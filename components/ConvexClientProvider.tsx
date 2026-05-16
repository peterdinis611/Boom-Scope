"use client";

import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
import { ConvexReactClient } from "convex/react";
import type { ReactNode } from "react";

import { AccentProvider } from "./AccentProvider";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function ConvexClientProvider({
	children,
}: {
	children: ReactNode;
}) {
	return (
		<ConvexAuthNextjsProvider client={convex}>
			<AccentProvider>{children}</AccentProvider>
		</ConvexAuthNextjsProvider>
	);
}
