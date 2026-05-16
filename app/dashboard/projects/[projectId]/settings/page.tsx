"use client";

import { useMutation, useQuery } from "convex/react";
import {
	AlertTriangle,
	ArrowLeft,
	Check,
	FolderKanban,
	Loader2,
	Settings2,
	Trash2,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
			if (name === "") {
				// eslint-disable-next-line react-hooks/set-state-in-effect
				setName(project.name);
			}
			if (description === "" && project.description) {
				// eslint-disable-next-line react-hooks/set-state-in-effect
				setDescription(project.description);
			}
		}
	}, [project, name, description]);

	if (project === undefined) {
		return (
			<div className="flex h-[calc(100vh-100px)] w-full items-center justify-center">
				<Loader2 className="size-8 animate-spin opacity-20 text-primary" />
			</div>
		);
	}

	if (project === null) {
		return (
			<div className="flex h-screen flex-col items-center justify-center space-y-6">
				<div className="size-20 rounded-[32px] bg-red-500/10 flex items-center justify-center text-red-500">
					<Trash2 className="size-8" />
				</div>
				<div className="text-center space-y-2">
					<h2 className="text-2xl font-black uppercase tracking-tight">
						Projekt neexistuje
					</h2>
				</div>
				<Button
					onClick={() => router.push("/dashboard/projects")}
					variant="outline"
					className="h-14 px-8 rounded-2xl"
				>
					Späť na projekty
				</Button>
			</div>
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
			toast.success("Projekt bol úspešne aktualizovaný");
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
		<div className="min-h-screen bg-background text-foreground p-8 lg:p-12">
			<div className="max-w-4xl mx-auto space-y-12">
				<header className="space-y-8">
					<Button
						variant="ghost"
						onClick={() => router.push(`/dashboard/projects/${projectId}`)}
						className="group rounded-xl hover:bg-foreground/5 -ml-4"
					>
						<ArrowLeft className="size-5 mr-2 group-hover:-translate-x-1 transition-transform" />
						Späť na projekt
					</Button>

					<div className="flex items-center gap-6">
						<div className="size-16 rounded-[24px] flex items-center justify-center border border-primary/20 bg-primary/10 shadow-sm">
							<Settings2 className="size-8 text-primary" />
						</div>
						<div>
							<p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mb-1">
								Nastavenia
							</p>
							<h1 className="text-3xl lg:text-4xl font-black tracking-tighter">
								{project.name}
							</h1>
						</div>
					</div>
				</header>

				<div className="space-y-12">
					{/* Všeobecné nastavenia */}
					<section className="space-y-8">
						<div className="space-y-2">
							<h3 className="text-xl font-black tracking-tight flex items-center gap-2">
								<FolderKanban className="size-5 opacity-40" /> Všeobecné detaily
							</h3>
							<p className="text-[10px] font-bold opacity-30 uppercase tracking-widest">
								Základné informácie o projekte
							</p>
						</div>

						<div className="p-8 rounded-[40px] bg-foreground/5 border border-border space-y-8">
							<div className="space-y-3">
								<Label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 px-1">
									Názov projektu
								</Label>
								<Input
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder="Zadajte názov"
									className="h-14 bg-background border-border rounded-2xl px-6 text-sm font-bold focus:border-primary transition-all"
								/>
							</div>

							<div className="space-y-3">
								<Label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 px-1">
									Popis projektu
								</Label>
								<Textarea
									value={description}
									onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
										setDescription(e.target.value)
									}
									placeholder="Pridajte krátky popis projektu..."
									className="min-h-[120px] bg-background border-border rounded-2xl p-6 text-sm font-medium resize-y focus:border-primary transition-all"
								/>
							</div>

							<div className="flex justify-end pt-4 border-t border-border/50">
								<Button
									onClick={handleUpdate}
									disabled={
										isUpdating ||
										(name === project.name &&
											description === (project.description || ""))
									}
									className="h-14 px-10 rounded-2xl text-white font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-primary/20 gap-3 bg-primary hover:bg-primary/90"
								>
									{isUpdating ? (
										<Loader2 className="size-4 animate-spin" />
									) : (
										<Check className="size-4" />
									)}
									Uložiť zmeny
								</Button>
							</div>
						</div>
					</section>

					{/* Nebezpečná zóna */}
					<section className="space-y-8 pt-8 border-t border-red-500/10">
						<div className="space-y-2">
							<h3 className="text-xl font-black tracking-tight text-red-500 flex items-center gap-2">
								<AlertTriangle className="size-5" /> Nebezpečná zóna
							</h3>
							<p className="text-[10px] font-bold opacity-30 uppercase tracking-widest">
								Trvalé odstránenie dát
							</p>
						</div>

						<div className="p-8 rounded-[40px] border border-red-500/20 bg-red-500/5 space-y-6">
							<div className="space-y-2">
								<h4 className="text-sm font-bold text-red-500">
									Zmazať projekt
								</h4>
								<p className="text-xs font-medium opacity-60 leading-relaxed max-w-2xl">
									Po zmazaní projektu nebudete môcť obnoviť jeho dáta, dizajny
									ani poznámky. Táto akcia je nevratná.
								</p>
							</div>

							<div className="space-y-3 pt-4">
								<Label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 px-1 text-red-500">
									Pre potvrdenie napíšte:{" "}
									<span className="font-bold">{project.name}</span>
								</Label>
								<div className="flex gap-4 items-center">
									<Input
										value={deleteConfirm}
										onChange={(e) => setDeleteConfirm(e.target.value)}
										placeholder={project.name}
										className="h-14 bg-background border-red-500/30 rounded-2xl px-6 text-sm font-bold focus:border-red-500 transition-all max-w-sm"
									/>
									<Button
										onClick={handleDelete}
										disabled={isDeleting || deleteConfirm !== project.name}
										variant="destructive"
										className="h-14 px-10 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-red-500/20 gap-3"
									>
										{isDeleting ? (
											<Loader2 className="size-4 animate-spin" />
										) : (
											<Trash2 className="size-4" />
										)}
										Trvalo zmazať
									</Button>
								</div>
							</div>
						</div>
					</section>
				</div>
			</div>
		</div>
	);
}
