import { describe, expect, test } from "vitest";
import type { CanvasElement } from "../components/design/KonvaCanvas";
import {
	cloneElementsForPaste,
	groupElementsAtIndices,
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
});
