"use client";

import { useSearchParams } from "next/navigation";
import { LinkLibrary } from "@/components/links/link-library";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import type { Id } from "@/convex/_generated/dataModel";

export function LinksPageClient() {
	const searchParams = useSearchParams();
	const projectIdParam = searchParams.get("projectId");

	return (
		<PageContainer className="space-y-6">
			<PageHeader
				title="Link Hub"
				description="Save important links for projects — docs, tools, references, and other resources in one place."
			/>
			<LinkLibrary
				defaultProjectId={
					projectIdParam ? (projectIdParam as Id<"projects">) : undefined
				}
			/>
		</PageContainer>
	);
}
