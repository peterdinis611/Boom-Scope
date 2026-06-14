"use client";

import { useAction } from "convex/react";
import {
	Clock,
	ExternalLink,
	History,
	Layers,
	Loader2,
	Monitor,
	Smartphone,
	Sparkles,
	Tablet as TabletIcon,
	Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DesignPreview } from "@/components/design/DesignPreview";
import { ConfirmDialog } from "@/components/layout/ConfirmDialog";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { IDB_KEYS, idbGet, idbRemove, idbSet } from "@/lib/idb-storage";
import { cn } from "@/lib/utils";

interface GeneratedDesign {
	web: { elements: [] };
	tablet: { elements: [] };
	mobile: { elements: [] };
}

interface Message {
	role: "user" | "assistant";
	content: string;
	design?: GeneratedDesign;
}

interface HistoryItem {
	id: string;
	timestamp: number;
	prompt: string;
	design: GeneratedDesign;
	messages: Message[];
}

const SUGGESTIONS = [
	{ text: "Modern SaaS landing page", icon: "🚀" },
	{ text: "Dark mode toggle", icon: "🌙" },
	{ text: "Clean card layout with shadows", icon: "✨" },
	{ text: "Neon purple and blue theme", icon: "💜" },
	{ text: "Pricing and benefits section", icon: "💸" },
];

