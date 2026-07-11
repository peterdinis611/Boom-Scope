"use client";

import { useMutation } from "convex/react";
import { Columns3, Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { getErrorMessage } from "@/lib/errors";
import type { KanbanColumn } from "@/lib/kanban";

type KanbanColumnManagerProps = {
	projectId: Id<"projects">;
	columns: KanbanColumn[];
};

export function KanbanColumnManager({
	projectId,
	columns,
}: KanbanColumnManagerProps) {
	const [open, setOpen] = useState(false);
	const [label, setLabel] = useState("");
	const [isSaving, setIsSaving] = useState(false);
	const createColumn = useMutation(api.kanban_columns.create);
	const removeColumn = useMutation(api.kanban_columns.remove);

	const handleCreate = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!label.trim()) return;

		setIsSaving(true);
		try {
			await createColumn({ projectId, label: label.trim() });
			setLabel("");
			toast.success("Column added");
		} catch (error) {
			toast.error(getErrorMessage(error) || "Failed to add column");
		} finally {
			setIsSaving(false);
		}
	};

	const handleRemove = async (columnId: Id<"kanban_columns">) => {
		try {
			await removeColumn({ columnId });
			toast.success("Column removed");
		} catch (error) {
			toast.error(getErrorMessage(error) || "Failed to remove column");
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button type="button" variant="outline" size="sm" className="gap-2">
					<Columns3 className="size-4" />
					Columns
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Board columns</DialogTitle>
				</DialogHeader>
				<div className="space-y-3">
					{columns.map((column) => (
						<div
							key={column._id}
							className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
						>
							<div>
								<p className="text-sm font-medium">{column.label}</p>
								{column.key ? (
									<p className="text-xs text-muted-foreground">Default column</p>
								) : null}
							</div>
							{!column.key ? (
								<Button
									type="button"
									size="icon-xs"
									variant="ghost"
									className="text-destructive"
									onClick={() => void handleRemove(column._id)}
									aria-label={`Delete ${column.label}`}
								>
									<Trash2 className="size-3.5" />
								</Button>
							) : null}
						</div>
					))}
				</div>
				<form onSubmit={(event) => void handleCreate(event)} className="space-y-3">
					<div className="space-y-2">
						<Label htmlFor="new-column-label">New column</Label>
						<Input
							id="new-column-label"
							value={label}
							onChange={(event) => setLabel(event.target.value)}
							placeholder="e.g. Review, Blocked, QA"
						/>
					</div>
					<DialogFooter>
						<Button type="submit" disabled={!label.trim() || isSaving} className="gap-2">
							{isSaving ? (
								<Loader2 className="size-4 animate-spin" />
							) : (
								<Plus className="size-4" />
							)}
							Add column
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
