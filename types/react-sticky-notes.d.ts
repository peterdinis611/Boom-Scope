declare module "@react-latest-ui/react-sticky-notes" {
	import type { Component } from "react";

	export type ReactStickyNote = {
		id?: string;
		color?: string;
		text?: string;
		selected?: boolean;
		position?: { x: number; y: number };
	};

	export type ReactStickyNotesProps = {
		sessionKey?: string | null;
		colorCodes?: string[];
		colors?: string[];
		notes?: ReactStickyNote[];
		containerWidth?: string;
		containerHeight?: string;
		noteWidth?: number;
		noteHeight?: number;
		footer?: boolean;
		navbar?: boolean;
		useCSS?: boolean;
		useMaterialIcons?: boolean;
		onBeforeChange?: (
			type: string,
			payload: Record<string, unknown>,
			notes: ReactStickyNote[],
		) => Record<string, unknown>;
		onChange?: (
			type: string,
			payload: Record<string, unknown>,
			notes: ReactStickyNote[],
		) => void;
	};

	export default class ReactStickyNotes extends Component<ReactStickyNotesProps> {}
}
