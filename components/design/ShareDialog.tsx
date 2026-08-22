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
				<div className="fixed inset-0 z-100 flex items-center justify-center p-4">
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
						className="absolute inset-0 bg-background/60 backdrop-blur-sm"
					/>
					<motion.div
						initial={{ scale: 0.96, opacity: 0, y: 12 }}
						animate={{ scale: 1, opacity: 1, y: 0 }}
						exit={{ scale: 0.96, opacity: 0, y: 12 }}
						className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-background p-6 shadow-lg"
					>
						<div className="absolute top-0 right-0 h-1 w-full bg-primary" />

						<button
							type="button"
							onClick={onClose}
							className="absolute top-4 right-4 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
						>
							<X className="size-4" />
						</button>

						<div className="space-y-6">
							<div className="flex items-center gap-4">
								<div className="flex size-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
									<Share2 className="size-5 text-primary" />
								</div>
								<div>
									<p className="font-mono text-[11px] tracking-[0.2em] text-scope uppercase">
										Share
									</p>
									<h2 className="font-heading text-xl font-semibold tracking-tight">
										Share design
									</h2>
									<p className="mt-0.5 text-sm text-muted-foreground">
										Create a public link for your project
									</p>
								</div>
							</div>

							<div className="space-y-2">
								<p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
									Public link
								</p>
								<div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-3">
									<Globe className="size-4 shrink-0 text-primary/70" />
									<p className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground">
										{shareUrl || "Generating link..."}
									</p>
									<Button
										onClick={copyToClipboard}
										disabled={!designId}
										size="sm"
										className={cn(
											copied && "bg-success text-primary-foreground hover:bg-success/90",
										)}
									>
										{copied ? (
											<Check className="size-4" />
										) : (
											<span className="flex items-center gap-1.5">
												<Copy className="size-3.5" /> Copy
											</span>
										)}
									</Button>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-3">
								<div className="space-y-2 rounded-xl border border-border bg-muted/30 p-4">
									<div className="flex size-9 items-center justify-center rounded-lg border border-primary/10 bg-primary/10">
										<Link className="size-4 text-primary" />
									</div>
									<h3 className="text-sm font-medium">Read-only</h3>
									<p className="text-xs leading-relaxed text-muted-foreground">
										Anyone with the link can view the design, but cannot edit
										it.
									</p>
								</div>
								<div className="space-y-2 rounded-xl border border-border bg-muted/30 p-4">
									<div className="flex size-9 items-center justify-center rounded-lg border border-success/15 bg-success/10">
										<Globe className="size-4 text-success" />
									</div>
									<h3 className="text-sm font-medium">Access</h3>
									<p className="text-xs leading-relaxed text-muted-foreground">
										Your design is accessible to anyone with this unique URL.
									</p>
								</div>
							</div>

							<Button variant="outline" onClick={onClose} className="w-full">
								Close
							</Button>
						</div>
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);
}
