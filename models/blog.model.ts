import { FieldValue, Timestamp } from "firebase/firestore";

export interface Blog {
    blogId: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    author: string;
    createdAt?: Timestamp | FieldValue;
    updatedAt?: Timestamp | FieldValue;
}
