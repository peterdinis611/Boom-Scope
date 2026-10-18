"use client";

import {
	AlertTriangle,
	ArrowLeft,
	ChevronDown,
	Copy,
	FileQuestion,
	Home,
	RefreshCcw,
	WifiOff,
} from "lucide-react";
import {
	AnimatePresence,
	motion,
	useReducedMotion,
} from "motion/react";
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

const ease = [0.22, 1, 0.36, 1] as const;

function getIcon(kind: ErrorFallbackKind, title: string) {
	if (kind === "not-found") {
		return FileQuestion;
	}
	if (title.includes("connection") || title.includes("Connection")) {
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
	const reduceMotion = useReducedMotion();
	const [showDetails, setShowDetails] = useState(false);
	const [copying, setCopying] = useState(false);
	const [retrying, setRetrying] = useState(false);

	const friendly =
		kind === "error" && error ? toFriendlyError(error, error.digest) : null;

	const title =
		titleOverride ??
		(kind === "not-found"
			? "Page not found"
			: (friendly?.title ?? "Something went wrong"));

	const description =
		descriptionOverride ??
		(kind === "not-found"
			? "The link may be invalid, the page may have moved, or it no longer exists."
			: (friendly?.description ??
				"An unexpected error occurred. Try refreshing the page."));

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
			toast.success("Reference copied");
		} else {
			toast.error("Copy failed");
		}
	}

	function handleRetry() {
		if (!reset) return;
		setRetrying(true);
		window.setTimeout(() => {
			reset();
		}, reduceMotion ? 0 : 420);
	}

	const recoverySteps =
		kind === "not-found"
			? [
					"Check that the address in your browser is correct.",
					"Return to the dashboard and continue from there.",
				]
			: [
					"Try the action again — most errors are temporary.",
					"Refresh the page if you just received a new version of the app.",
					"If it keeps happening, copy the reference ID below.",
				];

	const enter = (delay = 0) =>
		reduceMotion
			? undefined
			: {
					initial: { opacity: 0, y: 14 },
					animate: { opacity: 1, y: 0 },
					transition: { duration: 0.45, delay, ease },
				};

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
			<div className="relative w-full max-w-lg space-y-6">
				<motion.div
					className="space-y-3 text-center"
					{...enter(0)}
				>
					<motion.div
						className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-border bg-card shadow-sm"
						animate={
							reduceMotion
								? undefined
								: kind === "error"
									? {
											rotate: [0, -6, 6, -4, 4, 0],
											scale: [1, 1.04, 1],
										}
									: { scale: [1, 1.03, 1] }
						}
						transition={{
							duration: 0.7,
							delay: 0.15,
							ease,
						}}
					>
						<motion.span
							animate={
								reduceMotion
									? undefined
									: {
											opacity: [1, 0.7, 1],
										}
							}
							transition={{
								duration: 2.2,
								repeat: Infinity,
								ease: "easeInOut",
							}}
						>
							<Icon
								className={cn(
									"size-7",
									kind === "not-found"
										? "text-muted-foreground"
										: "text-destructive",
								)}
							/>
						</motion.span>
					</motion.div>
					<h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
						{title}
					</h1>
					<p className="text-sm leading-relaxed text-muted-foreground">
						{description}
					</p>
					{hint ? (
						<motion.p
							className="rounded-lg border border-scope/20 bg-scope/10 px-3 py-2 text-xs text-foreground/80"
							initial={reduceMotion ? false : { opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4, delay: 0.2, ease }}
						>
							{hint}
						</motion.p>
					) : null}
				</motion.div>

				<motion.div {...enter(0.12)}>
					<Card className="overflow-hidden border-border/80 shadow-sm">
						<CardContent className="space-y-5 pt-6">
							<div className="space-y-2">
								<p className="font-mono text-[10px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
									What you can try
								</p>
								<ul className="space-y-1.5 text-sm text-foreground">
									{recoverySteps.map((step, index) => (
										<motion.li
											key={step}
											className="flex gap-2"
											initial={reduceMotion ? false : { opacity: 0, x: -8 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{
												duration: 0.35,
												delay: reduceMotion ? 0 : 0.2 + index * 0.07,
												ease,
											}}
										>
											<span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
											<span>{step}</span>
										</motion.li>
									))}
								</ul>
							</div>

							<div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
								{reset ? (
									<motion.div
										className="sm:flex-1"
										whileHover={reduceMotion ? undefined : { scale: 1.02 }}
										whileTap={reduceMotion ? undefined : { scale: 0.98 }}
									>
										<Button
											onClick={handleRetry}
											disabled={retrying}
											className="w-full gap-2"
										>
											<RefreshCcw
												className={cn(
													"size-4",
													retrying && "animate-spin",
												)}
											/>
											{retrying ? "Retrying…" : "Try again"}
										</Button>
									</motion.div>
								) : null}
								{showBack ? (
									<motion.div
										className="sm:flex-1"
										whileHover={reduceMotion ? undefined : { scale: 1.02 }}
										whileTap={reduceMotion ? undefined : { scale: 0.98 }}
									>
										<Button
											variant="outline"
											className="w-full gap-2"
											onClick={() => window.history.back()}
										>
											<ArrowLeft className="size-4" />
											Back
										</Button>
									</motion.div>
								) : null}
								<motion.div
									className="sm:flex-1"
									whileHover={reduceMotion ? undefined : { scale: 1.02 }}
									whileTap={reduceMotion ? undefined : { scale: 0.98 }}
								>
									<Button
										variant={reset ? "outline" : "default"}
										className="w-full gap-2"
										asChild
									>
										<Link href={homeHref}>
											<Home className="size-4" />
											{homeHref.startsWith("/dashboard")
												? "Dashboard"
												: "Home"}
										</Link>
									</Button>
								</motion.div>
							</div>

							{kind === "error" && error ? (
								<div className="space-y-2 border-t border-border pt-4">
									<Button
										variant="ghost"
										size="sm"
										onClick={() => setShowDetails((v) => !v)}
										className="h-8 w-full gap-1 text-muted-foreground"
										aria-expanded={showDetails}
									>
										<motion.span
											animate={{ rotate: showDetails ? 180 : 0 }}
											transition={{ duration: 0.25, ease }}
										>
											<ChevronDown className="size-4" />
										</motion.span>
										Technical details
									</Button>

									<AnimatePresence initial={false}>
										{showDetails ? (
											<motion.div
												key="details"
												initial={
													reduceMotion
														? false
														: { opacity: 0, height: 0, y: -6 }
												}
												animate={{ opacity: 1, height: "auto", y: 0 }}
												exit={
													reduceMotion
														? undefined
														: { opacity: 0, height: 0, y: -4 }
												}
												transition={{ duration: 0.3, ease }}
												className="overflow-hidden"
											>
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
																{copying ? "Copying…" : "Copy"}
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
											</motion.div>
										) : null}
									</AnimatePresence>
								</div>
							) : null}
						</CardContent>
					</Card>
				</motion.div>
			</div>
		</div>
	);
}
