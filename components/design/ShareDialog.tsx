"use client";

import { Check, Copy, Globe, Link, Share2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ShareDialogProps {
	isOpen: boolean;
	onClose: () => void;
	designId: string | null;
}

export function ShareDialog({ isOpen, onClose, designId }: ShareDialogProps) {
	const [copied, setCopied] = useState(false);
	const shareUrl = designId
		? `${window.location.origin}/share/${designId}`
		: "";

	const copyToClipboard = () => {
		if (shareUrl) {
			navigator.clipboard.writeText(shareUrl);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
						className="absolute inset-0 bg-background/40 backdrop-blur-xl transition-all"
					/>
					<motion.div
						initial={{ scale: 0.9, opacity: 0, y: 20 }}
						animate={{ scale: 1, opacity: 1, y: 0 }}
						exit={{ scale: 0.9, opacity: 0, y: 20 }}
						className="relative w-full max-w-lg bg-background border border-border rounded-[40px] shadow-2xl overflow-hidden p-10"
					>
						<div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500" />

						<button
							onClick={onClose}
							className="absolute top-8 right-8 p-3 rounded-full hover:bg-accent text-foreground/40 hover:text-foreground transition-all"
						>
							<X className="size-5" />
						</button>

						<div className="space-y-10">
							<div className="flex items-center gap-6">
								<div className="size-16 rounded-[24px] bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
									<Share2 className="size-8 text-primary" />
								</div>
								<div>
									<h2 className="text-2xl font-black tracking-tight">
										Zdieľať Design
									</h2>
									<p className="text-sm font-bold opacity-40 uppercase tracking-widest mt-1">
										Vytvorte verejný odkaz pre váš projekt
									</p>
								</div>
							</div>

							<div className="space-y-4">
								<p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 px-2">
									Verejný Odkaz
								</p>
								<div className="group relative flex items-center gap-4 p-5 rounded-[28px] bg-accent border border-border hover:border-primary/30 transition-all shadow-inner">
									<Globe className="size-5 text-primary/60" />
									<div className="flex-1 min-w-0">
										<p className="text-xs font-mono font-bold truncate opacity-60">
											{shareUrl || "Generujem odkaz..."}
										</p>
									</div>
									<Button
										onClick={copyToClipboard}
										disabled={!designId}
										className={cn(
											"h-12 px-6 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all",
											copied
												? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30"
												: "bg-primary hover:bg-primary text-white shadow-lg shadow-primary/30",
										)}
									>
										{copied ? (
											<Check className="size-4" />
										) : (
											<div className="flex items-center gap-2">
												<Copy className="size-3.5" /> Kopírovať
											</div>
										)}
									</Button>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="p-6 rounded-[32px] bg-foreground/5 border border-border space-y-3">
									<div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/10">
										<Link className="size-4 text-primary" />
									</div>
									<h3 className="text-xs font-black uppercase tracking-widest">
										Read-Only
									</h3>
									<p className="text-[10px] font-bold opacity-40 leading-relaxed uppercase tracking-widest">
										Osoba s odkazom si môže design prezerať, ale nemôže ho
										upravovať.
									</p>
								</div>
								<div className="p-6 rounded-[32px] bg-foreground/5 border border-border space-y-3">
									<div className="size-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/10">
										<Globe className="size-4 text-emerald-500" />
									</div>
									<h3 className="text-xs font-black uppercase tracking-widest">
										Prístup
									</h3>
									<p className="text-[10px] font-bold opacity-40 leading-relaxed uppercase tracking-widest">
										Váš design je teraz prístupný pre kohokoľvek s týmto
										unikátnym URL.
									</p>
								</div>
							</div>

							<Button
								variant="outline"
								onClick={onClose}
								className="w-full h-16 rounded-[28px] border-border hover:bg-accent text-xs font-black uppercase tracking-[0.4em] transition-all"
							>
								Zavrieť Dialóg
							</Button>
						</div>
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);
}
