"use client";

import { useMutation, useQuery } from "convex/react";
import {
	ExternalLink,
	Link2,
	Pin,
	PinOff,
	Plus,
	Search,
	Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/layout/EmptyState";
import { ProjectSelector } from "@/components/notes/ProjectSelector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import {
	getLinkCategoryClassName,
	getLinkCategoryLabel,
	getLinkHostname,
	LINK_CATEGORIES,
	type LinkCategory,
	normalizeLinkUrl,
} from "@/lib/link-utils";
import { cn } from "@/lib/utils";

type ProjectLink = Doc<"project_links"> & { projectName?: string | null };

type LinkFormState = {
	title: string;
	url: string;
	description: string;
	category: LinkCategory;
	projectId?: Id<"projects">;
	isPinned: boolean;
};

const EMPTY_FORM: LinkFormState = {
	title: "",
	url: "",
	description: "",
	category: "general",
	projectId: undefined,
	isPinned: false,
};

type LinkLibraryProps = {
	defaultProjectId?: Id<"projects">;
	compact?: boolean;
};

export function LinkLibrary({
	defaultProjectId,
	compact = false,
}: LinkLibraryProps) {
	const [searchTerm, setSearchTerm] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [categoryFilter, setCategoryFilter] = useState<LinkCategory | "all">(
		"all",
	);
	const [projectFilter, setProjectFilter] = useState<Id<"projects"> | undefined>(
		defaultProjectId,
	);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingLink, setEditingLink] = useState<ProjectLink | null>(null);
	const [form, setForm] = useState<LinkFormState>({
		...EMPTY_FORM,
		projectId: defaultProjectId,
	});

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedSearch(searchTerm), 250);
		return () => clearTimeout(timer);
	}, [searchTerm]);

	const links = useQuery(api.project_links.list, {
		projectId: projectFilter,
		searchTerm: debouncedSearch || undefined,
		category: categoryFilter === "all" ? undefined : categoryFilter,
	});
	const projects = useQuery(api.projects.list);

	const createLink = useMutation(api.project_links.create);
	const updateLink = useMutation(api.project_links.update);
	const removeLink = useMutation(api.project_links.remove);
	const togglePin = useMutation(api.project_links.togglePin);

	const pinnedCount = useMemo(
		() => links?.filter((link) => link.isPinned).length ?? 0,
		[links],
	);

	const openCreateDialog = () => {
		setEditingLink(null);
		setForm({ ...EMPTY_FORM, projectId: projectFilter ?? defaultProjectId });
		setDialogOpen(true);
	};

	const openEditDialog = (link: ProjectLink) => {
		setEditingLink(link);
		setForm({
			title: link.title,
			url: link.url,
			description: link.description ?? "",
			category: link.category,
			projectId: link.projectId,
			isPinned: Boolean(link.isPinned),
		});
		setDialogOpen(true);
	};

	const handleSubmit = async () => {
		try {
			const payload = {
				title: form.title.trim(),
				url: normalizeLinkUrl(form.url),
				description: form.description.trim() || undefined,
				category: form.category,
				projectId: form.projectId,
				isPinned: form.isPinned,
			};

			if (editingLink) {
				await updateLink({ linkId: editingLink._id, ...payload });
				toast.success("Link updated");
			} else {
				await createLink(payload);
				toast.success("Link saved");
			}

			setDialogOpen(false);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to save link");
		}
	};

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
				<div className="grid flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
					<div className="relative sm:col-span-2 xl:col-span-2">
						<Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder="Search links…"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-9"
						/>
					</div>
					<Select
						value={categoryFilter}
						onValueChange={(value) =>
							setCategoryFilter(value as LinkCategory | "all")
						}
					>
						<SelectTrigger>
							<SelectValue placeholder="Category" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All categories</SelectItem>
							{LINK_CATEGORIES.map((category) => (
								<SelectItem key={category.id} value={category.id}>
									{category.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{!defaultProjectId ? (
						<Select
							value={projectFilter ?? "all"}
							onValueChange={(value) =>
								setProjectFilter(
									value === "all" ? undefined : (value as Id<"projects">),
								)
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="All projects" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All projects</SelectItem>
								{projects?.map((project) => (
									<SelectItem key={project._id} value={project._id}>
										{project.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					) : null}
				</div>

				<Button className="gap-2" onClick={openCreateDialog}>
					<Plus className="size-4" />
					Add link
				</Button>
			</div>

			{!compact ? (
				<div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
					<span>{links?.length ?? 0} links</span>
					{pinnedCount > 0 ? <span>· {pinnedCount} pinned</span> : null}
				</div>
			) : null}

			{links === undefined ? (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{[1, 2, 3].map((item) => (
						<Card key={item} className="h-36 animate-pulse bg-muted/30" />
					))}
				</div>
			) : links.length === 0 ? (
				<EmptyState
					icon={Link2}
					title="No links yet"
					description="Save important URLs for projects, docs, tools, and references."
					action={
						<Button onClick={openCreateDialog} className="gap-2">
							<Plus className="size-4" />
							Add first link
						</Button>
					}
				/>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
					{links.map((link) => (
						<Card
							key={link._id}
							className={cn(
								"group transition-colors hover:border-primary/30",
								link.isPinned && "border-primary/30 bg-primary/5",
							)}
						>
							<CardHeader className="space-y-3 pb-3">
								<div className="flex items-start justify-between gap-3">
									<div className="min-w-0 space-y-1">
										<CardTitle className="line-clamp-2 text-base">
											{link.title}
										</CardTitle>
										<p className="truncate text-xs text-muted-foreground">
											{getLinkHostname(link.url)}
										</p>
									</div>
									{link.isPinned ? (
										<Pin className="size-4 shrink-0 text-primary" />
									) : null}
								</div>
								<div className="flex flex-wrap gap-2">
									<span
										className={cn(
											"rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
											getLinkCategoryClassName(link.category),
										)}
									>
										{getLinkCategoryLabel(link.category)}
									</span>
									{link.projectName ? (
										<span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
											{link.projectName}
										</span>
									) : null}
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								{link.description ? (
									<p className="line-clamp-3 text-sm text-muted-foreground">
										{link.description}
									</p>
								) : null}
								<div className="flex flex-wrap gap-2">
									<Button asChild size="sm" className="gap-1.5">
										<a href={link.url} target="_blank" rel="noreferrer noopener">
											<ExternalLink className="size-3.5" />
											Open
										</a>
									</Button>
									<Button
										size="sm"
										variant="outline"
										onClick={() => openEditDialog(link)}
									>
										Edit
									</Button>
									<Button
										size="sm"
										variant="outline"
										onClick={() => togglePin({ linkId: link._id })}
									>
										{link.isPinned ? (
											<PinOff className="size-3.5" />
										) : (
											<Pin className="size-3.5" />
										)}
									</Button>
									<Button
										size="sm"
										variant="ghost"
										className="text-destructive hover:text-destructive"
										onClick={async () => {
											await removeLink({ linkId: link._id });
											toast.success("Link removed");
										}}
									>
										<Trash2 className="size-3.5" />
									</Button>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent className="sm:max-w-lg">
					<DialogHeader>
						<DialogTitle>{editingLink ? "Edit link" : "Add link"}</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<div className="space-y-1.5">
							<Label htmlFor="link-title">Title</Label>
							<Input
								id="link-title"
								value={form.title}
								onChange={(e) => setForm({ ...form, title: e.target.value })}
								placeholder="Figma board, API docs…"
							/>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="link-url">URL</Label>
							<Input
								id="link-url"
								value={form.url}
								onChange={(e) => setForm({ ...form, url: e.target.value })}
								placeholder="https://example.com"
							/>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="link-description">Description</Label>
							<Textarea
								id="link-description"
								value={form.description}
								onChange={(e) =>
									setForm({ ...form, description: e.target.value })
								}
								placeholder="Why this link matters…"
								rows={3}
							/>
						</div>
						<div className="grid gap-3 sm:grid-cols-2">
							<div className="space-y-1.5">
								<Label>Category</Label>
								<Select
									value={form.category}
									onValueChange={(value) =>
										setForm({ ...form, category: value as LinkCategory })
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{LINK_CATEGORIES.map((category) => (
											<SelectItem key={category.id} value={category.id}>
												{category.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-1.5">
								<Label>Project</Label>
								<ProjectSelector
									value={form.projectId}
									onChange={(projectId) => setForm({ ...form, projectId })}
								/>
							</div>
						</div>
						<label className="flex items-center gap-2 text-sm">
							<input
								type="checkbox"
								checked={form.isPinned}
								onChange={(e) =>
									setForm({ ...form, isPinned: e.target.checked })
								}
								className="size-4 rounded border-border accent-primary"
							/>
							Pin this link
						</label>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDialogOpen(false)}>
							Cancel
						</Button>
						<Button onClick={handleSubmit}>
							{editingLink ? "Save changes" : "Add link"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
