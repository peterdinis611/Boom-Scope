"use client";

import { Zap } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { QuickNoteDialog } from "@/components/notes/QuickNoteDialog";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import {
	CLIPBOARD_ACTION,
	QUICK_ACTION_ITEMS,
	type QuickActionItem,
} from "./quick-action-items";

type HeaderQuickActionsProps = {
	onOpenClipboard?: () => void;
	clipboardCount?: number;
	onOpenCapture?: () => void;
};

function QuickActionMenuItem({
	item,
	badge,
	onSelect,
}: {
	item: QuickActionItem;
	badge?: number;
	onSelect: () => void;
}) {
	const Icon = item.icon;

	return (
		<DropdownMenuItem
			onClick={onSelect}
			className="gap-3 rounded-xl px-2 py-2.5 focus:bg-accent/60"
		>
			<span
				className={cn(
					"flex size-9 shrink-0 items-center justify-center rounded-lg border",
					item.iconClassName,
				)}
			>
				<Icon className="size-4" aria-hidden="true" />
			</span>
			<span className="min-w-0 flex-1 text-left">
				<span className="block text-sm font-medium leading-tight">
					{item.label}
				</span>
				<span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
					{item.description}
				</span>
			</span>
			{badge !== undefined && badge > 0 ? (
				<span className="ml-auto shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold tabular-nums text-primary">
					{badge}
				</span>
			) : null}
		</DropdownMenuItem>
	);
}

export function HeaderQuickActions({
	onOpenClipboard,
	clipboardCount = 0,
	onOpenCapture,
}: HeaderQuickActionsProps) {
	const router = useRouter();
	const [isNoteOpen, setIsNoteOpen] = useState(false);

	const runAction = (item: QuickActionItem) => {
		if (item.action === "note") {
			setIsNoteOpen(true);
			return;
		}
		if (item.action === "capture") {
			onOpenCapture?.();
			return;
		}
		if (item.href) {
			router.push(item.href as Route);
		}
	};

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						type="button"
						variant="outline"
						size="sm"
						className="gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10"
						aria-label="Quick actions"
					>
						<Zap className="size-4 text-primary" />
						<span className="hidden sm:inline">Quick actions</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-72 p-2">
					<div className="px-2 pb-1 pt-1">
						<p className="text-sm font-semibold text-foreground">
							Quick actions
						</p>
						<p className="text-xs text-muted-foreground">
							Shortcuts to common tasks
						</p>
					</div>
					<DropdownMenuSeparator className="my-1.5" />
					{QUICK_ACTION_ITEMS.map((item) => (
						<QuickActionMenuItem
							key={item.id}
							item={item}
							onSelect={() => runAction(item)}
						/>
					))}
					{onOpenClipboard ? (
						<>
							<DropdownMenuSeparator className="my-1.5" />
							<QuickActionMenuItem
								item={CLIPBOARD_ACTION}
								badge={clipboardCount}
								onSelect={onOpenClipboard}
							/>
						</>
					) : null}
				</DropdownMenuContent>
			</DropdownMenu>

			<QuickNoteDialog open={isNoteOpen} onOpenChange={setIsNoteOpen} />
		</>
	);
}
