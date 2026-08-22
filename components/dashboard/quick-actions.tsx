"use client";

import { X, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { CaptureDialog } from "@/components/inbox/capture-dialog";
import { QuickNoteDialog } from "@/components/notes/QuickNoteDialog";
import { cn } from "@/lib/utils";

import { QUICK_ACTION_ITEMS, type QuickActionItem } from "./quick-action-items";

export function QuickActions() {
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(false);
	const [isNoteOpen, setIsNoteOpen] = useState(false);
	const [isCaptureOpen, setIsCaptureOpen] = useState(false);

	const runAction = (item: QuickActionItem) => {
		if (item.action === "note") {
			setIsNoteOpen(true);
		} else if (item.action === "capture") {
			setIsCaptureOpen(true);
		} else if (item.href) {
			router.push(item.href as Route);
		}
		setIsOpen(false);
	};

	return (
		<>
			<div className="fixed bottom-6 left-6 z-50 flex flex-col items-start">
				<AnimatePresence>
					{isOpen && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="mb-3 flex flex-col gap-2"
						>
							{QUICK_ACTION_ITEMS.map((action, index) => {
								const Icon = action.icon;
								return (
									<motion.button
										key={action.id}
										type="button"
										initial={{ opacity: 0, x: -24, scale: 0.85 }}
										animate={{ opacity: 1, x: 0, scale: 1 }}
										exit={{
											opacity: 0,
											x: -24,
											scale: 0.85,
											transition: {
												delay: (QUICK_ACTION_ITEMS.length - 1 - index) * 0.04,
											},
										}}
										transition={{
											type: "spring",
											stiffness: 420,
											damping: 28,
											delay: index * 0.05,
										}}
										whileHover={{ scale: 1.04, x: 4 }}
										whileTap={{ scale: 0.96 }}
										onClick={() => runAction(action)}
										className={cn(
											"group flex min-w-[11.5rem] items-center gap-3 rounded-2xl border px-3.5 py-3 shadow-lg backdrop-blur-xl transition-colors",
											"border-border/60 bg-background/90 dark:bg-background/75",
										)}
									>
										<span
											className={cn(
												"flex size-10 shrink-0 items-center justify-center rounded-xl border",
												action.iconClassName,
											)}
										>
											<Icon className="size-5" />
										</span>
										<span className="min-w-0 pr-1 text-left font-sans">
											<span className="block text-sm font-semibold leading-tight text-foreground">
												{action.label}
											</span>
											<span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
												{action.description}
											</span>
										</span>
									</motion.button>
								);
							})}
						</motion.div>
					)}
				</AnimatePresence>

				<motion.button
					type="button"
					onClick={() => setIsOpen((prev) => !prev)}
					className={cn(
						"relative flex size-11 items-center justify-center rounded-xl border shadow-md transition-colors duration-300 focus:outline-none",
						isOpen
							? "border-border bg-foreground text-background hover:bg-foreground/90"
							: "border-primary/20 bg-primary text-primary-foreground shadow-primary/20 hover:bg-primary/95",
					)}
					whileHover={{ scale: 1.06 }}
					whileTap={{ scale: 0.94 }}
					aria-expanded={isOpen}
					aria-label={isOpen ? "Close quick actions" : "Open quick actions"}
				>
					<AnimatePresence mode="wait" initial={false}>
						{isOpen ? (
							<motion.span
								key="close"
								initial={{ rotate: -90, opacity: 0 }}
								animate={{ rotate: 0, opacity: 1 }}
								exit={{ rotate: 90, opacity: 0 }}
								transition={{ duration: 0.2 }}
							>
								<X className="size-5" />
							</motion.span>
						) : (
							<motion.span
								key="open"
								initial={{ rotate: 90, opacity: 0 }}
								animate={{ rotate: 0, opacity: 1 }}
								exit={{ rotate: -90, opacity: 0 }}
								transition={{ duration: 0.2 }}
								className="relative"
							>
								<Zap className="size-5" />
								<motion.span
									className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-success"
									animate={{ scale: [1, 1.3, 1] }}
									transition={{
										duration: 2,
										repeat: Number.POSITIVE_INFINITY,
										ease: "easeInOut",
									}}
								/>
							</motion.span>
						)}
					</AnimatePresence>
				</motion.button>
			</div>

			<QuickNoteDialog open={isNoteOpen} onOpenChange={setIsNoteOpen} />
			<CaptureDialog open={isCaptureOpen} onOpenChange={setIsCaptureOpen} />
		</>
	);
}
