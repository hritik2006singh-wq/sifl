import StudentSlugClient from "./StudentSlugClient";

export default async function StudentsSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <StudentSlugClient slug={slug} />;
}