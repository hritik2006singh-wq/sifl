import { collection, getDocs, query, QueryConstraint } from "firebase/firestore";
import { db } from "@/lib/firebase-client";

/**
 * safeCollectionFetch
 *
 * A crash-safe wrapper around Firestore collection reads.
 * If Firestore throws (e.g. "Missing or insufficient permissions"),
 * the error is logged to the console and an empty array is returned
 * so the UI renders normally without crashing.
 *
 * @param collectionName - The Firestore collection to read from.
 * @param constraints    - Optional query constraints (where, orderBy, limit, …).
 * @returns              - Array of plain document objects (id + data), or [] on error.
 */
export async function safeCollectionFetch<T = Record<string, unknown>>(
    collectionName: string,
    ...constraints: QueryConstraint[]
): Promise<(T & { id: string })[]> {
    try {
        const ref = collection(db, collectionName);
        const q = constraints.length > 0 ? query(ref, ...constraints) : ref;
        const snapshot = await getDocs(q);
        return snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as T),
        }));
    } catch (error) {
        console.error(
            `[firestore-safe] Failed to fetch collection "${collectionName}":`,
            error
        );
        return [];
    }
}
