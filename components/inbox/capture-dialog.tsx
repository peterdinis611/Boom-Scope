"use client";

import { useMutation } from "convex/react";
import { Inbox, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";

type CaptureDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function CaptureDialog({ open, onOpenChange }: CaptureDialogProps) {
	const capture = useMutation(api.inbox.capture);
	const [body, setBody] = useState("");
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		if (!open) setBody("");
	}, [open]);

	const handleSave = async () => {
		if (!body.trim()) {
			toast.error("Write something to capture.");
			return;
		}
		setSaving(true);
		try {
			await capture({ body: body.trim() });
			toast.success("Saved to inbox", {
				description: "Triage it later into a note, task, or sticky.",
			});
			onOpenChange(false);
		} catch {
			toast.error("Could not save capture.");
		} finally {
			setSaving(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
				<DialogHeader className="border-b border-border px-5 py-4">
					<div className="flex items-center gap-3">
						<span className="flex size-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
							<Inbox className="size-4 text-primary" />
						</span>
						<div>
							<DialogTitle className="font-heading text-lg">
								Quick capture
							</DialogTitle>
							<DialogDescription>
								Dump a thought now — sort it later.{" "}
								<kbd className="rounded border px-1 py-0.5 text-[10px]">⌘N</kbd>
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>
				<div className="px-5 py-4">
					<Textarea
						autoFocus
						value={body}
						onChange={(event) => setBody(event.target.value)}
						placeholder="Idea, link, reminder…"
						className="min-h-32 resize-none"
						onKeyDown={(event) => {
							if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
								event.preventDefault();
								void handleSave();
							}
						}}
					/>
					<p className="mt-2 text-xs text-muted-foreground">
						⌘Enter to save · Esc to close
					</p>
				</div>
				<DialogFooter className="border-t border-border px-5 py-3">
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={saving}
					>
						Cancel
					</Button>
					<Button
						type="button"
						onClick={() => void handleSave()}
						disabled={saving || !body.trim()}
					>
						{saving ? (
							<>
								<Loader2 className="size-4 animate-spin" />
								Saving
							</>
						) : (
							"Save to inbox"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
