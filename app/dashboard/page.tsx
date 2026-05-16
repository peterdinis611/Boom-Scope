import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { Suspense } from "react";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { DashboardContent } from "@/components/dashboard/dashboard-content-client";
import { api } from "@/convex/_generated/api";

async function getCachedViewer(token: string | undefined) {
	"use cache";
	return fetchQuery(api.users.viewer, {}, { token });
}

export default async function DashboardPage() {
	const token = await convexAuthNextjsToken();
	const viewer = await getCachedViewer(token);

	return (
		<Suspense fallback={<DashboardSkeleton />}>
			<DashboardContent viewer={viewer} />
		</Suspense>
	);
}
