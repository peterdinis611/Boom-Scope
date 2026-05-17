"use client";

import { useAction, useMutation, useQuery } from "convex/react";
import {
	AlertCircle,
	Check,
	CheckCircle2,
	Copy,
	Download,
	ExternalLink,
	History,
	Image as ImageIcon,
	Layout,
	Lightbulb,
	Link2,
	MousePointer2,
	NotebookPen,
	Palette,
	Plus,
	RefreshCw,
	Save,
	Sparkles,
	Trash2,
	Type,
	Upload,
	Wand2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useSearchParams } from "next/navigation";
import {
	Suspense,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { QuickNoteDialog } from "@/components/notes/QuickNoteDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { designSystemToFigmaTokensJson } from "@/lib/figma-tokens";
import { cn } from "@/lib/utils";

const aiSystemSchema = z.object({
	colors: z.array(
		z.object({
			name: z.string(),
			hex: z.string().regex(/^#/, "Farba musí byť v HEX formáte"),
			rgb: z.string(),
		}),
	),
	fonts: z.array(z.string()),
	description: z.string().optional(),
	goodThings: z.array(z.string()).optional(),
	badThings: z.array(z.string()).optional(),
	suggestions: z.array(z.string()).optional(),
});

type GeneratedSystem = z.infer<typeof aiSystemSchema>;

type TabId = "assets" | "visual";

export default function DesignSystemV2() {
	const [activeTab, setActiveTab] = useState<TabId>("assets");
	const projects = useQuery(api.projects.list);
	const historyList = useQuery(api.design_systems.listByUser);
	const analyzeDesign = useAction(api.openai.analyzeDesignSystem);
	const generateDesign = useAction(api.openai.generateDesignFromImages);
	const saveSystem = useMutation(api.design_systems.create);
	const updateSystem = useMutation(api.design_systems.update);
	const saveDesignAction = useMutation(api.designs.saveDesign);
	const setPublicMutation = useMutation(api.design_systems.setPublic);
	const deleteSystemMutation = useMutation(api.design_systems.remove);

	const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
		null,
	);
	const [images, setImages] = useState<{ id: string; url: string }[]>([]);
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [isGeneratingDesign, setIsGeneratingDesign] = useState(false);
	const [system, setSystem] = useState<GeneratedSystem | null>(null);
	const [localColors, setLocalColors] = useState<
		{ name: string; hex: string; rgb: string }[]
	>([]);
	const [localFonts, setLocalFonts] = useState<string[]>([]);
	const [newColorName, setNewColorName] = useState("");
	const [newColorHex, setNewColorHex] = useState("#3b82f6");
	const [newFont, setNewFont] = useState("");
	const [lastSavedId, setLastSavedId] = useState<Id<"design_systems"> | null>(
		null,
	);
	const [sharePublic, setSharePublic] = useState(false);
	const { copiedValue, copy: copyToClipboard } = useCopyToClipboard();
	const [isNoteOpen, setIsNoteOpen] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const searchParams = useSearchParams();
	const systemIdParam = searchParams.get("systemId");
	const projectIdParam = searchParams.get("projectId");

	const existingSystem = useQuery(
		api.design_systems.getById,
		systemIdParam ? { id: systemIdParam as Id<"design_systems"> } : "skip",
	);

	useEffect(() => {
		if (existingSystem && !Array.isArray(existingSystem)) {
			setSystem({
				colors: existingSystem.colors,
				fonts: existingSystem.fonts,
				description: existingSystem.description,
				goodThings: existingSystem.goodThings,
				badThings: existingSystem.badThings,
				suggestions: existingSystem.suggestions,
			});
			setLocalColors([]);
			setLocalFonts([]);
			setLastSavedId(existingSystem._id);
			setSharePublic(existingSystem.isPublic ?? false);
			setSelectedProjectId(existingSystem.projectId);
		}
	}, [existingSystem]);

	useEffect(() => {
		if (projectIdParam && !selectedProjectId && !systemIdParam) {
			setSelectedProjectId(projectIdParam);
		}
	}, [projectIdParam, selectedProjectId, systemIdParam]);

	const merged = useMemo(() => {
		const baseColors = system?.colors ?? [];
		const baseFonts = system?.fonts ?? [];
		return {
			colors: [...baseColors, ...localColors],
			fonts: [...baseFonts, ...localFonts],
			description: system?.description,
			goodThings: system?.goodThings,
			badThings: system?.badThings,
			suggestions: system?.suggestions,
		};
	}, [system, localColors, localFonts]);

	const hexToRgb = (hex: string): string => {
		const h = hex.replace("#", "");
		if (h.length !== 6) return "rgb(0, 0, 0)";
		const n = parseInt(h, 16);
		return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
	};

	const persistSystem = async () => {
		if (!selectedProjectId) {
			toast.error("Najprv vyberte projekt!");
			return;
		}
		setIsSaving(true);
		try {
			if (lastSavedId) {
				await updateSystem({
					id: lastSavedId,
					colors: merged.colors,
					fonts: merged.fonts.length > 0 ? merged.fonts : ["Inter, sans-serif"],
					description: merged.description || "Design system",
					goodThings: merged.goodThings,
					badThings: merged.badThings,
					suggestions: merged.suggestions,
				});
				toast.success("Design system aktualizovaný!");
			} else {
				const id = await saveSystem({
					projectId: selectedProjectId as Id<"projects">,
					colors:
						merged.colors.length > 0
							? merged.colors
							: [
								{
									name: "Neutral",
									hex: "#71717a",
									rgb: "rgb(113, 113, 122)",
								},
							],
					fonts: merged.fonts.length > 0 ? merged.fonts : ["Inter, sans-serif"],
					description: merged.description || "Design system",
					goodThings: merged.goodThings,
					badThings: merged.badThings,
					suggestions: merged.suggestions,
				});
				setLastSavedId(id);
				toast.success("Design system uložený!");
			}
		} catch {
			toast.error("Ukladanie zlyhalo.");
		} finally {
			setIsSaving(false);
		}
	};

	const addManualColor = () => {
		let hex = newColorHex.trim();
		if (!hex.startsWith("#")) hex = `#${hex}`;
		if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) {
			toast.error("Zadajte platný HEX.");
			return;
		}
		setLocalColors((prev) => [
			...prev,
			{ name: newColorName.trim() || hex, hex, rgb: hexToRgb(hex) },
		]);
		setNewColorName("");
		toast.success("Farba pridaná");
	};

	const addManualFont = () => {
		const f = newFont.trim();
		if (!f) return;
		setLocalFonts((prev) => [...prev, f]);
		setNewFont("");
		toast.success("Font pridaný");
	};

	const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		files.forEach((file) => {
			const reader = new FileReader();
			reader.onload = () => {
				setImages((prev) => [
					...prev,
					{ id: Math.random().toString(), url: reader.result as string },
				]);
			};
			reader.readAsDataURL(file);
		});
	};

	const analyzeImages = async () => {
		if (images.length === 0 || !selectedProjectId) {
			toast.error(
				images.length === 0 ? "Nahrajte obrázky!" : "Vyberte projekt!",
			);
			return;
		}
		setIsAnalyzing(true);
		try {
			const result = await analyzeDesign({
				imageUrls: images.map((img) => img.url),
			});
			const parsed = aiSystemSchema.parse(result);
			setSystem(parsed);
			toast.success("Analýza dokončená!");
		} catch (error) {
			toast.error("Chyba pri analýze.");
		} finally {
			setIsAnalyzing(false);
		}
	};

	const handleGenerateDesign = async () => {
		if (images.length === 0 || !selectedProjectId) return;
		setIsGeneratingDesign(true);
		try {
			const result = await generateDesign({
				imageUrls: images.map((img) => img.url),
			});
			await saveDesignAction({
				name: result.name || "AI Generated Design",
				elements: JSON.stringify(result.elements),
				projectId: selectedProjectId as Id<"projects">,
				canvasSize: result.canvasSize || { width: 1920, height: 1080 },
			});
			toast.success("Dizajn vygenerovaný!");
		} catch (error) {
			toast.error("Chyba pri generovaní.");
		} finally {
			setIsGeneratingDesign(false);
		}
	};

	return (
		<div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/20">
			{/* Top Hero Bar */}
			<div className="relative h-64 lg:h-80 overflow-hidden bg-muted/40 dark:bg-muted/10 flex flex-col justify-end p-8 lg:p-16 border-b border-border/80">
				<div className="absolute inset-0 bg-linear-to-t from-background to-transparent z-10" />
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.05),transparent_70%)]" />

				<div className="relative z-20 space-y-4 max-w-7xl mx-auto w-full">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="flex items-center gap-4"
					>
						<div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 backdrop-blur-xl">
							<Palette className="size-6 text-primary" />
						</div>
						<h1 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter italic text-foreground">
							Design System Lab
						</h1>
					</motion.div>
					<p className="text-muted-foreground max-w-xl text-lg font-medium">
						Definujte vizuálnu DNA vášho projektu pomocou manuálnych tokenov
						alebo AI analýzy.
					</p>
				</div>
			</div>

			<main className="flex-1 max-w-7xl mx-auto w-full p-8 lg:p-16 -mt-12 relative z-30">
				{/* Project Selector Overlay */}
				<Card className="mb-12 p-6 bg-background/60 backdrop-blur-3xl border-border/50 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
					<div className="flex flex-col gap-1.5 flex-1">
						<label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
							Aktívny Projekt
						</label>
						<Select
							onValueChange={setSelectedProjectId}
							value={selectedProjectId || undefined}
						>
							<SelectTrigger className="h-14 rounded-2xl bg-transparent border-border/50 text-lg font-bold">
								<SelectValue placeholder="Vyberte projekt pre uloženie..." />
							</SelectTrigger>
							<SelectContent className="rounded-2xl">
								{projects?.map((p) => (
									<SelectItem key={p._id} value={p._id} className="rounded-xl">
										{p.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="flex gap-3">
						<Button
							onClick={persistSystem}
							disabled={!selectedProjectId || isSaving}
							className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs gap-2"
						>
							{isSaving ? (
								<RefreshCw className="size-4 animate-spin" />
							) : (
								<Save className="size-4" />
							)}
							Uložiť Systém
						</Button>
						<Button
							variant="outline"
							onClick={() => setIsNoteOpen(true)}
							className="h-14 w-14 rounded-2xl border-border/50"
						>
							<NotebookPen className="size-5" />
						</Button>
					</div>
				</Card>

				{/* Tab Switcher */}
				<div className="flex items-center justify-center mb-12">
					<div className="inline-flex p-1.5 bg-muted/30 backdrop-blur-xl rounded-[2rem] border border-border/50">
						<button
							onClick={() => setActiveTab("assets")}
							className={cn(
								"flex items-center gap-3 px-8 py-3 rounded-3xl transition-all duration-500 font-black uppercase tracking-widest text-xs",
								activeTab === "assets"
									? "bg-background shadow-xl text-primary scale-105"
									: "text-muted-foreground hover:text-foreground",
							)}
						>
							<MousePointer2 className="size-4" /> Vlastné Veci
						</button>
						<button
							onClick={() => setActiveTab("visual")}
							className={cn(
								"flex items-center gap-3 px-8 py-3 rounded-3xl transition-all duration-500 font-black uppercase tracking-widest text-xs",
								activeTab === "visual"
									? "bg-background shadow-xl text-primary scale-105"
									: "text-muted-foreground hover:text-foreground",
							)}
						>
							<ImageIcon className="size-4" /> Vizuálny Lab (AI)
						</button>
					</div>
				</div>

				<AnimatePresence mode="wait">
					{activeTab === "assets" ? (
						<motion.div
							key="assets"
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: 20 }}
							className="space-y-12"
						>
							{/* Manual Entry Section */}
							<div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
								{/* Colors */}
								<Card className="p-8 rounded-[2.5rem] bg-background/40 border-border/50 space-y-8">
									<div className="flex items-center justify-between">
										<h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
											<div className="size-2 rounded-full bg-blue-500 animate-pulse" />{" "}
											Paleta Farieb
										</h2>
										<Plus className="size-5 opacity-20" />
									</div>
									<div className="space-y-6">
										<div className="flex gap-3">
											<Input
												placeholder="Názov farby"
												value={newColorName}
												onChange={(e) => setNewColorName(e.target.value)}
												className="h-12 rounded-xl bg-muted/20 border-none"
											/>
											<Input
												type="color"
												value={newColorHex}
												onChange={(e) => setNewColorHex(e.target.value)}
												className="w-16 h-12 p-1 rounded-xl bg-muted/20 border-none cursor-pointer"
											/>
											<Button
												onClick={addManualColor}
												className="h-12 rounded-xl px-6"
											>
												Pridať
											</Button>
										</div>
										<div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
											{merged.colors.map((c, i) => (
												<button
													key={i}
													type="button"
													onClick={() => copyToClipboard(c.hex)}
													className="group text-left relative p-3 rounded-2xl bg-muted/10 border border-border/5 hover:border-primary/20 transition-all cursor-pointer w-full flex flex-col items-start"
												>
													<div
														className="h-16 w-full rounded-xl mb-3 shadow-inner relative flex items-center justify-center overflow-hidden"
														style={{ backgroundColor: c.hex }}
													>
														<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
															{copiedValue === c.hex ? (
																<Check className="size-5 text-emerald-400" />
															) : (
																<Copy className="size-5 text-white/80" />
															)}
														</div>
													</div>
													<p className="text-[10px] font-black uppercase truncate">
														{c.name}
													</p>
													<p className="text-[9px] font-mono opacity-40 uppercase tracking-tighter">
														{c.hex}
													</p>
													<button
														type="button"
														onClick={(e) => {
															e.stopPropagation();
															setLocalColors((prev) =>
																prev.filter(
																	(_, idx) =>
																		idx !== i - (system?.colors.length || 0),
																),
															);
														}}
														className="absolute top-2 right-2 size-6 rounded-lg bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white hover:bg-red-500 transition-all z-10"
													>
														<Trash2 className="size-3" />
													</button>
												</button>
											))}
										</div>
									</div>
								</Card>

								{/* Fonts */}
								<Card className="p-8 rounded-[2.5rem] bg-background/40 border-border/50 space-y-8">
									<h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
										<div className="size-2 rounded-full bg-purple-500 animate-pulse" />{" "}
										Typografia
									</h2>
									<div className="space-y-6">
										<div className="flex gap-3">
											<Input
												placeholder="Názov fontu (napr. Inter)"
												value={newFont}
												onChange={(e) => setNewFont(e.target.value)}
												className="h-12 rounded-xl bg-muted/20 border-none"
											/>
											<Button
												onClick={addManualFont}
												variant="secondary"
												className="h-12 rounded-xl px-6"
											>
												Pridať
											</Button>
										</div>
										<div className="space-y-3">
											{merged.fonts.map((f, i) => (
												<button
													key={i}
													type="button"
													onClick={() => copyToClipboard(f)}
													className="w-full text-left flex items-center justify-between p-4 rounded-2xl bg-muted/10 border border-border/5 hover:border-primary/10 transition-all group cursor-pointer"
												>
													<span
														className="font-medium text-lg"
														style={{ fontFamily: f }}
													>
														{f}
													</span>
													<div className="flex items-center gap-2">
														{copiedValue === f ? (
															<Check className="size-4 text-emerald-500" />
														) : (
															<Copy className="size-4 opacity-0 group-hover:opacity-20 transition-opacity" />
														)}
														{i >= (system?.fonts.length || 0) && (
															<button
																type="button"
																onClick={(e) => {
																	e.stopPropagation();
																	setLocalFonts((prev) =>
																		prev.filter(
																			(_, idx) =>
																				idx !== i - (system?.fonts.length || 0),
																		),
																	);
																	toast.info("Font zmazaný");
																}}
																className="size-6 rounded-lg flex items-center justify-center hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
															>
																<Trash2 className="size-3.5" />
															</button>
														)}
													</div>
												</button>
											))}
										</div>
									</div>
								</Card>
							</div>

							{/* History & Export */}
							<div className="space-y-6">
								<h3 className="text-sm font-black uppercase tracking-[0.3em] opacity-40 flex items-center gap-3 px-4">
									<History className="size-4" /> História Snapshotov
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
									{historyList?.map((h) => (
										<Card
											key={h._id}
											className="p-6 rounded-[2rem] bg-background/40 border-border/50 hover:border-primary/30 transition-all cursor-pointer group relative overflow-hidden"
										>
											<div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-all">
												<Trash2 className="size-4 text-red-500 hover:scale-110" />
											</div>
											<div className="space-y-3">
												<p className="font-black uppercase tracking-tight text-sm">
													{h.projectName || "Bez názvu"}
												</p>
												<p className="text-[10px] text-muted-foreground opacity-60 font-medium">
													{new Date(h._creationTime).toLocaleDateString()}
												</p>
												<div className="flex gap-1.5 mt-4">
													{h.colors.slice(0, 5).map((c, idx) => (
														<div
															key={idx}
															className="size-6 rounded-full border border-white/10"
															style={{ backgroundColor: c.hex }}
														/>
													))}
												</div>
											</div>
										</Card>
									))}
								</div>
							</div>
						</motion.div>
					) : (
						<motion.div
							key="visual"
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -20 }}
							className="space-y-12"
						>
							{/* AI Visual Lab Section */}
							<div className="space-y-8">
								<div
									onClick={() => fileInputRef.current?.click()}
									className={cn(
										"relative group min-h-100 rounded-[3rem] border-2 border-dashed transition-all duration-700 overflow-hidden flex flex-col items-center justify-center p-12 text-center",
										"bg-background/20 backdrop-blur-3xl border-foreground/5 hover:border-primary/30 hover:bg-primary/5 shadow-inner",
									)}
								>
									<input
										type="file"
										multiple
										ref={fileInputRef}
										onChange={handleUpload}
										className="hidden"
										accept="image/*"
									/>

									{images.length === 0 ? (
										<div className="space-y-8">
											<div className="size-24 rounded-[2.5rem] bg-primary/10 flex items-center justify-center mx-auto group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
												<Upload className="size-10 text-primary opacity-50" />
											</div>
											<div className="space-y-3">
												<h3 className="text-2xl font-black uppercase tracking-tight">
													Presuňte inšpiráciu sem
												</h3>
												<p className="text-muted-foreground font-medium opacity-60">
													Naša AI zanalyzuje štýl, farby a atmosféru z vašich
													obrázkov.
												</p>
											</div>
										</div>
									) : (
										<div className="flex flex-wrap justify-center gap-6">
											{images.map((img) => (
												<div
													key={img.id}
													className="relative group/img size-48 rounded-[2rem] overflow-hidden shadow-2xl border border-white/10"
												>
													<img
														src={img.url}
														className="size-full object-cover transition-all group-hover/img:scale-110"
														alt="Insp"
													/>
													<button
														onClick={(e) => {
															e.stopPropagation();
															setImages((prev) =>
																prev.filter((i) => i.id !== img.id),
															);
														}}
														className="absolute top-4 right-4 p-2 rounded-xl bg-black/60 opacity-0 group-hover/img:opacity-100 hover:bg-red-500 transition-all text-white"
													>
														<Trash2 className="size-4" />
													</button>
												</div>
											))}
											<div className="size-48 rounded-[2rem] border-2 border-dashed border-primary/20 flex items-center justify-center hover:bg-primary/5 transition-all">
												<Plus className="size-6 text-primary opacity-30" />
											</div>
										</div>
									)}
								</div>

								{/* AI Actions */}
								{images.length > 0 && (
									<div className="flex flex-col md:flex-row items-center justify-center gap-6">
										<Button
											size="lg"
											onClick={analyzeImages}
											disabled={isAnalyzing}
											className="h-20 px-12 rounded-[2rem] bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-primary/30 gap-4 group"
										>
											{isAnalyzing ? (
												<RefreshCw className="size-5 animate-spin" />
											) : (
												<Wand2 className="size-6 group-hover:rotate-12 transition-transform" />
											)}
											Analyzovať Štýl
										</Button>
										<Button
											size="lg"
											variant="outline"
											onClick={handleGenerateDesign}
											disabled={isGeneratingDesign}
											className="h-20 px-12 rounded-[2rem] border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 font-black uppercase tracking-[0.2em] text-xs gap-4 group"
										>
											{isGeneratingDesign ? (
												<RefreshCw className="size-5 animate-spin" />
											) : (
												<Sparkles className="size-6 group-hover:scale-110 transition-transform" />
											)}
											Generovať Design
										</Button>
									</div>
								)}

								{/* AI Results Overlay (Simplified for brevity in the Lab tab) */}
								{system && (
									<motion.div
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12"
									>
										<Card className="p-8 rounded-[2.5rem] bg-primary/5 border-primary/20 space-y-4">
											<h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
												AI Analýza
											</h4>
											<p className="text-lg font-bold leading-relaxed">
												{system.description}
											</p>
										</Card>
										<Card className="p-8 rounded-[2.5rem] bg-green-500/5 border-green-500/20 space-y-4">
											<h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 text-green-500">
												Silné Stránky
											</h4>
											<ul className="space-y-2">
												{system.goodThings?.slice(0, 3).map((t, i) => (
													<li
														key={i}
														className="text-xs font-bold flex items-center gap-2"
													>
														<CheckCircle2 className="size-3 text-green-500" />{" "}
														{t}
													</li>
												))}
											</ul>
										</Card>
										<Card className="p-8 rounded-[2.5rem] bg-amber-500/5 border-amber-500/20 space-y-4">
											<h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 text-amber-500">
												Odporúčania
											</h4>
											<ul className="space-y-2">
												{system.suggestions?.slice(0, 3).map((t, i) => (
													<li
														key={i}
														className="text-xs font-bold flex items-center gap-2"
													>
														<Lightbulb className="size-3 text-amber-500" /> {t}
													</li>
												))}
											</ul>
										</Card>
									</motion.div>
								)}
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</main>

			<QuickNoteDialog
				open={isNoteOpen}
				onOpenChange={setIsNoteOpen}
				defaultProjectId={selectedProjectId}
			/>
		</div>
	);
}
