"use client";

import { Grid, ZoomIn, ZoomOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CanvasZoomControlsProps = {
	zoom: number;
	snapToGrid: boolean;
	onZoomOut: () => void;
	onZoomIn: () => void;
	onToggleSnap: () => void;
};

export function CanvasZoomControls({
	zoom,
	snapToGrid,
	onZoomOut,
	onZoomIn,
	onToggleSnap,
}: CanvasZoomControlsProps) {
	return (
		<div className="absolute bottom-3 right-3 z-20 flex items-center gap-1 rounded-lg border border-border bg-background/95 p-1 shadow-sm backdrop-blur-sm">
			<Button
				type="button"
				variant="ghost"
				size="icon-sm"
				onClick={onZoomOut}
				aria-label="Zoom out"
			>
				<ZoomOut className="size-4" />
			</Button>
			<span className="min-w-12 text-center text-xs font-medium tabular-nums text-muted-foreground">
				{Math.round(zoom * 100)}%
			</span>
			<Button
				type="button"
				variant="ghost"
				size="icon-sm"
				onClick={onZoomIn}
				aria-label="Zoom in"
			>
				<ZoomIn className="size-4" />
			</Button>
			<div className="mx-0.5 h-5 w-px bg-border" />
			<Button
				type="button"
				variant={snapToGrid ? "secondary" : "ghost"}
				size="icon-sm"
				onClick={onToggleSnap}
				aria-label="Grid"
				aria-pressed={snapToGrid}
				className={cn(snapToGrid && "text-primary")}
			>
				<Grid className="size-4" />
			</Button>
		</div>
	);
}
