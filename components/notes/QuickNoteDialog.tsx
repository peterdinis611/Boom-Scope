"use client";

import { useMutation, useQuery } from "convex/react";
import { FileText, FolderKanban, Loader2, NotebookPen, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

interface QuickNoteDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Pre-select a project (e.g. from canvas or design-system context) */
	defaultProjectId?: string | null;
}

export function QuickNoteDialog({
	open,
	onOpenChange,
	defaultProjectId,
}: QuickNoteDialogProps) {
	const projects = useQuery(api.projects.list);
	const createNote = useMutation(api.notes.create);

	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [projectId, setProjectId] = useState<string | null>(
		defaultProjectId ?? null,
	);
	const [isSaving, setIsSaving] = useState(false);

	const reset = () => {
		setTitle("");
		setContent("");
		setProjectId(defaultProjectId ?? null);
	};

	const handleClose = () => {
		reset();
		onOpenChange(false);
	};

	const handleSave = async () => {
		if (!title.trim()) {
			toast.error("Enter a note title.");
			return;
		}
		if (!content.trim()) {
			toast.error("Write note content.");
			return;
		}

		setIsSaving(true);
		try {
			await createNote({
				title: title.trim(),
				content: content.trim(),
				projectId: projectId ? (projectId as Id<"projects">) : undefined,
			});
			toast.success("Note saved!");
			handleClose();
		} catch {
			toast.error("Failed to save note.");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className={cn(
					"rounded-3xl border border-border shadow-2xl sm:max-w-lg",
					"bg-background/95 backdrop-blur-3xl",
				)}
			>
				{/* Custom close button */}
				<button
					onClick={handleClose}
					className="absolute right-5 top-5 rounded-xl p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
				>
					<X className="size-4" />
					<span className="sr-only">Close</span>
				</button>

				<DialogHeader className="pb-2">
					<div className="flex items-center gap-3 mb-1">
						<div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
							<NotebookPen className="size-5" />
						</div>
						<div>
							<DialogTitle className="text-lg font-black tracking-tight">
								Quick note
							</DialogTitle>
							<DialogDescription className="text-xs text-muted-foreground font-medium mt-0.5">
								Capture an idea directly from your workspace.
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<div className="space-y-4 py-2">
					{/* Title */}
					<div className="space-y-1.5">
						<Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
							<FileText className="size-3" />
							Title
						</Label>
						<Input
							id="quick-note-title"
							placeholder="e.g. Color palette, Layout idea..."
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							className="h-11 rounded-2xl bg-accent/30 border-border/60 font-medium placeholder:text-muted-foreground/40 focus-visible:ring-primary/30"
							onKeyDown={(e) => {
								if (e.key === "Enter") e.currentTarget.blur();
							}}
						/>
					</div>

					{/* Content */}
					<div className="space-y-1.5">
						<Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
							<NotebookPen className="size-3" />
							Content
						</Label>
						<Textarea
							id="quick-note-content"
							placeholder="Write your notes, ideas, or observations..."
							value={content}
							onChange={(e) => setContent(e.target.value)}
							rows={5}
							className="rounded-2xl bg-accent/30 border-border/60 font-medium placeholder:text-muted-foreground/40 resize-none focus-visible:ring-primary/30"
						/>
					</div>

					{/* Project */}
					<div className="space-y-1.5">
						<Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
							<FolderKanban className="size-3" />
							Assign to project{" "}
							<span className="normal-case font-normal opacity-50">
								(optional)
							</span>
						</Label>
						<Select
							value={projectId ?? "none"}
							onValueChange={(v) => setProjectId(v === "none" ? null : v)}
						>
							<SelectTrigger className="h-11 rounded-2xl bg-accent/30 border-border/60 font-medium">
								<SelectValue placeholder="No project" />
							</SelectTrigger>
							<SelectContent className="rounded-2xl border-border/50 backdrop-blur-3xl">
								<SelectItem
									value="none"
									className="rounded-xl text-muted-foreground"
								>
									<span className="flex items-center gap-2 opacity-60">
										No project
									</span>
								</SelectItem>
								{projects?.map((project) => (
									<SelectItem
										key={project._id}
										value={project._id}
										className="rounded-xl"
									>
										<div className="flex items-center gap-2">
											<FolderKanban className="size-3.5 text-primary opacity-60" />
											{project.name}
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				<DialogFooter className="gap-2 pt-2">
					<Button
						variant="outline"
						className="rounded-xl h-11 font-bold"
						onClick={handleClose}
						disabled={isSaving}
					>
						Cancel
					</Button>
					<Button
						className="rounded-xl h-11 font-black uppercase tracking-wider text-xs bg-primary hover:bg-primary/90 min-w-32"
						onClick={handleSave}
						disabled={isSaving || !title.trim() || !content.trim()}
					>
						{isSaving ? (
							<Loader2 className="size-4 animate-spin" />
						) : (
							<>
								<NotebookPen className="size-4 mr-2" />
								Save
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
