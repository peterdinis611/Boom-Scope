"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { NoteList } from "@/components/notes/NoteList";
import type { Id } from "@/convex/_generated/dataModel";

function NotesListLoader() {
	const searchParams = useSearchParams();
	const projectId = searchParams.get("projectId");

	return (
		<NoteList
			defaultProjectId={
				projectId ? (projectId as Id<"projects">) : undefined
			}
		/>
	);
}

export function NotesPageClient() {
	return (
		<Suspense
			fallback={
				<p className="text-sm text-muted-foreground">Loading notes…</p>
			}
		>
			<NotesListLoader />
		</Suspense>
	);
}
