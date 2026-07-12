"use client";

import { useMutation } from "convex/react";
import { Columns3, Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
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

type ColumnDraft = {
	label: string;
	wipLimit: string;
};

function ColumnEditorRow({
	column,
	onSave,
	onRemove,
}: {
	column: KanbanColumn;
	onSave: (draft: ColumnDraft) => Promise<void>;
	onRemove?: () => Promise<void>;
}) {
	const [draft, setDraft] = useState<ColumnDraft>({
		label: column.label,
		wipLimit: column.wipLimit ? String(column.wipLimit) : "",
	});
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		setDraft({
			label: column.label,
			wipLimit: column.wipLimit ? String(column.wipLimit) : "",
		});
	}, [column.label, column.wipLimit]);

	const hasChanges =
		draft.label.trim() !== column.label ||
		(draft.wipLimit.trim() === ""
			? Boolean(column.wipLimit)
			: Number(draft.wipLimit) !== column.wipLimit);

	const handleSave = async () => {
		setIsSaving(true);
		try {
			await onSave(draft);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="space-y-2 rounded-lg border border-border p-3">
			<div className="grid gap-2 sm:grid-cols-[1fr_88px_auto_auto] sm:items-end">
				<div className="space-y-1.5">
					<Label htmlFor={`column-label-${column._id}`}>Name</Label>
					<Input
						id={`column-label-${column._id}`}
						value={draft.label}
						onChange={(event) =>
							setDraft((current) => ({
								...current,
								label: event.target.value,
							}))
						}
					/>
				</div>
				<div className="space-y-1.5">
					<Label htmlFor={`column-wip-${column._id}`}>WIP limit</Label>
					<Input
						id={`column-wip-${column._id}`}
						type="number"
						min={1}
						placeholder="∞"
						value={draft.wipLimit}
						onChange={(event) =>
							setDraft((current) => ({
								...current,
								wipLimit: event.target.value,
							}))
						}
					/>
				</div>
				<Button
					type="button"
					size="sm"
					variant="outline"
					disabled={!hasChanges || !draft.label.trim() || isSaving}
					onClick={() => void handleSave()}
				>
					{isSaving ? <Loader2 className="size-4 animate-spin" /> : "Save"}
				</Button>
				{onRemove ? (
					<Button
						type="button"
						size="icon-sm"
						variant="ghost"
						className="text-destructive"
						onClick={() => void onRemove()}
						aria-label={`Delete ${column.label}`}
					>
						<Trash2 className="size-4" />
					</Button>
				) : (
					<div className="hidden sm:block" />
				)}
			</div>
			{column.key ? (
				<p className="text-xs text-muted-foreground">
					Default workflow column — you can rename it and set a WIP limit.
				</p>
			) : null}
		</div>
	);
}

export function KanbanColumnManager({
	projectId,
	columns,
}: KanbanColumnManagerProps) {
	const [open, setOpen] = useState(false);
	const [label, setLabel] = useState("");
	const [isCreating, setIsCreating] = useState(false);
	const createColumn = useMutation(api.kanban_columns.create);
	const updateColumn = useMutation(api.kanban_columns.update);
	const removeColumn = useMutation(api.kanban_columns.remove);

	const handleCreate = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!label.trim()) return;

		setIsCreating(true);
		try {
			await createColumn({ projectId, label: label.trim() });
			setLabel("");
			toast.success("Column added");
		} catch (error) {
			toast.error(getErrorMessage(error) || "Failed to add column");
		} finally {
			setIsCreating(false);
		}
	};

	const handleSave = async (columnId: Id<"kanban_columns">, draft: ColumnDraft) => {
		try {
			const wipValue = draft.wipLimit.trim();
			await updateColumn({
				columnId,
				label: draft.label.trim(),
				wipLimit:
					wipValue === "" ? null : Math.max(1, Math.floor(Number(wipValue))),
			});
			toast.success("Column updated");
		} catch (error) {
			toast.error(getErrorMessage(error) || "Failed to update column");
			throw error;
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
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Board columns</DialogTitle>
				</DialogHeader>
				<div className="space-y-3">
					{columns.map((column) => (
						<ColumnEditorRow
							key={column._id}
							column={column}
							onSave={(draft) => handleSave(column._id, draft)}
							onRemove={
								column.key ? undefined : () => handleRemove(column._id)
							}
						/>
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
						<Button
							type="submit"
							disabled={!label.trim() || isCreating}
							className="gap-2"
						>
							{isCreating ? (
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
