"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { courseNotes, courses, liveClasses, sections } from "@kanada/db";
import { getDb } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { studentsWithAccess } from "@/lib/access";
import { trustedOrigin } from "@/lib/origin";
import { formatIst, liveState, parseIstLocal } from "@/lib/time";
import { attachmentDisposition, deleteObject, putObject } from "@/lib/storage";
import { buildLiveClassEmail, sendEmailBatch, type LiveClassEmailKind } from "@/lib/email";
import type { ActionState } from "./auth-actions";

// Server actions are public POST endpoints: each re-checks the role and
// that the course belongs to the caller (admins may manage any course).

async function requireCourseManager(courseId: string) {
  const user = await requireRole(["TEACHER", "ADMIN"]);
  z.string().min(1).max(64).parse(courseId);
  const db = await getDb();
  const course = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
    with: { teacher: { columns: { name: true } } },
  });
  if (!course || (user.role !== "ADMIN" && course.teacherId !== user.id)) {
    throw new Error("Course not found.");
  }
  return { user, course };
}

function revalidateTeaching(courseId: string, slug?: string) {
  revalidatePath("/teacher", "layout");
  revalidatePath("/admin/teachers", "layout");
  revalidatePath(`/teacher/courses/${courseId}/edit`);
  revalidatePath("/student/dashboard");
  if (slug) {
    revalidatePath(`/courses/${slug}`);
    revalidatePath(`/student/courses/${slug}/learn`);
  }
}

// ---------------------------------------------------------------- live classes

const liveClassSchema = z.object({
  courseId: z.string().min(1, "Choose a course.").max(64),
  title: z.string().trim().min(3, "Give the class a title.").max(150),
  description: z.string().trim().max(2000).optional(),
  startsAt: z.string().min(1, "Pick a date and time."),
  durationMinutes: z.coerce.number().int().min(15, "At least 15 minutes.").max(480, "At most 8 hours."),
  meetingUrl: z
    .string()
    .trim()
    .url("Paste the full meeting link (https://…).")
    .refine((u) => u.startsWith("https://"), "The meeting link must start with https://"),
});

function readLiveClassForm(formData: FormData) {
  return liveClassSchema.safeParse({
    courseId: formData.get("courseId"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    startsAt: formData.get("startsAt"),
    durationMinutes: formData.get("durationMinutes"),
    meetingUrl: formData.get("meetingUrl"),
  });
}

/** Emails every student with access; best-effort, never fails the action. */
async function notifyStudents(
  kind: LiveClassEmailKind,
  cls: { courseId: string; title: string; startsAt: Date; durationMinutes: number },
  courseTitle: string,
  teacherName: string,
) {
  try {
    const students = await studentsWithAccess(cls.courseId);
    const origin = await trustedOrigin();
    await sendEmailBatch(
      students.map((s) =>
        buildLiveClassEmail({
          to: s.email,
          name: s.name,
          kind,
          classTitle: cls.title,
          courseTitle,
          teacherName,
          when: formatIst(cls.startsAt),
          durationMinutes: cls.durationMinutes,
          classesUrl: `${origin}/student/dashboard#live-classes`,
        }),
      ),
    );
  } catch (err) {
    console.error("[live-class] notification failed", err);
  }
}

export async function scheduleLiveClassAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = readLiveClassForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const { user, course } = await requireCourseManager(parsed.data.courseId);

  const startsAt = parseIstLocal(parsed.data.startsAt);
  if (!startsAt) return { error: "Pick a valid date and time." };
  if (startsAt.getTime() < Date.now() - 5 * 60_000) return { error: "That time is in the past." };

  const db = await getDb();
  const values = {
    courseId: course.id,
    teacherId: course.teacherId,
    title: parsed.data.title,
    description: parsed.data.description || null,
    startsAt,
    durationMinutes: parsed.data.durationMinutes,
    meetingUrl: parsed.data.meetingUrl,
  };
  await db.insert(liveClasses).values(values);

  if (formData.get("notify") === "on") {
    await notifyStudents("scheduled", values, course.title, course.teacher?.name ?? user.name ?? "your teacher");
  }
  revalidateTeaching(course.id, course.slug);
  return { success: true };
}

async function requireLiveClass(classId: string) {
  z.string().min(1).max(64).parse(classId);
  const db = await getDb();
  const cls = await db.query.liveClasses.findFirst({ where: eq(liveClasses.id, classId) });
  if (!cls) throw new Error("Live class not found.");
  const ctx = await requireCourseManager(cls.courseId);
  return { cls, ...ctx };
}

