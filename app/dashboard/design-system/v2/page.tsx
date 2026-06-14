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
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { QuickNoteDialog } from "@/components/notes/QuickNoteDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ColorPickerGrid } from "@/components/ui/color-picker-grid";
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
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { APP_PALETTE_HEX } from "@/lib/canvas-colors";
import { designSystemToFigmaTokensJson } from "@/lib/figma-tokens";
import { cn } from "@/lib/utils";

const aiSystemSchema = z.object({
	colors: z.array(
		z.object({
			name: z.string(),
			hex: z.string().regex(/^#/, "Color must be in HEX format"),
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
			toast.error("Select a project first!");
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
				toast.success("Design system updated!");
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
				toast.success("Design system saved!");
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
			toast.error("Enter a valid HEX value.");
			return;
		}
		setLocalColors((prev) => [
			...prev,
			{ name: newColorName.trim() || hex, hex, rgb: hexToRgb(hex) },
		]);
		setNewColorName("");
		toast.success("Color added");
	};

	const addManualFont = () => {
		const f = newFont.trim();
		if (!f) return;
		setLocalFonts((prev) => [...prev, f]);
		setNewFont("");
		toast.success("Font added");
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
			toast.error(images.length === 0 ? "Upload images!" : "Select a project!");
			return;
		}
		setIsAnalyzing(true);
		try {
			const result = await analyzeDesign({
				imageUrls: images.map((img) => img.url),
			});
			const parsed = aiSystemSchema.parse(result);
			setSystem(parsed);
			toast.success("Analysis complete!");
		} catch (error) {
			toast.error("Error during analysis.");
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
			toast.success("Design generated!");
		} catch (error) {
			toast.error("Error during generation.");
		} finally {
			setIsGeneratingDesign(false);
		}
	};

	return (
		<PageContainer size="wide" className="space-y-6">
			<PageHeader
				title="Design System Lab"
				description="Define your project visual DNA using tokens or AI analysis."
			/>

			<main className="space-y-6">
				{/* Project Selector Overlay */}
				<Card className="flex flex-col items-center justify-between gap-6 p-6 md:flex-row">
					<div className="flex flex-1 flex-col gap-2">
						<Label htmlFor="project-select">Active project</Label>
						<Select
							onValueChange={setSelectedProjectId}
							value={selectedProjectId || undefined}
						>
							<SelectTrigger id="project-select" className="w-full">
								<SelectValue placeholder="Select project to save to..." />
							</SelectTrigger>
							<SelectContent>
								{projects?.map((p) => (
									<SelectItem key={p._id} value={p._id}>
										{p.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="flex gap-2">
						<Button
							onClick={persistSystem}
							disabled={!selectedProjectId || isSaving}
							className="gap-2"
						>
							{isSaving ? (
								<RefreshCw className="size-4 animate-spin" />
							) : (
								<Save className="size-4" />
							)}
							Save system
						</Button>
						<Button
							variant="outline"
							size="icon"
							onClick={() => setIsNoteOpen(true)}
							aria-label="Quick note"
						>
							<NotebookPen className="size-4" />
						</Button>
					</div>
				</Card>

				<div className="flex flex-wrap justify-center gap-2">
					<Button
						type="button"
						variant={activeTab === "assets" ? "default" : "outline"}
						onClick={() => setActiveTab("assets")}
						className="gap-2"
					>
						<MousePointer2 className="size-4" /> Custom items
					</Button>
					<Button
						type="button"
						variant={activeTab === "visual" ? "default" : "outline"}
						onClick={() => setActiveTab("visual")}
						className="gap-2"
					>
						<ImageIcon className="size-4" /> Visualny lab (AI)
					</Button>
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
								<Card className="space-y-6 p-6">
									<div className="flex items-center justify-between">
										<h2 className="font-heading text-lg font-semibold">
											Color palette
										</h2>
										<Plus className="size-4 text-muted-foreground" />
									</div>
									<div className="space-y-6">
										<div className="space-y-3">
											<Input
												placeholder="Color name"
												value={newColorName}
												onChange={(e) => setNewColorName(e.target.value)}
												className="h-12 rounded-xl bg-muted/20 border-none"
											/>
											<ColorPickerGrid
												value={newColorHex}
												palette={APP_PALETTE_HEX}
												onChange={setNewColorHex}
											/>
											<Button
												onClick={addManualColor}
												className="h-12 w-full rounded-xl"
											>
												Add color
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
													<p className="truncate text-sm font-medium">
														{c.name}
													</p>
													<p className="font-mono text-xs text-muted-foreground">
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
								<Card className="space-y-6 p-6">
									<h2 className="font-heading text-lg font-semibold">
										Typografia
									</h2>
									<div className="space-y-6">
										<div className="flex gap-3">
											<Input
												placeholder="Title fontu (napr. Inter)"
												value={newFont}
												onChange={(e) => setNewFont(e.target.value)}
												className="h-12 rounded-xl bg-muted/20 border-none"
											/>
											<Button
												onClick={addManualFont}
												variant="secondary"
												className="h-12 rounded-xl px-6"
											>
												Add
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
																	toast.info("Font deleted");
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
									<History className="size-4" /> Snapshot history
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
													{h.projectName || "Untitled"}
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
													Drop inspiration here
												</h3>
												<p className="text-muted-foreground font-medium opacity-60">
													Our AI analyzes style, colors, and mood from your
													images.
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
											Analyze style
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
											Generate design
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
												AI analysis
											</h4>
											<p className="text-lg font-bold leading-relaxed">
												{system.description}
											</p>
										</Card>
										<Card className="p-8 rounded-[2.5rem] bg-green-500/5 border-green-500/20 space-y-4">
											<h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 text-green-500">
												Strengths
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
												Recommendations
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
		</PageContainer>
	);
}
