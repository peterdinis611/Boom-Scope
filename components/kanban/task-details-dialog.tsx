"use client";

import { Loader2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";

export type TaskDetailsFormValues = {
	title: string;
	description: string;
};

type TaskDetailsDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	mode: "create" | "edit";
	initialValues?: TaskDetailsFormValues;
	onSubmit: (values: TaskDetailsFormValues) => Promise<void>;
};

const EMPTY_VALUES: TaskDetailsFormValues = {
	title: "",
	description: "",
};

export function TaskDetailsDialog({
	open,
	onOpenChange,
	mode,
	initialValues,
	onSubmit,
}: TaskDetailsDialogProps) {
	const [values, setValues] = useState<TaskDetailsFormValues>(EMPTY_VALUES);
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		if (!open) return;
		setValues(initialValues ?? EMPTY_VALUES);
	}, [open, initialValues]);

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		const title = values.title.trim();
		if (!title) return;

		setIsSaving(true);
		try {
			await onSubmit({
				title,
				description: values.description.trim(),
			});
			onOpenChange(false);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-lg">
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
							rows={5}
						/>
					</div>
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
