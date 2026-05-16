"use client";

import { motion } from "motion/react";

import { cn } from "@/lib/utils";

interface AnimatedSkeletonProps {
	className?: string;
	/** Delay (in seconds) before the entrance fade-in. */
	delay?: number;
}

function AnimatedSkeleton({ className, delay = 0 }: AnimatedSkeletonProps) {
	return (
		<motion.div
			data-slot="animated-skeleton"
			aria-hidden
			className={cn(
				"relative overflow-hidden rounded-md bg-muted/60",
				className,
			)}
			initial={{ opacity: 0 }}
			animate={{ opacity: [0, 0.95, 0.6, 0.95, 0.6] }}
			transition={{
				opacity: {
					times: [0, 0.15, 0.5, 0.85, 1],
					duration: 1.8,
					repeat: Infinity,
					repeatType: "loop",
					ease: "easeInOut",
					delay,
				},
			}}
		>
			<motion.span
				aria-hidden
				className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/10 to-transparent"
				initial={{ x: "-100%" }}
				animate={{ x: "100%" }}
				transition={{
					duration: 1.4,
					repeat: Infinity,
					ease: "easeInOut",
					delay,
				}}
			/>
		</motion.div>
	);
}

export { AnimatedSkeleton };
