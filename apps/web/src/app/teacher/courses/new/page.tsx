import { CourseForm } from "@/components/course-form";
import { createCourseAction } from "@/actions/course-actions";

export default function NewCoursePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Create a new course</h1>
      <p className="mt-1 text-muted-foreground">
        You can add sections, lessons, and videos after creating the course.
      </p>
      <div className="mt-8">
        <CourseForm action={createCourseAction} submitLabel="Create course" />
      </div>
    </div>
  );
}
