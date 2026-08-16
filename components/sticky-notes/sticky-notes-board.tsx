"use client";

import { useMutation, useQuery } from "convex/react";
import { Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ProjectSelector } from "@/components/notes/ProjectSelector";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
	createStickyNote,
	parseStickyNoteItems,
	readStickyNotesCache,
	serializeStickyNoteItems,
	STICKY_NOTE_COLORS,
	type StickyNoteItem,
	writeStickyNotesCache,
} from "@/lib/sticky-notes";
import { cn } from "@/lib/utils";
import { StickyNoteCard } from "./sticky-note-card";

const SAVE_DEBOUNCE_MS = 500;

type StickyNotesBoardProps = {
	focusNoteId?: string | null;
	defaultProjectId?: Id<"projects">;
};

export function StickyNotesBoard({
	focusNoteId,
	defaultProjectId,
}: StickyNotesBoardProps = {}) {
	const board = useQuery(api.sticky_notes.get);
	const saveBoard = useMutation(api.sticky_notes.save);
	const [notes, setNotes] = useState<StickyNoteItem[]>(readStickyNotesCache);
	const [projectFilter, setProjectFilter] = useState<Id<"projects"> | undefined>(
		defaultProjectId,
	);
	const [activeId, setActiveId] = useState<string | null>(null);
	const [selectedColor, setSelectedColor] = useState<string>(
		STICKY_NOTE_COLORS[0],
	);
	const hasHydratedFromServer = useRef(false);
	const hasLocalEdits = useRef(false);
	const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const latestNotesRef = useRef<StickyNoteItem[]>([]);

	useEffect(() => {
		if (board === undefined || hasHydratedFromServer.current) return;

		hasHydratedFromServer.current = true;
		const serverNotes = parseStickyNoteItems(board.items);

		setNotes((current) => {
			if (hasLocalEdits.current) return current;
			if (current.length === 0) return serverNotes;
			return serverNotes.length > current.length ? serverNotes : current;
		});

		setActiveId((current) => current ?? serverNotes[0]?.id ?? null);
	}, [board]);

	useEffect(() => {
		setProjectFilter(defaultProjectId);
	}, [defaultProjectId]);

	useEffect(() => {
		if (!focusNoteId || notes.length === 0) return;
		if (!notes.some((note) => note.id === focusNoteId)) return;

		setActiveId(focusNoteId);
		requestAnimationFrame(() => {
			document
				.querySelector(`[data-sticky-note-id="${focusNoteId}"]`)
				?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
		});
	}, [focusNoteId, notes]);

	useEffect(() => {
		return () => {
			if (saveTimeoutRef.current) {
				clearTimeout(saveTimeoutRef.current);
			}
		};
	}, []);

	const persistNotes = useCallback(
		(nextNotes: StickyNoteItem[]) => {
			latestNotesRef.current = nextNotes;
			writeStickyNotesCache(nextNotes);

			if (saveTimeoutRef.current) {
				clearTimeout(saveTimeoutRef.current);
			}

			saveTimeoutRef.current = setTimeout(() => {
				void saveBoard({
					items: serializeStickyNoteItems(latestNotesRef.current),
				});
			}, SAVE_DEBOUNCE_MS);
		},
		[saveBoard],
	);

	const commitNotes = useCallback(
		(updater: (current: StickyNoteItem[]) => StickyNoteItem[]) => {
			hasLocalEdits.current = true;
			setNotes((current) => {
				const nextNotes = updater(current);
				persistNotes(nextNotes);
				return nextNotes;
			});
		},
		[persistNotes],
	);

	const visibleNotes = useMemo(() => {
		if (!projectFilter) return notes;
		return notes.filter((note) => note.projectId === projectFilter);
	}, [notes, projectFilter]);

	const handleAddNote = () => {
		const note = createStickyNote(notes, selectedColor, projectFilter);
		commitNotes((current) => [...current, note]);
		setActiveId(note.id);
	};

	const handleUpdateNote = (id: string, updates: Partial<StickyNoteItem>) => {
		commitNotes((current) =>
			current.map((note) => (note.id === id ? { ...note, ...updates } : note)),
		);
	};

	const handleDeleteNote = (id: string) => {
		commitNotes((current) => current.filter((note) => note.id !== id));
		setActiveId((current) => (current === id ? null : current));
	};

	return (
		<div className="flex h-full min-h-[480px] flex-col overflow-hidden rounded-lg border border-border bg-muted/20">
			<div className="flex flex-wrap items-center gap-2 border-b border-border bg-background/80 px-3 py-2 backdrop-blur">
				<Button type="button" size="sm" onClick={handleAddNote}>
					<Plus data-icon="inline-start" />
					Add note
				</Button>
				<div className="w-full max-w-[220px]">
					<ProjectSelector
						value={projectFilter}
						onChange={setProjectFilter}
						noneLabel="All projects"
						placeholder="All projects"
					/>
				</div>
				<div className="flex flex-wrap items-center gap-1.5">
					{STICKY_NOTE_COLORS.map((color) => (
						<button
							key={color}
							type="button"
							aria-label={`Use ${color} for new notes`}
							className={cn(
								"size-7 rounded-full border border-black/10 shadow-sm transition-transform hover:scale-105",
								selectedColor === color &&
									"ring-2 ring-primary ring-offset-2 ring-offset-background",
							)}
							style={{ backgroundColor: color }}
							onClick={() => setSelectedColor(color)}
						/>
					))}
				</div>
			</div>

			<div
				className="relative min-h-0 flex-1 overflow-auto bg-muted/40"
				onPointerDown={() => setActiveId(null)}
			>
				{visibleNotes.length === 0 ? (
					<div className="flex h-full min-h-[360px] items-center justify-center px-6 text-center">
						<div className="space-y-2">
							<p className="text-sm font-medium text-foreground">
								{projectFilter
									? "No sticky notes for this project"
									: "Your board is empty"}
							</p>
							<p className="text-sm text-muted-foreground">
								Click <span className="font-medium">Add note</span> to start
								capturing ideas.
							</p>
						</div>
					</div>
				) : (
					visibleNotes.map((note) => (
						<StickyNoteCard
							key={note.id}
							note={note}
							isActive={activeId === note.id}
							onSelect={setActiveId}
							onUpdate={handleUpdateNote}
							onDelete={handleDeleteNote}
						/>
					))
				)}
			</div>
		</div>
	);
}
