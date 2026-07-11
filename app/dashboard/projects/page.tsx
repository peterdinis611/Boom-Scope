"use client";

import { useMutation, useQuery } from "convex/react";
import { FolderKanban, MoreVertical, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/layout/ConfirmDialog";
import { EmptyState } from "@/components/layout/EmptyState";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { fuseSearch } from "@/lib/fuse-search";
import { projectSchema } from "@/lib/validations";

export default function ProjectsPage() {
	const projects = useQuery(api.projects.list);
	const createProject = useMutation(api.projects.create);
	const deleteProject = useMutation(api.projects.remove);

	const [searchQuery, setSearchQuery] = useState("");
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [newProjectName, setNewProjectName] = useState("");
	const [deleteTarget, setDeleteTarget] = useState<Id<"projects"> | null>(null);
	const [deleting, setDeleting] = useState(false);

	const filteredProjects = useMemo(() => {
		if (!projects) return undefined;
		return fuseSearch(projects, searchQuery, ["name", "description"]);
	}, [projects, searchQuery]);

	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault();
		const validation = projectSchema.safeParse({ name: newProjectName });
		if (!validation.success) {
			toast.error(validation.error.message);
			return;
		}
		try {
			await createProject({ name: newProjectName });
			setNewProjectName("");
			setIsCreateOpen(false);
			toast.success("Project created.");
		} catch {
			toast.error("Failed to create project.");
		}
	};

	const handleDelete = async () => {
		if (!deleteTarget) return;
		setDeleting(true);
		try {
			await deleteProject({ projectId: deleteTarget });
			toast.success("Project deleted.");
			setDeleteTarget(null);
		} catch {
			toast.error("Error deleting project.");
		} finally {
			setDeleting(false);
		}
	};

	return (
		<PageContainer className="space-y-6">
			<PageHeader
				title="Projects"
				description="Manage all your projects in one place."
				actions={
					<Button onClick={() => setIsCreateOpen(true)} className="gap-2">
						<Plus className="size-4" />
						New project
					</Button>
				}
			/>

			<div className="relative max-w-sm">
				<Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					placeholder="Search projects…"
					className="pl-9"
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
				/>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{!projects
					? Array.from({ length: 6 }).map((_, i) => (
							<Card key={`sk-${i}`}>
								<CardHeader>
									<Skeleton className="h-5 w-2/3" />
								</CardHeader>
								<CardContent>
									<Skeleton className="h-4 w-full" />
								</CardContent>
							</Card>
						))
					: null}

				{projects && filteredProjects?.length === 0 ? (
					<div className="col-span-full">
						<EmptyState
							icon={FolderKanban}
							title="No projects"
							description="Create your first project and get started."
							action={
								<Button onClick={() => setIsCreateOpen(true)}>
									New project
								</Button>
							}
						/>
					</div>
				) : null}

				{filteredProjects?.map((project) => (
					<Card
						key={project._id}
						className="group transition-colors hover:border-primary/40"
					>
						<CardHeader className="flex flex-row items-start justify-between space-y-0">
							<Link
								href={`/dashboard/projects/${project._id}`}
								className="min-w-0 flex-1"
							>
								<CardTitle className="line-clamp-1 text-base">
									{project.name}
								</CardTitle>
							</Link>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										size="icon-sm"
										aria-label="Project options"
									>
										<MoreVertical className="size-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem
										className="text-destructive focus:text-destructive"
										onClick={() => setDeleteTarget(project._id)}
									>
										<Trash2 className="size-4" />
										Delete
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</CardHeader>
						<CardContent>
							<Link href={`/dashboard/projects/${project._id}`}>
								<p className="line-clamp-2 text-sm text-muted-foreground">
									{project.description || "No description"}
								</p>
							</Link>
						</CardContent>
					</Card>
				))}
			</div>

			<Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>New project</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleCreate} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="project-name">Project name</Label>
							<Input
								id="project-name"
								autoFocus
								value={newProjectName}
								onChange={(e) => setNewProjectName(e.target.value)}
								placeholder="e.g. Web application"
							/>
						</div>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setIsCreateOpen(false)}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={!newProjectName.trim()}>
								Create
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			<ConfirmDialog
				open={deleteTarget !== null}
				onOpenChange={(open) => !open && setDeleteTarget(null)}
				title="Delete project?"
				description="This action cannot be undone."
				confirmLabel="Delete"
				variant="destructive"
				onConfirm={handleDelete}
				loading={deleting}
			/>
		</PageContainer>
	);
}
