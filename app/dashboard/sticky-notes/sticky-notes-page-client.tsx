"use client";

import dynamic from "next/dynamic";
import { StickyNotesBoardSkeleton } from "@/components/sticky-notes/sticky-notes-board-skeleton";

const StickyNotesBoard = dynamic(
	() =>
		import("@/components/sticky-notes/sticky-notes-board").then(
			(module) => module.StickyNotesBoard,
		),
	{
		loading: () => <StickyNotesBoardSkeleton />,
	},
);

export function StickyNotesPageClient() {
	return <StickyNotesBoard />;
}
