"use client";

import { usePathname } from "next/navigation";
import { ErrorFallback } from "@/components/error/ErrorFallback";

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	const pathname = usePathname();
	const homeHref = pathname.startsWith("/dashboard") ? "/dashboard" : "/";

	return (
		<ErrorFallback
			error={error}
			reset={reset}
			variant="page"
			homeHref={homeHref}
		/>
	);
}
