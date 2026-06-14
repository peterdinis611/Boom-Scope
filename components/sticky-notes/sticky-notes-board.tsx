"use client";

import { useMutation, useQuery } from "convex/react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import {
	parseStickyNoteItems,
	serializeStickyNoteItems,
	STICKY_NOTE_COLORS,
	type StickyNoteItem,
	toLibraryNotes,
} from "@/lib/sticky-notes";

const ReactStickyNotes = dynamic(
	() => import("@react-latest-ui/react-sticky-notes"),
	{
		ssr: false,
		loading: () => (
			<div className="flex h-full items-center justify-center text-muted-foreground">
				<Loader2 className="size-6 animate-spin" />
			</div>
		),
	},
);

const SAVE_DEBOUNCE_MS = 600;

export function StickyNotesBoard() {
	const board = useQuery(api.sticky_notes.get);
	const saveBoard = useMutation(api.sticky_notes.save);
	const [initialNotes, setInitialNotes] = useState<StickyNoteItem[] | null>(
		null,
	);
	const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const latestItemsRef = useRef<StickyNoteItem[]>([]);

	useEffect(() => {
		if (board !== undefined && initialNotes === null) {
			setInitialNotes(parseStickyNoteItems(board?.items));
		}
	}, [board, initialNotes]);

	useEffect(() => {
		return () => {
			if (saveTimeoutRef.current) {
				clearTimeout(saveTimeoutRef.current);
			}
		};
	}, []);

	const persistNotes = useCallback(
		(items: StickyNoteItem[]) => {
			latestItemsRef.current = items;

			if (saveTimeoutRef.current) {
				clearTimeout(saveTimeoutRef.current);
			}

			saveTimeoutRef.current = setTimeout(() => {
				void saveBoard({ items: serializeStickyNoteItems(latestItemsRef.current) });
			}, SAVE_DEBOUNCE_MS);
		},
		[saveBoard],
	);

	const handleChange = useCallback(
		(
			_type: string,
			_payload: Record<string, unknown>,
			notes: Array<{
				id?: string;
				color?: string;
				text?: string;
				selected?: boolean;
				position?: { x: number; y: number };
			}>,
		) => {
			const normalized = notes.flatMap((note) => {
				if (
					!note.id ||
					!note.color ||
					typeof note.text !== "string" ||
					!note.position
				) {
					return [];
				}
				return [
					{
						id: note.id,
						color: note.color,
						text: note.text,
						selected: note.selected,
						position: note.position,
					} satisfies StickyNoteItem,
				];
			});
			persistNotes(normalized);
		},
		[persistNotes],
	);

	if (board === undefined || initialNotes === null) {
		return (
			<div className="flex h-full items-center justify-center text-muted-foreground">
				<Loader2 className="size-6 animate-spin" />
			</div>
		);
	}

	return (
		<div className="sticky-notes-board h-full min-h-0 overflow-hidden rounded-lg border border-border bg-muted/30">
			<ReactStickyNotes
				sessionKey=""
				colorCodes={[...STICKY_NOTE_COLORS]}
				notes={toLibraryNotes(initialNotes)}
				containerWidth="100%"
				containerHeight="100%"
				noteWidth={240}
				noteHeight={240}
				navbar
				useCSS
				useMaterialIcons
				onChange={handleChange}
			/>
		</div>
	);
}
