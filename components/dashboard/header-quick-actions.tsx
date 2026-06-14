"use client";

import {
	Clipboard,
	FileText,
	FolderKanban,
	MoreHorizontal,
	Palette,
	Sparkles,
	Timer,
} from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { QuickNoteDialog } from "@/components/notes/QuickNoteDialog";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type HeaderQuickActionsProps = {
	onOpenClipboard?: () => void;
	clipboardCount?: number;
};

export function HeaderQuickActions({
	onOpenClipboard,
	clipboardCount = 0,
}: HeaderQuickActionsProps) {
	const router = useRouter();
	const [isNoteOpen, setIsNoteOpen] = useState(false);

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						type="button"
						variant="outline"
						size="sm"
						className="gap-2"
						aria-label="Rýchle akcie"
					>
						<MoreHorizontal className="size-4" />
						<span className="hidden sm:inline">Rýchle akcie</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-52">
					<DropdownMenuLabel>Rýchle akcie</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={() => setIsNoteOpen(true)}>
						<FileText className="size-4" />
						Nová poznámka
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => router.push("/dashboard/canvas" as Route)}
					>
						<Palette className="size-4" />
						Canvas
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => router.push("/dashboard/generator" as Route)}
					>
						<Sparkles className="size-4" />
						AI Generátor
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => router.push("/dashboard/pomodoro" as Route)}
					>
						<Timer className="size-4" />
						Pomodoro
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => router.push("/dashboard/projects" as Route)}
					>
						<FolderKanban className="size-4" />
						Projekty
					</DropdownMenuItem>
					{onOpenClipboard ? (
						<>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={onOpenClipboard}>
								<Clipboard className="size-4" />
								Schránka
								{clipboardCount > 0 ? (
									<span className="ml-auto text-xs text-muted-foreground">
										{clipboardCount}
									</span>
								) : null}
							</DropdownMenuItem>
						</>
					) : null}
				</DropdownMenuContent>
			</DropdownMenu>

			<QuickNoteDialog open={isNoteOpen} onOpenChange={setIsNoteOpen} />
		</>
	);
}
