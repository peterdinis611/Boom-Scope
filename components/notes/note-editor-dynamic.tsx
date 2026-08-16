"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { ComponentProps } from "react";

const NoteEditorLazy = dynamic(
	() =>
		import("@/components/notes/NoteEditor").then((module) => module.NoteEditor),
	{
		ssr: false,
		loading: () => (
			<div className="space-y-3 rounded-xl border border-border bg-card/60 p-4">
				<Skeleton className="h-9 w-full rounded-lg" />
				<Skeleton className="h-40 w-full rounded-lg" />
				<Skeleton className="h-8 w-1/3 rounded-lg" />
			</div>
		),
	},
);

export function NoteEditorDynamic(
	props: ComponentProps<typeof NoteEditorLazy>,
) {
	return <NoteEditorLazy {...props} />;
}
