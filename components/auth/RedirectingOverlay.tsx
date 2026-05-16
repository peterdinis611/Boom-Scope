"use client";

import { AnimatePresence, motion } from "motion/react";

interface RedirectingOverlayProps {
	show: boolean;
	label?: string;
}

export function RedirectingOverlay({
	show,
	label = "Presmerúvam…",
}: RedirectingOverlayProps) {
	return (
		<AnimatePresence>
			{show ? (
				<motion.div
					key="redirect-overlay"
					role="status"
					aria-live="polite"
					aria-label={label}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.2 }}
					className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background/80 backdrop-blur-sm"
				>
					<motion.span
						aria-hidden
						className="block size-10 rounded-full border-2 border-muted border-t-primary"
						animate={{ rotate: 360 }}
						transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
					/>
					<motion.p
						initial={{ opacity: 0, y: 4 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1, duration: 0.3 }}
						className="text-sm font-medium text-muted-foreground"
					>
						{label}
					</motion.p>
				</motion.div>
			) : null}
		</AnimatePresence>
	);
}