export async function updateLiveClassAction(
  classId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { cls, user, course } = await requireLiveClass(classId);
  const parsed = readLiveClassForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  if (parsed.data.courseId !== cls.courseId) return { error: "A class can't be moved to another course." };

  const startsAt = parseIstLocal(parsed.data.startsAt);
  if (!startsAt) return { error: "Pick a valid date and time." };

  const db = await getDb();
  const next = {
    title: parsed.data.title,
    description: parsed.data.description || null,
    startsAt,
    durationMinutes: parsed.data.durationMinutes,
    meetingUrl: parsed.data.meetingUrl,
  };
  await db.update(liveClasses).set(next).where(eq(liveClasses.id, cls.id));

  const timeChanged =
    startsAt.getTime() !== cls.startsAt.getTime() || next.durationMinutes !== cls.durationMinutes;
  const stillAhead = liveState(startsAt, next.durationMinutes) !== "ended";
  if (cls.status === "SCHEDULED" && stillAhead && (timeChanged || next.meetingUrl !== cls.meetingUrl)) {
    await notifyStudents(
      "updated",
      { courseId: cls.courseId, ...next },
      course.title,
      course.teacher?.name ?? user.name ?? "your teacher",
    );
  }
  revalidateTeaching(course.id, course.slug);
  return { success: true };
}

export async function cancelLiveClassAction(classId: string) {
  const { cls, user, course } = await requireLiveClass(classId);
  if (cls.status === "CANCELLED") return;
  const db = await getDb();
  await db.update(liveClasses).set({ status: "CANCELLED" }).where(eq(liveClasses.id, cls.id));
  if (liveState(cls.startsAt, cls.durationMinutes) !== "ended") {
    await notifyStudents("cancelled", cls, course.title, course.teacher?.name ?? user.name ?? "your teacher");
  }
  revalidateTeaching(course.id, course.slug);
}

export async function deleteLiveClassAction(classId: string) {
  const { cls, course } = await requireLiveClass(classId);
  const ended = liveState(cls.startsAt, cls.durationMinutes) === "ended";
  if (cls.status === "SCHEDULED" && !ended) {
    throw new Error("Cancel an upcoming class before deleting it, so students are told.");
  }
  const db = await getDb();
  await db.delete(liveClasses).where(eq(liveClasses.id, cls.id));
  revalidateTeaching(course.id, course.slug);
}

export async function setRecordingUrlAction(
  classId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { cls, course } = await requireLiveClass(classId);
  const raw = String(formData.get("recordingUrl") ?? "").trim();
  if (raw && !/^https:\/\/\S+$/.test(raw)) return { error: "Use a full https:// link." };
  const db = await getDb();
  await db.update(liveClasses).set({ recordingUrl: raw || null }).where(eq(liveClasses.id, cls.id));
  revalidateTeaching(course.id, course.slug);
  return { success: true };
}

// ----------------------------------------------------------------------- notes

const MAX_NOTE_BYTES = 20 * 1024 * 1024; // 20 MB

/** Office/PDF documents only — by extension, with the MIME type to serve. */
const NOTE_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  odt: "application/vnd.oasis.opendocument.text",
  odp: "application/vnd.oasis.opendocument.presentation",
  txt: "text/plain",
};

export async function uploadNoteAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const courseId = String(formData.get("courseId") ?? "");
  if (!courseId) return { error: "Choose a course." };
  const { user, course } = await requireCourseManager(courseId);

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a file to upload." };
  if (file.size > MAX_NOTE_BYTES) return { error: "Files must be 20 MB or smaller." };
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const contentType = NOTE_TYPES[ext];
  if (!contentType) return { error: "Upload a PDF, Word, PowerPoint, Excel or text file." };

  const parsed = z
    .object({
      title: z.string().trim().max(150).optional(),
      description: z.string().trim().max(1000).optional(),
      sectionId: z.string().max(64).optional(),
    })
    .safeParse({
      title: formData.get("title") || undefined,
      description: formData.get("description") || undefined,
      sectionId: formData.get("sectionId") || undefined,
    });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const db = await getDb();
  let sectionId: string | null = null;
  if (parsed.data.sectionId) {
    const section = await db.query.sections.findFirst({
      where: and(eq(sections.id, parsed.data.sectionId), eq(sections.courseId, course.id)),
      columns: { id: true },
    });
    if (!section) return { error: "That section isn't part of this course." };
    sectionId = section.id;
  }

  const fileName = file.name.slice(0, 200);
  const key = `notes/${course.id}/${crypto.randomUUID()}.${ext}`;
  await putObject(key, await file.arrayBuffer(), contentType, attachmentDisposition(fileName));
  await db.insert(courseNotes).values({
    courseId: course.id,
    sectionId,
    uploadedBy: user.id,
    title: parsed.data.title || fileName.replace(/\.[^.]+$/, ""),
    description: parsed.data.description || null,
    fileKey: key,
    fileName,
    contentType,
    sizeBytes: file.size,
  });
  revalidateTeaching(course.id, course.slug);
  return { success: true };
}

export async function deleteNoteAction(noteId: string) {
  z.string().min(1).max(64).parse(noteId);
  const db = await getDb();
  const note = await db.query.courseNotes.findFirst({ where: eq(courseNotes.id, noteId) });
  if (!note) return;
  const { course } = await requireCourseManager(note.courseId);
  await db.delete(courseNotes).where(eq(courseNotes.id, note.id));
  await deleteObject(note.fileKey);
  revalidateTeaching(course.id, course.slug);
}
