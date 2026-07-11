"use client";

import { Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
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
import type { Id } from "@/convex/_generated/dataModel";
import {
	createSubtask,
	PRIORITY_META,
	TASK_PRIORITIES,
	type TaskPriority,
	type TaskSubtask,
} from "@/lib/kanban";

export type TaskLinkOption = {
	id: string;
	label: string;
};

export type TaskDetailsFormValues = {
	title: string;
	description: string;
	linkedNoteId?: Id<"notes"> | null;
	linkedDesignId?: Id<"designs"> | null;
	dueDate?: string;
	priority?: TaskPriority | null;
	labels: string;
	subtasks: TaskSubtask[];
};

type TaskDetailsDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	mode: "create" | "edit";
	initialValues?: TaskDetailsFormValues;
	noteOptions?: TaskLinkOption[];
	designOptions?: TaskLinkOption[];
	onSubmit: (values: TaskDetailsFormValues) => Promise<void>;
};

const EMPTY_VALUES: TaskDetailsFormValues = {
	title: "",
	description: "",
	linkedNoteId: null,
	linkedDesignId: null,
	dueDate: "",
	priority: null,
	labels: "",
	subtasks: [],
};

export function TaskDetailsDialog({
	open,
	onOpenChange,
	mode,
	initialValues,
	noteOptions = [],
	designOptions = [],
	onSubmit,
}: TaskDetailsDialogProps) {
	const [values, setValues] = useState<TaskDetailsFormValues>(EMPTY_VALUES);
	const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		if (!open) return;
		setValues(initialValues ?? EMPTY_VALUES);
		setNewSubtaskTitle("");
	}, [open, initialValues]);

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		const title = values.title.trim();
		if (!title) return;

		setIsSaving(true);
		try {
			await onSubmit({
				...values,
				title,
				description: values.description.trim(),
				linkedNoteId: values.linkedNoteId ?? null,
				linkedDesignId: values.linkedDesignId ?? null,
			});
			onOpenChange(false);
		} finally {
			setIsSaving(false);
		}
	};

	const addSubtask = () => {
		const title = newSubtaskTitle.trim();
		if (!title) return;
		setValues((current) => ({
			...current,
			subtasks: [...current.subtasks, createSubtask(title)],
		}));
		setNewSubtaskTitle("");
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>
						{mode === "create" ? "Add task with details" : "Edit task"}
					</DialogTitle>
				</DialogHeader>
				<form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="task-title">Title</Label>
						<Input
							id="task-title"
							value={values.title}
							onChange={(event) =>
								setValues((current) => ({
									...current,
									title: event.target.value,
								}))
							}
							placeholder="What needs to be done?"
							autoFocus
						/>
					</div>
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="task-due-date">Due date</Label>
							<Input
								id="task-due-date"
								type="date"
								value={values.dueDate ?? ""}
								onChange={(event) =>
									setValues((current) => ({
										...current,
										dueDate: event.target.value,
									}))
								}
							/>
						</div>
						<div className="space-y-2">
							<Label>Priority</Label>
							<Select
								value={values.priority ?? "none"}
								onValueChange={(value) =>
									setValues((current) => ({
										...current,
										priority:
											value === "none" ? null : (value as TaskPriority),
									}))
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="No priority" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="none">No priority</SelectItem>
									{TASK_PRIORITIES.map((priority) => (
										<SelectItem key={priority} value={priority}>
											{PRIORITY_META[priority].label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
					<div className="space-y-2">
						<Label htmlFor="task-labels">Labels</Label>
						<Input
							id="task-labels"
							value={values.labels}
							onChange={(event) =>
								setValues((current) => ({
									...current,
									labels: event.target.value,
								}))
							}
							placeholder="design, urgent, client"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="task-description">Details</Label>
						<Textarea
							id="task-description"
							value={values.description}
							onChange={(event) =>
								setValues((current) => ({
									...current,
									description: event.target.value,
								}))
							}
							placeholder="Add notes, links, acceptance criteria, or context…"
							rows={4}
						/>
					</div>
					<div className="space-y-2">
						<Label>Checklist</Label>
						<div className="space-y-2 rounded-lg border border-border p-3">
							{values.subtasks.length === 0 ? (
								<p className="text-sm text-muted-foreground">
									Break the task into smaller steps.
								</p>
							) : (
								values.subtasks.map((subtask) => (
									<div key={subtask.id} className="flex items-center gap-2">
										<input
											type="checkbox"
											checked={subtask.completed}
											onChange={(event) =>
												setValues((current) => ({
													...current,
													subtasks: current.subtasks.map((item) =>
														item.id === subtask.id
															? { ...item, completed: event.target.checked }
															: item,
													),
												}))
											}
											className="size-4 rounded border border-border"
										/>
										<Input
											value={subtask.title}
											onChange={(event) =>
												setValues((current) => ({
													...current,
													subtasks: current.subtasks.map((item) =>
														item.id === subtask.id
															? { ...item, title: event.target.value }
															: item,
													),
												}))
											}
											className="h-8"
										/>
										<Button
											type="button"
											size="icon-xs"
											variant="ghost"
											onClick={() =>
												setValues((current) => ({
													...current,
													subtasks: current.subtasks.filter(
														(item) => item.id !== subtask.id,
													),
												}))
											}
										>
											<Trash2 className="size-3.5" />
										</Button>
									</div>
								))
							)}
							<div className="flex gap-2">
								<Input
									value={newSubtaskTitle}
									onChange={(event) => setNewSubtaskTitle(event.target.value)}
									placeholder="Add checklist item"
									className="h-8"
								/>
								<Button
									type="button"
									size="sm"
									variant="outline"
									onClick={addSubtask}
									disabled={!newSubtaskTitle.trim()}
								>
									<Plus className="size-4" />
								</Button>
							</div>
						</div>
					</div>
					{noteOptions.length > 0 ? (
						<div className="space-y-2">
							<Label>Linked note</Label>
							<Select
								value={values.linkedNoteId ?? "none"}
								onValueChange={(value) =>
									setValues((current) => ({
										...current,
										linkedNoteId:
											value === "none" ? null : (value as Id<"notes">),
									}))
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="No linked note" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="none">No linked note</SelectItem>
									{noteOptions.map((option) => (
										<SelectItem key={option.id} value={option.id}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					) : null}
					{designOptions.length > 0 ? (
						<div className="space-y-2">
							<Label>Linked canvas</Label>
							<Select
								value={values.linkedDesignId ?? "none"}
								onValueChange={(value) =>
									setValues((current) => ({
										...current,
										linkedDesignId:
											value === "none" ? null : (value as Id<"designs">),
									}))
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="No linked canvas" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="none">No linked canvas</SelectItem>
									{designOptions.map((option) => (
										<SelectItem key={option.id} value={option.id}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					) : null}
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isSaving}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={!values.title.trim() || isSaving}>
							{isSaving ? (
								<>
									<Loader2 className="size-4 animate-spin" />
									Saving
								</>
							) : mode === "create" ? (
								"Create task"
							) : (
								"Save changes"
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
