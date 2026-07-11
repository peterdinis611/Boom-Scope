"use client";

import { useQuery } from "convex/react";
import { ArrowRight, StickyNote } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import {
	getStickyNoteHref,
	getStickyNotePreviewTitle,
	parseStickyNoteItems,
} from "@/lib/sticky-notes";
import { cn } from "@/lib/utils";

const PREVIEW_LIMIT = 6;

export function StickyNotesPreview() {
	const board = useQuery(api.sticky_notes.get);

	const notes = useMemo(() => {
		if (board === undefined) return undefined;
		return parseStickyNoteItems(board.items);
	}, [board]);

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
				<CardTitle className="text-base">Your sticky notes</CardTitle>
				<Button variant="ghost" size="sm" asChild>
					<Link href="/dashboard/sticky-notes">
						Open board
						<ArrowRight data-icon="inline-end" />
					</Link>
				</Button>
			</CardHeader>
			<CardContent className="space-y-1">
				{notes === undefined ? (
					<p className="text-sm text-muted-foreground">Loading sticky notes…</p>
				) : notes.length === 0 ? (
					<div className="rounded-lg border border-dashed border-border px-4 py-6 text-center">
						<p className="text-sm text-muted-foreground">
							No sticky notes yet.
						</p>
						<Button variant="outline" size="sm" className="mt-3" asChild>
							<Link href="/dashboard/sticky-notes">Create your first note</Link>
						</Button>
					</div>
				) : (
					<>
						{notes.slice(0, PREVIEW_LIMIT).map((note) => (
							<Link
								key={note.id}
								href={getStickyNoteHref(note.id) as Route}
								className={cn(
									"flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/60",
								)}
							>
								<span
									className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-black/5 shadow-sm"
									style={{ backgroundColor: note.color }}
								>
									<StickyNote className="size-4 text-foreground/70" />
								</span>
								<span className="min-w-0 flex-1">
									<span className="block truncate text-sm font-medium">
										{getStickyNotePreviewTitle(note.text)}
									</span>
									<span className="block text-xs text-muted-foreground">
										Sticky note
									</span>
								</span>
							</Link>
						))}
						{notes.length > PREVIEW_LIMIT ? (
							<Button variant="link" size="sm" className="px-2" asChild>
								<Link href="/dashboard/sticky-notes">
									View all {notes.length} notes
								</Link>
							</Button>
						) : null}
					</>
				)}
			</CardContent>
		</Card>
	);
}
