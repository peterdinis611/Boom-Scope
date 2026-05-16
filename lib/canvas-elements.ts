import type { CanvasElement } from "@/components/design/KonvaCanvas";

export function regenerateIds(el: CanvasElement): CanvasElement {
	const id = `el-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
	if (el.type === "group" && el.children?.length) {
		return {
			...el,
			id,
			children: el.children.map(regenerateIds),
		};
	}
	return { ...el, id };
}

export function cloneElementsForPaste(
	roots: CanvasElement[],
	offset = 20,
): CanvasElement[] {
	return roots.map((el) => {
		const dup = regenerateIds(el);
		return {
			...dup,
			x: dup.x + offset,
			y: dup.y + offset,
		};
	});
}

function bboxOf(elements: CanvasElement[]): {
	minX: number;
	minY: number;
	maxX: number;
	maxY: number;
} {
	let minX = Infinity;
	let minY = Infinity;
	let maxX = -Infinity;
	let maxY = -Infinity;

	const expand = (left: number, top: number, right: number, bottom: number) => {
		minX = Math.min(minX, left);
		minY = Math.min(minY, top);
		maxX = Math.max(maxX, right);
		maxY = Math.max(maxY, bottom);
	};

	for (const el of elements) {
		if (el.type === "pencil" && el.points?.length) {
			for (let i = 0; i < el.points.length; i += 2) {
				const px = el.points[i] ?? 0;
				const py = el.points[i + 1] ?? 0;
				expand(px, py, px, py);
			}
			continue;
		}
		const w = el.width ?? 0;
		const h = el.height ?? 0;
		if (el.type === "circle") {
			const r = Math.sqrt(w * w + h * h);
			expand(el.x - r, el.y - r, el.x + r, el.y + r);
			continue;
		}
		if (el.type === "group" && el.children?.length) {
			const inner = bboxOf(el.children);
			expand(
				el.x + inner.minX,
				el.y + inner.minY,
				el.x + inner.maxX,
				el.y + inner.maxY,
			);
			continue;
		}
		expand(el.x, el.y, el.x + Math.abs(w), el.y + Math.abs(h));
	}

	if (!Number.isFinite(minX)) {
		return { minX: 0, minY: 0, maxX: 100, maxY: 100 };
	}
	return { minX, minY, maxX, maxY };
}

/** Top-level indices to replace with one group */
export function groupElementsAtIndices(
	elements: CanvasElement[],
	indices: number[],
): CanvasElement[] | null {
	const sorted = [...new Set(indices)]
		.filter((i) => i >= 0)
		.sort((a, b) => a - b);
	if (sorted.length < 2) return null;

	const picked = sorted.map((i) => elements[i]).filter(Boolean);
	if (picked.some((p) => p.isLocked)) return null;

	const { minX, minY, maxX, maxY } = bboxOf(picked);
	const width = Math.max(1, maxX - minX);
	const height = Math.max(1, maxY - minY);

	const children: CanvasElement[] = picked.map((el) => {
		if (el.type === "group" && el.children) {
			return {
				...el,
				x: el.x - minX,
				y: el.y - minY,
				children: el.children.map((c) => ({ ...c })),
			};
		}
		if (el.type === "pencil" && el.points?.length) {
			const shifted = el.points.map((v, i) =>
				i % 2 === 0 ? v - minX : v - minY,
			);
			return {
				...el,
				x: 0,
				y: 0,
				points: shifted,
			};
		}
		return {
			...el,
			x: el.x - minX,
			y: el.y - minY,
		};
	});

	const group: CanvasElement = {
		id: `el-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
		type: "group",
		x: minX,
		y: minY,
		width,
		height,
		stroke: "transparent",
		fill: "none",
		strokeWidth: 0,
		rotation: 0,
		opacity: 1,
		isVisible: true,
		isLocked: false,
		children,
	};

	const next = elements.filter((_, i) => !sorted.includes(i));
	next.push(group);
	return next;
}

export function ungroupElement(
	elements: CanvasElement[],
	groupId: string,
): CanvasElement[] | null {
	const idx = elements.findIndex((e) => e.id === groupId);
	if (idx === -1) return null;
	const g = elements[idx];
	if (g.type !== "group" || !g.children?.length) return null;

	const absChildren = g.children.map((child) => {
		if (child.type === "pencil" && child.points?.length) {
			const shifted = child.points.map((v, i) =>
				i % 2 === 0 ? v + g.x : v + g.y,
			);
			return {
				...child,
				x: 0,
				y: 0,
				points: shifted,
			};
		}
		return {
			...child,
			x: child.x + g.x,
			y: child.y + g.y,
			rotation: (child.rotation ?? 0) + (g.rotation ?? 0),
			opacity: (child.opacity ?? 1) * (g.opacity ?? 1),
		};
	});

	const next = [
		...elements.slice(0, idx),
		...absChildren,
		...elements.slice(idx + 1),
	];
	return next;
}
