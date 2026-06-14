"use client";

import { AlertCircle, ChevronDown, ChevronUp, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorReport {
	message: string;
	digest?: string;
	stack?: string;
	url: string;
	userAgent: string;
	timestamp: string;
	appVersion: string;
	environment: string;
	sessionDuration: number;
	referrer: string;
	viewport: string;
	memoryMB?: number;
}

function collectErrorReport(error: Error & { digest?: string }): ErrorReport {
	const now = new Date();
	const memory = (performance as { memory?: { usedJSHeapSize: number } })
		.memory;
	const memoryMB = memory
		? Math.round(memory.usedJSHeapSize / 1024 / 1024)
		: undefined;

	return {
		message: error.message,
		digest: error.digest,
		stack: error.stack,
		url: window.location.href,
		userAgent: navigator.userAgent,
		timestamp: now.toISOString(),
		appVersion: process.env.NEXT_PUBLIC_APP_VERSION ?? "unknown",
		environment: process.env.NODE_ENV,
		sessionDuration: Math.round(performance.now() / 1000),
		referrer: document.referrer || "(direct)",
		viewport: `${window.innerWidth}×${window.innerHeight}`,
		memoryMB,
	};
}

function logError(error: Error & { digest?: string }): void {
	const report = collectErrorReport(error);
	console.group(
		`%cGlobalError  %c${report.timestamp}`,
		"color:#ef4444;font-weight:700;font-size:13px",
		"color:#6b7280;font-weight:400;font-size:11px",
	);
	console.error("Error:", error);
	console.groupCollapsed("Context");
	console.table({
		URL: report.url,
		Digest: report.digest ?? "—",
		Environment: report.environment,
		"App Version": report.appVersion,
		"Session Age": `${report.sessionDuration}s`,
		Referrer: report.referrer,
		Viewport: report.viewport,
		...(report.memoryMB !== undefined
			? { "JS Heap": `${report.memoryMB} MB` }
			: {}),
	});
	console.groupEnd();
	console.groupEnd();
}

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	const [showDetails, setShowDetails] = useState(false);

	useEffect(() => {
		logError(error);
	}, [error]);

	return (
		<div className="flex flex-1 items-center justify-center px-4 py-16">
			<div className="w-full max-w-md space-y-6">
				<PageHeader
					title="Niečo sa pokazilo"
					description="Vyskytla sa neočakávaná chyba. Skúste obnoviť stránku alebo sa vráťte na dashboard."
				/>
				<Card>
					<CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
						<div className="flex size-12 items-center justify-center rounded-lg bg-destructive/10">
							<AlertCircle className="size-6 text-destructive" />
						</div>
						<p className="text-sm text-muted-foreground">{error.message}</p>
						<div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
							<Button onClick={() => reset()} className="gap-2">
								<RefreshCcw className="size-4" />
								Skúsiť znova
							</Button>
							<Button
								variant="outline"
								onClick={() => {
									window.location.href = "/dashboard";
								}}
							>
								Domov
							</Button>
						</div>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setShowDetails((v) => !v)}
							className="gap-1 text-muted-foreground"
						>
							{showDetails ? (
								<ChevronUp className="size-4" />
							) : (
								<ChevronDown className="size-4" />
							)}
							Technické detaily
						</Button>
						{showDetails ? (
							<div className="w-full rounded-lg border border-border bg-muted/30 p-3 text-left font-mono text-xs text-muted-foreground break-all">
								{error.digest ? (
									<p className="mb-2">Digest: {error.digest}</p>
								) : null}
								{error.stack ? (
									<pre className="max-h-40 overflow-auto whitespace-pre-wrap">
										{error.stack}
									</pre>
								) : null}
							</div>
						) : null}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
