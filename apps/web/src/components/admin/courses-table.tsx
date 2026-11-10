"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import {
  Badge,
  Button,
  Input,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kanada/ui";
import { setCoursePublishedAction } from "@/actions/admin-actions";

export interface AdminCourseRow {
  id: string;
  title: string;
  slug: string;
  teacherName: string;
  students: number;
  published: boolean;
}

export function CoursesTable({ courses }: { courses: AdminCourseRow[] }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"ALL" | "PUBLISHED" | "DRAFT">("ALL");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return courses.filter((c) => {
      if (status === "PUBLISHED" && !c.published) return false;
      if (status === "DRAFT" && c.published) return false;
      if (term && !`${c.title} ${c.teacherName}`.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [courses, q, status]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          type="search"
          placeholder="Search title or teacher…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="sm:max-w-xs"
          aria-label="Search courses"
        />
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as "ALL" | "PUBLISHED" | "DRAFT")}
          className="h-10 sm:w-40"
          aria-label="Filter by status"
        >
          <option value="ALL">Any status</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
        </Select>
        <span className="text-sm text-muted-foreground sm:ml-auto">
          {filtered.length} of {courses.length}
        </span>
      </div>

      <div className="mt-6 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Teacher</TableHead>
              <TableHead>Students</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((course) => (
              <CourseRow key={course.id} course={course} />
            ))}
          </TableBody>
        </Table>
        {filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No courses match these filters.
          </p>
        )}
      </div>
    </div>
  );
}

function CourseRow({ course }: { course: AdminCourseRow }) {
  const [pending, start] = useTransition();
  return (
    <TableRow>
      <TableCell className="font-medium">
        <Link href={`/courses/${course.slug}`} className="hover:underline">
          {course.title}
        </Link>
      </TableCell>
      <TableCell className="text-muted-foreground">{course.teacherName}</TableCell>
      <TableCell className="text-muted-foreground">{course.students}</TableCell>
      <TableCell>
        <Badge variant={course.published ? "success" : "outline"}>
          {course.published ? "Published" : "Draft"}
        </Badge>
      </TableCell>
      <TableCell>
        <Button
          size="sm"
          variant="ghost"
          disabled={pending}
          onClick={() => start(() => setCoursePublishedAction(course.id, !course.published))}
        >
          {course.published ? "Unpublish" : "Publish"}
        </Button>
      </TableCell>
    </TableRow>
  );
}
