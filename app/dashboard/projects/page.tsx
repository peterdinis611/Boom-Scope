"use client";

import { useMutation, useQuery } from "convex/react";
import {
	ArrowRight,
	Clock,
	FolderKanban,
	MoreVertical,
	Plus,
	Search,
	Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { projectSchema } from "@/lib/validations";

export default function ProjectsPage() {
	const projects = useQuery(api.projects.list);
	const createProject = useMutation(api.projects.create);
	const deleteProject = useMutation(api.projects.remove);

	const [searchQuery, setSearchQuery] = useState("");
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [newProjectName, setNewProjectName] = useState("");

	const filteredProjects = projects?.filter((p) =>
		p.name.toLowerCase().includes(searchQuery.toLowerCase()),
	);

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
			setIsCreateModalOpen(false);
			toast.success("Projekt vytvorený!");
		} catch {
			toast.error("Nepodarilo sa vytvoriť projekt.");
		}
	};

	const handleDelete = async (projectId: Id<"projects">) => {
		if (!confirm("Naozaj chcete vymazať tento projekt?")) return;
		try {
			await deleteProject({ projectId });
			toast.success("Projekt vymazaný.");
		} catch {
			toast.error("Chyba pri mazaní projektu.");
		}
	};

	return (
		<div className="min-h-screen bg-background text-foreground p-8 lg:p-12">
			<div className="max-w-7xl mx-auto space-y-12">
				{/* Header */}
				<header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
					<div className="space-y-4">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-black uppercase tracking-[0.2em]"
						>
							<FolderKanban className="size-3" />
							Centrálny Dashboard
						</motion.div>
						<motion.h1
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.1 }}
							className="text-5xl lg:text-7xl font-black tracking-tighter"
						>
							Vaše <span className="text-primary">Projekty</span>
						</motion.h1>
					</div>

					<div className="flex items-center gap-4">
						<div className="relative w-64">
							<Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 opacity-20" />
							<Input
								placeholder="Hľadať projekt..."
								className="pl-12 h-14 rounded-2xl bg-background/40 backdrop-blur-3xl border-border"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</div>
						<Button
							onClick={() => setIsCreateModalOpen(true)}
							className="h-14 px-8 rounded-2xl bg-primary hover:bg-blue-700 text-white shadow-[0_20px_40px_rgba(37,99,235,0.3)] transition-all"
						>
							<Plus className="size-5 mr-2" />
							Nový Projekt
						</Button>
					</div>
				</header>

				{/* Projects Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					<AnimatePresence mode="popLayout">
						{filteredProjects?.map((project, i) => (
							<motion.div
								key={project._id}
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.9 }}
								transition={{ delay: i * 0.05 }}
								className="group relative"
							>
								<Link href={`/dashboard/projects/${project._id}`}>
									<div className="h-64 p-8 rounded-[40px] bg-background/40 backdrop-blur-3xl border border-border hover:border-primary/30 transition-all duration-500 shadow-xl group-hover:shadow-primary/5 group-hover:-translate-y-2 flex flex-col justify-between overflow-hidden">
										{/* Background Accent */}
										<div className="absolute -right-4 -top-4 size-32 bg-primary/5 blur-3xl group-hover:bg-primary/10 transition-colors" />

										<div className="space-y-4">
											<div className="flex items-start justify-between">
												<div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:scale-110 transition-transform duration-500">
													<FolderKanban className="size-6" />
												</div>
												<DropdownMenu>
													<DropdownMenuTrigger
														asChild
														onClick={(e) => e.preventDefault()}
													>
														<Button
															variant="ghost"
															size="icon"
															className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
														>
															<MoreVertical className="size-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent
														align="end"
														className="rounded-2xl border-border bg-background/90 backdrop-blur-xl"
													>
														<DropdownMenuItem
															className="text-red-500 focus:text-red-500 focus:bg-red-500/10 rounded-xl"
															onClick={(e) => {
																e.preventDefault();
																handleDelete(project._id);
															}}
														>
															<Trash2 className="size-4 mr-2" /> Vymazať
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</div>
											<h3 className="text-2xl font-black tracking-tight">
												{project.name}
											</h3>
											<p className="text-sm font-medium opacity-40 line-clamp-2">
												{project.description || "Žiadny popis projektu."}
											</p>
										</div>

										<div className="flex items-center justify-between pt-6 border-t border-border/50">
											<div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest opacity-30">
												<span className="flex items-center gap-1.5">
													<Clock className="size-3" /> Nedávno
												</span>
											</div>
											<div className="size-10 rounded-full bg-foreground/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500">
												<ArrowRight className="size-4" />
											</div>
										</div>
									</div>
								</Link>
							</motion.div>
						))}
					</AnimatePresence>

					{/* Empty State */}
					{projects && filteredProjects?.length === 0 && (
						<div className="col-span-full py-32 flex flex-col items-center justify-center space-y-8 opacity-20">
							<div className="size-32 rounded-[48px] border-4 border-dashed border-foreground/20 flex items-center justify-center">
								<FolderKanban className="size-12" />
							</div>
							<div className="text-center">
								<p className="text-xl font-black uppercase tracking-widest">
									Žiadne projekty
								</p>
								<p className="text-sm font-medium">
									Vytvorte si svoj prvý projekt na začatie práce
								</p>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Create Project Modal */}
			<AnimatePresence>
				{isCreateModalOpen && (
					<div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={() => setIsCreateModalOpen(false)}
							className="absolute inset-0 bg-background/80 backdrop-blur-md"
						/>
						<motion.div
							initial={{ opacity: 0, scale: 0.9, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.9, y: 20 }}
							className="relative w-full max-w-lg p-10 rounded-[40px] bg-background border border-border shadow-2xl"
						>
							<h2 className="text-3xl font-black tracking-tight mb-8">
								Nový <span className="text-primary">Projekt</span>
							</h2>
							<form onSubmit={handleCreate} className="space-y-8">
								<div className="space-y-4">
									<label className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 ml-4">
										Názov Projektu
									</label>
									<Input
										autoFocus
										value={newProjectName}
										onChange={(e) => setNewProjectName(e.target.value)}
										placeholder="Napr. Moderná Vila, Web App..."
										className="h-16 rounded-[24px] bg-foreground/5 border-border text-lg font-bold px-8 focus:ring-2 focus:ring-primary/20"
									/>
								</div>
								<div className="flex gap-4">
									<Button
										type="button"
										variant="ghost"
										onClick={() => setIsCreateModalOpen(false)}
										className="flex-1 h-16 rounded-[24px] font-black uppercase tracking-widest text-xs"
									>
										Zrušiť
									</Button>
									<Button
										type="submit"
										disabled={!newProjectName.trim()}
										className="flex-2 h-16 px-10 rounded-[24px] bg-primary hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs shadow-xl"
									>
										Vytvoriť Projekt
									</Button>
								</div>
							</form>
						</motion.div>
					</div>
				)}
			</AnimatePresence>
		</div>
	);
}
