"use client";

import { useQuery } from "convex/react";
import {
	FileText,
	FolderKanban,
	Link2,
	Palette,
	Search,
	SquareKanban,
} from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
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

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
	const router = useRouter();
	const [term, setTerm] = useState("");
	const debouncedTerm = useDebouncedValue(term, 200);

	useEffect(() => {
		if (!open) setTerm("");
	}, [open]);

	const search = useQuery(
		api.dashboard.globalSearch,
		debouncedTerm.trim() ? { term: debouncedTerm.trim() } : "skip",
	);

	const groups = useMemo(() => {
		if (!debouncedTerm.trim()) return [];
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
	}, [debouncedTerm, search]);

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

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
				<DialogHeader className="border-b border-border px-4 py-3">
					<DialogTitle className="sr-only">Command palette</DialogTitle>
					<div className="relative">
						<Search className="absolute left-0 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							autoFocus
							value={term}
							onChange={(event) => setTerm(event.target.value)}
							placeholder="Search projects, notes, links, pages…"
							className="border-none bg-transparent pl-7 shadow-none focus-visible:ring-0"
						/>
					</div>
				</DialogHeader>
				<div className="max-h-80 overflow-y-auto p-2">
					{!debouncedTerm.trim() ? (
						<p className="px-3 py-6 text-center text-sm text-muted-foreground">
							Type to search or jump to a page. Press{" "}
							<kbd className="rounded border px-1.5 py-0.5 text-xs">⌘K</kbd> anytime.
						</p>
					) : groups.length === 0 ? (
						<p className="px-3 py-6 text-center text-sm text-muted-foreground">
							No results found.
						</p>
					) : (
						groups.map((group) => (
							<div key={group.label} className="mb-2">
								<p className="px-3 py-1.5 text-xs font-medium text-muted-foreground">
									{group.label}
								</p>
								{group.items.map((item) => {
									const Icon =
										TYPE_ICONS[item.type as keyof typeof TYPE_ICONS] ?? Search;
									return (
										<button
											key={`${item.type}-${item.href}-${item.label}`}
											type="button"
											className={cn(
												"flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm",
												"hover:bg-accent hover:text-accent-foreground",
											)}
											onClick={() => navigate(item.href)}
										>
											<Icon className="size-4 shrink-0 text-muted-foreground" />
											<span className="truncate">{item.label}</span>
										</button>
									);
								})}
							</div>
						))
					)}
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
		<button
			type="button"
			onClick={onClick}
			className="hidden items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted md:flex"
		>
			<Search className="size-4" />
			<span>Search…</span>
			<kbd className="rounded border bg-background px-1.5 py-0.5 text-[10px]">
				⌘K
			</kbd>
		</button>
	);
}
