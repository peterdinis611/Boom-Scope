"use client";

import {
	ArrowRight,
	Circle,
	Copy,
	Layers,
	Plus,
	Square,
	Star,
	Triangle,
	Type,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { LayerType } from "@/lib/canvas-layers";

const LAYER_OPTIONS: {
	type: LayerType;
	label: string;
	icon: typeof Square;
}[] = [
	{ type: "rect", label: "Rectangle", icon: Square },
	{ type: "circle", label: "Circle", icon: Circle },
	{ type: "text", label: "Text", icon: Type },
	{ type: "triangle", label: "Triangle", icon: Triangle },
	{ type: "star", label: "Star", icon: Star },
	{ type: "arrow", label: "Arrow", icon: ArrowRight },
];

interface LayerAddMenuProps {
	onAdd: (type: LayerType) => void;
	disabled?: boolean;
}

export function LayerAddMenu({ onAdd, disabled }: LayerAddMenuProps) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					type="button"
					variant="outline"
					size="sm"
					disabled={disabled}
					className="h-8 flex-1 gap-1.5 rounded-lg text-xs font-medium"
				>
					<Plus className="size-3.5" />
					Add layer
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className="w-48">
				{LAYER_OPTIONS.map(({ type, label, icon: Icon }) => (
					<DropdownMenuItem
						key={type}
						onClick={() => onAdd(type)}
						className="gap-2 text-xs"
					>
						<Icon className="size-3.5" />
						{label}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export function LayerPanelHeader({
	layerCount,
	onAdd,
	onDuplicate,
	canDuplicate,
}: {
	layerCount: number;
	onAdd: (type: LayerType) => void;
	onDuplicate: () => void;
	canDuplicate: boolean;
}) {
	return (
		<div className="space-y-2 border-b border-border px-3 py-2">
			<div className="flex items-center justify-between gap-2">
				<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
					<Layers className="size-3.5" />
					<span>{layerCount} layer{layerCount === 1 ? "" : "s"}</span>
				</div>
			</div>
			<div className="flex gap-2">
				<LayerAddMenu onAdd={onAdd} />
				<Button
					type="button"
					variant="outline"
					size="sm"
					disabled={!canDuplicate}
					onClick={onDuplicate}
					className="h-8 shrink-0 rounded-lg px-2.5 text-xs"
					title="Duplicate selected layer"
				>
					<Copy className="size-3.5" />
				</Button>
			</div>
		</div>
	);
}
