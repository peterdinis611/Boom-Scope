"use client";

import {
	FileText,
	FolderKanban,
	Palette,
	Sparkles,
	Timer,
	X,
	Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import type { ElementType } from "react";
import { useState } from "react";
import { QuickNoteDialog } from "@/components/notes/QuickNoteDialog";
import { cn } from "@/lib/utils";

type QuickAction = {
	id: string;
	label: string;
	description: string;
	icon: ElementType;
	color: string;
	onClick: () => void;
};

export function QuickActions() {
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(false);
	const [isNoteOpen, setIsNoteOpen] = useState(false);

	const runAction = (action: () => void) => {
		action();
		setIsOpen(false);
	};

	const actions: QuickAction[] = [
		{
			id: "note",
			label: "Poznámka",
			description: "Rýchla poznámka",
			icon: FileText,
			color:
				"bg-emerald-500/15 text-emerald-500 border-emerald-500/25 hover:bg-emerald-500/25",
			onClick: () => setIsNoteOpen(true),
		},
		{
			id: "canvas",
			label: "Canvas",
			description: "Otvoriť editor",
			icon: Palette,
			color: "bg-primary/15 text-primary border-primary/25 hover:bg-primary/25",
			onClick: () => router.push("/dashboard/canvas" as Route),
		},
		{
			id: "generator",
			label: "AI Studio",
			description: "Generovať dizajn",
			icon: Sparkles,
			color:
				"bg-violet-500/15 text-violet-500 border-violet-500/25 hover:bg-violet-500/25",
			onClick: () => router.push("/dashboard/generator" as Route),
		},
		{
			id: "pomodoro",
			label: "Pomodoro",
			description: "Spustiť timer",
			icon: Timer,
			color:
				"bg-amber-500/15 text-amber-500 border-amber-500/25 hover:bg-amber-500/25",
			onClick: () => router.push("/dashboard/pomodoro" as Route),
		},
		{
			id: "project",
			label: "Projekt",
			description: "Spravovať projekty",
			icon: FolderKanban,
			color: "bg-sky-500/15 text-sky-500 border-sky-500/25 hover:bg-sky-500/25",
			onClick: () => router.push("/dashboard/projects" as Route),
		},
	];

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
							{actions.map((action, index) => {
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
												delay: (actions.length - 1 - index) * 0.04,
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
										onClick={() => runAction(action.onClick)}
										className={cn(
											"group flex min-w-[11.5rem] items-center gap-3 rounded-2xl border px-3.5 py-3 shadow-lg backdrop-blur-xl transition-colors",
											"bg-background/90 dark:bg-background/75",
											action.color,
										)}
									>
										<span
											className={cn(
												"flex size-10 shrink-0 items-center justify-center rounded-xl border",
												action.color,
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
						"relative flex size-14 items-center justify-center rounded-full border shadow-2xl transition-colors duration-300 focus:outline-none",
						isOpen
							? "border-neutral-700 bg-neutral-800 text-white hover:bg-neutral-900"
							: "border-white/20 bg-primary text-white hover:bg-primary/95",
					)}
					whileHover={{ scale: 1.06 }}
					whileTap={{ scale: 0.94 }}
					aria-expanded={isOpen}
					aria-label={isOpen ? "Zavrieť rýchle akcie" : "Otvoriť rýchle akcie"}
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
									className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
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
		</>
	);
}
