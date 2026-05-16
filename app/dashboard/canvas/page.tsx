"use client";

import { useMutation, useQuery } from "convex/react";
import {
	ArrowDown,
	ArrowUp,
	Circle,
	Clipboard,
	Copy,
	Download,
	Eye,
	EyeOff,
	FolderKanban,
	Grid,
	Group,
	Image as ImageIcon,
	Layers,
	Lock,
	Maximize2,
	NotebookPen,
	Palette,
	PanelLeft,
	PanelRight,
	Pencil,
	Redo,
	RefreshCw,
	RotateCw,
	Settings2,
	Sliders,
	Smartphone,
	Sparkles,
	Square,
	Tablet,
	Trash2,
	Type,
	Undo2,
	Ungroup,
	Unlock,
	Upload,
	ZoomIn,
	ZoomOut,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import dynamic from "next/dynamic";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Dock } from "@/components/design/Dock";
import type { CanvasElement } from "@/components/design/KonvaCanvas";
import { ShareDialog } from "@/components/design/ShareDialog";
import {
	FacebookIcon,
	InstagramIcon,
	LinkedinIcon,
	TwitterIcon,
} from "@/components/icons/SocialIcons";
import { QuickNoteDialog } from "@/components/notes/QuickNoteDialog";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
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
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
	cloneElementsForPaste,
	groupElementsAtIndices,
	ungroupElement,
} from "@/lib/canvas-elements";
import { CANVAS_PRESETS } from "@/lib/canvas-presets";
import { cn } from "@/lib/utils";

const KonvaCanvas = dynamic(() => import("@/components/design/KonvaCanvas"), {
	ssr: false,
	loading: () => (
		<div className="flex h-full w-full items-center justify-center bg-background">
			<div className="flex flex-col items-center gap-4">
				<div className="h-12 w-12 animate-spin rounded-full border-2 border-primary border-t-transparent shadow-[0_0_30px_rgba(59,130,246,0.3)]" />
				<p className="text-[10px] font-bold text-foreground/40 tracking-[0.3em] uppercase animate-pulse">
					Syncing Engine
				</p>
			</div>
		</div>
	),
});

const PALETTE = [
	"#ffffff",
	"#000000",
	"#71717a",
	"var(--destructive)",
	"#f97316",
	"#f59e0b",
	"var(--success)",
	"var(--primary)",
	"#6366f1",
	"#a855f7",
	"#ec4899",
];

const FONTS = [
	"Inter, sans-serif",
	"Georgia, serif",
	"Courier New, monospace",
	"Impact, charcoal, sans-serif",
	"Verdana, sans-serif",
	"Trebuchet MS, sans-serif",
	"Times New Roman, serif",
	"Arial Black, sans-serif",
];

