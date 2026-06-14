"use client";

import {
	Circle,
	Download,
	Eraser,
	Hand,
	Hexagon,
	Image as ImageIcon,
	MousePointer2,
	MoveUp,
	Pencil,
	Redo,
	Save,
	Share2,
	Square,
	Star,
	Trash2,
	Triangle,
	Type,
	Undo,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ToolSeparator = { id: string; type: "separator" };
type ToolButton = {
	id: string;
	icon: React.ElementType;
	label: string;
	variant?: "destructive";
};
type ToolItem = ToolSeparator | ToolButton;

function isSeparator(tool: ToolItem): tool is ToolSeparator {
	return "type" in tool && tool.type === "separator";
}

const tools: ToolItem[] = [
	{ id: "select", icon: MousePointer2, label: "Select" },
	{ id: "hand", icon: Hand, label: "Pan" },
	{ id: "pencil", icon: Pencil, label: "Pencil" },
	{ id: "eraser", icon: Eraser, label: "Eraser" },
	{ id: "sep-1", type: "separator" },
	{ id: "rect", icon: Square, label: "Rectangle" },
	{ id: "circle", icon: Circle, label: "Circle" },
	{ id: "triangle", icon: Triangle, label: "Triangle" },
	{ id: "polygon", icon: Hexagon, label: "Polygon" },
	{ id: "star", icon: Star, label: "Star" },
	{ id: "arrow", icon: MoveUp, label: "Arrow" },
	{ id: "text", icon: Type, label: "Text" },
	{ id: "image", icon: ImageIcon, label: "Image" },
	{ id: "sep-2", type: "separator" },
	{ id: "undo", icon: Undo, label: "Back" },
	{ id: "redo", icon: Redo, label: "Redo" },
	{ id: "sep-3", type: "separator" },
	{ id: "trash", icon: Trash2, label: "Delete", variant: "destructive" },
	{ id: "download", icon: Download, label: "Export" },
	{ id: "save", icon: Save, label: "Save" },
	{ id: "share", icon: Share2, label: "Share" },
];

export function Dock({
	activeTool,
	onToolChange,
	embedded = false,
}: {
	activeTool: string;
	onToolChange: (tool: string) => void;
	embedded?: boolean;
}) {
	return (
		<div
			className={cn(
				"flex max-w-full items-center gap-0.5 overflow-x-auto rounded-lg border border-border bg-background p-1 shadow-sm",
				embedded
					? "scrollbar-none"
					: "fixed bottom-4 left-1/2 z-50 -translate-x-1/2",
			)}
		>
			{tools.map((tool) => {
				if (isSeparator(tool)) {
					return (
						<div
							key={tool.id}
							className="mx-0.5 h-6 w-px shrink-0 bg-border"
							aria-hidden
						/>
					);
				}

				const Icon = tool.icon;
				const isActive = activeTool === tool.id;

				return (
					<Button
						key={tool.id}
						type="button"
						variant={isActive ? "default" : "ghost"}
						size="icon-sm"
						onClick={() => onToolChange(tool.id)}
						title={tool.label}
						aria-label={tool.label}
						className={cn(
							"shrink-0",
							tool.variant === "destructive" &&
								!isActive &&
								"text-destructive hover:text-destructive",
						)}
					>
						<Icon className="size-4" />
					</Button>
				);
			})}
		</div>
	);
}
