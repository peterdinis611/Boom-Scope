"use client";

import type Konva from "konva";

import "konva/lib/shapes/Transformer";
import "konva/lib/shapes/Rect";
import "konva/lib/shapes/Circle";
import "konva/lib/shapes/Line";
import "konva/lib/shapes/Text";

import type { KonvaEventObject } from "konva/lib/Node";
import { Trash2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import {
	Arrow,
	Circle,
	Group as KonvaGroup,
	Image as KonvaImage,
	Layer,
	Line,
	Rect,
	RegularPolygon,
	Stage,
	Star,
	Text,
	Transformer,
} from "react-konva";
import useImage from "use-image";
import { getCSSVariable } from "@/lib/utils";

export interface CanvasElement {
	id: string;
	type: string;
	x: number;
	y: number;
	width?: number;
	height?: number;
	points?: number[];
	stroke: string;
	fill: string;
	strokeWidth: number;
	rotation?: number;
	opacity?: number;
	cornerRadius?: number;
	text?: string;
	fontSize?: number;
	fontFamily?: string;
	src?: string;
	globalCompositeOperation?: string;
	isLocked?: boolean;
	isVisible?: boolean;
	fillType?: "solid" | "gradient";
	gradientStart?: { x: number; y: number };
	gradientEnd?: { x: number; y: number };
	gradientColors?: string[];
	dash?: number[];
	shadowBlur?: number;
	children?: CanvasElement[];
}

interface KonvaCanvasProps {
	activeTool?: string;
	elements: CanvasElement[];
	commitElements: (next: CanvasElement[]) => void;
	selectedIds: string[];
	onSelectionChange: (ids: string[]) => void;
	onElementPointer: (id: string, opts: { shiftKey: boolean }) => void;
	strokeColor?: string;
	fillColor?: string;
	strokeWidth?: number;
	snapToGrid?: boolean;
	canvasSize?: { width: number; height: number } | null;
	zoom: number;
	setZoom: (zoom: number | ((prev: number) => number)) => void;
	artboardColor?: string | null;
	readOnly?: boolean;
}

const GRID_SIZE = 20;

export default function KonvaCanvas({
	activeTool = "select",
	elements,
	commitElements,
	selectedIds,
	onSelectionChange,
	onElementPointer,
	strokeColor = "var(--primary)",
	fillColor = "none",
	strokeWidth = 2,
	snapToGrid = true,
	canvasSize,
	zoom,
	setZoom,
	artboardColor,
	readOnly = false,
}: KonvaCanvasProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const stageRef = useRef<Konva.Stage>(null);
	const transformerRef = useRef<Konva.Transformer>(null);
	const [size, setSize] = useState({ width: 0, height: 0 });
	const [isDrawing, setIsDrawing] = useState(false);
	const [newElement, setNewElement] = useState<CanvasElement | null>(null);
	const [contextMenu, setContextMenu] = useState<{
		x: number;
		y: number;
		elementId: string;
	} | null>(null);
	const [selectionBox, setSelectionBox] = useState<{
		x: number;
		y: number;
		width: number;
		height: number;
		active: boolean;
		startX: number;
		startY: number;
	} | null>(null);
	const { resolvedTheme } = useTheme();
	const isDark = resolvedTheme === "dark";

	const elementsRef = useRef(elements);

	useEffect(() => {
		elementsRef.current = elements;
	}, [elements]);

	// Handle stage resizing
	useEffect(() => {
		if (!containerRef.current) return;

		const observeTarget = containerRef.current;
		const resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				setSize({
					width: entry.contentRect.width,
					height: entry.contentRect.height,
				});
			}
		});

		resizeObserver.observe(observeTarget);
		return () => resizeObserver.unobserve(observeTarget);
	}, []);

	// Center stage when canvasSize changes
	useEffect(() => {
		if (canvasSize && stageRef.current) {
			const stage = stageRef.current;
			const scale = Math.min(
				(size.width * 0.8) / canvasSize.width,
				(size.height * 0.8) / canvasSize.height,
				1,
			);

			stage.scale({ x: scale, y: scale });
			setZoom(scale);
			stage.position({
				x: (size.width - canvasSize.width * scale) / 2,
				y: (size.height - canvasSize.height * scale) / 2,
			});
		}
	}, [canvasSize, size.width, size.height, setZoom]);

	// Update stage scale when zoom prop changes
	useEffect(() => {
		if (stageRef.current) {
			stageRef.current.scale({ x: zoom, y: zoom });
		}
	}, [zoom]);

	// Handle transformer selection
	useEffect(() => {
		if (transformerRef.current && selectedIds.length > 0 && stageRef.current) {
			const nodes = selectedIds
				.map((sid) => stageRef.current?.findOne(`#${sid}`))
				.filter(
					(n): n is NonNullable<typeof n> => n !== null && n !== undefined,
				);
			const locked = selectedIds.some((sid) => {
				const element = elementsRef.current.find((el) => el.id === sid);
				return element?.isLocked || element?.isVisible === false;
			});

			if (nodes.length > 0 && !locked) {
				if (typeof transformerRef.current.nodes === "function") {
					transformerRef.current.nodes(nodes);
					transformerRef.current.getLayer()!.batchDraw();
				}
			} else {
				if (typeof transformerRef.current.nodes === "function") {
					transformerRef.current.nodes([]);
				}
				if (locked) {
					onSelectionChange([]);
				}
			}
		} else if (transformerRef.current) {
			if (typeof transformerRef.current.nodes === "function") {
				transformerRef.current.nodes([]);
			}
		}
	}, [selectedIds, onSelectionChange]);

	const snap = (val: number) => {
		return snapToGrid ? Math.round(val / GRID_SIZE) * GRID_SIZE : val;
	};

	const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
		if (readOnly) return;
		const clickedOnStage = e.target === e.target.getStage();
		
		if (clickedOnStage && activeTool === "select") {
			onSelectionChange([]);
			const stage = e.target.getStage();
			if (stage) {
				const pos = stage.getRelativePointerPosition();
				if (pos) {
					setSelectionBox({
						x: pos.x,
						y: pos.y,
						width: 0,
						height: 0,
						active: true,
						startX: pos.x,
						startY: pos.y,
					});
				}
			}
			return;
		}

		if (clickedOnStage && activeTool === "hand") {
			onSelectionChange([]);
			return;
		}

		if (activeTool === "select" || activeTool === "hand") return;

		onSelectionChange([]);
		const stage = e.target.getStage();
		if (!stage) return;

		const pos = stage.getRelativePointerPosition();
		if (!pos) return;

		const snappedX = snap(pos.x);
		const snappedY = snap(pos.y);

		setIsDrawing(true);
		const id = `el-${Date.now()}`;
		const isFreeHand = activeTool === "pencil" || activeTool === "eraser";

		const element: CanvasElement = {
			id,
			type: activeTool === "eraser" ? "pencil" : activeTool,
			x: isFreeHand ? 0 : snappedX,
			y: isFreeHand ? 0 : snappedY,
			stroke:
				activeTool === "eraser"
					? isDark
						? "#000000"
						: "#ffffff"
					: strokeColor,
			fill: activeTool === "eraser" ? "none" : fillColor,
			strokeWidth: activeTool === "eraser" ? strokeWidth * 2 : strokeWidth,
			rotation: 0,
			opacity: 1,
			isVisible: true,
			isLocked: false,
			globalCompositeOperation:
				activeTool === "eraser" ? "destination-out" : "source-over",
		};

		if (isFreeHand) {
			element.points = [pos.x, pos.y];
		} else if (activeTool === "text") {
			element.text = "Napíšte text...";
			element.fontSize = 24;
			element.fontFamily = "Inter, sans-serif";
			setIsDrawing(false);
			commitElements([...elementsRef.current, element]);
			onSelectionChange([id]);
			return;
		} else {
			element.width = 0;
			element.height = 0;
		}

		setNewElement(element);
	};

	const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
		const stage = e.target.getStage();
		if (!stage) return;

		if (selectionBox?.active) {
			const pos = stage.getRelativePointerPosition();
			if (!pos) return;
			setSelectionBox({
				...selectionBox,
				x: Math.min(pos.x, selectionBox.startX),
				y: Math.min(pos.y, selectionBox.startY),
				width: Math.abs(pos.x - selectionBox.startX),
				height: Math.abs(pos.y - selectionBox.startY),
			});
			return;
		}

		if (readOnly || !isDrawing || !newElement) return;

		const pos = stage.getRelativePointerPosition();
		if (!pos) return;

		if (activeTool === "pencil" || activeTool === "eraser") {
			setNewElement({
				...newElement,
				points: [...(newElement.points || []), pos.x, pos.y],
			});
		} else {
			let width = snap(pos.x - newElement.x);
			let height = snap(pos.y - newElement.y);

			if (e.evt.shiftKey) {
				const size = Math.max(Math.abs(width), Math.abs(height));
				width = width < 0 ? -size : size;
				height = height < 0 ? -size : size;
			}

			setNewElement({
				...newElement,
				width,
				height,
			});
		}
	};

	const handleMouseUp = () => {
		if (selectionBox?.active) {
			const box = {
				minX: selectionBox.x,
				minY: selectionBox.y,
				maxX: selectionBox.x + selectionBox.width,
				maxY: selectionBox.y + selectionBox.height,
			};

			const newSelection = elementsRef.current.filter((el) => {
				if (el.isLocked || el.isVisible === false) return false;
				
				if (el.type === "pencil" && el.points) {
					for (let i = 0; i < el.points.length; i += 2) {
						const px = el.points[i] + el.x;
						const py = el.points[i + 1] + el.y;
						if (px >= box.minX && px <= box.maxX && py >= box.minY && py <= box.maxY) {
							return true;
						}
					}
					return false;
				}

				const elMinX = el.x;
				const elMinY = el.y;
				const elMaxX = el.x + (el.width || 0);
				const elMaxY = el.y + (el.height || 0);
				
				const nx1 = Math.min(elMinX, elMaxX);
				const ny1 = Math.min(elMinY, elMaxY);
				const nx2 = Math.max(elMinX, elMaxX);
				const ny2 = Math.max(elMinY, elMaxY);

				return !(
					box.maxX < nx1 ||
					box.minX > nx2 ||
					box.maxY < ny1 ||
					box.minY > ny2
				);
			}).map((el) => el.id);

			onSelectionChange(newSelection);
			setSelectionBox(null);
			return;
		}

		if (!isDrawing || !newElement) return;

		commitElements([...elementsRef.current, newElement]);
		setNewElement(null);
		setIsDrawing(false);
	};

	const handleTransformEnd = (e: KonvaEventObject<Event>) => {
		const transformer = transformerRef.current;
		if (!transformer) return;

		const nodes = transformer.nodes();
		if (nodes.length === 0) return;

		const updateNested = (items: CanvasElement[]): CanvasElement[] =>
			items.map((el) => {
				const node = nodes.find((n) => n.id() === el.id);
				if (node) {
					const scaleX = node.scaleX();
					const scaleY = node.scaleY();

					node.scaleX(1);
					node.scaleY(1);

					if (el.type === "pencil" && el.points) {
						return {
							...el,
							x: snap(node.x()),
							y: snap(node.y()),
							rotation: node.rotation(),
							points: el.points.map((p, i) =>
								i % 2 === 0 ? p * scaleX : p * scaleY
							),
						};
					}

					if (el.type === "text") {
						return {
							...el,
							x: snap(node.x()),
							y: snap(node.y()),
							rotation: node.rotation(),
							width: el.width ? snap(Math.max(5, el.width * scaleX)) : undefined,
							height: el.height ? snap(Math.max(5, el.height * scaleY)) : undefined,
							fontSize: (el.fontSize || 24) * scaleY,
						};
					}

					return {
						...el,
						x: snap(node.x()),
						y: snap(node.y()),
						rotation: node.rotation(),
						width: el.width ? snap(Math.max(5, el.width * scaleX)) : el.width,
						height: el.height
							? snap(Math.max(5, el.height * scaleY))
							: el.height,
					};
				}
				if (el.type === "group" && el.children?.length) {
					return { ...el, children: updateNested(el.children) };
				}
				return el;
			});

		commitElements(updateNested(elementsRef.current));
	};

	const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
		const id = e.target.id();
		const nx = snap(e.target.x());
		const ny = snap(e.target.y());

		const updateNested = (items: CanvasElement[]): CanvasElement[] =>
			items.map((el) => {
				if (el.id === id) {
					return { ...el, x: nx, y: ny };
				}
				if (el.type === "group" && el.children?.length) {
					return { ...el, children: updateNested(el.children) };
				}
				return el;
			});

		commitElements(updateNested(elementsRef.current));
	};

	const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
		e.evt.preventDefault();
		const stage = stageRef.current;
		if (!stage) return;

		// Handle Panning (Standard Scroll)
		if (!e.evt.ctrlKey && !e.evt.metaKey) {
			const dx = -e.evt.deltaX;
			const dy = -e.evt.deltaY;
			stage.position({
				x: stage.x() + dx,
				y: stage.y() + dy,
			});
			return;
		}

		// Handle Zooming (Ctrl/Cmd + Scroll)
		const oldScale = stage.scaleX();
		const pointer = stage.getPointerPosition();
		if (!pointer) return;

		const mousePointTo = {
			x: (pointer.x - stage.x()) / oldScale,
			y: (pointer.y - stage.y()) / oldScale,
		};

		const direction = e.evt.deltaY > 0 ? 1 : -1;
		const scaleBy = 1.1;
		const newScale = direction > 0 ? oldScale / scaleBy : oldScale * scaleBy;

		// Limit zoom
		const finalScale = Math.max(0.1, Math.min(5, newScale));
		stage.scale({ x: finalScale, y: finalScale });
		setZoom(finalScale);

		const newPos = {
			x: pointer.x - mousePointTo.x * finalScale,
			y: pointer.y - mousePointTo.y * finalScale,
		};
		stage.position(newPos);
	};

	const handleContextMenu = (e: KonvaEventObject<PointerEvent>) => {
		e.evt.preventDefault();
		const stage = stageRef.current;
		if (!stage) return;

		const pointer = stage.getPointerPosition();
		if (!pointer) return;

		const clickedOnElement = e.target !== stage;
		if (clickedOnElement) {
			const id = e.target.id();
			if (id) {
				setContextMenu({
					x: pointer.x,
					y: pointer.y,
					elementId: id,
				});
				onSelectionChange([id]);
			}
		} else {
			setContextMenu(null);
		}
	};

	useEffect(() => {
		const handleClickOutside = () => setContextMenu(null);
		window.addEventListener("click", handleClickOutside);
		return () => window.removeEventListener("click", handleClickOutside);
	}, []);

	const renderGrid = () => {
		const lines = [];
		const width = size.width * 10;
		const height = size.height * 10;
		const stroke = isDark ? "#ffffff" : "#000000";
		const opacity = isDark ? 0.05 : 0.2;

		for (let i = -width; i < width; i += GRID_SIZE) {
			lines.push(
				<Line
					key={`v-${i}`}
					points={[i, -height, i, height]}
					stroke={stroke}
					strokeWidth={0.2}
					opacity={opacity}
					listening={false}
				/>,
			);
		}
		for (let j = -height; j < height; j += GRID_SIZE) {
			lines.push(
				<Line
					key={`h-${j}`}
					points={[-width, j, width, j]}
					stroke={stroke}
					strokeWidth={0.2}
					opacity={opacity}
					listening={false}
				/>,
			);
		}
		return lines;
	};

	return (
		<div
			ref={containerRef}
			className="h-full w-full bg-background relative overflow-hidden"
		>
			<Stage
				ref={stageRef}
				width={size.width}
				height={size.height}
				onMouseDown={handleMouseDown}
				onMouseMove={handleMouseMove}
				onMouseUp={readOnly ? undefined : handleMouseUp}
				onWheel={handleWheel}
				onContextMenu={
					readOnly ? (e) => e.evt.preventDefault() : handleContextMenu
				}
				draggable={
					!readOnly && (activeTool === "select" || activeTool === "hand")
				}
				style={{
					cursor: readOnly
						? "default"
						: activeTool === "hand"
							? "grab"
							: "default",
				}}
			>
				{/* Background Grid Layer */}
				<Layer listening={false}>{renderGrid()}</Layer>

				{/* Artboard Background */}
				{canvasSize && (
					<Layer listening={false}>
						<Rect
							x={0}
							y={0}
							width={canvasSize.width}
							height={canvasSize.height}
							fill={artboardColor || (isDark ? "#18181b" : "#ffffff")}
							shadowColor="black"
							shadowBlur={20}
							shadowOpacity={0.1}
							shadowOffset={{ x: 0, y: 10 }}
						/>
					</Layer>
				)}

				{/* Main Drawing Layer */}
				<Layer>
					{elements.map((el) => (
						<RenderElement
							key={el.id}
							element={el}
							isSelected={selectedIds.includes(el.id)}
							activeTool={activeTool}
							reportSelect={(shiftKey) => {
								if (
									activeTool === "select" &&
									!el.isLocked &&
									el.isVisible !== false
								) {
									onElementPointer(el.id, { shiftKey });
								}
							}}
							onDragEnd={handleDragEnd}
							draggable={
								activeTool === "select" &&
								!el.isLocked &&
								el.isVisible !== false
							}
						/>
					))}
					{newElement && (
						<RenderElement
							element={newElement}
							isSelected={false}
							activeTool={activeTool}
						/>
					)}

					{selectionBox?.active && (
						<Rect
							x={selectionBox.x}
							y={selectionBox.y}
							width={selectionBox.width}
							height={selectionBox.height}
							fill={getCSSVariable("--primary")}
							opacity={0.1}
							stroke={getCSSVariable("--primary")}
							strokeWidth={1}
						/>
					)}

					{activeTool === "select" && (
						<Transformer
							ref={transformerRef}
							onTransformEnd={handleTransformEnd}
							boundBoxFunc={(oldBox, newBox) => {
								if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
									return oldBox;
								}
								return newBox;
							}}
							anchorSize={10}
							anchorCornerRadius={3}
							anchorStroke={getCSSVariable("--primary")}
							anchorFill="#ffffff"
							borderStroke={getCSSVariable("--primary")}
							borderStrokeWidth={1}
							rotateAnchorOffset={20}
						/>
					)}
				</Layer>
			</Stage>

			{/* Context Menu */}
			{contextMenu && (
				<div
					className="absolute z-[100] bg-background/80 backdrop-blur-2xl border border-border rounded-2xl shadow-2xl p-1.5 min-w-[180px] animate-in zoom-in-95 duration-200"
					style={{ top: contextMenu.y, left: contextMenu.x }}
				>
					<button
						className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-500 transition-all group"
						onClick={(e) => {
							e.stopPropagation();
							commitElements(
								elementsRef.current.filter(
									(el) => el.id !== contextMenu.elementId,
								),
							);
							if (selectedIds.includes(contextMenu.elementId))
								onSelectionChange([]);
							setContextMenu(null);
						}}
					>
						<span className="text-[10px] font-black uppercase tracking-widest">
							Vymazať objekt
						</span>
						<Trash2 className="size-3.5 opacity-50 group-hover:opacity-100" />
					</button>
				</div>
			)}
		</div>
	);
}

