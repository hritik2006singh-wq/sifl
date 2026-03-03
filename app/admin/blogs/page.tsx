import BlogsClient from "./BlogsClient";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Blog Manager | SIFL Admin",
};

export default function BlogsPage() {
    return <BlogsClient />;
}
