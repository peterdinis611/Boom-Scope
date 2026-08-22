"use client";

import { useQuery } from "convex/react";
import {
	FileText,
	FolderKanban,
	Link2,
	Loader2,
	Palette,
	Search,
	SquareKanban,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { cn } from "@/lib/utils";

const TYPE_ICONS = {
	project: FolderKanban,
	note: FileText,
	link: Link2,
	design: Palette,
	task: SquareKanban,
	nav: Search,
} as const;

type CommandPaletteProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

const panelEase = [0.22, 1, 0.36, 1] as const;

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
	const router = useRouter();
	const reduceMotion = useReducedMotion();
	const [term, setTerm] = useState("");
	const debouncedTerm = useDebouncedValue(term, 200);
	const trimmed = debouncedTerm.trim();

	useEffect(() => {
		if (!open) setTerm("");
	}, [open]);

	const search = useQuery(
		api.dashboard.globalSearch,
		trimmed ? { term: trimmed } : "skip",
	);

	const isSearching = Boolean(trimmed) && search === undefined;

	const groups = useMemo(() => {
		if (!trimmed) return [];
		return [
			{
				label: "Navigation",
				items: (search?.navigation ?? []).map((item) => ({
					...item,
					type: "nav" as const,
				})),
			},
			{
				label: "Results",
				items: search?.results ?? [],
			},
		].filter((group) => group.items.length > 0);
	}, [trimmed, search]);

	const navigate = useCallback(
		(href: string) => {
			onOpenChange(false);
			router.push(href as Route);
		},
		[onOpenChange, router],
	);

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
				event.preventDefault();
				onOpenChange(true);
			}
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [onOpenChange]);

	const contentKey = !trimmed
		? "hint"
		: isSearching
			? "loading"
			: groups.length === 0
				? "empty"
				: "results";

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className={cn(
					"gap-0 overflow-hidden p-0 sm:max-w-lg",
					"duration-300 data-open:slide-in-from-top-6 data-open:zoom-in-95",
					"data-closed:slide-out-to-top-2 data-closed:zoom-out-95 data-closed:duration-200",
				)}
			>
				<DialogHeader className="border-b border-border px-4 py-3">
					<DialogTitle className="sr-only">Command palette</DialogTitle>
					<div className="relative">
						<motion.span
							className="absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground"
							animate={
								reduceMotion
									? undefined
									: term
										? { scale: [1, 1.12, 1], rotate: [0, -8, 0] }
										: { scale: 1, rotate: 0 }
							}
							transition={{ duration: 0.35, ease: panelEase }}
						>
							{isSearching ? (
								<Loader2 className="size-4 animate-spin text-primary" />
							) : (
								<Search className="size-4" />
							)}
						</motion.span>
						<Input
							autoFocus
							value={term}
							onChange={(event) => setTerm(event.target.value)}
							placeholder="Search projects, notes, links, pages…"
							className="border-none bg-transparent pl-7 shadow-none focus-visible:ring-0"
						/>
					</div>
				</DialogHeader>

				<div className="relative max-h-80 min-h-[8.5rem] overflow-y-auto p-2">
					<AnimatePresence mode="wait" initial={false}>
						{contentKey === "hint" ? (
							<motion.p
								key="hint"
								initial={reduceMotion ? false : { opacity: 0, y: 8 }}
								animate={{ opacity: 1, y: 0 }}
								exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
								transition={{ duration: 0.22, ease: panelEase }}
								className="px-3 py-6 text-center text-sm text-muted-foreground"
							>
								Type to search or jump to a page. Press{" "}
								<kbd className="rounded border px-1.5 py-0.5 text-xs">⌘K</kbd>{" "}
								anytime.
							</motion.p>
						) : contentKey === "loading" ? (
							<motion.div
								key="loading"
								initial={reduceMotion ? false : { opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={reduceMotion ? undefined : { opacity: 0 }}
								transition={{ duration: 0.18 }}
								className="flex flex-col items-center justify-center gap-3 px-3 py-8"
							>
								<motion.div
									className="flex gap-1.5"
									aria-hidden
								>
									{[0, 1, 2].map((i) => (
										<motion.span
											key={i}
											className="size-1.5 rounded-full bg-scope"
											animate={
												reduceMotion
													? undefined
													: { y: [0, -5, 0], opacity: [0.4, 1, 0.4] }
											}
											transition={{
												duration: 0.7,
												repeat: Infinity,
												ease: "easeInOut",
												delay: i * 0.12,
											}}
										/>
									))}
								</motion.div>
								<p className="text-sm text-muted-foreground">Searching…</p>
							</motion.div>
						) : contentKey === "empty" ? (
							<motion.p
								key="empty"
								initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={reduceMotion ? undefined : { opacity: 0, scale: 0.98 }}
								transition={{ duration: 0.22, ease: panelEase }}
								className="px-3 py-6 text-center text-sm text-muted-foreground"
							>
								No results found.
							</motion.p>
						) : (
							<motion.div
								key={`results-${trimmed}`}
								initial={reduceMotion ? false : { opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={reduceMotion ? undefined : { opacity: 0 }}
								transition={{ duration: 0.15 }}
							>
								{groups.map((group, groupIndex) => (
									<div key={group.label} className="mb-2">
										<motion.p
											initial={reduceMotion ? false : { opacity: 0, x: -6 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{
												duration: 0.2,
												delay: reduceMotion ? 0 : groupIndex * 0.04,
												ease: panelEase,
											}}
											className="px-3 py-1.5 font-mono text-[10px] font-medium tracking-[0.14em] text-muted-foreground uppercase"
										>
											{group.label}
										</motion.p>
										{group.items.map((item, itemIndex) => {
											const Icon =
												TYPE_ICONS[item.type as keyof typeof TYPE_ICONS] ??
												Search;
											const delay = reduceMotion
												? 0
												: groupIndex * 0.05 + itemIndex * 0.035;
											return (
												<motion.button
													key={`${item.type}-${item.href}-${item.label}`}
													type="button"
													initial={
														reduceMotion ? false : { opacity: 0, y: 10, x: -4 }
													}
													animate={{ opacity: 1, y: 0, x: 0 }}
													transition={{
														duration: 0.28,
														delay,
														ease: panelEase,
													}}
													whileHover={
														reduceMotion
															? undefined
															: { x: 2, transition: { duration: 0.15 } }
													}
													whileTap={reduceMotion ? undefined : { scale: 0.98 }}
													className={cn(
														"flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm",
														"hover:bg-accent hover:text-accent-foreground",
													)}
													onClick={() => navigate(item.href)}
												>
													<span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
														<Icon className="size-3.5" />
													</span>
													<span className="truncate">{item.label}</span>
												</motion.button>
											);
										})}
									</div>
								))}
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export function CommandPaletteTrigger({
	onClick,
}: {
	onClick: () => void;
}) {
	return (
		<motion.button
			type="button"
			onClick={onClick}
			whileHover={{ scale: 1.02 }}
			whileTap={{ scale: 0.98 }}
			className="hidden items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted md:flex"
		>
			<Search className="size-4" />
			<span>Search…</span>
			<kbd className="rounded border bg-background px-1.5 py-0.5 text-[10px]">
				⌘K
			</kbd>
		</motion.button>
	);
}
