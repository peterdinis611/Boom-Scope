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
			className={cn("rounded-md bg-muted/60", className)}
			initial={{ opacity: 0 }}
			animate={{ opacity: [0.45, 0.9, 0.45] }}
			transition={{
				opacity: {
					duration: 1.6,
					repeat: Infinity,
					ease: "easeInOut",
					delay,
				},
			}}
		/>
	);
}

export { AnimatedSkeleton };
