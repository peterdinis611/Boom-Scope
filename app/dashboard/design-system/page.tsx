import type { Route } from "next";
import { redirect } from "next/navigation";

type PageProps = {
	searchParams: Promise<{ projectId?: string; systemId?: string }>;
};

export default async function DesignSystemLegacyPage({
	searchParams,
}: PageProps) {
	const params = await searchParams;
	const query = new URLSearchParams();
	if (params.projectId) query.set("projectId", params.projectId);
	if (params.systemId) query.set("systemId", params.systemId);
	const suffix = query.toString() ? `?${query.toString()}` : "";
	redirect(`/dashboard/design-system/v2${suffix}` as Route);
}
