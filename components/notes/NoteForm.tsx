"use client";

import { useMutation } from "convex/react";
import {
	ChevronLeft,
	Copy,
	Download,
	FileText,
	Globe,
	Loader2,
	Save,
	Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/layout/ConfirmDialog";
import { InsertTaskLink } from "@/components/notes/insert-task-link";
import { NoteEditorDynamic } from "@/components/notes/note-editor-dynamic";
import { NoteTagsField } from "@/components/notes/NoteTagsField";
import { ProjectSelector } from "@/components/notes/ProjectSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { downloadNoteAsMarkdown } from "@/lib/download";
import { downloadNoteAsPdf, downloadNoteAsTxt } from "@/lib/notes";
import { noteSchema } from "@/lib/validations";

interface NoteFormProps {
	initialData: {
		_id: Id<"notes">;
		title: string;
		content: string;
		projectId?: Id<"projects">;
		tags?: string[];
		isPublic?: boolean;
	};
}

export function NoteForm({ initialData }: NoteFormProps) {
	const router = useRouter();
	const updateNote = useMutation(api.notes.update);
	const setPublic = useMutation(api.notes.setPublic);
	const removeNote = useMutation(api.notes.remove);

	const [title, setTitle] = useState(initialData.title);
	const [content, setContent] = useState(initialData.content);
	const [projectId, setProjectId] = useState<Id<"projects"> | undefined>(
		initialData.projectId,
	);
	const [tags, setTags] = useState<string[]>(initialData.tags ?? []);
	const [isPublic, setIsPublic] = useState(Boolean(initialData.isPublic));
	const [isSaving, setIsSaving] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);

	const handleSave = async () => {
		const validation = noteSchema.safeParse({ title, content, projectId, tags });

		if (!validation.success) {
			toast.error(validation.error.issues[0]?.message ?? "Invalid input.");
			return;
		}

		setIsSaving(true);
		try {
			await updateNote({
				noteId: initialData._id,
				title,
				content,
				projectId,
				tags,
			});
			toast.success("Note was saved.");
		} catch (error) {
			console.error(error);
			toast.error("Failed to save note.");
		} finally {
			setIsSaving(false);
		}
	};

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			await removeNote({ noteId: initialData._id });
			toast.success("Note was removed.");
			router.push("/dashboard/notes");
		} catch (error) {
			console.error(error);
			toast.error("Failed to delete note.");
			setIsDeleting(false);
		}
	};

	return (
		<div className="flex flex-col gap-8">
			<div className="flex items-center justify-between gap-4">
				<Link href="/dashboard/notes">
					<Button variant="ghost" size="sm" className="gap-2">
						<ChevronLeft className="size-4" />
						Back
					</Button>
				</Link>
				<div className="flex items-center gap-2">
					<Button
						variant={isPublic ? "default" : "outline"}
						size="sm"
						className="gap-1.5"
						onClick={async () => {
							try {
								const next = !isPublic;
								await setPublic({
									noteId: initialData._id,
									isPublic: next,
								});
								setIsPublic(next);
								if (next) {
									const url = `${window.location.origin}/share/note/${initialData._id}`;
									await navigator.clipboard.writeText(url);
									toast.success("Public link copied");
								} else {
									toast.success("Note is private again");
								}
							} catch {
								toast.error("Could not update sharing");
							}
						}}
						title="Share note"
					>
						{isPublic ? <Copy className="size-3.5" /> : <Globe className="size-3.5" />}
						{isPublic ? "Copy link" : "Share"}
					</Button>
					<Button
						variant="outline"
						size="icon-sm"
						onClick={() => downloadNoteAsTxt(title, content)}
						title="Download as .txt"
					>
						<Download className="size-4" />
					</Button>
					<Button
						variant="outline"
						size="icon-sm"
						onClick={() => downloadNoteAsMarkdown(title, content)}
						title="Download as Markdown"
					>
						<span className="text-[10px] font-bold">MD</span>
					</Button>
					<Button
						variant="outline"
						size="icon-sm"
						onClick={() => downloadNoteAsPdf(title, content)}
						title="Download as .pdf"
					>
						<FileText className="size-4" />
					</Button>
					<Button
						variant="outline"
						size="icon-sm"
						onClick={() => setDeleteOpen(true)}
						disabled={isDeleting}
						className="text-destructive hover:bg-destructive/10"
						aria-label="Delete note"
					>
						{isDeleting ? (
							<Loader2 className="size-4 animate-spin" />
						) : (
							<Trash2 className="size-4" />
						)}
					</Button>
					<Button onClick={handleSave} disabled={isSaving} className="gap-2">
						{isSaving ? (
							<Loader2 className="size-4 animate-spin" />
						) : (
							<Save className="size-4" />
						)}
						Save changes
					</Button>
				</div>
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
					<InsertTaskLink
						projectId={projectId}
						onInsert={(html) => {
							setContent((current) => `${current}${html}`);
							toast.success("Task link inserted — save the note");
						}}
					/>
				</div>

				<NoteEditorDynamic content={content} onChange={setContent} />
			</div>

			<ConfirmDialog
				open={deleteOpen}
				onOpenChange={setDeleteOpen}
				title="Delete note?"
				description="This action cannot be undone. The note will be permanently deleted."
				confirmLabel="Delete"
				variant="destructive"
				onConfirm={handleDelete}
				loading={isDeleting}
			/>
		</div>
	);
}
