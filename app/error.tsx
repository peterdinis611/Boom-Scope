"use client";

import { AlertCircle, ChevronDown, ChevronUp, RefreshCcw } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	const [showDetails, setShowDetails] = useState(false);

	useEffect(() => {
		// Log the error to an error reporting service
		console.error(error);
	}, [error]);

	return (
		<div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background p-4">
			<motion.div
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				className="flex max-w-md flex-col items-center gap-8 text-center"
			>
				{/* Animated Error Icon */}
				<motion.div
					animate={{
						rotate: [0, -10, 10, -10, 10, 0],
						scale: [1, 1.1, 1],
					}}
					transition={{
						duration: 0.5,
						repeat: Number.POSITIVE_INFINITY,
						repeatDelay: 2,
					}}
					className="flex size-20 items-center justify-center rounded-2xl bg-destructive/10 text-destructive shadow-2xl shadow-destructive/20"
				>
					<AlertCircle className="size-10" />
				</motion.div>

				{/* Error Content */}
				<div className="flex flex-col gap-3">
					<motion.h1
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1 }}
						className="font-heading text-3xl font-bold tracking-tight"
					>
						Ups! Niečo sa pokazilo
					</motion.h1>
					<motion.p
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
						className="text-muted-foreground"
					>
						Ospravedlňujeme sa, ale pri načítavaní stránky sa vyskytla
						neočakávaná chyba.
					</motion.p>
					{error.digest && (
						<motion.code
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.3 }}
							className="mt-2 rounded bg-muted px-2 py-1 text-[10px] text-muted-foreground"
						>
							ID chyby: {error.digest}
						</motion.code>
					)}
				</div>

				{/* Error Details Toggle */}
				<div className="flex flex-col w-full gap-2">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setShowDetails(!showDetails)}
						className="mx-auto flex items-center gap-2 text-muted-foreground/60 hover:text-muted-foreground"
					>
						{showDetails ? (
							<>
								<ChevronUp className="size-4" />
								Skryť detaily
							</>
						) : (
							<>
								<ChevronDown className="size-4" />
								Zobraziť detaily
							</>
						)}
					</Button>
					<AnimatePresence>
						{showDetails && (
							<motion.div
								initial={{ height: 0, opacity: 0 }}
								animate={{ height: "auto", opacity: 1 }}
								exit={{ height: 0, opacity: 0 }}
								className="overflow-hidden"
							>
								<div className="rounded-xl border border-border/50 bg-muted/30 p-4 text-left font-mono text-xs text-muted-foreground break-all">
									<p className="font-bold text-foreground mb-2">
										Message: {error.message}
									</p>
									{error.stack && (
										<pre className="whitespace-pre-wrap overflow-x-auto max-h-[200px]">
											{error.stack}
										</pre>
									)}
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</div>

				{/* Actions */}
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
					className="flex w-full items-center justify-center gap-4"
				>
					<Button
						variant="default"
						size="lg"
						onClick={() => reset()}
						className="group gap-2 px-8"
					>
						<RefreshCcw className="size-4 transition-transform group-hover:rotate-180" />
						Skúsiť znova
					</Button>
					<Button
						variant="outline"
						size="lg"
						onClick={() => (window.location.href = "/dashboard")}
					>
						Domov
					</Button>
				</motion.div>
			</motion.div>

			{/* Decorative background elements */}
			<div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
				<div className="absolute -top-[10%] -left-[10%] size-96 rounded-full bg-destructive/5 blur-3xl" />
				<div className="absolute -bottom-[10%] -right-[10%] size-96 rounded-full bg-primary/5 blur-3xl" />
			</div>
		</div>
	);
}
