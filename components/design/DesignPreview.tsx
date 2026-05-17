"use client";

import type { CanvasElement } from "@/components/design/KonvaCanvas";
import { cn } from "@/lib/utils";

interface DesignPreviewProps {
	elements: CanvasElement[];
	width: number;
	height: number;
	className?: string;
	scale?: number;
}

export function DesignPreview({
	elements,
	width,
	height,
	className,
	scale = 1,
}: DesignPreviewProps) {
	const escapeXml = (s: string) =>
		s
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;");

	return (
		<div
			className={cn(
				"relative overflow-hidden rounded-lg bg-card shadow-lg border border-border",
				className,
			)}
			style={{
				width: width * scale,
				height: height * scale,
			}}
		>
			<svg
				width={width}
				height={height}
				viewBox={`0 0 ${width} ${height}`}
				className="absolute inset-0 h-full w-full"
				style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
				xmlns="http://www.w3.org/2000/svg"
			>
				{elements.map((el) => {
					const op = el.opacity ?? 1;
					const rot = el.rotation ?? 0;
					const cx = (el.x ?? 0) + (el.width ?? 0) / 2;
					const cy = (el.y ?? 0) + (el.height ?? 0) / 2;
					const transform = rot ? `rotate(${rot} ${cx} ${cy})` : undefined;

					if (el.type === "rect") {
						return (
							<rect
								key={el.id}
								x={el.x}
								y={el.y}
								width={el.width}
								height={el.height}
								fill={el.fill === "none" ? "transparent" : el.fill}
								stroke={el.stroke}
								strokeWidth={el.strokeWidth}
								rx={el.cornerRadius}
								ry={el.cornerRadius}
								opacity={op}
								transform={transform}
							/>
						);
					}
					if (el.type === "circle") {
						const r =
							Math.sqrt((el.width ?? 0) ** 2 + (el.height ?? 0) ** 2) / 2;
						return (
							<circle
								key={el.id}
								cx={el.x}
								cy={el.y}
								r={r}
								fill={el.fill === "none" ? "transparent" : el.fill}
								stroke={el.stroke}
								strokeWidth={el.strokeWidth}
								opacity={op}
								transform={transform}
							/>
						);
					}
					if (el.type === "text") {
						return (
							<text
								key={el.id}
								x={el.x}
								y={el.y + (el.fontSize ?? 24)}
								fontSize={el.fontSize ?? 24}
								fontFamily={el.fontFamily ?? "Inter, sans-serif"}
								fill={el.stroke}
								opacity={op}
								transform={transform}
							>
								{escapeXml(el.text ?? "")}
							</text>
						);
					}
					if (el.type === "star") {
						// Simple star representation
						return (
							<path
								key={el.id}
								d={`M ${el.x} ${el.y} L ${el.x + 10} ${el.y + 20} L ${el.x - 10} ${el.y + 20} Z`}
								fill={el.fill === "none" ? "transparent" : el.fill}
								stroke={el.stroke}
								strokeWidth={el.strokeWidth}
								opacity={op}
								transform={transform}
							/>
						);
					}
					return null;
				})}
			</svg>
		</div>
	);
}
