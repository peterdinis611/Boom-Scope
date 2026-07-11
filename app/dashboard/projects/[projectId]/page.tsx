"use client";

import { useMutation, useQuery } from "convex/react";
import {
	ArrowLeft,
	Clock,
	FileText,
	Layout,
	Link2,
	Palette,
	Plus,
	Settings2,
	Sparkles,
	Trash2,
} from "lucide-react";
import Link from "next/link";
import type { Route } from "next";
import { useParams, useRouter } from "next/navigation";
import { EmptyState } from "@/components/layout/EmptyState";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/layout/StatCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LinkLibrary } from "@/components/links/link-library";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { formatAppDate } from "@/lib/locale";

export default function ProjectDetailPage() {
	const params = useParams();
	const router = useRouter();
	const projectIdRaw = params?.projectId;
	const projectId = Array.isArray(projectIdRaw)
		? projectIdRaw[0]
		: projectIdRaw;

	const project = useQuery(
		api.projects.getById,
		projectId ? { projectId: projectId as Id<"projects"> } : "skip",
	);

	const designs = useQuery(
		api.designs.listByProject,
		projectId ? { projectId: projectId as Id<"projects"> } : "skip",
	);

	const designSystems = useQuery(
		api.design_systems.getByProject,
		projectId ? { projectId: projectId as Id<"projects"> } : "skip",
	);

	const notes = useQuery(
		api.notes.list,
		projectId
			? {
					projectId: projectId as Id<"projects">,
					paginationOpts: { numItems: 100, cursor: null },
				}
			: "skip",
	);

	const projectLinks = useQuery(
		api.project_links.list,
		projectId ? { projectId: projectId as Id<"projects"> } : "skip",
	);

	if (project === undefined) {
		return (
			<PageContainer>
				<div className="flex h-40 items-center justify-center">
					<div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
				</div>
			</PageContainer>
		);
	}

	if (project === null) {
		return (
			<PageContainer>
				<EmptyState
					icon={Trash2}
					title="Project does not exist"
					description="Project not found or you do not have access."
					action={
						<Button onClick={() => router.push("/dashboard/projects")}>
							Back to projects
						</Button>
					}
				/>
			</PageContainer>
		);
	}

	return (
		<PageContainer className="space-y-8">
			<Button
				variant="ghost"
				size="sm"
				onClick={() => router.back()}
				className="gap-2"
			>
				<ArrowLeft className="size-4" />
				Back
			</Button>

			<PageHeader
				title={project.name}
				description={
					project.description ||
					"This project has no description yet. You can add one in settings."
				}
				actions={
					<Button
						variant="outline"
						onClick={() =>
							router.push(`/dashboard/projects/${projectId}/settings`)
						}
						className="gap-2"
					>
						<Settings2 className="size-4" />
						Settings
					</Button>
				}
			/>

			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				<StatCard
					title="Notes"
					value={notes?.page?.length ?? 0}
					icon={FileText}
					href={`/dashboard/notes?projectId=${projectId}`}
				/>
				<StatCard
					title="Links"
					value={projectLinks?.length ?? 0}
					icon={Link2}
					href={`/dashboard/links?projectId=${projectId}` as Route}
				/>
				<StatCard
					title="Canvas"
					value={designs?.length ?? 0}
					icon={Palette}
					href={`/dashboard/canvas?projectId=${projectId}`}
				/>
				<StatCard
					title="Design System"
					value={designSystems?.length ?? 0}
					icon={Layout}
					href={`/dashboard/design-system/v2?projectId=${projectId}`}
				/>
			</div>

			<section className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="section-title">Important links</h2>
					<Button
						size="sm"
						variant="outline"
						onClick={() =>
							router.push(
								`/dashboard/links?projectId=${projectId}` as Route,
							)
						}
						className="gap-2"
					>
						<Link2 className="size-4" />
						Open Link Hub
					</Button>
				</div>
				<LinkLibrary
					defaultProjectId={projectId as Id<"projects">}
					compact
				/>
			</section>

			<section className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="section-title">Canvasi</h2>
					<Button
						size="sm"
						onClick={() =>
							router.push(`/dashboard/canvas?projectId=${projectId}`)
						}
						className="gap-2"
					>
						<Plus className="size-4" />
						New canvas
					</Button>
				</div>
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{designs?.map((design) => (
						<Link
							key={design._id}
							href={`/dashboard/canvas?projectId=${projectId}&designId=${design._id}`}
						>
							<Card className="transition-colors hover:border-primary/40">
								<CardHeader>
									<CardTitle className="text-base">{design.name}</CardTitle>
								</CardHeader>
								<CardContent className="flex items-center gap-2 text-xs text-muted-foreground">
									<Clock className="size-3.5" />
									{formatAppDate(design._creationTime)}
								</CardContent>
							</Card>
						</Link>
					))}
					{designs?.length === 0 ? (
						<div className="col-span-full">
							<EmptyState
								icon={Palette}
								title="No canvases"
								description="Create the first canvas for this project."
							/>
						</div>
					) : null}
				</div>
			</section>

			<section className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="section-title">Design systems</h2>
					<Button
						size="sm"
						variant="outline"
						onClick={() =>
							router.push(`/dashboard/design-system/v2?projectId=${projectId}`)
						}
						className="gap-2"
					>
						<Sparkles className="size-4" />
						Open lab
					</Button>
				</div>
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{designSystems?.map((sys) => (
						<Link
							key={sys._id}
							href={`/dashboard/design-system/v2?projectId=${projectId}`}
						>
							<Card className="transition-colors hover:border-primary/40">
								<CardHeader>
									<CardTitle className="line-clamp-1 text-base">
										{sys.description || "Design system"}
									</CardTitle>
								</CardHeader>
								<CardContent className="flex gap-2">
									{sys.colors.slice(0, 4).map((c, i) => (
										<div
											key={i}
											className="size-6 rounded-md border border-border"
											style={{ backgroundColor: c.hex }}
										/>
									))}
								</CardContent>
							</Card>
						</Link>
					))}
					{designSystems?.length === 0 ? (
						<div className="col-span-full">
							<EmptyState
								icon={Sparkles}
								title="No design systems"
								description="Create a visual identity in Design System Lab."
							/>
						</div>
					) : null}
				</div>
			</section>
		</PageContainer>
	);
}
