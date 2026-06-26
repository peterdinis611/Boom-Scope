"use client";

import { useMutation } from "convex/react";
import { ChevronLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { NoteEditor } from "@/components/notes/NoteEditor";
import { NoteTagsField } from "@/components/notes/NoteTagsField";
import { ProjectSelector } from "@/components/notes/ProjectSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { noteSchema } from "@/lib/validations";

export default function NewNotePage() {
	const router = useRouter();
	const createNote = useMutation(api.notes.create);

	const [title, setTitle] = useState("");
	const [content, setContent] = useState("<p></p>");
	const [projectId, setProjectId] = useState<Id<"projects"> | undefined>(
		undefined,
	);
	const [tags, setTags] = useState<string[]>([]);
	const [isSaving, setIsSaving] = useState(false);

	const handleSave = async () => {
		const validation = noteSchema.safeParse({ title, content, projectId, tags });

		if (!validation.success) {
			toast.error(validation.error.message);
			return;
		}

		setIsSaving(true);
		try {
			const id = await createNote({
				title,
				content,
				projectId,
				tags,
			});
			toast.success("Note was created.");
			router.push(`/dashboard/notes/${id}`);
		} catch (error) {
			console.error(error);
			toast.error("Failed to create note.");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="mx-auto w-full max-w-4xl px-4 py-8 md:px-8 md:py-10">
			<div className="flex flex-col gap-8">
				<div className="flex items-center justify-between gap-4">
					<Link href="/dashboard/notes">
						<Button variant="ghost" size="sm" className="gap-2">
							<ChevronLeft className="size-4" />
							Back to list
						</Button>
					</Link>
					<Button onClick={handleSave} disabled={isSaving} className="gap-2">
						{isSaving ? (
							<Loader2 className="size-4 animate-spin" />
						) : (
							<Save className="size-4" />
						)}
						Save note
					</Button>
				</div>

				<div className="flex flex-col gap-6">
					<div className="flex flex-col gap-4">
						<Input
							placeholder="Note title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							className="border-none bg-transparent px-0 text-3xl font-bold focus-visible:ring-0 md:text-4xl"
						/>
						<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
							<span className="text-sm text-muted-foreground">
								Assign to project:
							</span>
							<div className="w-full sm:w-64">
								<ProjectSelector value={projectId} onChange={setProjectId} />
							</div>
						</div>
						<NoteTagsField tags={tags} onChange={setTags} />
					</div>

					<NoteEditor
						content={content}
						onChange={setContent}
						placeholder="Start writing your note..."
					/>
				</div>
			</div>
		</div>
	);
}
