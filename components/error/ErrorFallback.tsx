"use client";

import {
	AlertTriangle,
	ArrowLeft,
	ChevronDown,
	ChevronUp,
	Copy,
	FileQuestion,
	Home,
	RefreshCcw,
	WifiOff,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	copyErrorReference,
	logClientError,
	toFriendlyError,
} from "@/lib/errors";
import { cn } from "@/lib/utils";

type ErrorFallbackKind = "error" | "not-found";

type HomeHref = "/" | "/dashboard";

type ErrorFallbackProps = {
	kind?: ErrorFallbackKind;
	error?: Error & { digest?: string };
	reset?: () => void;
	variant?: "page" | "fullscreen" | "compact";
	title?: string;
	description?: string;
	homeHref?: HomeHref;
	showBack?: boolean;
	className?: string;
};

function getIcon(kind: ErrorFallbackKind, title: string) {
	if (kind === "not-found") {
		return FileQuestion;
	}
	if (title.includes("pripojen")) {
		return WifiOff;
	}
	return AlertTriangle;
}

export function ErrorFallback({
	kind = "error",
	error,
	reset,
	variant = "page",
	title: titleOverride,
	description: descriptionOverride,
	homeHref = "/dashboard",
	showBack = true,
	className,
}: ErrorFallbackProps) {
	const [showDetails, setShowDetails] = useState(false);
	const [copying, setCopying] = useState(false);

	const friendly =
		kind === "error" && error
			? toFriendlyError(error, error.digest)
			: null;

	const title =
		titleOverride ??
		(kind === "not-found" ? "Stránka sa nenašla" : (friendly?.title ?? "Niečo sa pokazilo"));

	const description =
		descriptionOverride ??
		(kind === "not-found"
			? "Odkaz môže byť neplatný, stránka bola presunutá alebo už neexistuje."
			: (friendly?.description ??
				"Vyskytla sa neočakávaná chyba. Skúste obnoviť stránku."));

	const hint = friendly?.hint;
	const Icon = getIcon(kind, title);

	useEffect(() => {
		if (kind === "error" && error) {
			logClientError(error);
		}
	}, [error, kind]);

	async function handleCopyReference() {
		if (!error) return;
		setCopying(true);
		const ok = await copyErrorReference(error);
		setCopying(false);
		if (ok) {
			toast.success("Referencia skopírovaná");
		} else {
			toast.error("Kopírovanie zlyhalo");
		}
	}

	const recoverySteps =
		kind === "not-found"
			? [
					"Skontrolujte, či je adresa v prehliadači správna.",
					"Vráťte sa na dashboard a pokračujte odtiaľ.",
				]
			: [
					"Skúste akciu zopakovať — väčšina chýb je dočasná.",
					"Obnovte stránku, ak ste práve dostali novú verziu aplikácie.",
					"Pri opakovanom výskyte skopírujte referenčné ID nižšie.",
				];

	return (
		<div
			className={cn(
				"relative flex w-full items-center justify-center px-4",
				variant === "fullscreen" && "min-h-screen bg-background",
				variant === "page" && "flex-1 py-16",
				variant === "compact" && "py-10",
				className,
			)}
		>
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 overflow-hidden"
			>
				<div className="absolute -top-24 left-1/2 size-72 -translate-x-1/2 rounded-full bg-destructive/5 blur-3xl" />
				<div className="absolute right-0 bottom-0 size-56 translate-x-1/3 translate-y-1/3 rounded-full bg-primary/5 blur-3xl" />
			</div>

			<div className="relative w-full max-w-lg space-y-6">
				<div className="space-y-2 text-center">
					<div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-border bg-card shadow-sm">
						<Icon
							className={cn(
								"size-7",
								kind === "not-found"
									? "text-muted-foreground"
									: "text-destructive",
							)}
						/>
					</div>
					<h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
						{title}
					</h1>
					<p className="text-sm leading-relaxed text-muted-foreground">
						{description}
					</p>
					{hint ? (
						<p className="rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
							{hint}
						</p>
					) : null}
				</div>

				<Card className="border-border/80 shadow-sm">
					<CardContent className="space-y-5 pt-6">
						<div className="space-y-2">
							<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
								Čo môžete skúsiť
							</p>
							<ul className="space-y-1.5 text-sm text-foreground">
								{recoverySteps.map((step) => (
									<li key={step} className="flex gap-2">
										<span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
										<span>{step}</span>
									</li>
								))}
							</ul>
						</div>

						<div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
							{reset ? (
								<Button onClick={() => reset()} className="gap-2 sm:flex-1">
									<RefreshCcw className="size-4" />
									Skúsiť znova
								</Button>
							) : null}
							{showBack ? (
								<Button
									variant="outline"
									className="gap-2 sm:flex-1"
									onClick={() => window.history.back()}
								>
									<ArrowLeft className="size-4" />
									Späť
								</Button>
							) : null}
							<Button
								variant={reset ? "outline" : "default"}
								className="gap-2 sm:flex-1"
								asChild
							>
								<Link href={homeHref}>
									<Home className="size-4" />
									{homeHref.startsWith("/dashboard") ? "Dashboard" : "Domov"}
								</Link>
							</Button>
						</div>

						{kind === "error" && error ? (
							<div className="space-y-2 border-t border-border pt-4">
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setShowDetails((v) => !v)}
									className="h-8 w-full gap-1 text-muted-foreground"
								>
									{showDetails ? (
										<ChevronUp className="size-4" />
									) : (
										<ChevronDown className="size-4" />
									)}
									Technické detaily
								</Button>

								{showDetails ? (
									<div className="space-y-3 rounded-lg border border-border bg-muted/30 p-3 text-left">
										{error.digest ? (
											<div className="flex items-center justify-between gap-2">
												<p className="font-mono text-xs text-muted-foreground">
													<span className="text-foreground">ID:</span>{" "}
													{error.digest}
												</p>
												<Button
													variant="outline"
													size="sm"
													className="h-7 gap-1 px-2 text-xs"
													disabled={copying}
													onClick={() => void handleCopyReference()}
												>
													<Copy className="size-3" />
													Kopírovať
												</Button>
											</div>
										) : null}
										<p className="font-mono text-xs break-all text-muted-foreground">
											{friendly?.technicalMessage ?? error.message}
										</p>
										{error.stack ? (
											<pre className="max-h-36 overflow-auto rounded-md border border-border/60 bg-background/60 p-2 font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-muted-foreground">
												{error.stack}
											</pre>
										) : null}
									</div>
								) : null}
							</div>
						) : null}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
