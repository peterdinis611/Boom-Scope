"use client";

import { useMutation, useQuery } from "convex/react";
import {
	FileText,
	Inbox,
	Loader2,
	SquareKanban,
	StickyNote,
	Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/layout/EmptyState";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { formatAppDateTime } from "@/lib/locale";

export function InboxPageClient() {
	const items = useQuery(api.inbox.listOpen);
	const projects = useQuery(api.projects.list);
	const triageToNote = useMutation(api.inbox.triageToNote);
	const triageToTask = useMutation(api.inbox.triageToTask);
	const triageToSticky = useMutation(api.inbox.triageToSticky);
	const removeItem = useMutation(api.inbox.remove);

	const [projectByItem, setProjectByItem] = useState<
		Record<string, string | undefined>
	>({});
	const [busyId, setBusyId] = useState<string | null>(null);

	const projectOptions = useMemo(() => projects ?? [], [projects]);

	const run = async (
		itemId: Id<"inbox_items">,
		action: () => Promise<unknown>,
		success: string,
	) => {
		setBusyId(itemId);
		try {
			await action();
			toast.success(success);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Triage failed.",
			);
		} finally {
			setBusyId(null);
		}
	};

	return (
		<PageContainer className="space-y-6">
			<PageHeader
				title="Inbox"
				description="Capture fast with ⌘N, then sort into a note, task, or sticky."
			/>

			{items === undefined ? (
				<p className="text-sm text-muted-foreground">Loading inbox…</p>
			) : items.length === 0 ? (
				<EmptyState
					icon={Inbox}
					title="Inbox zero"
					description="Nothing waiting. Press ⌘N anytime to capture a thought."
				/>
			) : (
				<ul className="space-y-3">
					{items.map((item) => {
						const selectedProject =
							projectByItem[item._id] ?? projectOptions[0]?._id;
						const busy = busyId === item._id;

						return (
							<li
								key={item._id}
								className="rounded-xl border border-border bg-card p-4 shadow-sm"
							>
								<p className="whitespace-pre-wrap text-sm text-foreground">
									{item.body}
								</p>
								<p className="mt-2 font-mono text-[10px] tracking-wide text-muted-foreground uppercase">
									Captured {formatAppDateTime(item._creationTime)}
								</p>

								<div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
									{projectOptions.length > 0 ? (
										<Select
											value={selectedProject}
											onValueChange={(value) =>
												setProjectByItem((current) => ({
													...current,
													[item._id]: value,
												}))
											}
										>
											<SelectTrigger className="w-full sm:w-52">
												<SelectValue placeholder="Project" />
											</SelectTrigger>
											<SelectContent>
												{projectOptions.map((project) => (
													<SelectItem key={project._id} value={project._id}>
														{project.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									) : (
										<p className="text-xs text-muted-foreground">
											Create a project to triage into tasks.
										</p>
									)}

									<div className="flex flex-wrap gap-2">
										<Button
											type="button"
											size="sm"
											variant="outline"
											disabled={busy}
											className="gap-1.5"
											onClick={() =>
												void run(
													item._id,
													() =>
														triageToNote({
															itemId: item._id,
															projectId: selectedProject
																? (selectedProject as Id<"projects">)
																: undefined,
														}),
													"Moved to note",
												)
											}
										>
											{busy ? (
												<Loader2 className="size-3.5 animate-spin" />
											) : (
												<FileText className="size-3.5" />
											)}
											Note
										</Button>
										<Button
											type="button"
											size="sm"
											variant="outline"
											disabled={busy || !selectedProject}
											className="gap-1.5"
											onClick={() => {
												if (!selectedProject) {
													toast.error("Pick a project for the task.");
													return;
												}
												void run(
													item._id,
													() =>
														triageToTask({
															itemId: item._id,
															projectId: selectedProject as Id<"projects">,
														}),
													"Moved to task",
												);
											}}
										>
											<SquareKanban className="size-3.5" />
											Task
										</Button>
										<Button
											type="button"
											size="sm"
											variant="outline"
											disabled={busy}
											className="gap-1.5"
											onClick={() =>
												void run(
													item._id,
													() =>
														triageToSticky({
															itemId: item._id,
															projectId: selectedProject
																? (selectedProject as Id<"projects">)
																: undefined,
														}),
													"Moved to sticky notes",
												)
											}
										>
											<StickyNote className="size-3.5" />
											Sticky
										</Button>
										<Button
											type="button"
											size="icon-sm"
											variant="ghost"
											disabled={busy}
											className="text-destructive"
											aria-label="Delete capture"
											onClick={() =>
												void run(
													item._id,
													() => removeItem({ itemId: item._id }),
													"Capture deleted",
												)
											}
										>
											<Trash2 className="size-3.5" />
										</Button>
									</div>
								</div>
							</li>
						);
					})}
				</ul>
			)}
		</PageContainer>
	);
}
