"use client";

import { ErrorFallback } from "@/components/error/ErrorFallback";
import "./globals.css";

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<html lang="sk">
			<body className="min-h-full font-sans antialiased">
				<ErrorFallback
					error={error}
					reset={reset}
					variant="fullscreen"
					homeHref="/"
					showBack={false}
				/>
			</body>
		</html>
	);
}
