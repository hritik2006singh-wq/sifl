import TeacherSlugClient from "./TeacherSlugClient";

export default function TeacherSlugPage({ params }: { params: { slug: string } }) {
    return <TeacherSlugClient slug={params.slug} />;
}
