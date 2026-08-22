"use client";

import { Check, Clipboard, Copy, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { formatAppTime } from "@/lib/locale";
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
					"relative flex size-10 items-center justify-center rounded-xl border border-primary/20 bg-primary text-primary-foreground shadow-md shadow-primary/20 transition-colors duration-300 hover:bg-primary/95 focus:outline-none",
					isOpen && "bg-foreground text-background border-border hover:bg-foreground/90",
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
						className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full border-2 border-background bg-destructive text-[9px] font-semibold text-primary-foreground shadow-sm"
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
						className="absolute bottom-14 right-0 w-80 space-y-4 rounded-xl border border-border bg-popover p-4 shadow-lg md:w-96"
					>
						{/* Header */}
						<div className="flex items-center justify-between pb-3 border-b border-border/20">
							<div className="flex items-center gap-2">
								<Clipboard className="size-4 text-primary" />
								<h3 className="text-sm font-semibold">
									Clipboard ({history.length}/10)
								</h3>
							</div>
							{history.length > 0 && (
								<button
									type="button"
									onClick={clearHistory}
									className="text-xs font-medium text-muted-foreground hover:text-destructive transition-colors duration-300"
								>
									Clear
								</button>
							)}
						</div>

						{/* History List */}
						{history.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-10 opacity-30 text-center space-y-2">
								<Clipboard className="size-8 text-muted-foreground" />
								<p className="text-xs font-bold uppercase tracking-wider">
									Clipboard is empty
								</p>
								<p className="text-[10px] text-muted-foreground max-w-50">
									Anything you copy from the design system will appear here for
									quick access.
								</p>
							</div>
						) : (
							<div className="overflow-y-auto space-y-2.5 max-h-87.5 pr-1 scrollbar-hide">
								{history.map((item) => {
									const isHex = isColor(item.text);
									return (
										<div
											key={item.id}
											className="group relative rounded-2xl bg-muted/20 hover:bg-primary/5 border border-border/40 hover:border-primary/20 transition-all duration-300 flex items-center justify-between gap-3"
										>
											<button
												type="button"
												onClick={() =>
													copy(item.text, "Item copied from clipboard history")
												}
												className="flex min-w-0 flex-1 items-center gap-3 p-3 text-left"
											>
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
														{formatAppTime(item.timestamp, {
															hour: "2-digit",
															minute: "2-digit",
															second: "2-digit",
														})}
													</span>
												</div>
											</button>

											{/* Copy & Delete Trigger */}
											<div className="flex items-center gap-1.5 shrink-0 pr-3">
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
													aria-label="Remove item"
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
