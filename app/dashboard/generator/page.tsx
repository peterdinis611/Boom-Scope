"use client";

import { useAction } from "convex/react";
import {
	ChevronRight,
	Download,
	ExternalLink,
	Layers,
	Loader2,
	Monitor,
	Smartphone,
	Sparkles,
	Tablet as TabletIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { DesignPreview } from "@/components/design/DesignPreview";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

interface GeneratedDesign {
	web: { elements: any[] };
	tablet: { elements: any[] };
	mobile: { elements: any[] };
}

interface Message {
	role: "user" | "assistant";
	content: string;
	design?: GeneratedDesign;
}

const SUGGESTIONS = [
	{ text: "Moderná SaaS landing page", icon: "🚀" },
	{ text: "Prepínač pre tmavý režim", icon: "🌙" },
	{ text: "Čistý layout kariet s tieňmi", icon: "✨" },
	{ text: "Neon fialová a modrá téma", icon: "💜" },
	{ text: "Sekcia s cenníkom a benefitmi", icon: "💸" },
];

export default function GeneratorPage() {
	const [prompt, setPrompt] = useState("");
	const [isGenerating, setIsGenerating] = useState(false);
	const [messages, setMessages] = useState<Message[]>([]);
	const generateAction = useAction(api.openai.generateResponsiveDesign);
	const router = useRouter();

	const handleSuggestionClick = (text: string) => {
		setPrompt((prev) => {
			const cleaned = prev.trim();
			if (!cleaned) return text;
			return `${cleaned}, ${text.toLowerCase()}`;
		});
	};

	const handleGenerate = async () => {
		if (!prompt.trim()) {
			toast.error("Zadajte prompt!");
			return;
		}

		const userMessage: Message = { role: "user", content: prompt };
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
				prompt,
				history: history as any,
			});

			const assistantMessage: Message = {
				role: "assistant",
				content: "Tu je váš aktualizovaný dizajn.",
				design: result as GeneratedDesign,
			};

			setMessages((prev) => [...prev, assistantMessage]);
			toast.success("Dizajn aktualizovaný!");
		} catch (error) {
			console.error(error);
			toast.error("Nepodarilo sa vygenerovať dizajn.");
		} finally {
			setIsGenerating(false);
		}
	};

	const latestDesign = messages
		.filter((m) => m.role === "assistant" && m.design)
		.slice(-1)[0]?.design;

	const openInCanvas = (elements: any[], viewport: string) => {
		localStorage.setItem("imported_design", JSON.stringify(elements));
		localStorage.setItem("imported_viewport", viewport);
		router.push("/dashboard/canvas");
	};

	return (
		<div className="flex flex-col min-h-screen bg-background text-foreground p-6 lg:p-10 space-y-10">
			{/* Header */}
			<div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
				<div className="flex flex-col space-y-2">
					<div className="flex items-center gap-3 text-primary">
						<div className="p-2 rounded-xl bg-primary/10 border border-primary/20 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
							<Sparkles className="size-5" />
						</div>
						<h1 className="text-3xl font-black uppercase tracking-tight italic">
							AI Design Studio
						</h1>
					</div>
					<p className="text-muted-foreground max-w-2xl text-lg font-medium leading-relaxed">
						Diskutujte s AI o vašom dizajne. Napíšte zmeny a sledujte ako sa
						vizuál vyvíja v reálnom čase.
					</p>
				</div>
				{messages.length > 0 && (
					<Button
						variant="outline"
						size="sm"
						onClick={() => {
							setMessages([]);
							setPrompt("");
							toast.info("Studio bolo resetované.");
						}}
						className="rounded-xl border-border/50 hover:bg-destructive/10 hover:text-destructive font-black uppercase text-[10px] tracking-widest h-10 px-6"
					>
						Reset Studio
					</Button>
				)}
			</div>

			{/* Chat / Prompt Input Section */}
			<div className="relative group">
				<div className={cn(
					"absolute -inset-1 rounded-3xl blur-xl opacity-50 transition duration-1000",
					isGenerating
						? "bg-gradient-to-r from-primary via-purple-600 to-blue-600 opacity-90 animate-pulse scale-[1.01]"
						: "bg-gradient-to-r from-primary/20 via-purple-500/10 to-blue-500/20 group-focus-within:opacity-100"
				)} />
				<Card className="relative bg-background/50 backdrop-blur-3xl border-border/50 rounded-3xl p-6 shadow-2xl space-y-6">
					{/* Message History (Simplified) */}
					{messages.length > 0 && (
						<div className="max-h-[200px] overflow-y-auto space-y-4 pb-4 border-b border-border/50 scrollbar-hide">
							{messages.map((m, i) => (
								<div
									key={i}
									className={cn(
										"flex flex-col space-y-1",
										m.role === "user" ? "items-end" : "items-start",
									)}
								>
									<span className="text-[10px] font-black uppercase tracking-widest opacity-40">
										{m.role === "user" ? "Vy" : "AI"}
									</span>
									<div
										className={cn(
											"px-4 py-2 rounded-2xl text-sm font-medium max-w-[80%]",
											m.role === "user"
												? "bg-primary text-white rounded-tr-none"
												: "bg-muted text-foreground rounded-tl-none",
										)}
									>
										{m.role === "user"
											? m.content
											: "Aktualizoval som dizajn podľa vašich požiadaviek."}
									</div>
								</div>
							))}
						</div>
					)}

					<div className="relative">
						<Textarea
							placeholder={
								messages.length === 0
									? "Napr.: Moderná landing page pre SaaS platformu..."
									: "Napr.: Zmeň hlavnú farbu na fialovú a pridaj viac miesta medzi kartami..."
							}
							className="min-h-[100px] text-lg bg-transparent border-none focus-visible:ring-0 placeholder:text-muted-foreground/30 resize-none px-0 focus-visible:border-none focus-visible:ring-offset-0"
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
							<div className="absolute right-0 bottom-0 text-[10px] font-bold text-muted-foreground/40 tracking-wider">
								{prompt.length} znakov
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
								className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/40 hover:bg-primary/10 hover:text-primary border border-border/40 hover:border-primary/20 text-xs font-semibold transition-all duration-300 active:scale-95 text-muted-foreground disabled:opacity-50 disabled:pointer-events-none"
							>
								<span>{s.icon}</span>
								<span>{s.text}</span>
							</button>
						))}
					</div>

					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
						<div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">
							<span className="flex items-center gap-1">
								<span className="size-1.5 rounded-full bg-green-500" /> Web
							</span>
							<span className="flex items-center gap-1">
								<span className="size-1.5 rounded-full bg-purple-500" /> Tablet
							</span>
							<span className="flex items-center gap-1">
								<span className="size-1.5 rounded-full bg-blue-500" /> Mobile
							</span>
							<span className="ml-auto sm:ml-0 text-[9px] lowercase opacity-60">
								(Enter pre odoslanie, Shift+Enter pre nový riadok)
							</span>
						</div>
						<Button
							onClick={handleGenerate}
							disabled={isGenerating || !prompt.trim()}
							className="px-8 rounded-2xl h-12 bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 w-full sm:w-auto"
						>
							{isGenerating ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Navrhujem...
								</>
							) : (
								<>
									<Sparkles className="mr-2 h-4 w-4" />
									{messages.length === 0 ? "Generovať" : "Aktualizovať"}
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
							<div className="flex items-center justify-between px-4">
								<h3 className="text-sm font-black uppercase tracking-[0.2em] opacity-40 flex items-center gap-2">
									<Monitor className="size-4" /> Desktop Verzia (1920x1080)
								</h3>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => openInCanvas(latestDesign.web.elements, "web")}
									className="rounded-xl hover:bg-primary/10 text-primary uppercase font-black text-[10px] tracking-widest"
								>
									Upraviť v Canvas <ExternalLink className="ml-2 size-3" />
								</Button>
							</div>
							<div className="bg-muted/30 rounded-[2rem] p-8 border border-border/50 shadow-inner overflow-x-auto">
								<DesignPreview
									elements={latestDesign.web.elements}
									width={1920}
									height={1080}
									scale={0.4}
									className="mx-auto shadow-[0_30px_100px_rgba(0,0,0,0.2)]"
								/>
							</div>
						</div>

						{/* Tablet Preview */}
						<div className="xl:col-span-7 space-y-4">
							<div className="flex items-center justify-between px-4">
								<h3 className="text-sm font-black uppercase tracking-[0.2em] opacity-40 flex items-center gap-2">
									<TabletIcon className="size-4" /> Tablet Verzia (768x1024)
								</h3>
								<Button
									variant="ghost"
									size="sm"
									onClick={() =>
										openInCanvas(latestDesign.tablet.elements, "tablet")
									}
									className="rounded-xl hover:bg-primary/10 text-primary uppercase font-black text-[10px] tracking-widest"
								>
									Upraviť v Canvas <ExternalLink className="ml-2 size-3" />
								</Button>
							</div>
							<div className="bg-muted/30 rounded-[2rem] p-8 border border-border/50 shadow-inner flex justify-center">
								<DesignPreview
									elements={latestDesign.tablet.elements}
									width={768}
									height={1024}
									scale={0.5}
									className="shadow-[0_30px_80px_rgba(0,0,0,0.15)]"
								/>
							</div>
						</div>

						{/* Mobile Preview */}
						<div className="xl:col-span-5 space-y-4">
							<div className="flex items-center justify-between px-4">
								<h3 className="text-sm font-black uppercase tracking-[0.2em] opacity-40 flex items-center gap-2">
									<Smartphone className="size-4" /> Mobilná Verzia (375x667)
								</h3>
								<Button
									variant="ghost"
									size="sm"
									onClick={() =>
										openInCanvas(latestDesign.mobile.elements, "mobile")
									}
									className="rounded-xl hover:bg-primary/10 text-primary uppercase font-black text-[10px] tracking-widest"
								>
									Upraviť v Canvas <ExternalLink className="ml-2 size-3" />
								</Button>
							</div>
							<div className="bg-muted/30 rounded-[2rem] p-8 border border-border/50 shadow-inner flex justify-center">
								<DesignPreview
									elements={latestDesign.mobile.elements}
									width={375}
									height={667}
									scale={0.8}
									className="shadow-[0_30px_60px_rgba(0,0,0,0.1)]"
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
							<p className="text-xl font-bold uppercase tracking-[0.3em] text-center">
								Zadajte prompt pre začiatok generovania
							</p>
						</motion.div>
					)
				)}
			</AnimatePresence>

			{/* Loading State Overlay */}
			{isGenerating && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-md">
					<div className="flex flex-col items-center gap-8">
						<div className="relative">
							<div className="h-24 w-24 animate-spin rounded-full border-b-2 border-primary" />
							<div className="absolute inset-0 flex items-center justify-center">
								<Sparkles className="size-8 text-primary animate-pulse" />
							</div>
						</div>
						<div className="flex flex-col items-center space-y-2">
							<h2 className="text-2xl font-black uppercase tracking-widest animate-pulse">
								Navrhujem Vizuál...
							</h2>
							<p className="text-muted-foreground font-medium">
								Pripravujem Web, Tablet a Mobile verzie
							</p>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
