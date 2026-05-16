"use client";

import { useMutation } from "convex/react";
import { ChevronLeft, Download, Loader2, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { NoteEditor } from "@/components/notes/NoteEditor";
import { ProjectSelector } from "@/components/notes/ProjectSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { downloadNoteAsTxt } from "@/lib/notes";
import { noteSchema } from "@/lib/validations";

interface NoteFormProps {
	initialData: {
		_id: Id<"notes">;
		title: string;
		content: string;
		projectId?: Id<"projects">;
	};
}

export function NoteForm({ initialData }: NoteFormProps) {
	const router = useRouter();
	const updateNote = useMutation(api.notes.update);
	const removeNote = useMutation(api.notes.remove);

	const [title, setTitle] = useState(initialData.title);
	const [content, setContent] = useState(initialData.content);
	const [projectId, setProjectId] = useState<Id<"projects"> | undefined>(
		initialData.projectId,
	);
	const [isSaving, setIsSaving] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const handleSave = async () => {
		const validation = noteSchema.safeParse({ title, content, projectId });

		if (!validation.success) {
			toast.error(validation.error.issues[0]?.message ?? "Neplatný vstup.");
			return;
		}

		setIsSaving(true);
		try {
			await updateNote({
				noteId: initialData._id,
				title,
				content,
				projectId,
			});
			toast.success("Poznámka bola uložená.");
		} catch (error) {
			console.error(error);
			toast.error("Nepodarilo sa uložiť poznámku.");
		} finally {
			setIsSaving(false);
		}
	};

	const handleDelete = async () => {
		if (!confirm("Naozaj chcete túto poznámku odstrániť?")) return;

		setIsDeleting(true);
		try {
			await removeNote({ noteId: initialData._id });
			toast.success("Poznámka bola odstránená.");
			router.push("/dashboard/notes");
		} catch (error) {
			console.error(error);
			toast.error("Nepodarilo sa odstrániť poznámku.");
			setIsDeleting(false);
		}
	};

	return (
		<div className="flex flex-col gap-8">
			<div className="flex items-center justify-between gap-4">
				<Link href="/dashboard/notes">
					<Button variant="ghost" size="sm" className="gap-2">
						<ChevronLeft className="size-4" />
						Späť
					</Button>
				</Link>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="icon-sm"
						onClick={() => downloadNoteAsTxt(title, content)}
						title="Stiahnuť ako .txt"
					>
						<Download className="size-4" />
					</Button>
					<Button
						variant="outline"
						size="icon-sm"
						onClick={handleDelete}
						disabled={isDeleting}
						className="text-destructive hover:bg-destructive/10"
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
						Uložiť zmeny
					</Button>
				</div>
			</div>

			<div className="flex flex-col gap-6">
				<div className="flex flex-col gap-4">
					<Input
						placeholder="Názov poznámky"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						className="border-none bg-transparent px-0 text-3xl font-bold focus-visible:ring-0 md:text-4xl"
					/>
					<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
						<span className="text-sm text-muted-foreground">
							Priradiť k projektu:
						</span>
						<div className="w-full sm:w-64">
							<ProjectSelector value={projectId} onChange={setProjectId} />
						</div>
					</div>
				</div>

				<NoteEditor content={content} onChange={setContent} />
			</div>
		</div>
	);
}
