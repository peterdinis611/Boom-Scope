"use client";

import { useAction, useMutation, useQuery } from "convex/react";
import {
	AlertCircle,
	CheckCircle2,
	Copy,
	Download,
	ExternalLink,
	Layout,
	Lightbulb,
	Link2,
	NotebookPen,
	Palette,
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
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { QuickNoteDialog } from "@/components/notes/QuickNoteDialog";
import { Button } from "@/components/ui/button";
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

function DesignSystemPageContent() {
	const projects = useQuery(api.projects.list);
	const historyList = useQuery(api.design_systems.listByUser);
	const analyzeDesign = useAction(api.openai.analyzeDesignSystem);
	const generateDesign = useAction(api.openai.generateDesignFromImages);
	const saveSystem = useMutation(api.design_systems.create);
	const updateSystem = useMutation(api.design_systems.update);
	const saveDesign = useMutation(api.designs.saveDesign);
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
	const [newColorHex, setNewColorHex] = useState("var(--primary)");
	const [newFont, setNewFont] = useState("");
	const [lastSavedId, setLastSavedId] = useState<Id<"design_systems"> | null>(
		null,
	);
	const [sharePublic, setSharePublic] = useState(false);
	const [copiedColor, setCopiedColor] = useState<string | null>(null);
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
		if (
			projectIdParam &&
			!selectedProjectId &&
			!systemIdParam &&
			selectedProjectId !== projectIdParam
		) {
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

	function hexToRgb(hex: string): string {
		const h = hex.replace("#", "");
		if (h.length !== 6) return "rgb(0, 0, 0)";
		const n = Number.parseInt(h, 16);
		const r = (n >> 16) & 255;
		const g = (n >> 8) & 255;
		const b = n & 255;
		return `rgb(${r}, ${g}, ${b})`;
	}

	const persistSystem = async () => {
		if (!selectedProjectId) {
			toast.error("Najprv vyberte projekt!");
			return;
		}
		const fonts =
			merged.fonts.length > 0 ? merged.fonts : ["Inter, sans-serif"];
		if (merged.colors.length === 0 && merged.fonts.length === 0) {
			toast.error("Pridajte aspoň jednu farbu alebo font.");
			return;
		}
		setIsSaving(true);
		try {
			if (lastSavedId) {
				await updateSystem({
					id: lastSavedId,
					colors: merged.colors,
					fonts,
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
							: [{ name: "Neutral", hex: "#71717a", rgb: "rgb(113, 113, 122)" }],
					fonts,
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
			toast.error("Zadajte platný HEX (#RRGGBB).");
			return;
		}
		const rgb = hexToRgb(hex);
		setLocalColors((prev) => [
			...prev,
			{ name: newColorName.trim() || hex, hex, rgb },
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

	const exportFigmaJson = () => {
		if (merged.colors.length === 0 && merged.fonts.length === 0) {
			toast.error("Nie sú žiadne tokeny na export.");
			return;
		}
		const json = designSystemToFigmaTokensJson(merged.colors, merged.fonts);
		const blob = new Blob([json], { type: "application/json" });
		const link = document.createElement("a");
		link.href = URL.createObjectURL(blob);
		link.download = "boom-scope-figma-tokens.json";
		link.click();
		toast.success("Figma / JSON tokeny stiahnuté!");
	};

	const exportPlainJson = () => {
		const blob = new Blob(
			[
				JSON.stringify(
					{
						colors: merged.colors,
						fonts: merged.fonts,
						description: merged.description ?? null,
					},
					null,
					2,
				),
			],
			{ type: "application/json" },
		);
		const link = document.createElement("a");
		link.href = URL.createObjectURL(blob);
		link.download = "boom-scope-design-system.json";
		link.click();
		toast.success("JSON exportovaný!");
	};

	const copyShareLink = async () => {
		if (!lastSavedId) {
			toast.error("Najprv uložte design system.");
			return;
		}
		const origin = typeof window !== "undefined" ? window.location.origin : "";
		const url = `${origin}/share/design-system/${lastSavedId}`;
		await navigator.clipboard.writeText(url);
		toast.success("Zdieľateľný link skopírovaný!");
	};

	const toggleSharePublic = async (next: boolean) => {
		if (!lastSavedId) {
			toast.error("Najprv uložte design system.");
			return;
		}
		try {
			await setPublicMutation({ id: lastSavedId, isPublic: next });
			setSharePublic(next);
			toast.success(next ? "Verejný náhľad zapnutý" : "Verejný náhľad vypnutý");
		} catch {
			toast.error("Nepodarilo sa aktualizovať nastavenie.");
		}
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
		if (images.length === 0) return;
		if (!selectedProjectId) {
			toast.error("Najprv vyberte projekt!");
			return;
		}

		setIsAnalyzing(true);
		setSystem(null);

		try {
			const result = await analyzeDesign({
				imageUrls: images.map((img) => img.url),
			});

			const parsed = aiSystemSchema.safeParse(result);
			if (!parsed.success) {
				throw new Error("AI vrátila neplatné dáta.");
			}

			setSystem(parsed.data);

			const mergedColors = [...parsed.data.colors, ...localColors];
			const mergedFonts =
				[...parsed.data.fonts, ...localFonts].length > 0
					? [...parsed.data.fonts, ...localFonts]
					: parsed.data.fonts;

			const id = await saveSystem({
				projectId: selectedProjectId as Id<"projects">,
				colors: mergedColors,
				fonts: mergedFonts,
				description: parsed.data.description,
				goodThings: parsed.data.goodThings,
				badThings: parsed.data.badThings,
				suggestions: parsed.data.suggestions,
			});

			setLastSavedId(id);
			setLocalColors([]);
			setLocalFonts([]);

			toast.success("Design System úspešne vygenerovaný a uložený!");
		} catch (error) {
			console.error(error);
			toast.error(
				"Nepodarilo sa zanalyzovať dizajn. Skontrolujte OpenAI kľúč.",
			);
		} finally {
			setIsAnalyzing(false);
		}
	};

	const handleGenerateDesign = async () => {
		if (images.length === 0) {
			toast.error("Najprv nahrajte inšpiráciu!");
			return;
		}
		if (!selectedProjectId) {
			toast.error("Najprv vyberte projekt!");
			return;
		}

		setIsGeneratingDesign(true);

		try {
			const result = await generateDesign({
				imageUrls: images.map((img) => img.url),
			});

			const id = await saveDesign({
				name: result.name || "AI Generated Design",
				elements: JSON.stringify(result.elements),
				projectId: selectedProjectId as Id<"projects">,
				canvasSize: result.canvasSize || { width: 1920, height: 1080 },
			});

			toast.success("Design úspešne vygenerovaný!", {
				action: {
					label: "Otvoriť v Canvas",
					onClick: () => (window.location.href = "/dashboard/canvas"),
				},
			});
		} catch (error) {
			console.error(error);
			toast.error("Nepodarilo sa vygenerovať design.");
		} finally {
			setIsGeneratingDesign(false);
		}
	};

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
		setCopiedColor(text);
		setTimeout(() => setCopiedColor(null), 2000);
		toast.success(`Copied ${text}`);
	};

	const copyAsCSS = () => {
		if (merged.colors.length === 0 && merged.fonts.length === 0) return;
		const css = `:root {
  ${merged.colors.map((c) => `--color-${c.name.toLowerCase().replace(/\s+/g, "-")}: ${c.hex};`).join("\n  ")}
  ${merged.fonts.map((f, i) => `--font-${i === 0 ? "primary" : `family-${i}`}: '${f}';`).join("\n  ")}
}`;
		navigator.clipboard.writeText(css);
		toast.success("CSS variables copied!");
	};

	return (
		<div className="min-h-screen bg-background text-foreground p-8 lg:p-16">
			<div className="max-w-7xl mx-auto space-y-16">
				{/* Header */}
				<header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
					<div className="space-y-4">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-black uppercase tracking-[0.2em]"
						>
							<Sparkles className="size-3" />
							AI Powered Engine
						</motion.div>
						<motion.h1
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.1 }}
							className="text-5xl lg:text-7xl font-black tracking-tighter"
						>
							Design <span className="text-primary">System</span>
						</motion.h1>
						<motion.p
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.2 }}
							className="text-foreground/40 max-w-xl text-lg font-medium"
						>
							Nahrajte inšpiratívne obrázky a nechajte našu AI extrahovať farby,
							písma a vytvoriť vizuálnu identitu pre váš projekt.
						</motion.p>
					</div>

					{images.length > 0 && (
						<motion.div
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							className="flex flex-wrap gap-4"
						>
							<Button
								size="lg"
								onClick={analyzeImages}
								disabled={isAnalyzing || isGeneratingDesign}
								className="h-16 px-10 rounded-[24px] bg-primary hover:bg-blue-700 text-white shadow-[0_20px_40px_rgba(37,99,235,0.3)] transition-all group overflow-hidden relative"
							>
								{isAnalyzing ? (
									<RefreshCw className="size-5 animate-spin" />
								) : (
									<div className="flex items-center gap-3">
										<Wand2 className="size-5 group-hover:rotate-12 transition-transform" />
										<span className="font-black uppercase tracking-widest text-xs">
											Generovať Identitu
										</span>
									</div>
								)}
							</Button>

							<Button
								size="lg"
								onClick={handleGenerateDesign}
								disabled={isAnalyzing || isGeneratingDesign}
								variant="outline"
								className="h-16 px-10 rounded-[24px] border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-all group"
							>
								{isGeneratingDesign ? (
									<RefreshCw className="size-5 animate-spin" />
								) : (
									<div className="flex items-center gap-3">
										<Layout className="size-5 group-hover:scale-110 transition-transform" />
										<span className="font-black uppercase tracking-widest text-xs">
											Generovať Design
										</span>
									</div>
								)}
							</Button>
						</motion.div>
					)}

					<div className="flex flex-wrap gap-4">
						<Button
							variant="outline"
							onClick={persistSystem}
							disabled={!selectedProjectId}
							className="h-12 px-6 rounded-2xl border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 font-black uppercase tracking-widest text-[10px] gap-2"
						>
							<Save className="size-4" />
							Uložiť
						</Button>

						<Button
							variant="outline"
							onClick={() => setIsNoteOpen(true)}
							className="h-12 px-6 rounded-2xl border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 font-black uppercase tracking-widest text-[10px] gap-2"
						>
							<NotebookPen className="size-4" />
							Rýchla poznámka
						</Button>
					</div>
				</header>

				<section className="space-y-4">
					<div className="flex flex-col gap-2">
						<label className="text-[10px] font-black uppercase tracking-widest opacity-40">
							Priradiť k projektu
						</label>
						<Select
							onValueChange={setSelectedProjectId}
							value={selectedProjectId || undefined}
						>
							<SelectTrigger className="w-full md:w-75 h-12 rounded-2xl bg-background/50 backdrop-blur-xl border-border/50">
								<SelectValue placeholder="Vyberte projekt..." />
							</SelectTrigger>
							<SelectContent className="rounded-2xl border-border/50 backdrop-blur-3xl">
								{projects?.map((project) => (
									<SelectItem
										key={project._id}
										value={project._id}
										className="rounded-xl"
									>
										{project.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</section>

				<section className="rounded-[40px] border border-border bg-background/40 backdrop-blur-xl p-8 space-y-8 shadow-xl">
					<div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
						<div>
							<h2 className="text-xl font-black tracking-tight">
								Vlastné farby a fonty
							</h2>
							<p className="text-sm text-muted-foreground mt-1">
								Pridajte tokeny ručne bez AI. Po uložení sa objavia v náhľade a
								v histórii.
							</p>
						</div>
						<div className="flex flex-wrap gap-2">
							<Button
								variant="outline"
								size="sm"
								className="rounded-xl font-black uppercase text-[10px]"
								onClick={persistSystem}
								disabled={!selectedProjectId}
							>
								Uložiť snapshot
							</Button>
							<Button
								variant="outline"
								size="sm"
								className="rounded-xl font-black uppercase text-[10px] gap-1.5"
								onClick={exportFigmaJson}
							>
								<Download className="size-3.5" /> Figma tokeny JSON
							</Button>
							<Button
								variant="outline"
								size="sm"
								className="rounded-xl font-black uppercase text-[10px] gap-1.5"
								onClick={exportPlainJson}
							>
								<Download className="size-3.5" /> JSON
							</Button>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						<div className="space-y-4">
							<Label className="text-[10px] font-black uppercase tracking-widest opacity-50">
								Nová farba
							</Label>
							<div className="flex flex-col sm:flex-row gap-3">
								<Input
									placeholder="Názov"
									value={newColorName}
									onChange={(e) => setNewColorName(e.target.value)}
									className="rounded-xl h-11"
								/>
								<Input
									placeholder="#RRGGBB"
									value={newColorHex}
									onChange={(e) => setNewColorHex(e.target.value)}
									className="rounded-xl h-11 font-mono"
								/>
								<Button
									type="button"
									onClick={addManualColor}
									className="rounded-xl font-black uppercase text-[10px]"
								>
									Pridať
								</Button>
							</div>
						</div>
						<div className="space-y-4">
							<Label className="text-[10px] font-black uppercase tracking-widest opacity-50">
								Nový font (CSS stack)
							</Label>
							<div className="flex flex-col sm:flex-row gap-3">
								<Input
									placeholder="napr. Inter, system-ui, sans-serif"
									value={newFont}
									onChange={(e) => setNewFont(e.target.value)}
									className="rounded-xl h-11"
								/>
								<Button
									type="button"
									onClick={addManualFont}
									variant="secondary"
									className="rounded-xl font-black uppercase text-[10px]"
								>
									Pridať
								</Button>
							</div>
						</div>
					</div>

					<div className="rounded-2xl border border-border/60 p-6 space-y-4 bg-accent/20">
						<p className="text-[10px] font-black uppercase tracking-widest opacity-40">
							Zdieľanie
						</p>
						<label className="flex items-center gap-3 cursor-pointer text-sm font-medium">
							<input
								type="checkbox"
								className="size-4 rounded border-border"
								checked={sharePublic}
								onChange={(e) => toggleSharePublic(e.target.checked)}
								disabled={!lastSavedId}
							/>
							Verejný odkaz (každý s URL môže čítať)
						</label>
						<div className="flex flex-wrap gap-2">
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="rounded-xl gap-2 font-bold text-xs"
								onClick={copyShareLink}
								disabled={!lastSavedId}
							>
								<Link2 className="size-3.5" /> Kopírovať link
							</Button>
							{lastSavedId && (
								<Button
									variant="ghost"
									size="sm"
									className="rounded-xl text-xs"
									asChild
								>
									<a
										href={`/share/design-system/${lastSavedId}`}
										target="_blank"
										rel="noopener noreferrer"
									>
										Otvoriť náhľad
									</a>
								</Button>
							)}
						</div>
					</div>
				</section>

				{historyList && historyList.length > 0 && (
					<section className="space-y-4">
						<h2 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
							História uložených systémov
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
							{historyList.map((row) => (
								<div
									key={row._id}
									className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-accent/20 px-4 py-3"
								>
									<button
										type="button"
										className="text-left flex-1 min-w-0"
										onClick={() => {
											setSystem({
												colors: row.colors,
												fonts: row.fonts,
												description: row.description,
												goodThings: row.goodThings,
												badThings: row.badThings,
												suggestions: row.suggestions,
											});
											setLocalColors([]);
											setLocalFonts([]);
											setLastSavedId(row._id);
											setSharePublic(row.isPublic ?? false);
											toast.success("Načítané z histórie");
										}}
									>
										<p className="font-bold truncate text-sm">
											{row.description || "Design system"}
										</p>
										<p className="text-[10px] text-muted-foreground truncate">
											{row.projectName} ·{" "}
											{new Date(row._creationTime).toLocaleString()}
										</p>
									</button>
									<Button
										type="button"
										variant="ghost"
										size="icon-sm"
										className="shrink-0 text-red-500"
										onClick={async () => {
											try {
												await deleteSystemMutation({ id: row._id });
												if (lastSavedId === row._id) setLastSavedId(null);
												toast.success("Zmazané");
											} catch {
												toast.error("Nepodarilo sa zmazať.");
											}
										}}
									>
										<Trash2 className="size-4" />
									</Button>
								</div>
							))}
						</div>
					</section>
				)}

				{/* Upload Area */}
				<section>
					<div
						onClick={() => fileInputRef.current?.click()}
						className={cn(
							"relative group cursor-pointer rounded-[40px] border-2 border-dashed transition-all duration-700 overflow-hidden",
							images.length > 0 ? "h-64" : "h-96",
							"bg-background/20 backdrop-blur-3xl border-foreground/5 hover:border-primary/30",
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
							<div className="h-full flex flex-col items-center justify-center space-y-6">
								<div className="size-20 rounded-[32px] bg-foreground/5 border border-foreground/10 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
									<Upload className="size-8 opacity-20" />
								</div>
								<div className="text-center">
									<p className="text-sm font-black uppercase tracking-[0.2em] opacity-40">
										Presuňte inšpiráciu sem
									</p>
									<p className="text-[10px] font-bold opacity-20 uppercase tracking-widest mt-2">
										Podporuje PNG, JPG, WebP
									</p>
								</div>
							</div>
						) : (
							<div className="h-full flex items-center gap-4 px-8 overflow-x-auto custom-scrollbar">
								{images.map((img) => (
									<div
										key={img.id}
										className="relative h-48 min-w-48 rounded-[28px] overflow-hidden group/img shadow-2xl border border-white/10"
									>
										{/* eslint-disable-next-line @next/next/no-img-element -- user-uploaded blob/data URL preview */}
										<img
											src={img.url}
											className="h-full w-full object-cover transition-transform duration-700 group-hover/img:scale-110"
											alt="Inšpirácia"
										/>
										<button
											onClick={(e) => {
												e.stopPropagation();
												setImages((prev) =>
													prev.filter((i) => i.id !== img.id),
												);
											}}
											className="absolute top-4 right-4 p-2.5 rounded-xl bg-black/60 backdrop-blur-md text-white opacity-0 group-hover/img:opacity-100 transition-all hover:bg-red-500 shadow-xl"
										>
											<Trash2 className="size-4" />
										</button>
									</div>
								))}
								<div className="min-w-48 h-48 rounded-[28px] border-2 border-dashed border-foreground/5 flex flex-col items-center justify-center hover:border-primary/20 transition-all">
									<Upload className="size-6 opacity-10" />
								</div>
							</div>
						)}
					</div>
				</section>

				{/* Results / Analysis State */}
				<AnimatePresence mode="wait">
					{isAnalyzing && (
						<motion.div
							key="analyzing"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="py-32 flex flex-col items-center justify-center space-y-12"
						>
							<div className="relative size-32">
								<div className="absolute inset-0 rounded-full border-4 border-primary/10 animate-ping" />
								<div className="absolute inset-4 rounded-full border-4 border-primary/20 animate-pulse" />
								<div className="h-full w-full rounded-full border-4 border-t-primary animate-spin" />
								<div className="absolute inset-0 flex items-center justify-center">
									<Sparkles className="size-8 text-primary" />
								</div>
							</div>
							<div className="text-center space-y-4">
								<h2 className="text-3xl font-black tracking-tight uppercase">
									Analyzujem vizuálnu DNA
								</h2>
								<p className="text-foreground/40 font-medium tracking-widest text-[10px] uppercase animate-pulse">
									Extrahujem farby • Mapujem typografiu • Generujem komponenty
								</p>
							</div>
						</motion.div>
					)}

					{!isAnalyzing &&
						(system || localColors.length > 0 || localFonts.length > 0) && (
							<motion.div
								key="result"
								initial={{ opacity: 0, y: 50 }}
								animate={{ opacity: 1, y: 0 }}
								className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12"
							>
								{/* Sidebar: Summary */}
								<div className="lg:col-span-4 space-y-8">
									<div className="p-8 rounded-[40px] bg-background/40 backdrop-blur-3xl border border-border shadow-2xl space-y-8">
										<div className="space-y-2">
											<p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
												Vizuálny Štýl
											</p>
											<h2 className="text-4xl font-black tracking-tight">
												{merged.description || "Nová Identita"}
											</h2>
										</div>

										<div className="space-y-6">
											<div className="flex items-center gap-4">
												<div className="p-2.5 rounded-xl bg-foreground/5">
													<Palette className="size-4 opacity-40" />
												</div>
												<span className="text-[10px] font-black uppercase tracking-widest opacity-40">
													Farebná Paleta
												</span>
											</div>
											<div className="space-y-3">
												{merged.colors.map((color) => (
													<button
														key={color.hex}
														onClick={() => copyToClipboard(color.hex)}
														className="w-full flex items-center justify-between p-4 rounded-2xl bg-foreground/5 hover:bg-foreground/10 transition-all border border-border/50 group"
													>
														<div className="flex items-center gap-4">
															<div
																className="size-8 rounded-lg shadow-inner"
																style={{ backgroundColor: color.hex }}
															/>
															<div className="flex flex-col items-start">
																<span className="text-[10px] font-black uppercase tracking-tighter opacity-40 leading-none mb-1">
																	{color.name}
																</span>
																<span className="font-mono text-[10px] font-bold uppercase tracking-wider opacity-60">
																	{color.hex}
																</span>
															</div>
														</div>
														{copiedColor === color.hex ? (
															<Check className="size-4 text-emerald-500" />
														) : (
															<Copy className="size-4 opacity-0 group-hover:opacity-20 transition-opacity" />
														)}
													</button>
												))}
											</div>
										</div>

										<div className="pt-8 border-t border-border/50 space-y-6">
											<div className="flex items-center gap-4">
												<div className="p-2.5 rounded-xl bg-foreground/5">
													<Type className="size-4 opacity-40" />
												</div>
												<span className="text-[10px] font-black uppercase tracking-widest opacity-40">
													Typografia
												</span>
											</div>
											<div className="space-y-4">
												{merged.fonts.map((font, idx) => (
													<div
														key={font}
														className="p-5 rounded-2xl bg-foreground/5 border border-border/50"
													>
														<p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-20 mb-2">
															{idx === 0 ? "Hlavné Písmo" : "Sekundárne Písmo"}
														</p>
														<p
															className="text-xl font-black"
															style={{ fontFamily: font }}
														>
															{font}
														</p>
													</div>
												))}
											</div>
										</div>

										{/* Design Audit Section */}
										{(merged.goodThings ||
											merged.badThings ||
											merged.suggestions) && (
											<div className="pt-8 border-t border-border/50 space-y-8">
												<div className="flex items-center gap-4">
													<div className="p-2.5 rounded-xl bg-primary/10 text-primary">
														<Sparkles className="size-4" />
													</div>
													<span className="text-[10px] font-black uppercase tracking-widest opacity-60">
														Design Audit
													</span>
												</div>

												<div className="space-y-6">
													{merged.goodThings &&
														merged.goodThings.length > 0 && (
															<div className="space-y-3">
																<div className="flex items-center gap-2 text-emerald-500">
																	<CheckCircle2 className="size-3.5" />
																	<span className="text-[9px] font-black uppercase tracking-widest">
																		Silné stránky
																	</span>
																</div>
																<ul className="space-y-2">
																	{merged.goodThings.map((item, i) => (
																		<li
																			key={i}
																			className="text-xs font-medium text-foreground/60 flex items-start gap-2"
																		>
																			<span className="size-1 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
																			{item}
																		</li>
																	))}
																</ul>
															</div>
														)}

													{merged.badThings && merged.badThings.length > 0 && (
														<div className="space-y-3">
															<div className="flex items-center gap-2 text-red-500">
																<AlertCircle className="size-3.5" />
																<span className="text-[9px] font-black uppercase tracking-widest">
																	Potenciálne chyby
																</span>
															</div>
															<ul className="space-y-2">
																{merged.badThings.map((item, i) => (
																	<li
																		key={i}
																		className="text-xs font-medium text-foreground/60 flex items-start gap-2"
																	>
																		<span className="size-1 rounded-full bg-red-500 mt-1.5 shrink-0" />
																		{item}
																	</li>
																))}
															</ul>
														</div>
													)}

													{merged.suggestions &&
														merged.suggestions.length > 0 && (
															<div className="space-y-3">
																<div className="flex items-center gap-2 text-amber-500">
																	<Lightbulb className="size-3.5" />
																	<span className="text-[9px] font-black uppercase tracking-widest">
																		Návrhy na zlepšenie
																	</span>
																</div>
																<ul className="space-y-2">
																	{merged.suggestions.map((item, i) => (
																		<li
																			key={i}
																			className="text-xs font-medium text-foreground/60 flex items-start gap-2"
																		>
																			<span className="size-1 rounded-full bg-amber-500 mt-1.5 shrink-0" />
																			{item}
																		</li>
																	))}
																</ul>
															</div>
														)}
												</div>
											</div>
										)}

										<div className="flex gap-3">
											<Button
												onClick={copyAsCSS}
												className="flex-1 h-14 rounded-2xl bg-foreground text-background hover:opacity-90 font-black uppercase tracking-widest text-[10px]"
											>
												<Download className="size-4 mr-3" /> Exportovať CSS
											</Button>
										</div>
									</div>
								</div>

								{/* Main: Component Preview */}
								<div className="lg:col-span-8 space-y-8">
									<div className="p-10 lg:p-16 rounded-[40px] bg-background/40 backdrop-blur-3xl border border-border shadow-2xl space-y-16 overflow-hidden relative">
										<div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
											<Layout className="size-64 rotate-12" />
										</div>

										<div className="space-y-4">
											<p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">
												Live Preview
											</p>
											<h2 className="text-4xl font-black tracking-tight">
												Komponenty
											</h2>
										</div>

										{/* Preview Sections */}
										<div className="grid grid-cols-1 md:grid-cols-2 gap-12">
											{/* Buttons */}
											<div className="space-y-8">
												<p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-20">
													Tlačidlá
												</p>
												<div className="space-y-4">
													<Button
														className="h-14 w-full rounded-2xl text-white font-bold uppercase tracking-widest text-[10px] shadow-xl"
														style={{ backgroundColor: merged.colors[0]?.hex }}
													>
														Primary Action
													</Button>
													<Button
														variant="outline"
														className="h-14 w-full rounded-2xl border-2 font-bold uppercase tracking-widest text-[10px]"
														style={{
															borderColor: merged.colors[1]?.hex,
															color: merged.colors[1]?.hex,
														}}
													>
														Secondary Option
													</Button>
												</div>
											</div>

											{/* Inputs */}
											<div className="space-y-8">
												<p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-20">
													Inputy
												</p>
												<div className="space-y-4">
													<div className="relative">
														<div
															className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20"
															style={{ color: merged.colors[0]?.hex }}
														>
															<Sparkles className="size-4" />
														</div>
														<input
															placeholder="Píšte sem..."
															className="w-full h-14 bg-foreground/5 border border-border/50 rounded-2xl pl-12 pr-4 text-xs font-bold outline-none focus:border-primary transition-all shadow-inner"
														/>
													</div>
													<div className="flex gap-2">
														{merged.colors.map((c) => (
															<div
																key={`swatch-${c.hex}`}
																className="size-6 rounded-lg shadow-sm"
																style={{ backgroundColor: c.hex }}
															/>
														))}
													</div>
												</div>
											</div>

											{/* Card Preview */}
											<div className="md:col-span-2 space-y-8">
												<p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-20">
													Karty & Layout
												</p>
												<div
													className="p-8 rounded-[32px] border border-border/50 space-y-6 shadow-2xl relative overflow-hidden"
													style={{
														backgroundColor: merged.colors[0]?.hex
															? `${merged.colors[0].hex}14`
															: undefined,
													}}
												>
													<div className="flex items-center gap-4">
														<div
															className="size-12 rounded-2xl flex items-center justify-center text-white"
															style={{ backgroundColor: merged.colors[2]?.hex }}
														>
															<Layout className="size-6" />
														</div>
														<div>
															<h4
																className="font-black text-lg"
																style={{ fontFamily: merged.fonts[0] }}
															>
																Vizuálna Integrita
															</h4>
															<p
																className="text-xs font-medium opacity-40"
																style={{
																	fontFamily:
																		merged.fonts[1] || merged.fonts[0],
																}}
															>
																Harmonické farby extrahované z vašej inšpirácie.
															</p>
														</div>
													</div>
													<div className="flex gap-4">
														<div
															className="flex-1 h-2 rounded-full opacity-10"
															style={{ backgroundColor: merged.colors[0]?.hex }}
														/>
														<div
															className="w-1/3 h-2 rounded-full opacity-10"
															style={{ backgroundColor: merged.colors[3]?.hex }}
														/>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</motion.div>
						)}
				</AnimatePresence>
			</div>

			{/* Background Blobs */}
			<div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none opacity-20 dark:opacity-10">
				<div className="absolute top-0 right-0 size-200 bg-primary/20 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
				<div className="absolute bottom-0 left-0 size-150 bg-emerald-500/10 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2" />
			</div>

			<QuickNoteDialog
				open={isNoteOpen}
				onOpenChange={setIsNoteOpen}
				defaultProjectId={selectedProjectId}
			/>
		</div>
	);
}

export default function DesignSystemPage() {
	return (
		<Suspense
			fallback={
				<div className="flex h-screen w-full items-center justify-center bg-background">
					<div className="size-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
				</div>
			}
		>
			<DesignSystemPageContent />
		</Suspense>
	);
}
