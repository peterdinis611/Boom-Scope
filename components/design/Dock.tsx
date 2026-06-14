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
	{ id: "select", icon: MousePointer2, label: "Výber" },
	{ id: "hand", icon: Hand, label: "Posun" },
	{ id: "pencil", icon: Pencil, label: "Pero" },
	{ id: "eraser", icon: Eraser, label: "Guma" },
	{ id: "sep-1", type: "separator" },
	{ id: "rect", icon: Square, label: "Obdĺžnik" },
	{ id: "circle", icon: Circle, label: "Kruh" },
	{ id: "triangle", icon: Triangle, label: "Trojuholník" },
	{ id: "polygon", icon: Hexagon, label: "Mnohouholník" },
	{ id: "star", icon: Star, label: "Hviezda" },
	{ id: "arrow", icon: MoveUp, label: "Šípka" },
	{ id: "text", icon: Type, label: "Text" },
	{ id: "image", icon: ImageIcon, label: "Obrázok" },
	{ id: "sep-2", type: "separator" },
	{ id: "undo", icon: Undo, label: "Späť" },
	{ id: "redo", icon: Redo, label: "Dopredu" },
	{ id: "sep-3", type: "separator" },
	{ id: "trash", icon: Trash2, label: "Vymazať", variant: "destructive" },
	{ id: "download", icon: Download, label: "Export" },
	{ id: "save", icon: Save, label: "Uložiť" },
	{ id: "share", icon: Share2, label: "Zdieľať" },
];

export function Dock({
	activeTool,
	onToolChange,
}: {
	activeTool: string;
	onToolChange: (tool: string) => void;
}) {
	return (
		<div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-lg border border-border bg-background p-1 shadow-sm">
			{tools.map((tool) => {
				if (isSeparator(tool)) {
					return (
						<div
							key={tool.id}
							className="mx-1 h-6 w-px bg-border"
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
