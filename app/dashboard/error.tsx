"use client";

import { ErrorFallback } from "@/components/error/ErrorFallback";
import { PageContainer } from "@/components/layout/PageContainer";

export default function DashboardError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<PageContainer size="default">
			<ErrorFallback
				error={error}
				reset={reset}
				variant="compact"
				homeHref="/dashboard"
			/>
		</PageContainer>
	);
}
