"use client";

import { Check, Clipboard, Copy, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { cn } from "@/lib/utils";

export function ClipboardManager() {
	const { history, copy, clearHistory, deleteHistoryItem, copiedValue } =
		useCopyToClipboard();
	const [isOpen, setIsOpen] = useState(false);

	const isColor = (text: string) => {
		return /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(text.trim());
	};

	return (
		<div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
			{/* Floating Toggle Button */}
			<motion.button
				type="button"
				onClick={() => setIsOpen((prev) => !prev)}
				className={cn(
					"relative p-4 rounded-full shadow-2xl bg-primary hover:bg-primary/95 text-white flex items-center justify-center border border-white/20 transition-all duration-300 active:scale-95 group focus:outline-none",
					isOpen && "bg-neutral-800 hover:bg-neutral-900 border-neutral-700",
				)}
				whileHover={{ scale: 1.05 }}
				whileTap={{ scale: 0.95 }}
			>
				{isOpen ? (
					<X className="size-5" />
				) : (
					<Clipboard className="size-5 group-hover:rotate-6 transition-transform" />
				)}

				{/* History Item Count Badge */}
				{!isOpen && history.length > 0 && (
					<motion.span
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						className="absolute -top-1.5 -right-1.5 size-5 bg-red-500 text-white rounded-full text-[9px] font-black flex items-center justify-center border-2 border-background shadow-lg"
					>
						{history.length}
					</motion.span>
				)}
			</motion.button>

			{/* Sliding Clipboard Drawer */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, y: 20, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 20, scale: 0.95 }}
						transition={{ type: "spring", duration: 0.4 }}
						className="absolute bottom-16 right-0 w-80 md:w-96 rounded-3xl border border-border/50 bg-background/50 backdrop-blur-3xl p-5 shadow-[0_30px_100px_rgba(0,0,0,0.3)] space-y-4"
					>
						{/* Header */}
						<div className="flex items-center justify-between pb-3 border-b border-border/20">
							<div className="flex items-center gap-2">
								<Clipboard className="size-4 text-primary" />
								<h3 className="text-sm font-semibold">
									Schránka ({history.length}/10)
								</h3>
							</div>
							{history.length > 0 && (
								<button
									type="button"
									onClick={clearHistory}
									className="text-xs font-medium text-muted-foreground hover:text-destructive transition-colors duration-300"
								>
									Vyčistiť
								</button>
							)}
						</div>

						{/* History List */}
						{history.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-10 opacity-30 text-center space-y-2">
								<Clipboard className="size-8 text-muted-foreground" />
								<p className="text-xs font-bold uppercase tracking-wider">
									Schránka je prázdna
								</p>
								<p className="text-[10px] text-muted-foreground max-w-50">
									Čokoľvek skopírujete z design systému sa zobrazí tu pre rýchly
									prístup.
								</p>
							</div>
						) : (
							<div className="overflow-y-auto space-y-2.5 max-h-87.5 pr-1 scrollbar-hide">
								{history.map((item) => {
									const isHex = isColor(item.text);
									return (
										<div
											key={item.id}
											onClick={() =>
												copy(
													item.text,
													"Položka skopírovaná z histórie schránky",
												)
											}
											className="group relative p-3 rounded-2xl bg-muted/20 hover:bg-primary/5 border border-border/40 hover:border-primary/20 transition-all duration-300 cursor-pointer flex items-center justify-between gap-3"
										>
											<div className="flex items-center gap-3 min-w-0 flex-1">
												{/* Left side thumbnail helper (color block or icon) */}
												{isHex ? (
													<div
														className="size-7 rounded-lg shrink-0 border border-white/10 shadow-sm"
														style={{ backgroundColor: item.text }}
													/>
												) : (
													<div className="size-7 rounded-lg shrink-0 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-[10px] font-black uppercase">
														Aa
													</div>
												)}
												<div className="flex flex-col min-w-0">
													<p className="text-xs font-mono font-bold truncate text-foreground pr-2">
														{item.text}
													</p>
													<span className="text-[8px] text-muted-foreground opacity-60">
														{new Date(item.timestamp).toLocaleTimeString(
															"sk-SK",
															{
																hour: "2-digit",
																minute: "2-digit",
																second: "2-digit",
															},
														)}
													</span>
												</div>
											</div>

											{/* Copy & Delete Trigger */}
											<div className="flex items-center gap-1.5 shrink-0">
												{copiedValue === item.text ? (
													<Check className="size-4 text-emerald-500" />
												) : (
													<Copy className="size-3.5 text-muted-foreground opacity-40 group-hover:opacity-80 transition-opacity" />
												)}
												<button
													type="button"
													onClick={(e) => {
														e.stopPropagation();
														deleteHistoryItem(item.id);
													}}
													className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all duration-300"
												>
													<Trash2 className="size-3.5" />
												</button>
											</div>
										</div>
									);
								})}
							</div>
						)}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
