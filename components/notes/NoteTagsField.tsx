"use client";

import { Input } from "@/components/ui/input";
import { formatTagsInput, parseTagsInput } from "@/lib/note-tags";

type NoteTagsFieldProps = {
	tags: string[];
	onChange: (tags: string[]) => void;
};

export function NoteTagsField({ tags, onChange }: NoteTagsFieldProps) {
	return (
		<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
			<span className="text-sm text-muted-foreground shrink-0">Tags:</span>
			<Input
				placeholder="e.g. ideas, meeting, draft"
				value={formatTagsInput(tags)}
				onChange={(event) => onChange(parseTagsInput(event.target.value))}
				className="max-w-md"
			/>
		</div>
	);
}
