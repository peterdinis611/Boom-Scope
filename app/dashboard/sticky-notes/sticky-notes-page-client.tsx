"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { StickyNotesBoardSkeleton } from "@/components/sticky-notes/sticky-notes-board-skeleton";
import type { Id } from "@/convex/_generated/dataModel";

const StickyNotesBoard = dynamic(
	() =>
		import("@/components/sticky-notes/sticky-notes-board").then(
			(module) => module.StickyNotesBoard,
		),
	{
		loading: () => <StickyNotesBoardSkeleton />,
	},
);

function StickyNotesBoardLoader() {
	const searchParams = useSearchParams();
	const focusNoteId = searchParams.get("note");
	const projectId = searchParams.get("projectId");

	return (
		<StickyNotesBoard
			focusNoteId={focusNoteId}
			defaultProjectId={
				projectId ? (projectId as Id<"projects">) : undefined
			}
		/>
	);
}

export function StickyNotesPageClient() {
	return (
		<Suspense fallback={<StickyNotesBoardSkeleton />}>
			<StickyNotesBoardLoader />
		</Suspense>
	);
}
