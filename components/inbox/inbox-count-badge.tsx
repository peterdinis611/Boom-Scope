"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SoftBoundary } from "@/components/error/soft-boundary";

function InboxCountBadgeInner() {
	const inboxCount = useQuery(api.inbox.openCount);
	if (inboxCount === undefined || inboxCount <= 0) return null;

	return (
		<span className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-semibold text-primary-foreground">
			{inboxCount > 9 ? "9+" : inboxCount}
		</span>
	);
}

export function InboxCountBadge() {
	return (
		<SoftBoundary>
			<InboxCountBadgeInner />
		</SoftBoundary>
	);
}
