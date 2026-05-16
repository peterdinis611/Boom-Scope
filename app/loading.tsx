"use client";

import { motion } from "motion/react";

export default function GlobalLoading() {
	return (
		<div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-md">
			<div className="relative flex flex-col items-center gap-8">
				{/* Animated Logo/Shape */}
				<div className="relative flex items-center justify-center">
					<motion.div
						animate={{
							scale: [1, 1.2, 1],
							rotate: [0, 90, 180, 270, 360],
							borderRadius: ["20%", "20%", "50%", "50%", "20%"],
						}}
						transition={{
							duration: 3,
							ease: "easeInOut",
							repeat: Number.POSITIVE_INFINITY,
						}}
						className="size-16 bg-primary shadow-2xl shadow-primary/40"
					/>
					<motion.div
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{ opacity: [0, 1, 0], scale: [0.8, 1.5, 0.8] }}
						transition={{
							duration: 3,
							ease: "easeInOut",
							repeat: Number.POSITIVE_INFINITY,
						}}
						className="absolute size-16 rounded-full border-2 border-primary/30"
					/>
				</div>

				{/* Loading Text */}
				<div className="flex flex-col items-center gap-2">
					<motion.h2
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
						className="font-heading text-xl font-bold tracking-tight"
					>
						Boom Scope
					</motion.h2>
					<div className="flex items-center gap-1">
						<span className="text-sm text-muted-foreground">
							Pripravujeme prostredie
						</span>
						<motion.span
							animate={{ opacity: [0, 1, 0] }}
							transition={{
								repeat: Number.POSITIVE_INFINITY,
								duration: 1.5,
								times: [0, 0.5, 1],
							}}
							className="text-sm text-muted-foreground"
						>
							...
						</motion.span>
					</div>
				</div>
			</div>

			{/* Progress bar hint */}
			<motion.div
				initial={{ scaleX: 0 }}
				animate={{ scaleX: 1 }}
				transition={{ duration: 2, ease: "easeInOut" }}
				className="absolute bottom-0 left-0 h-1 w-full origin-left bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"
			/>
		</div>
	);
}
