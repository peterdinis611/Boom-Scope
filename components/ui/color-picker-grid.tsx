"use client";

import { Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import {
	APP_PALETTE,
	colorsMatch,
	getPickerHexValue,
	isValidHexColor,
	normalizeHexColor,
} from "@/lib/canvas-colors";
import { cn } from "@/lib/utils";

export interface ColorPickerGridProps {
	value?: string;
	onChange: (color: string) => void;
	palette?: readonly string[];
	columns?: 5 | 6;
	showHexInput?: boolean;
	showCustomSwatch?: boolean;
	swatchSize?: "sm" | "md";
	className?: string;
}

export function ColorPickerGrid({
	value = "#3b82f6",
	onChange,
	palette = APP_PALETTE,
	columns = 6,
	showHexInput = true,
	showCustomSwatch = true,
	swatchSize = "md",
	className,
}: ColorPickerGridProps) {
	const pickerRef = useRef<HTMLInputElement>(null);
	const [hexInput, setHexInput] = useState("");

	useEffect(() => {
		if (value.startsWith("#")) {
			setHexInput(value);
		}
	}, [value]);

	const pickerValue = getPickerHexValue(value);
	const isCustomSelected =
		showCustomSwatch &&
		value.startsWith("#") &&
		!palette.some((color) => colorsMatch(color, value));

	const applyHex = () => {
		const normalized = normalizeHexColor(hexInput);
		if (normalized) {
			onChange(normalized);
		}
	};

	const swatchSizeClass = swatchSize === "sm" ? "size-6 rounded-lg" : "size-8 rounded-xl";

	return (
		<div className={cn("space-y-3", className)}>
			<div
				className={cn(
					"grid gap-2",
					columns === 5 ? "grid-cols-5" : "grid-cols-6",
				)}
			>
				{palette.map((color) => (
					<button
						key={color}
						type="button"
						onClick={() => onChange(color)}
						className={cn(
							swatchSizeClass,
							"border-2 transition-all duration-300 hover:scale-110 active:scale-90",
							colorsMatch(value, color)
								? "border-primary scale-110 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
								: "border-transparent hover:border-foreground/20",
						)}
						style={{ backgroundColor: color }}
						aria-label={`Color ${color}`}
					/>
				))}
				{showCustomSwatch ? (
					<button
						type="button"
						onClick={() => pickerRef.current?.click()}
						className={cn(
							swatchSizeClass,
							"flex items-center justify-center border-2 border-dashed transition-all duration-300 hover:scale-110 active:scale-90",
							isCustomSelected
								? "border-primary bg-primary/10 scale-110"
								: "border-border/60 hover:border-primary/40",
						)}
						style={
							isCustomSelected ? { backgroundColor: value } : undefined
						}
						aria-label="Pick custom color"
					>
						{!isCustomSelected ? (
							<Plus
								className={cn(
									"text-muted-foreground",
									swatchSize === "sm" ? "size-3" : "size-3.5",
								)}
							/>
						) : null}
					</button>
				) : null}
			</div>

			{showHexInput ? (
				<div className="flex items-center gap-2">
					<Input
						value={hexInput}
						onChange={(e) => setHexInput(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") applyHex();
						}}
						onBlur={applyHex}
						placeholder="#3b82f6"
						className="h-8 flex-1 rounded-lg font-mono text-xs"
						spellCheck={false}
					/>
					<input
						ref={pickerRef}
						type="color"
						value={pickerValue}
						onChange={(e) => onChange(e.target.value)}
						className="size-8 shrink-0 cursor-pointer rounded-lg border border-border bg-transparent p-0.5"
						aria-label="Custom color picker"
					/>
				</div>
			) : null}
			{showHexInput &&
			hexInput &&
			!isValidHexColor(hexInput) &&
			hexInput.length >= 4 ? (
				<p className="text-[10px] text-muted-foreground">
					Enter a hex color like #3b82f6
				</p>
			) : null}
		</div>
	);
}
