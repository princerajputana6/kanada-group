import { redirect } from "next/navigation";

export default async function Page({ params }: { params: Promise<{ teacherId: string }> }) {
  const { teacherId } = await params;
  redirect(`/admin/teachers/${teacherId}/dashboard`);
}
