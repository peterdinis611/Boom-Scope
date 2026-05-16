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
	RotateCw,
	Save,
	Share2,
	Square,
	Star,
	Trash2,
	Triangle,
	Type,
	Undo,
} from "lucide-react";
import {
	type MotionValue,
	motion,
	useMotionValue,
	useSpring,
	useTransform,
} from "motion/react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

type ToolItem =
	| {
			id: string;
			type: "separator";
	  }
	| {
			id: string;
			type?: "tool";
			icon: React.ElementType;
			label: string;
			color?: string;
	  };

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
	{ id: "trash", icon: Trash2, label: "Vymazať", color: "text-red-500/60" },
	{
		id: "download",
		icon: Download,
		label: "Export",
		color: "text-green-500/60",
	},
	{ id: "save", icon: Save, label: "Uložiť", color: "text-primary" },
	{ id: "share", icon: Share2, label: "Zdieľať" },
];

export function Dock({
	activeTool,
	onToolChange,
}: {
	activeTool: string;
	onToolChange: (tool: string) => void;
}) {
	const mouseX = useMotionValue(Infinity);

	return (
		<div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
			<motion.div
				onMouseMove={(e) => mouseX.set(e.pageX)}
				onMouseLeave={() => mouseX.set(Infinity)}
				className={cn(
					"flex items-end gap-2 rounded-[28px] px-4 pb-4 pt-3",
					"bg-background/80 dark:bg-background/40 backdrop-blur-3xl border border-border",
					"shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]",
				)}
			>
				{tools.map((tool) => {
					if (tool.type === "separator") {
						return (
							<div
								key={tool.id}
								className="mx-2 h-10 w-px bg-border/50 self-center"
							/>
						);
					}
					return (
						<DockIcon
							key={tool.id}
							mouseX={mouseX}
							icon={tool.icon}
							label={tool.label}
							isActive={activeTool === tool.id}
							onClick={() => onToolChange(tool.id)}
							color={tool.color}
						/>
					);
				})}
			</motion.div>
		</div>
	);
}

function DockIcon({
	mouseX,
	icon: Icon,
	label,
	isActive,
	onClick,
	color,
}: {
	mouseX: MotionValue;
	icon: React.ElementType;
	label: string;
	isActive: boolean;
	onClick: () => void;
	color?: string;
}) {
	const ref = useRef<HTMLButtonElement>(null);

	const distance = useTransform(mouseX, (val) => {
		const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
		return val - bounds.x - bounds.width / 2;
	});

	const widthSync = useTransform(distance, [-150, 0, 150], [44, 70, 44]);
	const width = useSpring(widthSync, {
		mass: 0.1,
		stiffness: 150,
		damping: 12,
	});

	return (
		<button
			ref={ref}
			onClick={onClick}
			className="relative flex flex-col items-center group focus:outline-none"
		>
			<motion.div
				style={{ width, height: width }}
				className={cn(
					"flex items-center justify-center rounded-[18px] transition-all duration-300",
					isActive
						? "bg-primary text-white shadow-[0_10px_20px_rgba(37,99,235,0.4)]"
						: cn(
								"bg-foreground/5 text-foreground/40 hover:bg-foreground/10 hover:text-foreground",
								color,
							),
				)}
			>
				<Icon className="size-1/2" />
			</motion.div>

			{/* Tooltip */}
			<div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none translate-y-2 group-hover:translate-y-0">
				<div className="bg-background/90 backdrop-blur-md text-foreground text-[10px] px-3 py-1.5 rounded-xl border border-border shadow-2xl whitespace-nowrap font-bold uppercase tracking-widest">
					{label}
				</div>
			</div>

			{/* Active Indicator */}
			{isActive && (
				<motion.div
					layoutId="active-pill"
					className="absolute -bottom-2 size-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(59,130,246,0.8)]"
				/>
			)}
		</button>
	);
}
