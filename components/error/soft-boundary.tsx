"use client";

import { Component, type ReactNode } from "react";

type SoftBoundaryProps = {
	children: ReactNode;
	fallback?: ReactNode;
};

type SoftBoundaryState = {
	hasError: boolean;
};

/** Catches render/query errors so one missing Convex function doesn't take down the layout. */
export class SoftBoundary extends Component<
	SoftBoundaryProps,
	SoftBoundaryState
> {
	state: SoftBoundaryState = { hasError: false };

	static getDerivedStateFromError(): SoftBoundaryState {
		return { hasError: true };
	}

	render() {
		if (this.state.hasError) {
			return this.props.fallback ?? null;
		}
		return this.props.children;
	}
}