function RenderElement({
	element: el,
	isSelected,
	activeTool = "select",
	reportSelect,
	onDragEnd,
	draggable,
}: {
	element: CanvasElement;
	isSelected: boolean;
	activeTool?: string;
	reportSelect?: (shiftKey: boolean) => void;
	onDragEnd?: (e: KonvaEventObject<DragEvent>) => void;
	draggable?: boolean;
}) {
	const [image] = useImage(el.src || "");

	if (el.isVisible === false) return null;

	const clickSelect =
		reportSelect &&
		((ev: KonvaEventObject<Event>) => {
			ev.cancelBubble = true;
			const e = ev.evt as MouseEvent | PointerEvent | KeyboardEvent;
			const shift = "shiftKey" in e ? Boolean(e.shiftKey) : false;
			reportSelect(shift);
		});

	const commonProps = {
		id: el.id,
		x: el.x,
		y: el.y,
		stroke: el.stroke?.startsWith("var")
			? getCSSVariable(el.stroke.slice(4, -1))
			: el.stroke,
		fill:
			el.fillType === "gradient"
				? undefined
				: el.fill === "none"
					? undefined
					: el.fill?.startsWith("var")
						? getCSSVariable(el.fill.slice(4, -1))
						: el.fill,
		fillLinearGradientStartPoint:
			el.fillType === "gradient"
				? el.gradientStart || { x: 0, y: 0 }
				: undefined,
		fillLinearGradientEndPoint:
			el.fillType === "gradient"
				? el.gradientEnd || { x: el.width || 100, y: el.height || 100 }
				: undefined,
		fillLinearGradientColorStops:
			el.fillType === "gradient"
				? [
						0,
						el.gradientColors?.[0]?.startsWith("var")
							? getCSSVariable(el.gradientColors[0].slice(4, -1))
							: el.gradientColors?.[0] || getCSSVariable("--primary"),
						1,
						el.gradientColors?.[1]?.startsWith("var")
							? getCSSVariable(el.gradientColors[1].slice(4, -1))
							: el.gradientColors?.[1] || getCSSVariable("--success"),
					]
				: undefined,
		strokeWidth: el.strokeWidth,
		dash: el.dash,
		rotation: el.rotation || 0,
		opacity: el.opacity ?? 1,
		onClick: clickSelect,
		onTap: clickSelect,
		draggable: draggable,
		onDragEnd: onDragEnd,
		shadowColor: isSelected ? getCSSVariable("--primary") : "#000000",
		shadowBlur: isSelected ? 15 : el.shadowBlur || 0,
		shadowOpacity: isSelected ? 0.5 : el.shadowBlur ? 0.3 : 0,
		globalCompositeOperation:
			el.globalCompositeOperation as GlobalCompositeOperation,
	};

	if (el.type === "group" && el.children?.length) {
		return (
			<KonvaGroup
				id={el.id}
				x={el.x}
				y={el.y}
				rotation={el.rotation || 0}
				opacity={el.opacity ?? 1}
				draggable={draggable}
				onDragEnd={onDragEnd}
				onClick={
					reportSelect
						? (ev: KonvaEventObject<Event>) => {
								ev.cancelBubble = true;
								const e = ev.evt as MouseEvent | PointerEvent;
								reportSelect("shiftKey" in e ? Boolean(e.shiftKey) : false);
							}
						: undefined
				}
				onTap={
					reportSelect
						? (ev: KonvaEventObject<Event>) => {
								ev.cancelBubble = true;
								const e = ev.evt as MouseEvent | PointerEvent | TouchEvent;
								reportSelect("shiftKey" in e ? Boolean(e.shiftKey) : false);
							}
						: undefined
				}
				globalCompositeOperation={
					el.globalCompositeOperation as GlobalCompositeOperation
				}
			>
				{el.children.map((child) => (
					<RenderElement
						key={child.id}
						element={child}
						isSelected={false}
						activeTool={activeTool}
						reportSelect={(shiftKey) => {
							if (
								activeTool === "select" &&
								!child.isLocked &&
								child.isVisible !== false
							) {
								reportSelect?.(shiftKey);
							}
						}}
						draggable={false}
					/>
				))}
			</KonvaGroup>
		);
	}

	if (el.type === "rect") {
		return (
			<Rect
				{...commonProps}
				width={el.width}
				height={el.height}
				cornerRadius={el.cornerRadius}
			/>
		);
	}

	if (el.type === "circle") {
		const radius = Math.max(Math.abs(el.width || 0), Math.abs(el.height || 0)) / 2;
		return (
			<Circle 
				{...commonProps} 
				radius={radius} 
				offsetX={-(el.width || 0) / 2}
				offsetY={-(el.height || 0) / 2}
			/>
		);
	}

	if (el.type === "triangle") {
		return (
			<RegularPolygon
				{...commonProps}
				sides={3}
				radius={Math.max(Math.abs(el.width || 0), Math.abs(el.height || 0)) / 2}
				offsetX={-(el.width || 0) / 2}
				offsetY={-(el.height || 0) / 2}
			/>
		);
	}

	if (el.type === "polygon") {
		return (
			<RegularPolygon
				{...commonProps}
				sides={6}
				radius={Math.max(Math.abs(el.width || 0), Math.abs(el.height || 0)) / 2}
				offsetX={-(el.width || 0) / 2}
				offsetY={-(el.height || 0) / 2}
			/>
		);
	}

	if (el.type === "pencil") {
		return (
			<Line
				{...commonProps}
				points={el.points}
				tension={0.5}
				lineCap="round"
				lineJoin="round"
			/>
		);
	}

	if (el.type === "text") {
		return (
			<Text
				{...commonProps}
				text={el.text}
				fontSize={el.fontSize}
				fontFamily={el.fontFamily || "Inter, sans-serif"}
				fontStyle="bold"
				fill={el.stroke}
				width={el.width}
				height={el.height}
			/>
		);
	}

	if (el.type === "image" && image) {
		return (
			<KonvaImage
				{...commonProps}
				image={image}
				width={el.width}
				height={el.height}
			/>
		);
	}

	if (el.type === "star") {
		const outerRadius = Math.max(Math.abs(el.width || 0), Math.abs(el.height || 0)) / 2;
		return (
			<Star
				{...commonProps}
				innerRadius={outerRadius / 2}
				outerRadius={outerRadius}
				numPoints={5}
				offsetX={-(el.width || 0) / 2}
				offsetY={-(el.height || 0) / 2}
			/>
		);
	}

	if (el.type === "arrow") {
		return (
			<Arrow
				{...commonProps}
				points={[0, 0, el.width || 0, el.height || 0]}
				pointerLength={20}
				pointerWidth={20}
			/>
		);
	}

	return null;
}
