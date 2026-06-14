"use client";

import { useMutation, useQuery } from "convex/react";
import { AlertTriangle, ArrowLeft, Check, Loader2, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export default function ProjectSettingsPage() {
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

	const updateProject = useMutation(api.projects.update);
	const deleteProject = useMutation(api.projects.remove);

	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [isUpdating, setIsUpdating] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [deleteConfirm, setDeleteConfirm] = useState("");

	useEffect(() => {
		if (project) {
			if (name === "") setName(project.name);
			if (description === "" && project.description)
				setDescription(project.description);
		}
	}, [project, name, description]);

	if (project === undefined) {
		return (
			<PageContainer>
				<div className="flex h-40 items-center justify-center">
					<Loader2 className="size-8 animate-spin text-primary" />
				</div>
			</PageContainer>
		);
	}

	if (project === null) {
		return (
			<PageContainer>
				<p className="text-sm text-muted-foreground">Projekt neexistuje.</p>
				<Button onClick={() => router.push("/dashboard/projects")}>
					Späť na projekty
				</Button>
			</PageContainer>
		);
	}

	const handleUpdate = async () => {
		if (!name.trim()) {
			toast.error("Názov projektu nemôže byť prázdny");
			return;
		}
		setIsUpdating(true);
		try {
			await updateProject({
				projectId: projectId as Id<"projects">,
				name,
				description,
			});
			toast.success("Projekt bol aktualizovaný");
		} catch {
			toast.error("Chyba pri aktualizácii projektu");
		} finally {
			setIsUpdating(false);
		}
	};

	const handleDelete = async () => {
		if (deleteConfirm !== project.name) {
			toast.error("Pre zmazanie zadajte presný názov projektu");
			return;
		}
		setIsDeleting(true);
		try {
			await deleteProject({ projectId: projectId as Id<"projects"> });
			toast.success("Projekt bol vymazaný");
			router.push("/dashboard/projects");
		} catch {
			toast.error("Chyba pri mazaní projektu");
			setIsDeleting(false);
		}
	};

	return (
		<PageContainer className="max-w-2xl space-y-6">
			<Button
				variant="ghost"
				size="sm"
				onClick={() => router.push(`/dashboard/projects/${projectId}`)}
				className="gap-2"
			>
				<ArrowLeft className="size-4" />
				Späť na projekt
			</Button>

			<PageHeader title="Nastavenia projektu" description={project.name} />

			<Card>
				<CardHeader>
					<CardTitle>Všeobecné</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="project-name">Názov projektu</Label>
						<Input
							id="project-name"
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="project-description">Popis</Label>
						<Textarea
							id="project-description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Krátky popis projektu"
						/>
					</div>
					<Button
						onClick={handleUpdate}
						disabled={
							isUpdating ||
							(name === project.name &&
								description === (project.description || ""))
						}
						className="gap-2"
					>
						{isUpdating ? (
							<Loader2 className="size-4 animate-spin" />
						) : (
							<Check className="size-4" />
						)}
						Uložiť zmeny
					</Button>
				</CardContent>
			</Card>

			<Card className="border-destructive/30">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-destructive">
						<AlertTriangle className="size-4" />
						Nebezpečná zóna
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<p className="text-sm text-muted-foreground">
						Zmazanie projektu je nevratné. Všetky súvisiace dáta budú odstránené.
					</p>
					<div className="space-y-2">
						<Label htmlFor="delete-confirm">
							Pre potvrdenie napíšte: {project.name}
						</Label>
						<Input
							id="delete-confirm"
							value={deleteConfirm}
							onChange={(e) => setDeleteConfirm(e.target.value)}
							placeholder={project.name}
						/>
					</div>
					<Button
						variant="destructive"
						onClick={handleDelete}
						disabled={isDeleting || deleteConfirm !== project.name}
						className="gap-2"
					>
						{isDeleting ? (
							<Loader2 className="size-4 animate-spin" />
						) : (
							<Trash2 className="size-4" />
						)}
						Trvalo zmazať
					</Button>
				</CardContent>
			</Card>
		</PageContainer>
	);
}