export default function GeneratorPage() {
	const [prompt, setPrompt] = useState("");
	const [isGenerating, setIsGenerating] = useState(false);
	const [messages, setMessages] = useState<Message[]>([]);
	const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
	const [clearHistoryOpen, setClearHistoryOpen] = useState(false);
	const generateAction = useAction(api.openai.generateResponsiveDesign);
	const router = useRouter();

	useEffect(() => {
		let cancelled = false;

		(async () => {
			try {
				const stored = await idbGet<HistoryItem[]>(IDB_KEYS.generationHistory);
				if (!cancelled && stored) {
					setHistoryItems(stored);
				}
			} catch (e) {
				console.error(e);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, []);

	const saveToHistory = (
		promptText: string,
		design: GeneratedDesign,
		currentMessages: Message[],
	) => {
		const newItem: HistoryItem = {
			id: Math.random().toString(36).substring(2, 9),
			timestamp: Date.now(),
			prompt: promptText,
			design,
			messages: currentMessages,
		};
		setHistoryItems((prev) => {
			const updated = [newItem, ...prev].slice(0, 20);
			void idbSet(IDB_KEYS.generationHistory, updated);
			return updated;
		});
	};

	const restoreHistoryItem = (item: HistoryItem) => {
		setMessages(item.messages);
		setPrompt("");
		toast.success("Design and context restored from history!");
	};

	const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
		e.stopPropagation();
		setHistoryItems((prev) => {
			const updated = prev.filter((item) => item.id !== id);
			void idbSet(IDB_KEYS.generationHistory, updated);
			return updated;
		});
		toast.info("Generation cleared.");
	};

	const handleSuggestionClick = (text: string) => {
		setPrompt((prev) => {
			const cleaned = prev.trim();
			if (!cleaned) return text;
			return `${cleaned}, ${text.toLowerCase()}`;
		});
	};

	const handleGenerate = async () => {
		if (!prompt.trim()) {
			toast.error("Enter a prompt!");
			return;
		}

		const promptText = prompt;
		const userMessage: Message = { role: "user", content: promptText };
		const newMessages = [...messages, userMessage];
		setMessages(newMessages);
		setPrompt("");
		setIsGenerating(true);

		try {
			// Prepare history for the action (excluding the last prompt which is passed separately)
			const history = messages.map((m) => ({
				role: m.role,
				content: m.role === "assistant" ? JSON.stringify(m.design) : m.content,
			}));

			const result = await generateAction({
				prompt: promptText,
				history: history,
			});

			const assistantMessage: Message = {
				role: "assistant",
				content: "Here is your updated design.",
				design: result as GeneratedDesign,
			};

			const updated = [...newMessages, assistantMessage];
			setMessages(updated);
			saveToHistory(promptText, result as GeneratedDesign, updated);
			toast.success("Design updated!");
		} catch (error) {
			console.error(error);
			toast.error("Failed to generate design.");
		} finally {
			setIsGenerating(false);
		}
	};

	const latestDesign = messages
		.filter((m) => m.role === "assistant" && m.design)
		.slice(-1)[0]?.design;

	const openInCanvas = async (elements: [], viewport: string) => {
		await idbSet(IDB_KEYS.importedDesign, elements);
		await idbSet(IDB_KEYS.importedViewport, viewport);
		router.push("/dashboard/canvas");
	};

	return (
		<PageContainer size="wide" className="space-y-6">
			<PageHeader
				title="AI Generator"
				description="Discuss design with AI and generate multi-viewport layouts."
				actions={
					messages.length > 0 ? (
						<Button
							variant="outline"
							size="sm"
							onClick={() => {
								setMessages([]);
								setPrompt("");
								toast.info("Generator was reset.");
							}}
						>
							Reset
						</Button>
					) : undefined
				}
			/>

			{/* Responsive Workspace Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
				{/* Main Studio Area */}
				<div className="lg:col-span-9 space-y-8">
					{/* Chat / Prompt Input Section */}
					<div className="relative group">
						<Card className="space-y-6 p-6">
							{/* Message History (Simplified) */}
							{messages.length > 0 && (
								<div className="max-h-50 overflow-y-auto space-y-4 pb-4 border-b border-border/50 scrollbar-hide">
									{messages.map((m, i) => (
										<div
											key={i}
											className={cn(
												"flex flex-col space-y-1",
												m.role === "user" ? "items-end" : "items-start",
											)}
										>
											<span className="text-xs font-medium text-muted-foreground">
												{m.role === "user" ? "Vy" : "AI"}
											</span>
											<div
												className={cn(
													"max-w-[80%] rounded-lg px-4 py-2 text-sm",
													m.role === "user"
														? "rounded-tr-none bg-primary text-primary-foreground"
														: "rounded-tl-none bg-muted text-foreground",
												)}
											>
												{m.role === "user"
													? m.content
													: "I updated the design based on your requirements."}
											</div>
										</div>
									))}
								</div>
							)}

							<div className="relative">
								<Textarea
									placeholder={
										messages.length === 0
											? "e.g. Modern landing page for a SaaS platform..."
											: "e.g. Change the main color to purple and add more space between cards..."
									}
									className="min-h-25 text-lg bg-transparent border-none focus-visible:ring-0 placeholder:text-muted-foreground/30 resize-none px-0 focus-visible:border-none focus-visible:ring-offset-0"
									value={prompt}
									onChange={(e) => setPrompt(e.target.value)}
									disabled={isGenerating}
									onKeyDown={(e) => {
										if (e.key === "Enter" && !e.shiftKey) {
											e.preventDefault();
											handleGenerate();
										}
									}}
								/>
								{prompt.length > 0 && (
									<div className="absolute right-0 bottom-0 text-xs text-muted-foreground">
										{prompt.length} characters
									</div>
								)}
							</div>

							{/* Suggestion Pills */}
							<div className="flex flex-wrap gap-2 pt-2 border-t border-border/20">
								{SUGGESTIONS.map((s, idx) => (
									<button
										key={idx}
										type="button"
										onClick={() => handleSuggestionClick(s.text)}
										disabled={isGenerating}
										className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
									>
										<span>{s.icon}</span>
										<span>{s.text}</span>
									</button>
								))}
							</div>

							<div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
								<div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
									<span className="flex items-center gap-1.5">
										<span className="size-1.5 rounded-full bg-green-500" /> Web
									</span>
									<span className="flex items-center gap-1.5">
										<span className="size-1.5 rounded-full bg-purple-500" />{" "}
										Tablet
									</span>
									<span className="flex items-center gap-1.5">
										<span className="size-1.5 rounded-full bg-blue-500" /> Mobil
									</span>
									<span className="text-muted-foreground/70">
										Enter = send, Shift+Enter = new line
									</span>
								</div>
								<Button
									onClick={handleGenerate}
									disabled={isGenerating || !prompt.trim()}
									className="w-full gap-2 sm:w-auto"
								>
									{isGenerating ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Navrhujem...
										</>
									) : (
										<>
											<Sparkles className="mr-2 h-4 w-4" />
											{messages.length === 0 ? "Generate" : "Update"}
										</>
									)}
								</Button>
							</div>
						</Card>
					</div>

					{/* Previews */}
					<AnimatePresence mode="wait">
						{latestDesign ? (
							<motion.div
								key={messages.length} // Force re-animation on new message
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								className="grid grid-cols-1 xl:grid-cols-12 gap-8"
							>
								{/* Web Preview */}
								<div className="xl:col-span-12 space-y-4">
									<div className="flex items-center justify-between px-1">
										<h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
											<Monitor className="size-4" /> Desktop (1920×1080)
										</h3>
										<Button
											variant="ghost"
											size="sm"
											onClick={() =>
												openInCanvas(latestDesign.web.elements, "web")
											}
											className="gap-2 text-primary"
										>
											Edit in Canvas <ExternalLink className="size-3" />
										</Button>
									</div>
									<div className="overflow-x-auto rounded-xl border border-border bg-muted/30 p-6">
										<DesignPreview
											elements={latestDesign.web.elements}
											width={1920}
											height={1080}
											scale={0.4}
											className="mx-auto shadow-sm"
										/>
									</div>
								</div>

								{/* Tablet Preview */}
								<div className="xl:col-span-7 space-y-4">
									<div className="flex items-center justify-between px-1">
										<h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
											<TabletIcon className="size-4" /> Tablet (768×1024)
										</h3>
										<Button
											variant="ghost"
											size="sm"
											onClick={() =>
												openInCanvas(latestDesign.tablet.elements, "tablet")
											}
											className="gap-2 text-primary"
										>
											Edit in Canvas <ExternalLink className="size-3" />
										</Button>
									</div>
									<div className="flex justify-center rounded-xl border border-border bg-muted/30 p-6">
										<DesignPreview
											elements={latestDesign.tablet.elements}
											width={768}
											height={1024}
											scale={0.5}
											className="shadow-sm"
										/>
									</div>
								</div>

								{/* Mobile Preview */}
								<div className="xl:col-span-5 space-y-4">
									<div className="flex items-center justify-between px-1">
										<h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
											<Smartphone className="size-4" /> Mobil (375×667)
										</h3>
										<Button
											variant="ghost"
											size="sm"
											onClick={() =>
												openInCanvas(latestDesign.mobile.elements, "mobile")
											}
											className="gap-2 text-primary"
										>
											Edit in Canvas <ExternalLink className="size-3" />
										</Button>
									</div>
									<div className="flex justify-center rounded-xl border border-border bg-muted/30 p-6">
										<DesignPreview
											elements={latestDesign.mobile.elements}
											width={375}
											height={667}
											scale={0.8}
											className="shadow-sm"
										/>
									</div>
								</div>
							</motion.div>
						) : (
							!isGenerating && (
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									className="flex flex-col items-center justify-center py-20 space-y-6 opacity-20"
								>
									<div className="p-10 rounded-full border-4 border-dashed border-muted-foreground/30">
										<Layers className="size-20" />
									</div>
									<p className="text-center text-sm text-muted-foreground">
										Enter a prompt to start generating
									</p>
								</motion.div>
							)
						)}
					</AnimatePresence>
				</div>

				{/* Right Sidebar - History panel */}
				<div className="sticky top-6 lg:col-span-3">
					<Card className="flex flex-col p-6">
						<div className="mb-4 flex items-center justify-between border-b border-border pb-4">
							<h2 className="flex items-center gap-2 text-sm font-medium">
								<History className="size-4 text-primary" /> Generation history
							</h2>
							{historyItems.length > 0 && (
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setClearHistoryOpen(true)}
									className="text-muted-foreground hover:text-destructive"
								>
									Clear
								</Button>
							)}
						</div>

						{historyItems.length === 0 ? (
							<div className="flex flex-col items-center justify-center space-y-3 py-12 text-center text-muted-foreground">
								<Clock className="size-8 opacity-50" />
								<p className="text-sm font-medium">No history</p>
								<p className="max-w-40 text-xs leading-normal">
									Your successfully generated designs will be saved here.
								</p>
							</div>
						) : (
							<div className="max-h-125 space-y-3 overflow-y-auto pr-1 scrollbar-hide">
								{historyItems.map((item) => (
									<div
										key={item.id}
										onClick={() => restoreHistoryItem(item)}
										className="group relative flex cursor-pointer flex-col gap-1.5 rounded-lg border border-border p-3 transition-colors hover:border-primary/30 hover:bg-muted/50"
									>
										<div className="flex items-start justify-between gap-2">
											<span className="text-xs text-muted-foreground">
												{new Date(item.timestamp).toLocaleTimeString("sk-SK", {
													hour: "2-digit",
													minute: "2-digit",
												})}{" "}
												-{" "}
												{new Date(item.timestamp).toLocaleDateString("sk-SK", {
													day: "numeric",
													month: "short",
												})}
											</span>
											<button
												onClick={(e) => deleteHistoryItem(item.id, e)}
												className="flex size-5 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
												aria-label="Remove from history"
											>
												<Trash2 className="size-3.5" />
											</button>
										</div>
										<p className="line-clamp-2 text-sm leading-relaxed text-foreground">
											{item.prompt}
										</p>
										<div className="mt-0.5 flex items-center gap-1.5 text-xs text-primary">
											<Sparkles className="size-3" />
											<span>{item.messages.length} messages</span>
										</div>
									</div>
								))}
							</div>
						)}
					</Card>
				</div>
			</div>

			{/* Loading State Overlay */}
			{isGenerating && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80">
					<div className="flex flex-col items-center gap-6">
						<div className="relative">
							<div className="size-16 animate-spin rounded-full border-2 border-muted border-t-primary" />
							<div className="absolute inset-0 flex items-center justify-center">
								<Sparkles className="size-6 text-primary" />
							</div>
						</div>
						<div className="flex flex-col items-center space-y-1 text-center">
							<h2 className="font-heading text-lg font-semibold">
								Designing visual…
							</h2>
							<p className="text-sm text-muted-foreground">
								Preparing web, tablet, and mobile versions
							</p>
						</div>
					</div>
				</div>
			)}

			<ConfirmDialog
				open={clearHistoryOpen}
				onOpenChange={setClearHistoryOpen}
				title="Delete history?"
				description="All generation history will be permanently removed from this device."
				confirmLabel="Delete"
				variant="destructive"
				onConfirm={async () => {
					setHistoryItems([]);
					await idbRemove(IDB_KEYS.generationHistory);
					toast.success("History cleared.");
				}}
			/>
		</PageContainer>
	);
}