function DesignPageContent() {
	const [activeTool, setActiveTool] = useState("select");
	const [elements, setElements] = useState<CanvasElement[]>([]);
	const [selectedIds, setSelectedIds] = useState<string[]>([]);

	const [strokeColor, setStrokeColor] = useState("var(--primary)");
	const [fillColor] = useState("none");
	const [strokeWidth] = useState(2);

	const [leftPanelOpen, setLeftPanelOpen] = useState(true);
	const [rightPanelOpen, setRightPanelOpen] = useState(true);
	const [activeTab, setActiveTab] = useState<"layers" | "templates">("layers");
	const [canvasSize, setCanvasSize] = useState<{
		width: number;
		height: number;
	} | null>(null);
	const [zoom, setZoom] = useState(1);
	const [snapToGrid, setSnapToGrid] = useState(true);
	const [artboardColor, setArtboardColor] = useState<string | null>(null);
	const [previousTool, setPreviousTool] = useState<string | null>(null);
	const [isShareOpen, setIsShareOpen] = useState(false);
	const [sharedDesignId, setSharedDesignId] = useState<string | null>(null);
	const [isProjectPickerOpen, setIsProjectPickerOpen] = useState(false);
	const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
		null,
	);
	const [isSaving, setIsSaving] = useState(false);
	const [isNoteOpen, setIsNoteOpen] = useState(false);

	// Undo/Redo history stack
	const [history, setHistory] = useState<CanvasElement[][]>([[]]);
	const [historyIndex, setHistoryIndex] = useState(0);
	const historyRef = useRef(history);
	const historyIndexRef = useRef(historyIndex);
	useEffect(() => {
		historyRef.current = history;
	}, [history]);
	useEffect(() => {
		historyIndexRef.current = historyIndex;
	}, [historyIndex]);

	const clipboardRef = useRef<CanvasElement[] | null>(null);
	const jsonImportRef = useRef<HTMLInputElement>(null);

	const projects = useQuery(api.projects.list);
	const saveDesign = useMutation(api.designs.saveDesign);
	const updateDesign = useMutation(api.designs.updateDesign);

	const searchParams = useSearchParams();
	const designIdParam = searchParams.get("designId");
	const projectIdParam = searchParams.get("projectId");

	const existingDesign = useQuery(
		api.designs.getDesign,
		designIdParam ? { designId: designIdParam as Id<"designs"> } : "skip",
	);

	useEffect(() => {
		if (existingDesign) {
			try {
				const parsed = JSON.parse(existingDesign.elements);
				setElements(parsed);
				setHistory([parsed]);
				setHistoryIndex(0);
				if (existingDesign.canvasSize) setCanvasSize(existingDesign.canvasSize);
				if (existingDesign.artboardColor)
					setArtboardColor(existingDesign.artboardColor);
				setSharedDesignId(existingDesign._id);
				setSelectedProjectId(existingDesign.projectId);
			} catch (e) {
				console.error("Failed to parse design elements", e);
			}
		}
	}, [existingDesign]);

	useEffect(() => {
		if (projectIdParam && !selectedProjectId && !designIdParam) {
			setSelectedProjectId(projectIdParam);
		}
	}, [projectIdParam, selectedProjectId, designIdParam]);

	const elementsRef = useRef(elements);
	const activeToolRef = useRef(activeTool);
	const previousToolRef = useRef(previousTool);
	const selectedIdsRef = useRef(selectedIds);

	useEffect(() => {
		elementsRef.current = elements;
		activeToolRef.current = activeTool;
		previousToolRef.current = previousTool;
		selectedIdsRef.current = selectedIds;
	}, [elements, activeTool, previousTool, selectedIds]);

	const commitElements = useCallback((newElements: CanvasElement[]) => {
		setHistory((prev) => {
			const sliced = prev.slice(0, historyIndexRef.current + 1);
			return [...sliced, newElements];
		});
		setHistoryIndex((i) => i + 1);
		setElements(newElements);
	}, []);

	const onElementPointer = useCallback(
		(id: string, opts: { shiftKey: boolean }) => {
			setSelectedIds((prev) => {
				if (opts.shiftKey) {
					if (prev.includes(id)) return prev.filter((x) => x !== id);
					return [...prev, id];
				}
				return [id];
			});
		},
		[],
	);

	const escapeXml = (s: string) =>
		s
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;");

	const elementToSvg = useCallback((el: CanvasElement): string => {
		const op = el.opacity ?? 1;
		const blend =
			el.globalCompositeOperation &&
			el.globalCompositeOperation !== "source-over"
				? ` style="mix-blend-mode: ${el.globalCompositeOperation}"`
				: "";
		if (el.type === "group" && el.children?.length) {
			const inner = el.children.map(elementToSvg).join("\n");
			const rot = el.rotation ?? 0;
			const cx = (el.width ?? 0) / 2;
			const cy = (el.height ?? 0) / 2;
			return `<g transform="translate(${el.x},${el.y}) rotate(${rot},${cx},${cy})" opacity="${op}"${blend}>${inner}</g>`;
		}
		if (el.type === "rect") {
			const rot = el.rotation ?? 0;
			const cx = el.x + (el.width ?? 0) / 2;
			const cy = el.y + (el.height ?? 0) / 2;
			return `<rect x="${el.x}" y="${el.y}" width="${el.width ?? 0}" height="${el.height ?? 0}" fill="${el.fill === "none" ? "none" : el.fill}" stroke="${el.stroke}" stroke-width="${el.strokeWidth}" opacity="${op}" transform="rotate(${rot},${cx},${cy})"${blend}/>`;
		}
		if (el.type === "circle") {
			const r = Math.sqrt((el.width ?? 0) ** 2 + (el.height ?? 0) ** 2);
			return `<ellipse cx="${el.x}" cy="${el.y}" rx="${r}" ry="${r}" fill="${el.fill === "none" ? "none" : el.fill}" stroke="${el.stroke}" stroke-width="${el.strokeWidth}" opacity="${op}"${blend}/>`;
		}
		if (el.type === "pencil" && el.points?.length) {
			const pts: string[] = [];
			for (let i = 0; i < el.points.length; i += 2) {
				pts.push(`${el.points[i]},${el.points[i + 1]}`);
			}
			return `<polyline points="${pts.join(" ")}" fill="none" stroke="${el.stroke}" stroke-width="${el.strokeWidth}" stroke-linecap="round" opacity="${op}"${blend}/>`;
		}
		if (el.type === "text") {
			return `<text x="${el.x}" y="${el.y}" font-size="${el.fontSize ?? 24}" font-family="${escapeXml(el.fontFamily ?? "Inter, sans-serif")}" fill="${el.stroke}" opacity="${op}"${blend}>${escapeXml(el.text ?? "")}</text>`;
		}
		if (el.type === "image" && el.src) {
			return `<image href="${escapeXml(el.src)}" x="${el.x}" y="${el.y}" width="${el.width ?? 0}" height="${el.height ?? 0}" opacity="${op}" preserveAspectRatio="none"${blend}/>`;
		}
		return "";
	}, []);

	const exportSVG = useCallback(() => {
		const els = elementsRef.current;
		const w = canvasSize?.width ?? 1920;
		const h = canvasSize?.height ?? 1080;
		const svgEls = els.map(elementToSvg).join("\n");
		const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">\n${svgEls}\n</svg>`;
		const blob = new Blob([svg], { type: "image/svg+xml" });
		const link = document.createElement("a");
		link.href = URL.createObjectURL(blob);
		link.download = "boom-scope-design.svg";
		link.click();
		toast.success("SVG exportovaný!");
	}, [canvasSize, elementToSvg]);

	// JSON export helper
	const exportJSON = useCallback(() => {
		const data = { elements: elementsRef.current, canvasSize, artboardColor };
		const blob = new Blob([JSON.stringify(data, null, 2)], {
			type: "application/json",
		});
		const link = document.createElement("a");
		link.href = URL.createObjectURL(blob);
		link.download = "boom-scope-design.json";
		link.click();
		toast.success("JSON exportovaný!");
	}, [canvasSize, artboardColor]);

	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleSaveToProject = useCallback(async () => {
		if (!selectedProjectId) {
			toast.error("Vyberte projekt!");
			return;
		}
		setIsSaving(true);
		try {
			const id = await saveDesign({
				name: `Design - ${new Date().toLocaleDateString()}`,
				elements: JSON.stringify(elementsRef.current),
				projectId: selectedProjectId as Id<"projects">,
				canvasSize: canvasSize || { width: 1920, height: 1080 },
				artboardColor: artboardColor || undefined,
			});
			setIsProjectPickerOpen(false);
			setSharedDesignId(id);
			setIsShareOpen(true);
			toast.success("Design uložený do projektu!");
		} catch {
			toast.error("Nepodarilo sa uložiť design.");
		} finally {
			setIsSaving(false);
		}
	}, [selectedProjectId, saveDesign, canvasSize, artboardColor]);

	const handleAction = useCallback(
		async (toolId: string) => {
			if (toolId === "undo") {
				const idx = historyIndexRef.current;
				if (idx > 0) {
					const newIdx = idx - 1;
					setHistoryIndex(newIdx);
					setElements(historyRef.current[newIdx]);
				}
				return;
			}
			if (toolId === "redo") {
				const idx = historyIndexRef.current;
				const hist = historyRef.current;
				if (idx < hist.length - 1) {
					const newIdx = idx + 1;
					setHistoryIndex(newIdx);
					setElements(hist[newIdx]);
				}
				return;
			}
			if (toolId === "trash") {
				commitElements([]);
				setSelectedIds([]);
				return;
			}
			if (toolId === "image") {
				fileInputRef.current?.click();
				return;
			}
			if (toolId === "settings") {
				setRightPanelOpen((prev) => !prev);
				return;
			}
			if (toolId === "download") {
				const stage = document.querySelector("canvas");
				if (stage) {
					const link = document.createElement("a");
					link.download = "boom-scope-design.png";
					link.href = stage.toDataURL();
					link.click();
				}
				return;
			}
			if (toolId === "share") {
				if (!projects || projects.length === 0) {
					toast.error("Najprv si vytvorte projekt v dashboarde!");
					return;
				}
				// Open project picker dialog
				setSelectedProjectId(projects[0]._id);
				setIsProjectPickerOpen(true);
				return;
			}
			if (toolId === "save") {
				if (sharedDesignId) {
					setIsSaving(true);
					try {
						await updateDesign({
							id: sharedDesignId as Id<"designs">,
							elements: JSON.stringify(elementsRef.current),
							canvasSize: canvasSize || { width: 1920, height: 1080 },
							artboardColor: artboardColor || undefined,
						});
						toast.success("Design aktualizovaný!");
					} catch {
						toast.error("Nepodarilo sa aktualizovať design.");
					} finally {
						setIsSaving(false);
					}
				} else if (selectedProjectId) {
					handleSaveToProject();
				} else {
					handleAction("share");
				}
				return;
			}
			setActiveTool(toolId);
			if (toolId !== "select") {
				setSelectedIds([]);
			}
		},
		[projects, commitElements, sharedDesignId, selectedProjectId, updateDesign, handleSaveToProject, canvasSize, artboardColor],
	);

	const updateSelectedElement = useCallback(
		(updates: Partial<CanvasElement>) => {
			const ids = selectedIdsRef.current;
			if (ids.length === 0) return;
			commitElements(
				elementsRef.current.map((el) =>
					ids.includes(el.id) ? { ...el, ...updates } : el,
				),
			);
		},
		[commitElements],
	);

	// Keyboard Shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (
				e.target instanceof HTMLInputElement ||
				e.target instanceof HTMLTextAreaElement
			)
				return;

			const mod = e.metaKey || e.ctrlKey;

			if (mod && e.key === "z" && !e.shiftKey) {
				e.preventDefault();
				handleAction("undo");
			}
			if (mod && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
				e.preventDefault();
				handleAction("redo");
			}
			if (mod && e.key.toLowerCase() === "c") {
				const picked = elementsRef.current.filter((el) =>
					selectedIdsRef.current.includes(el.id),
				);
				if (picked.length) {
					clipboardRef.current = picked.map(
						(p) => JSON.parse(JSON.stringify(p)) as CanvasElement,
					);
					toast.success("Skopírované!");
				}
			}
			if (mod && e.key.toLowerCase() === "v") {
				const clip = clipboardRef.current;
				if (clip?.length) {
					const pasted = cloneElementsForPaste(clip);
					commitElements([...elementsRef.current, ...pasted]);
					setSelectedIds(pasted.map((p) => p.id));
				}
			}
			if (e.key === "Delete" || e.key === "Backspace") {
				const ids = selectedIdsRef.current;
				if (ids.length) {
					commitElements(
						elementsRef.current.filter((el) => !ids.includes(el.id)),
					);
					setSelectedIds([]);
				}
			}

			if (e.code === "Space" && activeToolRef.current !== "hand") {
				setPreviousTool(activeToolRef.current);
				setActiveTool("hand");
			}
			if (!mod && e.key.toLowerCase() === "v") setActiveTool("select");
			if (!mod && e.key.toLowerCase() === "p") setActiveTool("pencil");
			if (!mod && e.key.toLowerCase() === "e") setActiveTool("eraser");
			if (!mod && e.key.toLowerCase() === "r") setActiveTool("rect");
			if (!mod && e.key.toLowerCase() === "c") setActiveTool("circle");
			if (!mod && e.key.toLowerCase() === "t") setActiveTool("text");
			if (
				!mod &&
				e.key.toLowerCase() === "l" &&
				selectedIdsRef.current.length === 1
			) {
				const id = selectedIdsRef.current[0];
				const el = elementsRef.current.find((x) => x.id === id);
				if (el) updateSelectedElement({ isLocked: !el.isLocked });
			}
			if (
				!mod &&
				e.key.toLowerCase() === "h" &&
				selectedIdsRef.current.length === 1
			) {
				const id = selectedIdsRef.current[0];
				const el = elementsRef.current.find((x) => x.id === id);
				if (el) updateSelectedElement({ isVisible: el.isVisible === false });
			}
		};

		const handleKeyUp = (e: KeyboardEvent) => {
			if (e.code === "Space" && previousToolRef.current) {
				setActiveTool(previousToolRef.current);
				setPreviousTool(null);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("keyup", handleKeyUp);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("keyup", handleKeyUp);
		};
	}, [handleAction, updateSelectedElement, commitElements]);

	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = () => {
			const id = `el-${Date.now()}`;
			const newImg: CanvasElement = {
				id,
				type: "image",
				x: 100,
				y: 100,
				width: 300,
				height: 200,
				stroke: "transparent",
				fill: "none",
				strokeWidth: 0,
				src: reader.result as string,
				isVisible: true,
				isLocked: false,
			};
			commitElements([...elementsRef.current, newImg]);
			setSelectedIds([id]);
			setActiveTool("select");
		};
		reader.readAsDataURL(file);
	};

	const selectedElement =
		selectedIds.length === 1
			? elements.find((el) => el.id === selectedIds[0])
			: undefined;
	const hasVisualConfigured = selectedElement
		? (selectedElement.fill !== undefined && selectedElement.fill !== "none") ||
			(selectedElement.strokeWidth ?? 0) > 0
		: false;

	const handleGroupSelection = useCallback(() => {
		const ids = selectedIdsRef.current;
		if (ids.length < 2) return;
		const indices = ids
			.map((id) => elementsRef.current.findIndex((e) => e.id === id))
			.filter((i) => i >= 0)
			.sort((a, b) => a - b);
		const next = groupElementsAtIndices(elementsRef.current, indices);
		if (next) {
			commitElements(next);
			const g = next[next.length - 1];
			setSelectedIds([g.id]);
			toast.success("Skupina vytvorená");
		}
	}, [commitElements]);

	const handleUngroupSelection = useCallback(() => {
		if (selectedIdsRef.current.length !== 1) return;
		const id = selectedIdsRef.current[0];
		const next = ungroupElement(elementsRef.current, id);
		if (next) {
			commitElements(next);
			setSelectedIds([]);
			toast.success("Skupina rozdelená");
		}
	}, [commitElements]);

	const handleJsonImport = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			try {
				const data = JSON.parse(reader.result as string) as {
					elements?: CanvasElement[];
					canvasSize?: { width: number; height: number };
					artboardColor?: string | null;
				};
				if (!data.elements || !Array.isArray(data.elements)) throw new Error();
				commitElements(data.elements);
				if (data.canvasSize) setCanvasSize(data.canvasSize);
				if (data.artboardColor !== undefined)
					setArtboardColor(data.artboardColor);
				setSelectedIds([]);
				toast.success("JSON importovaný!");
			} catch {
				toast.error("Neplatný JSON súbor.");
			}
		};
		reader.readAsText(file);
		e.target.value = "";
	};

	const toggleElementProperty = (
		id: string,
		prop: "isLocked" | "isVisible",
	) => {
		commitElements(
			elementsRef.current.map((el) => {
				if (el.id === id) {
					if (prop === "isVisible") {
						return { ...el, isVisible: el.isVisible === false };
					}
					return { ...el, [prop]: !el[prop] };
				}
				return el;
			}),
		);
	};

	const randomizeText = () => {
		if (!selectedElement || selectedElement.type !== "text") return;
		const randomFont = FONTS[Math.floor(Math.random() * FONTS.length)];
		const randomSize = Math.floor(Math.random() * (120 - 12 + 1)) + 12;
		updateSelectedElement({ fontFamily: randomFont, fontSize: randomSize });
	};

	return (
		<div className="relative h-[calc(100vh-3.5rem)] w-full overflow-hidden bg-background text-foreground selection:bg-primary/30">
			<input
				type="file"
				ref={fileInputRef}
				onChange={handleImageUpload}
				className="hidden"
				accept="image/*"
			/>
			<input
				type="file"
				ref={jsonImportRef}
				onChange={handleJsonImport}
				className="hidden"
				accept="application/json,.json"
			/>

			{/* Canvas Area */}
			<div className="absolute inset-0 h-full w-full">
				<KonvaCanvas
					activeTool={activeTool}
					elements={elements}
					commitElements={commitElements}
					selectedIds={selectedIds}
					onSelectionChange={setSelectedIds}
					onElementPointer={onElementPointer}
					strokeColor={strokeColor}
					fillColor={fillColor}
					strokeWidth={strokeWidth}
					canvasSize={canvasSize}
					zoom={zoom}
					setZoom={setZoom}
					snapToGrid={snapToGrid}
					artboardColor={artboardColor}
				/>

				{/* Zoom Controls */}
				<div className="absolute bottom-10 right-10 z-50 flex items-center gap-2 bg-background/80 backdrop-blur-xl border border-border p-1.5 rounded-2xl shadow-2xl">
					<Button
						variant="ghost"
						size="icon-xs"
						onClick={() => setZoom((prev) => Math.max(0.1, prev - 0.1))}
						className="rounded-xl hover:bg-accent"
					>
						<ZoomOut className="size-3.5" />
					</Button>
					<div className="px-3 text-[10px] font-black uppercase tracking-widest min-w-[60px] text-center">
						{Math.round(zoom * 100)}%
					</div>
					<Button
						variant="ghost"
						size="icon-xs"
						onClick={() => setZoom((prev) => Math.min(5, prev + 0.1))}
						className="rounded-xl hover:bg-accent"
					>
						<ZoomIn className="size-3.5" />
					</Button>
					<div className="w-px h-6 bg-border mx-1" />
					<Button
						variant={snapToGrid ? "default" : "ghost"}
						size="icon-xs"
						onClick={() => setSnapToGrid(!snapToGrid)}
						className={cn(
							"rounded-xl",
							snapToGrid ? "bg-primary text-white" : "hover:bg-accent",
						)}
					>
						<Grid className="size-3.5" />
					</Button>
				</div>
			</div>

			{/* Top Bar Info */}
			<div className="absolute top-8 left-1/2 -translate-x-1/2 pointer-events-none z-50">
				<div
					className={cn(
						"flex items-center gap-6 px-8 py-3 rounded-2xl border shadow-2xl pointer-events-auto",
						"bg-background/60 dark:bg-background/40 backdrop-blur-3xl border-border",
						"shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)]",
					)}
				>
					<div className="flex items-center gap-3">
						<div
							className={cn(
								"size-2 rounded-full",
								activeTool === "select"
									? "bg-primary shadow-[0_0_10px_rgba(59,130,246,0.8)]"
									: "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]",
							)}
						/>
						<span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">
							{activeTool === "select"
								? "Navigácia"
								: `Editácia: ${activeTool}`}
						</span>
					</div>
					<div className="h-4 w-px bg-border/50" />
					<div className="flex items-center gap-6 text-[10px] font-bold tracking-widest opacity-40">
						<span className="flex items-center gap-2 uppercase">
							<Layers className="size-3" /> {elements.length}
						</span>
						<span className="flex items-center gap-2 uppercase">
							<RefreshCw className="size-3" /> Auto-Save
						</span>
						<button
							onClick={() => handleAction("save")}
							className="flex items-center gap-2 uppercase opacity-100 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors pointer-events-auto"
						>
							{isSaving ? (
								<RefreshCw className="size-3 animate-spin" />
							) : (
								<FolderKanban className="size-3" />
							)}
							{sharedDesignId ? "Aktualizovať" : "Uložiť do projektu"}
						</button>
						<button
							onClick={() => setIsNoteOpen(true)}
							className="flex items-center gap-2 uppercase opacity-100 px-3 py-1.5 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors pointer-events-auto"
						>
							<NotebookPen className="size-3" /> Poznámka
						</button>
					</div>
				</div>
			</div>

			{/* Panel Toggle Buttons */}
			<div className="absolute top-8 left-8 z-50 flex gap-2">
				{!leftPanelOpen && (
					<Button
						variant="outline"
						size="icon-sm"
						onClick={() => setLeftPanelOpen(true)}
						className="bg-background/60 backdrop-blur-md border-border hover:bg-accent rounded-2xl size-11 shadow-2xl"
					>
						<PanelLeft className="size-5" />
					</Button>
				)}
			</div>
			<div className="absolute top-8 right-8 z-50 flex gap-2">
				{!rightPanelOpen && (
					<Button
						variant="outline"
						size="icon-sm"
						onClick={() => setRightPanelOpen(true)}
						className="bg-background/60 backdrop-blur-md border-border hover:bg-accent rounded-2xl size-11 shadow-2xl"
					>
						<PanelRight className="size-5" />
					</Button>
				)}
			</div>

			{/* Left Sidebar (Layers) */}
			<AnimatePresence>
				{leftPanelOpen && (
					<motion.div
						initial={{ x: -300, opacity: 0 }}
						animate={{ x: 0, opacity: 1 }}
						exit={{ x: -300, opacity: 0 }}
						transition={{ type: "spring", damping: 25, stiffness: 120 }}
						className={cn(
							"absolute left-8 top-8 bottom-36 w-72 rounded-[32px] border border-border",
							"bg-background/80 dark:bg-background/20 backdrop-blur-3xl p-8 hidden lg:flex flex-col z-40",
							"shadow-[0_30px_60px_rgba(0,0,0,0.05)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.5)]",
						)}
					>
						<div className="flex items-center justify-between mb-8">
							<div className="flex p-1 rounded-2xl bg-accent/50 border border-border w-full">
								<button
									onClick={() => setActiveTab("layers")}
									className={cn(
										"flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
										activeTab === "layers"
											? "bg-background text-primary shadow-sm"
											: "text-foreground/40 hover:text-foreground",
									)}
								>
									<Layers className="size-3.5" />
									Vrstvy
								</button>
								<button
									onClick={() => setActiveTab("templates")}
									className={cn(
										"flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
										activeTab === "templates"
											? "bg-background text-primary shadow-sm"
											: "text-foreground/40 hover:text-foreground",
									)}
								>
									<Sparkles className="size-3.5" />
									Šablóny
								</button>
							</div>
							<Button
								variant="ghost"
								size="icon-xs"
								onClick={() => setLeftPanelOpen(false)}
								className="hover:bg-accent rounded-lg ml-2"
							>
								<PanelLeft className="size-4 opacity-40" />
							</Button>
						</div>

						<div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
							{activeTab === "layers" ? (
								elements.length === 0 ? (
									<div className="h-full flex flex-col items-center justify-center opacity-30 dark:opacity-10 text-center px-4">
										<div className="size-16 rounded-[24px] border-2 border-dashed border-foreground/20 mb-6 flex items-center justify-center">
											<Pencil className="size-6" />
										</div>
										<p className="text-[10px] font-black uppercase tracking-[0.2em]">
											Pripravené
										</p>
									</div>
								) : (
									elements
										.map((el) => (
											<div key={el.id} className="relative group">
												<button
													onClick={(ev) => {
														if (ev.shiftKey) {
															setSelectedIds((prev) =>
																prev.includes(el.id)
																	? prev.filter((x) => x !== el.id)
																	: [...prev, el.id],
															);
														} else {
															setSelectedIds([el.id]);
														}
													}}
													className={cn(
														"w-full flex items-center justify-between px-5 py-4 rounded-2xl text-xs transition-all duration-500",
														selectedIds.includes(el.id)
															? "bg-primary text-white shadow-[0_15px_30px_rgba(37,99,235,0.3)] scale-[1.02]"
															: "hover:bg-accent text-foreground/50 hover:text-foreground",
													)}
												>
													<div className="flex items-center gap-4">
														<div
															className={cn(
																"size-8 rounded-xl flex items-center justify-center border border-border/50",
																selectedIds.includes(el.id)
																	? "bg-white/20"
																	: "bg-background/40",
															)}
														>
															{el.type === "group" && (
																<Group className="size-4" />
															)}
															{el.type === "rect" && (
																<Square className="size-4" />
															)}
															{el.type === "circle" && (
																<Circle className="size-4" />
															)}
															{el.type === "pencil" && (
																<Pencil className="size-4" />
															)}
															{el.type === "text" && (
																<Type className="size-4" />
															)}
															{el.type === "image" && (
																<ImageIcon className="size-4" />
															)}
														</div>
														<div className="text-left">
															<p
																className={cn(
																	"font-black tracking-tight opacity-90",
																	el.isVisible === false &&
																		"line-through opacity-30",
																)}
															>
																{el.type.charAt(0).toUpperCase() +
																	el.type.slice(1)}
															</p>
															<p className="text-[9px] font-bold opacity-30 uppercase tracking-widest">
																ID: {el.id.split("-")[1]}
															</p>
														</div>
													</div>
												</button>

												{/* Quick Layer Controls */}
												<div
													className={cn(
														"absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
														selectedIds.includes(el.id) && "opacity-100",
													)}
												>
													<button
														onClick={(e) => {
															e.stopPropagation();
															toggleElementProperty(el.id, "isVisible");
														}}
														className="p-1.5 rounded-lg hover:bg-accent transition-colors"
													>
														{el.isVisible === false ? (
															<EyeOff className="size-3 text-red-500" />
														) : (
															<Eye className="size-3 opacity-40" />
														)}
													</button>
													<button
														onClick={(e) => {
															e.stopPropagation();
															toggleElementProperty(el.id, "isLocked");
														}}
														className="p-1.5 rounded-lg hover:bg-accent transition-colors"
													>
														{el.isLocked ? (
															<Lock className="size-3 text-amber-500" />
														) : (
															<Unlock className="size-3 opacity-40" />
														)}
													</button>
													<Button
														variant="ghost"
														size="icon-xs"
														onClick={(e) => {
															e.stopPropagation();
															commitElements(
																elementsRef.current.filter(
																	(item) => item.id !== el.id,
																),
															);
															setSelectedIds((prev) =>
																prev.filter((id) => id !== el.id),
															);
														}}
														className="hover:bg-red-500 hover:text-white rounded-lg transition-all duration-300"
													>
														<Trash2 className="size-3.5" />
													</Button>
												</div>
											</div>
										))
										.reverse()
								)
							) : (
								<div className="space-y-8 pb-10">
									{/* Social Media Group */}
									<div className="space-y-3">
										<h4 className="px-2 text-[9px] font-black uppercase tracking-[0.3em] text-primary/60 flex items-center gap-2">
											<div className="size-1 bg-primary rounded-full" />
											Sociálne siete
										</h4>
										<div className="grid grid-cols-1 gap-2">
											{CANVAS_PRESETS.filter(
												(p) => !["smartphone", "tablet"].includes(p.icon),
											).map((preset) => {
												const Icon =
													preset.icon === "facebook"
														? FacebookIcon
														: preset.icon === "twitter"
															? TwitterIcon
															: preset.icon === "instagram"
																? InstagramIcon
																: LinkedinIcon;
												return (
													<button
														key={preset.id}
														onClick={() =>
															setCanvasSize({
																width: preset.width,
																height: preset.height,
															})
														}
														className={cn(
															"w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-xs transition-all duration-300",
															canvasSize?.width === preset.width &&
																canvasSize?.height === preset.height
																? "bg-primary text-white shadow-[0_15px_30px_rgba(37,99,235,0.3)] scale-[1.02]"
																: "bg-accent/30 hover:bg-accent text-foreground/70 hover:text-foreground",
														)}
													>
														<div
															className={cn(
																"size-8 rounded-xl flex items-center justify-center border border-border/50",
																canvasSize?.width === preset.width &&
																	canvasSize?.height === preset.height
																	? "bg-white/20"
																	: "bg-background/40",
															)}
														>
															<Icon className="size-4" />
														</div>
														<div className="text-left">
															<p className="font-black tracking-tight">
																{preset.name}
															</p>
															<p className="text-[9px] font-bold opacity-30 uppercase tracking-widest">
																{preset.width} × {preset.height} px
															</p>
														</div>
													</button>
												);
											})}
										</div>
									</div>

									{/* Devices Group */}
									<div className="space-y-3">
										<h4 className="px-2 text-[9px] font-black uppercase tracking-[0.3em] text-primary/60 flex items-center gap-2">
											<div className="size-1 bg-primary rounded-full" />
											Zariadenia
										</h4>
										<div className="grid grid-cols-1 gap-2">
											{CANVAS_PRESETS.filter((p) =>
												["smartphone", "tablet"].includes(p.icon),
											).map((preset) => {
												const Icon =
													preset.icon === "smartphone" ? Smartphone : Tablet;
												return (
													<button
														key={preset.id}
														onClick={() =>
															setCanvasSize({
																width: preset.width,
																height: preset.height,
															})
														}
														className={cn(
															"w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-xs transition-all duration-300",
															canvasSize?.width === preset.width &&
																canvasSize?.height === preset.height
																? "bg-primary text-white shadow-[0_15px_30px_rgba(37,99,235,0.3)] scale-[1.02]"
																: "bg-accent/30 hover:bg-accent text-foreground/70 hover:text-foreground",
														)}
													>
														<div
															className={cn(
																"size-8 rounded-xl flex items-center justify-center border border-border/50",
																canvasSize?.width === preset.width &&
																	canvasSize?.height === preset.height
																	? "bg-white/20"
																	: "bg-background/40",
															)}
														>
															<Icon className="size-4" />
														</div>
														<div className="text-left">
															<p className="font-black tracking-tight">
																{preset.name}
															</p>
															<p className="text-[9px] font-bold opacity-30 uppercase tracking-widest">
																{preset.width} × {preset.height} px
															</p>
														</div>
													</button>
												);
											})}
										</div>
									</div>

									<div className="pt-6 border-t border-border space-y-4">
										<h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
											Vlastný rozmer
										</h4>
										<div className="grid grid-cols-2 gap-3">
											<div className="space-y-2">
												<Label className="text-[8px] font-black uppercase tracking-widest opacity-30">
													Šírka
												</Label>
												<Input
													type="number"
													placeholder="1920"
													value={canvasSize?.width || ""}
													onChange={(e) =>
														setCanvasSize((prev) => ({
															width: parseInt(e.target.value) || 0,
															height: prev?.height || 0,
														}))
													}
													className="bg-accent/30 border-border rounded-xl h-10 text-xs"
												/>
											</div>
											<div className="space-y-2">
												<Label className="text-[8px] font-black uppercase tracking-widest opacity-30">
													Výška
												</Label>
												<Input
													type="number"
													placeholder="1080"
													value={canvasSize?.height || ""}
													onChange={(e) =>
														setCanvasSize((prev) => ({
															width: prev?.width || 0,
															height: parseInt(e.target.value) || 0,
														}))
													}
													className="bg-accent/30 border-border rounded-xl h-10 text-xs"
												/>
											</div>
										</div>
										<Button
											variant="outline"
											className="w-full rounded-xl text-[10px] font-black uppercase tracking-widest"
											onClick={() => setCanvasSize(null)}
										>
											Resetovať rozmer
										</Button>
									</div>
								</div>
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Right Sidebar (Properties) */}
			<AnimatePresence>
				{rightPanelOpen && (
					<motion.div
						initial={{ x: 300, opacity: 0 }}
						animate={{ x: 0, opacity: 1 }}
						exit={{ x: 300, opacity: 0 }}
						transition={{ type: "spring", damping: 25, stiffness: 120 }}
						className={cn(
							"absolute right-8 top-8 bottom-36 w-80 rounded-[32px] border border-border",
							"bg-background/80 dark:bg-background/20 backdrop-blur-3xl p-8 hidden xl:flex flex-col z-40",
							"shadow-[0_30px_60px_rgba(0,0,0,0.05)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.5)]",
						)}
					>
						<div className="flex items-center justify-between mb-10">
							<div className="flex items-center gap-4">
								<div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
									<Settings2 className="size-4" />
								</div>
								<h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">
									Vlastnosti
								</h3>
							</div>
							<Button
								variant="ghost"
								size="icon-xs"
								onClick={() => setRightPanelOpen(false)}
								className="hover:bg-accent rounded-lg"
							>
								<PanelRight className="size-4 opacity-40" />
							</Button>
						</div>

						<div className="space-y-10 flex-1 overflow-y-auto pr-2 custom-scrollbar">
							{selectedIds.length > 1 ? (
								<div className="space-y-8">
									<p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">
										Výber: {selectedIds.length} vrstvy
									</p>
									<div className="grid grid-cols-2 gap-3">
										<Button
											variant="outline"
											size="sm"
											className="rounded-xl gap-2 text-[9px] font-black uppercase"
											onClick={handleGroupSelection}
										>
											<Group className="size-3" /> Skupina
										</Button>
										<Button
											variant="outline"
											size="sm"
											className="rounded-xl gap-2 text-[9px] font-black uppercase text-red-500"
											onClick={() => {
												commitElements(
													elementsRef.current.filter(
														(el) => !selectedIds.includes(el.id),
													),
												);
												setSelectedIds([]);
											}}
										>
											<Trash2 className="size-3" /> Vymazať
										</Button>
									</div>
									<div className="space-y-3">
										<p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-20">
											Priehľadnosť (všetky)
										</p>
										<input
											type="range"
											min="0"
											max="1"
											step="0.01"
											value={
												elements.find((e) => e.id === selectedIds[0])
													?.opacity ?? 1
											}
											onChange={(e) =>
												updateSelectedElement({
													opacity: parseFloat(e.target.value),
												})
											}
											className="w-full accent-primary bg-foreground/10 rounded-full h-1 appearance-none cursor-pointer"
										/>
									</div>
								</div>
							) : selectedElement ? (
								<>
									{/* Visibility & Lock Quick Controls */}
									<div className="grid grid-cols-2 gap-3 p-1 rounded-2xl bg-accent border border-border shadow-inner">
										<button
											onClick={() =>
												updateSelectedElement({
													isVisible: selectedElement.isVisible === false,
												})
											}
											className={cn(
												"flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
												selectedElement.isVisible === false
													? "bg-red-500/20 text-red-500"
													: "hover:bg-background/50 text-foreground/50",
											)}
										>
											{selectedElement.isVisible === false ? (
												<EyeOff className="size-3" />
											) : (
												<Eye className="size-3" />
											)}
											{selectedElement.isVisible === false
												? "Skryté"
												: "Viditeľné"}
										</button>
									</div>

									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
												<Sliders className="size-4 text-primary" />
											</div>
											<div>
												<h2 className="text-[10px] font-black uppercase tracking-[0.3em]">
													Editor Prvku
												</h2>
												<p className="text-[9px] font-bold opacity-30 uppercase tracking-widest">
													{selectedElement.type}
												</p>
											</div>
										</div>
										<button
											onClick={() =>
												updateSelectedElement({
													isLocked: !selectedElement.isLocked,
												})
											}
											className={cn(
												"size-10 rounded-xl flex items-center justify-center transition-all",
												selectedElement.isLocked
													? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
													: "hover:bg-foreground/5 text-foreground/40",
											)}
										>
											{selectedElement.isLocked ? (
												<Lock className="size-4" />
											) : (
												<Unlock className="size-4" />
											)}
										</button>
									</div>

									{selectedElement.type === "group" && (
										<Button
											variant="outline"
											className="w-full rounded-2xl border-border gap-2 text-[9px] font-black uppercase"
											onClick={handleUngroupSelection}
										>
											<Ungroup className="size-3.5" /> Rozdeliť skupinu
										</Button>
									)}

									{/* Geometry Section */}
									<div className="space-y-6">
										<div className="flex items-center gap-3">
											<Maximize2 className="size-3.5 text-primary/60" />
											<Label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
												Geometria
											</Label>
										</div>

										<div className="grid grid-cols-2 gap-4">
											<div className="space-y-3">
												<p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-20">
													Os X
												</p>
												<Input
													type="number"
													value={Math.round(selectedElement.x)}
													onChange={(e) =>
														updateSelectedElement({
															x: parseInt(e.target.value) || 0,
														})
													}
													className="bg-background border-border h-10 rounded-xl text-xs font-mono font-bold text-center"
												/>
											</div>
											<div className="space-y-3">
												<p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-20">
													Os Y
												</p>
												<Input
													type="number"
													value={Math.round(selectedElement.y)}
													onChange={(e) =>
														updateSelectedElement({
															y: parseInt(e.target.value) || 0,
														})
													}
													className="bg-background border-border h-10 rounded-xl text-xs font-mono font-bold text-center"
												/>
											</div>
										</div>

										<div className="grid grid-cols-2 gap-4">
											<div className="space-y-3">
												<p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-20">
													Šírka
												</p>
												<Input
													type="number"
													value={Math.round(selectedElement.width || 0)}
													onChange={(e) =>
														updateSelectedElement({
															width: parseInt(e.target.value) || 0,
														})
													}
													className="bg-background border-border h-10 rounded-xl text-xs font-mono font-bold text-center"
												/>
											</div>
											<div className="space-y-3">
												<p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-20">
													Výška
												</p>
												<Input
													type="number"
													value={Math.round(selectedElement.height || 0)}
													onChange={(e) =>
														updateSelectedElement({
															height: parseInt(e.target.value) || 0,
														})
													}
													className="bg-background border-border h-10 rounded-xl text-xs font-mono font-bold text-center"
												/>
											</div>
										</div>

										<div className="space-y-4">
											<div className="flex justify-between items-center">
												<p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-20">
													Rotácia
												</p>
												<div className="flex items-center gap-2">
													<RotateCw className="size-3 opacity-30" />
													<Input
														type="number"
														value={Math.round(selectedElement.rotation || 0)}
														onChange={(e) =>
															updateSelectedElement({
																rotation: parseInt(e.target.value) || 0,
															})
														}
														className="w-16 bg-background border-border h-8 rounded-lg text-[10px] font-mono font-bold text-center"
													/>
												</div>
											</div>
											<input
												type="range"
												min="0"
												max="360"
												value={selectedElement.rotation || 0}
												onChange={(e) =>
													updateSelectedElement({
														rotation: parseInt(e.target.value),
													})
												}
												className="w-full accent-primary bg-foreground/10 rounded-full h-1 appearance-none cursor-pointer hover:bg-foreground/20 transition-colors"
											/>
										</div>
									</div>

									{/* Visual Settings */}
									<div className="space-y-8">
										<div className="flex items-center gap-3">
											<Palette className="size-3.5 text-primary/60" />
											<Label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
												Vizuál
											</Label>
										</div>

										{!hasVisualConfigured && (
											<div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-3">
												<p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-500/80">
													Nikde nie je vizuál nastavený
												</p>
												<Button
													variant="outline"
													size="sm"
													className="h-8 rounded-xl border-amber-500/30 bg-amber-500/10 text-[9px] font-black uppercase tracking-widest text-amber-500 hover:bg-amber-500/20 hover:text-amber-500"
													onClick={() =>
														updateSelectedElement({
															fillType: "solid",
															fill: "var(--primary)",
															stroke: "var(--primary)",
															strokeWidth: 2,
															opacity: 1,
														})
													}
												>
													Nastaviť predvolený vizuál
												</Button>
											</div>
										)}

										{/* Fill / Gradient Toggle */}
										<div className="space-y-5">
											<p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-20">
												Typ Výplne
											</p>
											<div className="grid grid-cols-2 gap-2 p-1.5 bg-foreground/5 rounded-2xl border border-border">
												<button
													onClick={() =>
														updateSelectedElement({ fillType: "solid" })
													}
													className={cn(
														"py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
														selectedElement.fillType !== "gradient"
															? "bg-background text-primary shadow-sm border border-border"
															: "opacity-40 hover:opacity-100",
													)}
												>
													Jednofarebná
												</button>
												<button
													onClick={() =>
														updateSelectedElement({ fillType: "gradient" })
													}
													className={cn(
														"py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
														selectedElement.fillType === "gradient"
															? "bg-background text-primary shadow-sm border border-border"
															: "opacity-40 hover:opacity-100",
													)}
												>
													Gradient
												</button>
											</div>
										</div>

										<div className="space-y-5">
											<p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-20">
												{selectedElement.fillType === "gradient"
													? "Farby Gradientu"
													: "Farba Výplne"}
											</p>
											<div className="grid grid-cols-6 gap-2.5">
												{PALETTE.map((color) => (
													<button
														key={color}
														onClick={() => {
															if (selectedElement.fillType === "gradient") {
																const colors =
																	selectedElement.gradientColors || [
																		"var(--primary)",
																		"var(--success)",
																	];
																updateSelectedElement({
																	gradientColors: [color, colors[1]],
																});
															} else {
																updateSelectedElement({ fill: color });
															}
														}}
														className={cn(
															"size-8 rounded-xl border-2 transition-all duration-300 hover:scale-110 active:scale-90",
															selectedElement.fill === color ||
																selectedElement.gradientColors?.[0] === color
																? "border-primary scale-110 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
																: "border-transparent hover:border-foreground/20",
														)}
														style={{ backgroundColor: color }}
													/>
												))}
											</div>
										</div>

										{/* Borders / Stroke */}
										<div className="space-y-6">
											<div className="flex justify-between items-center">
												<p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-20">
													Obrys (Stroke)
												</p>
												<span className="text-[10px] font-mono font-bold opacity-60">
													{selectedElement.strokeWidth || 0}px
												</span>
											</div>
											<div className="space-y-5">
												<div className="grid grid-cols-6 gap-2.5">
													{PALETTE.map((color) => (
														<button
															key={color}
															onClick={() => {
																setStrokeColor(color);
																updateSelectedElement({ stroke: color });
															}}
															className={cn(
																"size-8 rounded-xl border-2 transition-all duration-300 hover:scale-110 active:scale-90",
																selectedElement.stroke === color
																	? "border-primary scale-110 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
																	: "border-transparent hover:border-foreground/20",
															)}
															style={{ backgroundColor: color }}
														/>
													))}
												</div>
											</div>
											<div className="space-y-4">
												<input
													type="range"
													min="0"
													max="20"
													value={selectedElement.strokeWidth || 0}
													onChange={(e) =>
														updateSelectedElement({
															strokeWidth: parseInt(e.target.value),
														})
													}
													className="w-full accent-primary bg-foreground/10 rounded-full h-1 appearance-none cursor-pointer hover:bg-foreground/20 transition-colors"
												/>
												<div className="grid grid-cols-3 gap-2">
													{[
														{ label: "Súvislá", value: [] },
														{ label: "Prerušená", value: [10, 5] },
														{ label: "Bodkovaná", value: [2, 4] },
													].map((style) => (
														<button
															key={style.label}
															onClick={() =>
																updateSelectedElement({ dash: style.value })
															}
															className={cn(
																"py-2 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all",
																JSON.stringify(selectedElement.dash) ===
																	JSON.stringify(style.value)
																	? "bg-primary/10 border-primary/30 text-primary"
																	: "bg-foreground/5 border-transparent opacity-40 hover:opacity-100",
															)}
														>
															{style.label}
														</button>
													))}
												</div>
											</div>
										</div>

										{/* Opacity */}
										<div className="space-y-5">
											<div className="flex justify-between items-center">
												<p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-20">
													Priehľadnosť
												</p>
												<span className="text-[10px] font-mono font-bold opacity-60">
													{Math.round((selectedElement.opacity ?? 1) * 100)}%
												</span>
											</div>
											<input
												type="range"
												min="0"
												max="1"
												step="0.01"
												value={selectedElement.opacity ?? 1}
												onChange={(e) =>
													updateSelectedElement({
														opacity: parseFloat(e.target.value),
													})
												}
												className="w-full accent-primary bg-foreground/10 rounded-full h-1 appearance-none cursor-pointer hover:bg-foreground/20 transition-colors"
											/>
										</div>

										{/* Blend Mode */}
										<div className="space-y-3">
											<p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-20">
												Blend Mode
											</p>
											<Select
												value={
													selectedElement.globalCompositeOperation ??
													"source-over"
												}
												onValueChange={(v) =>
													updateSelectedElement({ globalCompositeOperation: v })
												}
											>
												<SelectTrigger className="h-9 rounded-xl bg-background border-border text-[10px] font-bold">
													<SelectValue />
												</SelectTrigger>
												<SelectContent className="rounded-2xl border-border/50">
													{[
														"source-over",
														"multiply",
														"screen",
														"overlay",
														"darken",
														"lighten",
														"color-dodge",
														"color-burn",
														"hard-light",
														"soft-light",
														"difference",
														"exclusion",
													].map((mode) => (
														<SelectItem
															key={mode}
															value={mode}
															className="rounded-xl text-[10px] font-bold"
														>
															{mode === "source-over"
																? "Normal"
																: mode
																		.replace(/-/g, " ")
																		.replace(/\b\w/g, (c) => c.toUpperCase())}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>

										{/* Text Specifics */}
										{selectedElement.type === "text" && (
											<div className="space-y-6 pt-6 border-t border-border animate-in fade-in duration-500">
												<div className="flex items-center justify-between p-4 rounded-[20px] bg-primary/5 border border-primary/10 shadow-sm">
													<div className="flex items-center gap-3">
														<Sparkles className="size-4 text-primary" />
														<span className="text-[10px] font-black uppercase tracking-widest opacity-80 text-primary">
															Náhodný Štýl
														</span>
													</div>
													<Button
														size="xs"
														variant="outline"
														className="rounded-full bg-primary/20 border-primary/40 hover:bg-primary text-white"
														onClick={randomizeText}
													>
														<RefreshCw className="size-3" />
													</Button>
												</div>

												<div className="space-y-4">
													<p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-20">
														Obsah Textu
													</p>
													<textarea
														value={selectedElement.text || ""}
														onChange={(e) =>
															updateSelectedElement({ text: e.target.value })
														}
														className="w-full bg-background border border-border focus:border-primary/50 transition-all rounded-2xl p-4 text-xs h-24 outline-none resize-none font-bold"
													/>
												</div>
											</div>
										)}
									</div>

									{/* Layering & Delete */}
									<div className="pt-8 border-t border-border space-y-4">
										<div className="grid grid-cols-2 gap-3">
											<Button
												variant="outline"
												size="sm"
												className="rounded-xl border-border bg-background hover:bg-accent gap-2 text-[9px] font-black uppercase"
												onClick={() => {
													const sid = selectedIds[0];
													if (!sid) return;
													commitElements(
														(() => {
															const prev = elementsRef.current;
															const el = prev.find((e) => e.id === sid);
															if (!el) return prev;
															const otherElements = prev.filter(
																(e) => e.id !== sid,
															);
															return [...otherElements, el];
														})(),
													);
												}}
											>
												<ArrowUp className="size-3" /> Dopredu
											</Button>
											<Button
												variant="outline"
												size="sm"
												className="rounded-xl border-border bg-background hover:bg-accent gap-2 text-[9px] font-black uppercase"
												onClick={() => {
													const sid = selectedIds[0];
													if (!sid) return;
													commitElements(
														(() => {
															const prev = elementsRef.current;
															const el = prev.find((e) => e.id === sid);
															if (!el) return prev;
															const otherElements = prev.filter(
																(e) => e.id !== sid,
															);
															return [el, ...otherElements];
														})(),
													);
												}}
											>
												<ArrowDown className="size-3" /> Dozadu
											</Button>
										</div>
										<Button
											variant="ghost"
											className="w-full gap-4 text-[9px] font-black uppercase tracking-[0.3em] h-14 rounded-2xl bg-red-500/5 text-red-500/60 hover:bg-red-500/10 hover:text-red-500 border border-red-500/10 transition-all shadow-sm"
											onClick={() => {
												commitElements(
													elementsRef.current.filter(
														(el) => !selectedIds.includes(el.id),
													),
												);
												setSelectedIds([]);
											}}
										>
											<Trash2 className="size-4" /> Vymazať objekt
										</Button>
									</div>
								</>
							) : (
								<div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
									<div className="flex items-center gap-4">
										<div className="size-10 rounded-[18px] bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
											<Palette className="size-5 text-primary" />
										</div>
										<div>
											<h2 className="text-[10px] font-black uppercase tracking-[0.3em]">
												Nastavenia Plátna
											</h2>
											<p className="text-[9px] font-bold opacity-30 uppercase tracking-widest">
												Globálne parametre
											</p>
										</div>
									</div>

									{/* Artboard Size */}
									<div className="space-y-6">
										<p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-20">
											Rozmery Artboardu (px)
										</p>
										<div className="grid grid-cols-2 gap-4">
											<div className="space-y-3">
												<p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-20">
													Šírka
												</p>
												<Input
													type="number"
													value={canvasSize?.width || 1920}
													onChange={(e) =>
														setCanvasSize((prev) => ({
															...prev!,
															width: parseInt(e.target.value) || 1920,
														}))
													}
													className="bg-background border-border h-10 rounded-xl text-xs font-mono font-bold text-center"
												/>
											</div>
											<div className="space-y-3">
												<p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-20">
													Výška
												</p>
												<Input
													type="number"
													value={canvasSize?.height || 1080}
													onChange={(e) =>
														setCanvasSize((prev) => ({
															...prev!,
															height: parseInt(e.target.value) || 1080,
														}))
													}
													className="bg-background border-border h-10 rounded-xl text-xs font-mono font-bold text-center"
												/>
											</div>
										</div>
									</div>

									{/* Artboard Background */}
									<div className="space-y-6">
										<p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-20">
											Pozadie Plátna
										</p>
										<div className="grid grid-cols-5 gap-3">
											{[null, "#ffffff", "#f8fafc", "#18181b", "#000000"].map(
												(color) => (
													<button
														key={color || "none"}
														onClick={() => setArtboardColor(color)}
														className={cn(
															"size-9 rounded-xl border border-border shadow-sm transition-all hover:scale-110",
															artboardColor === color
																? "ring-2 ring-primary ring-offset-4"
																: "",
															!color &&
																"bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-repeat",
														)}
														style={{ backgroundColor: color || "transparent" }}
													/>
												),
											)}
										</div>
									</div>

									<div className="p-8 rounded-[32px] bg-primary/5 border border-primary/10 space-y-4 shadow-sm">
										<p className="text-[10px] font-bold text-primary/60 leading-relaxed uppercase tracking-widest text-center">
											Vyberte objekt pre špecifické úpravy alebo nastavte
											globálne parametre projektu vyššie.
										</p>
									</div>

									{/* Export */}
									<div className="pt-6 border-t border-border space-y-4">
										<div className="flex items-center gap-3">
											<Download className="size-3.5 text-primary/60" />
											<p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
												Export
											</p>
										</div>
										<div className="grid grid-cols-1 gap-2.5">
											<Button
												variant="outline"
												className="h-10 rounded-2xl border-border bg-background hover:bg-accent gap-2 text-[9px] font-black uppercase"
												onClick={() => handleAction("download")}
											>
												<Download className="size-3.5" /> PNG
											</Button>
											<Button
												variant="outline"
												className="h-10 rounded-2xl border-border bg-background hover:bg-accent gap-2 text-[9px] font-black uppercase"
												onClick={exportSVG}
											>
												<Download className="size-3.5" /> SVG
											</Button>
											<Button
												variant="outline"
												className="h-10 rounded-2xl border-border bg-background hover:bg-accent gap-2 text-[9px] font-black uppercase"
												onClick={exportJSON}
											>
												<Download className="size-3.5" /> JSON export
											</Button>
											<Button
												variant="outline"
												className="h-10 rounded-2xl border-border bg-background hover:bg-accent gap-2 text-[9px] font-black uppercase"
												onClick={() => jsonImportRef.current?.click()}
											>
												<Upload className="size-3.5" /> JSON import
											</Button>
										</div>
										<div className="flex items-center justify-between text-[9px] font-bold opacity-30 uppercase tracking-widest pt-1">
											<span className="flex items-center gap-1.5">
												<Clipboard className="size-3" /> História zmien
											</span>
											<span>
												krok {historyIndex + 1} / {history.length} (
												{history.length - 1} úprav)
											</span>
										</div>
									</div>
								</div>
							)}
						</div>

						{/* Quick Controls Footer */}
						<div className="mt-10 pt-8 border-t border-border grid grid-cols-3 gap-3">
							<Button
								variant="outline"
								className="h-14 rounded-2xl bg-background border-border hover:bg-accent transition-all shadow-sm"
								onClick={() => handleAction("undo")}
								title="Späť"
							>
								<Undo2 className="size-5 opacity-40" />
							</Button>
							<Button
								variant="outline"
								className="h-14 rounded-2xl bg-background border-border hover:bg-accent transition-all shadow-sm"
								onClick={() => handleAction("redo")}
								title="Dopredu"
							>
								<Redo className="size-5 opacity-40" />
							</Button>
							<Button
								variant="outline"
								className="h-14 rounded-2xl bg-background border-border hover:bg-accent transition-all group shadow-sm"
								onClick={() => handleAction("trash")}
								title="Vymazať plátno"
							>
								<Trash2 className="size-5 opacity-20 group-hover:opacity-60 text-red-500 transition-all" />
							</Button>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* The Magic Dock */}
			<Dock activeTool={activeTool} onToolChange={handleAction} />

			{/* Project Picker Dialog */}
			<Dialog open={isProjectPickerOpen} onOpenChange={setIsProjectPickerOpen}>
				<DialogContent className="rounded-3xl border border-border bg-background/95 backdrop-blur-3xl shadow-2xl sm:max-w-md">
					<DialogHeader className="pb-2">
						<div className="flex items-center gap-3 mb-2">
							<div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
								<FolderKanban className="size-5" />
							</div>
							<DialogTitle className="text-lg font-black tracking-tight">
								Priradiť k projektu
							</DialogTitle>
						</div>
						<DialogDescription className="text-xs text-muted-foreground font-medium">
							Vyberte projekt, do ktorého sa má tento canvas design uložiť.
						</DialogDescription>
					</DialogHeader>

					<div className="py-4 space-y-3">
						<Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
							Projekt
						</Label>
						<Select
							value={selectedProjectId || undefined}
							onValueChange={setSelectedProjectId}
						>
							<SelectTrigger className="h-12 rounded-2xl bg-accent/30 border-border/60 font-medium">
								<SelectValue placeholder="Vyberte projekt..." />
							</SelectTrigger>
							<SelectContent className="rounded-2xl border-border/50 backdrop-blur-3xl">
								{projects?.map((project) => (
									<SelectItem
										key={project._id}
										value={project._id}
										className="rounded-xl"
									>
										<div className="flex items-center gap-2">
											<FolderKanban className="size-3.5 text-primary opacity-60" />
											{project.name}
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<DialogFooter className="gap-2 pt-2">
						<Button
							variant="outline"
							className="rounded-xl h-11 font-bold"
							onClick={() => setIsProjectPickerOpen(false)}
						>
							Zrušiť
						</Button>
						<Button
							className="rounded-xl h-11 font-black uppercase tracking-wider text-xs bg-primary hover:bg-primary/90"
							onClick={handleSaveToProject}
							disabled={!selectedProjectId || isSaving}
						>
							{isSaving ? (
								<RefreshCw className="size-4 animate-spin" />
							) : (
								"Uložiť & Zdieľať"
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<ShareDialog
				isOpen={isShareOpen}
				onClose={() => setIsShareOpen(false)}
				designId={sharedDesignId}
			/>

			<QuickNoteDialog
				open={isNoteOpen}
				onOpenChange={setIsNoteOpen}
				defaultProjectId={selectedProjectId}
			/>
		</div>
	);
}

export default function DesignPage() {
	return (
		<Suspense
			fallback={
				<div className="flex h-screen w-full items-center justify-center bg-background">
					<div className="size-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
				</div>
			}
		>
			<DesignPageContent />
		</Suspense>
	);
}
