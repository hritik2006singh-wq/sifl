import BlogEditorClient from "./BlogEditorClient";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Edit Blog | SIFL Admin",
};

export default function BlogEditorPage() {
    return <BlogEditorClient />;
}
