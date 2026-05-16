"use client";

import { useAction } from "convex/react";
import {
	Loader2,
	Monitor,
	Smartphone,
	Sparkles,
	Tablet as TabletIcon,
	ExternalLink,
	Download,
	Layers,
	ChevronRight
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { DesignPreview } from "@/components/design/DesignPreview";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";

interface GeneratedDesign {
	web: { elements: any[] };
	tablet: { elements: any[] };
	mobile: { elements: any[] };
}

export default function GeneratorPage() {
	const [prompt, setPrompt] = useState("");
	const [isGenerating, setIsGenerating] = useState(false);
	const [generatedDesign, setGeneratedDesign] = useState<GeneratedDesign | null>(null);
	const generateAction = useAction(api.openai.generateResponsiveDesign);
	const router = useRouter();

	const handleGenerate = async () => {
		if (!prompt.trim()) {
			toast.error("Zadajte prompt!");
			return;
		}

		setIsGenerating(true);
		try {
			const result = await generateAction({ prompt });
			setGeneratedDesign(result as GeneratedDesign);
			toast.success("Dizajn vygenerovaný!");
		} catch (error) {
			console.error(error);
			toast.error("Nepodarilo sa vygenerovať dizajn.");
		} finally {
			setIsGenerating(false);
		}
	};

	const openInCanvas = (elements: any[], viewport: string) => {
		// In a real app, we might save this first. 
		// For now, let's simulate by passing via state or just showing a message
		// Actually, we can save it to localStorage and pick it up in canvas
		localStorage.setItem("imported_design", JSON.stringify(elements));
		localStorage.setItem("imported_viewport", viewport);
		router.push("/dashboard/canvas");
	};

	return (
		<div className="flex flex-col min-h-screen bg-background text-foreground p-6 lg:p-10 space-y-10">
			{/* Header */}
			<div className="flex flex-col space-y-2">
				<div className="flex items-center gap-3 text-primary">
					<div className="p-2 rounded-xl bg-primary/10 border border-primary/20 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
						<Sparkles className="size-5" />
					</div>
					<h1 className="text-3xl font-black uppercase tracking-tight italic">AI Design Generator</h1>
				</div>
				<p className="text-muted-foreground max-w-2xl text-lg font-medium leading-relaxed">
					Napíšte čo potrebujete a naša AI pripraví kompletnú vizuálnu identitu pre všetky zariadenia súčasne.
				</p>
			</div>

			{/* Prompt Input Section */}
			<div className="relative group">
				<div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-purple-500/10 to-blue-500/20 rounded-3xl blur-xl opacity-50 group-focus-within:opacity-100 transition duration-1000" />
				<Card className="relative bg-background/50 backdrop-blur-3xl border-border/50 rounded-3xl p-6 shadow-2xl space-y-6">
					<Textarea
						placeholder="Napr.: Moderná landing page pre SaaS platformu zameranú na analytiku dát. Použi tmavý režim, gradienty a sklenené efekty..."
						className="min-h-[120px] text-lg bg-transparent border-none focus-visible:ring-0 placeholder:text-muted-foreground/50 resize-none px-0"
						value={prompt}
						onChange={(e) => setPrompt(e.target.value)}
					/>
					<div className="flex items-center justify-between pt-4 border-t border-border/50">
						<div className="flex gap-4 text-xs font-black uppercase tracking-widest text-muted-foreground">
							<span className="flex items-center gap-1.5"><Monitor className="size-3" /> Web</span>
							<span className="flex items-center gap-1.5"><TabletIcon className="size-3" /> Tablet</span>
							<span className="flex items-center gap-1.5"><Smartphone className="size-3" /> Mobile</span>
						</div>
						<Button 
							onClick={handleGenerate} 
							disabled={isGenerating || !prompt.trim()}
							className="px-8 rounded-2xl h-12 bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
						>
							{isGenerating ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Generujem...
								</>
							) : (
								<>
									<Sparkles className="mr-2 h-4 w-4" />
									Generovať Dizajn
								</>
							)}
						</Button>
					</div>
				</Card>
			</div>

			{/* Previews */}
			<AnimatePresence mode="wait">
				{generatedDesign ? (
					<motion.div 
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
									onClick={() => openInCanvas(generatedDesign.web.elements, "web")}
									className="rounded-xl hover:bg-primary/10 text-primary uppercase font-black text-[10px] tracking-widest"
								>
									Upraviť v Canvas <ExternalLink className="ml-2 size-3" />
								</Button>
							</div>
							<div className="bg-muted/30 rounded-[2rem] p-8 border border-border/50 shadow-inner overflow-x-auto">
								<DesignPreview 
									elements={generatedDesign.web.elements} 
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
									onClick={() => openInCanvas(generatedDesign.tablet.elements, "tablet")}
									className="rounded-xl hover:bg-primary/10 text-primary uppercase font-black text-[10px] tracking-widest"
								>
									Upraviť v Canvas <ExternalLink className="ml-2 size-3" />
								</Button>
							</div>
							<div className="bg-muted/30 rounded-[2rem] p-8 border border-border/50 shadow-inner flex justify-center">
								<DesignPreview 
									elements={generatedDesign.tablet.elements} 
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
									onClick={() => openInCanvas(generatedDesign.mobile.elements, "mobile")}
									className="rounded-xl hover:bg-primary/10 text-primary uppercase font-black text-[10px] tracking-widest"
								>
									Upraviť v Canvas <ExternalLink className="ml-2 size-3" />
								</Button>
							</div>
							<div className="bg-muted/30 rounded-[2rem] p-8 border border-border/50 shadow-inner flex justify-center">
								<DesignPreview 
									elements={generatedDesign.mobile.elements} 
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
							<p className="text-xl font-bold uppercase tracking-[0.3em] text-center">Zadajte prompt pre začiatok generovania</p>
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
							<h2 className="text-2xl font-black uppercase tracking-widest animate-pulse">Navrhujem Vizuál...</h2>
							<p className="text-muted-foreground font-medium">Pripravujem Web, Tablet a Mobile verzie</p>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
