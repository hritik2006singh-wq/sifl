import { Timestamp } from "firebase/firestore";

export interface Blog {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    content?: string;          // Optional — drafts may have no body yet
    coverImageUrl?: string;
    coverImagePath?: string;
    status: "draft" | "published";
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
    publishedAt?: Timestamp;
}
