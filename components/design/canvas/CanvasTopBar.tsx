"use client";

import { FolderKanban, Layers, NotebookPen, PanelLeft, PanelRight, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { getCanvasToolLabel } from "./canvas-tool-labels";

type CanvasTopBarProps = {
	activeTool: string;
	layerCount: number;
	canvasLabel: string;
	isSaving: boolean;
	hasSavedDesign: boolean;
	leftPanelOpen: boolean;
	rightPanelOpen: boolean;
	onToggleLeftPanel: () => void;
	onToggleRightPanel: () => void;
	onSave: () => void;
	onOpenNote: () => void;
};

export function CanvasTopBar({
	activeTool,
	layerCount,
	canvasLabel,
	isSaving,
	hasSavedDesign,
	leftPanelOpen,
	rightPanelOpen,
	onToggleLeftPanel,
	onToggleRightPanel,
	onSave,
	onOpenNote,
}: CanvasTopBarProps) {
	return (
		<header className="flex h-11 shrink-0 items-center gap-2 border-b border-border bg-background px-3">
			<div className="flex items-center gap-1">
				<Button
					type="button"
					variant={leftPanelOpen ? "secondary" : "ghost"}
					size="icon-sm"
					onClick={onToggleLeftPanel}
					aria-label={leftPanelOpen ? "Hide layers" : "Show layers"}
					className="hidden lg:inline-flex"
				>
					<PanelLeft className="size-4" />
				</Button>
				<Button
					type="button"
					variant={rightPanelOpen ? "secondary" : "ghost"}
					size="icon-sm"
					onClick={onToggleRightPanel}
					aria-label={rightPanelOpen ? "Hide properties" : "Show properties"}
					className="hidden xl:inline-flex"
				>
					<PanelRight className="size-4" />
				</Button>
			</div>

			<div className="hidden min-w-0 flex-1 items-center gap-3 sm:flex">
				<span className="truncate text-sm font-medium">{getCanvasToolLabel(activeTool)}</span>
				<span className="text-muted-foreground">·</span>
				<span className="truncate text-xs text-muted-foreground">{canvasLabel}</span>
			</div>

			<div className="ml-auto flex items-center gap-2">
				<span className="hidden items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground md:inline-flex">
					<Layers className="size-3.5" />
					{layerCount}
				</span>
				<Button
					type="button"
					variant="outline"
					size="sm"
					className="hidden gap-1.5 sm:inline-flex"
					onClick={onSave}
					disabled={isSaving}
				>
					{isSaving ? (
						<RefreshCw className="size-3.5 animate-spin" />
					) : (
						<FolderKanban className="size-3.5" />
					)}
					{hasSavedDesign ? "Update" : "Save"}
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					className="gap-1.5"
					onClick={onOpenNote}
				>
					<NotebookPen className="size-3.5" />
					<span className="hidden sm:inline">Note</span>
				</Button>
			</div>
		</header>
	);
}
