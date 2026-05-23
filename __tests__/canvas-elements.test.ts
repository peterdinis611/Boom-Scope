import { describe, expect, test } from "vitest";
import type { CanvasElement } from "../components/design/KonvaCanvas";
import {
	cloneElementsForPaste,
	getDefaultVisualStyle,
	groupElementsAtIndices,
	isVisualConfigured,
	regenerateIds,
	ungroupElement,
} from "../lib/canvas-elements";

describe("Lib: Canvas Elements", () => {
	const mockRect: CanvasElement = {
		id: "1",
		type: "rect",
		x: 10,
		y: 10,
		width: 100,
		height: 50,
		stroke: "#000",
		fill: "#fff",
		strokeWidth: 2,
	};

	const mockCircle: CanvasElement = {
		id: "2",
		type: "circle",
		x: 50,
		y: 50,
		width: 40,
		height: 40,
		stroke: "#000",
		fill: "#fff",
		strokeWidth: 2,
	};

	test("regenerateIds changes ID and children IDs", () => {
		const group: CanvasElement = {
			id: "g1",
			type: "group",
			x: 0,
			y: 0,
			stroke: "none",
			fill: "none",
			strokeWidth: 0,
			children: [{ ...mockRect }],
		};

		const next = regenerateIds(group);
		expect(next.id).not.toBe("g1");
		expect(next.children?.[0].id).not.toBe("1");
	});

	test("cloneElementsForPaste offsets elements", () => {
		const elements = [mockRect];
		const offset = 50;
		const next = cloneElementsForPaste(elements, offset);

		expect(next[0].x).toBe(mockRect.x + offset);
		expect(next[0].y).toBe(mockRect.y + offset);
		expect(next[0].id).not.toBe(mockRect.id);
	});

	test("groupElementsAtIndices creates a group and shifts children", () => {
		const elements = [mockRect, mockCircle];
		const next = groupElementsAtIndices(elements, [0, 1]);

		expect(next).toHaveLength(1);
		const group = next![0];
		expect(group.type).toBe("group");
		expect(group.children).toHaveLength(2);

		// BBox of rect (10,10,110,60) and circle (50-40, 50-40, 50+40, 50+40) = (10,10, 110,60) is wrong
		// Circle bbox: x-r, y-r, x+r, y+r where r = sqrt(w*w+h*h)
		// For 40x40 circle, r = sqrt(1600+1600) = sqrt(3200) approx 56.5
		// minX = min(10, 50-56.5) = -6.5
		expect(group.x).toBeLessThanOrEqual(10);
	});

	test("ungroupElement restores children to absolute positions", () => {
		const group: CanvasElement = {
			id: "g1",
			type: "group",
			x: 100,
			y: 100,
			stroke: "none",
			fill: "none",
			strokeWidth: 0,
			children: [
				{
					...mockRect,
					x: 10,
					y: 10,
				},
			],
		};

		const next = ungroupElement([group], "g1");
		expect(next).toHaveLength(1);
		expect(next![0].x).toBe(110);
		expect(next![0].y).toBe(110);
	});

	test("groupElementsAtIndices returns null for fewer than two indices", () => {
		expect(groupElementsAtIndices([mockRect], [0])).toBeNull();
		expect(groupElementsAtIndices([mockRect, mockCircle], [])).toBeNull();
	});

	test("groupElementsAtIndices returns null when a picked element is locked", () => {
		const locked: CanvasElement = { ...mockCircle, isLocked: true };
		expect(groupElementsAtIndices([mockRect, locked], [0, 1])).toBeNull();
	});

	test("ungroupElement returns null for unknown group id", () => {
		expect(ungroupElement([mockRect], "missing")).toBeNull();
	});

	test("ungroupElement returns null for non-group element", () => {
		expect(ungroupElement([mockRect], "1")).toBeNull();
	});

	test("groupElementsAtIndices normalizes pencil points into group space", () => {
		const pencil: CanvasElement = {
			id: "p1",
			type: "pencil",
			x: 0,
			y: 0,
			points: [20, 30, 40, 50],
			stroke: "#000",
			fill: "none",
			strokeWidth: 2,
		};
		const next = groupElementsAtIndices([mockRect, pencil], [0, 1]);
		expect(next).toHaveLength(1);
		const group = next![0];
		expect(group.type).toBe("group");
		const groupedPencil = group.children?.find((c) => c.type === "pencil");
		// Pencil points are shifted by the group bbox origin (minX=10, minY=10)
		expect(groupedPencil?.points).toEqual([10, 20, 30, 40]);
		expect(groupedPencil?.x).toBe(0);
		expect(groupedPencil?.y).toBe(0);
	});
});

describe("Lib: Canvas Visual", () => {
	const baseRect: CanvasElement = {
		id: "1",
		type: "rect",
		x: 0,
		y: 0,
		width: 100,
		height: 50,
		stroke: "transparent",
		fill: "none",
		strokeWidth: 0,
	};

	test("isVisualConfigured is false for undefined element", () => {
		expect(isVisualConfigured(undefined)).toBe(false);
	});

	test("isVisualConfigured is false when fill is none and stroke width is zero", () => {
		expect(isVisualConfigured(baseRect)).toBe(false);
	});

	test("isVisualConfigured is true when fill is set", () => {
		expect(isVisualConfigured({ ...baseRect, fill: "#ff0000" })).toBe(true);
	});

	test("isVisualConfigured is true when stroke width is greater than zero", () => {
		expect(
			isVisualConfigured({ ...baseRect, fill: "none", strokeWidth: 1 }),
		).toBe(true);
	});

	test("getDefaultVisualStyle returns primary stroke and fill", () => {
		expect(getDefaultVisualStyle()).toEqual({
			fillType: "solid",
			fill: "var(--primary)",
			stroke: "var(--primary)",
			strokeWidth: 2,
			opacity: 1,
		});
	});
});
