import TeacherDetailClient from "./TeacherDetailClient";

export default async function TeacherDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <TeacherDetailClient id={id} />;
}