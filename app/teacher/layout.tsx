import TeacherLayoutClient from "./TeacherLayoutClient";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
    return <TeacherLayoutClient>{children}</TeacherLayoutClient>;
}
