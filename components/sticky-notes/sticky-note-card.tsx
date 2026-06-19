"use client";

import { GripVertical, Trash2 } from "lucide-react";
import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from "react";
import { Button } from "@/components/ui/button";
import {
	DEFAULT_STICKY_NOTE_SIZE,
	type StickyNoteItem,
} from "@/lib/sticky-notes";
import { cn } from "@/lib/utils";

type StickyNoteCardProps = {
	note: StickyNoteItem;
	isActive: boolean;
	onSelect: (id: string) => void;
	onUpdate: (id: string, updates: Partial<StickyNoteItem>) => void;
	onDelete: (id: string) => void;
};

export function StickyNoteCard({
	note,
	isActive,
	onSelect,
	onUpdate,
	onDelete,
}: StickyNoteCardProps) {
	const noteRef = useRef<HTMLDivElement>(null);
	const textRef = useRef<HTMLDivElement>(null);
	const dragState = useRef<{ offsetX: number; offsetY: number } | null>(null);

	useEffect(() => {
		if (textRef.current && textRef.current.textContent !== note.text) {
			textRef.current.textContent = note.text;
		}
	}, [note.text]);

	useEffect(() => {
		const element = noteRef.current;
		if (!element) return;

		const handlePointerUp = () => {
			const nextWidth = Math.round(element.offsetWidth);
			const nextHeight = Math.round(element.offsetHeight);
			if (
				nextWidth !== (note.width ?? DEFAULT_STICKY_NOTE_SIZE.width) ||
				nextHeight !== (note.height ?? DEFAULT_STICKY_NOTE_SIZE.height)
			) {
				onUpdate(note.id, { width: nextWidth, height: nextHeight });
			}
		};

		element.addEventListener("pointerup", handlePointerUp);
		return () => element.removeEventListener("pointerup", handlePointerUp);
	}, [note.id, note.width, note.height, onUpdate]);

	const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
		if (event.button !== 0) return;
		onSelect(note.id);

		const rect = noteRef.current?.getBoundingClientRect();
		if (!rect) return;

		dragState.current = {
			offsetX: event.clientX - rect.left,
			offsetY: event.clientY - rect.top,
		};

		const handle = event.currentTarget;
		handle.setPointerCapture(event.pointerId);

		const handlePointerMove = (moveEvent: PointerEvent) => {
			if (!dragState.current || !noteRef.current?.offsetParent) return;
			const parentRect = noteRef.current.offsetParent.getBoundingClientRect();
			const nextX = Math.max(
				0,
				moveEvent.clientX - parentRect.left - dragState.current.offsetX,
			);
			const nextY = Math.max(
				0,
				moveEvent.clientY - parentRect.top - dragState.current.offsetY,
			);
			noteRef.current.style.left = `${nextX}px`;
			noteRef.current.style.top = `${nextY}px`;
		};

		const handlePointerUp = (upEvent: PointerEvent) => {
			if (!dragState.current || !noteRef.current?.offsetParent) {
				dragState.current = null;
				return;
			}

			const parentRect = noteRef.current.offsetParent.getBoundingClientRect();
			const nextX = Math.max(
				0,
				upEvent.clientX - parentRect.left - dragState.current.offsetX,
			);
			const nextY = Math.max(
				0,
				upEvent.clientY - parentRect.top - dragState.current.offsetY,
			);

			noteRef.current.style.left = `${nextX}px`;
			noteRef.current.style.top = `${nextY}px`;
			onUpdate(note.id, { position: { x: nextX, y: nextY } });

			dragState.current = null;
			if (handle.hasPointerCapture(upEvent.pointerId)) {
				handle.releasePointerCapture(upEvent.pointerId);
			}
			window.removeEventListener("pointermove", handlePointerMove);
			window.removeEventListener("pointerup", handlePointerUp);
		};

		window.addEventListener("pointermove", handlePointerMove);
		window.addEventListener("pointerup", handlePointerUp);
	};

	return (
		<div
			ref={noteRef}
			className={cn(
				"absolute flex flex-col overflow-hidden rounded-md shadow-md ring-1 ring-black/10 transition-shadow",
				isActive && "z-20 shadow-lg ring-black/20",
				!isActive && "z-10",
			)}
			style={{
				left: note.position.x,
				top: note.position.y,
				width: note.width ?? DEFAULT_STICKY_NOTE_SIZE.width,
				height: note.height ?? DEFAULT_STICKY_NOTE_SIZE.height,
				backgroundColor: note.color,
				resize: "both",
				minWidth: 160,
				minHeight: 140,
			}}
			onPointerDown={() => onSelect(note.id)}
		>
			<div
				className="flex cursor-grab items-center justify-between border-b border-black/10 px-2 py-1 active:cursor-grabbing"
				onPointerDown={handlePointerDown}
			>
				<GripVertical className="size-4 text-slate-700/70" aria-hidden />
				<Button
					type="button"
					variant="ghost"
					size="icon-xs"
					className="size-7 text-slate-700 hover:bg-black/10 hover:text-slate-900"
					onClick={(event) => {
						event.stopPropagation();
						onDelete(note.id);
					}}
					aria-label="Delete note"
				>
					<Trash2 className="size-3.5" />
				</Button>
			</div>
			<div
				ref={textRef}
				contentEditable
				suppressContentEditableWarning
				className="min-h-0 flex-1 overflow-auto px-3 py-2 text-sm leading-relaxed text-slate-900 outline-none"
				onBlur={(event) => {
					onUpdate(note.id, { text: event.currentTarget.textContent ?? "" });
				}}
			/>
		</div>
	);
}
