"use client";

import { motion, type Variants } from "motion/react";

import { AnimatedSkeleton } from "@/components/ui/animated-skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const container: Variants = {
	hidden: { opacity: 0 },
	show: {
		opacity: 1,
		transition: { staggerChildren: 0.06, delayChildren: 0.04 },
	},
};

const item: Variants = {
	hidden: { opacity: 0, y: 10 },
	show: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
	},
};

export function DashboardSkeleton() {
	return (
		<motion.div
			role="status"
			aria-label="Načítavam dashboard"
			aria-live="polite"
			aria-busy="true"
			variants={container}
			initial="hidden"
			animate="show"
			className="flex min-h-0 flex-1 bg-background"
		>
			{/* Desktop sidebar */}
			<motion.aside
				variants={item}
				className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar md:flex md:flex-col"
			>
				<div className="flex h-14 items-center border-b border-sidebar-border px-4">
					<AnimatedSkeleton className="h-6 w-28" />
				</div>
				<div className="flex flex-1 flex-col gap-2 p-3">
					{[0, 1, 2, 3].map((i) => (
						<AnimatedSkeleton
							key={i}
							className="h-14 w-full rounded-lg"
							delay={i * 0.05}
						/>
					))}
				</div>
			</motion.aside>

			<div className="flex min-w-0 flex-1 flex-col">
				<motion.header
					variants={item}
					className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/75 md:px-6"
				>
					<AnimatedSkeleton className="size-8 rounded-md md:hidden" />
					<AnimatedSkeleton className="hidden h-5 w-32 md:block" />
					<div className="ml-auto flex items-center gap-2">
						<AnimatedSkeleton className="size-8 rounded-md" delay={0.05} />
						<div className="flex items-center gap-2 rounded-full border border-border py-1 pr-1 pl-1">
							<AnimatedSkeleton className="size-8 rounded-full" delay={0.1} />
							<AnimatedSkeleton className="h-3 w-20" delay={0.12} />
							<AnimatedSkeleton className="size-7 rounded-md" delay={0.15} />
						</div>
					</div>
				</motion.header>

				<motion.main
					variants={container}
					className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 md:px-8"
				>
					<motion.div variants={item} className="flex flex-col gap-3">
						<AnimatedSkeleton className="h-9 max-w-xs" />
						<AnimatedSkeleton className="h-5 max-w-md" delay={0.05} />
					</motion.div>

					<motion.div
						variants={item}
						className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
					>
						{[0, 1, 2].map((i) => (
							<Card key={i} className="overflow-hidden">
								<CardHeader className="gap-2">
									<AnimatedSkeleton className="h-5 w-40" delay={i * 0.04} />
									<AnimatedSkeleton
										className="h-4 w-full"
										delay={i * 0.04 + 0.02}
									/>
								</CardHeader>
								<CardContent>
									<AnimatedSkeleton
										className="h-9 w-28"
										delay={i * 0.04 + 0.04}
									/>
								</CardContent>
							</Card>
						))}
					</motion.div>

					<motion.div variants={item}>
						<Card>
							<CardHeader className="gap-2">
								<AnimatedSkeleton className="h-5 w-44" />
								<AnimatedSkeleton className="h-4 w-72" delay={0.05} />
							</CardHeader>
							<CardContent>
								<div className="flex items-center gap-2">
									<AnimatedSkeleton className="size-2 rounded-full" />
									<AnimatedSkeleton className="h-4 w-28" delay={0.05} />
								</div>
							</CardContent>
						</Card>
					</motion.div>
				</motion.main>
			</div>

			<span className="sr-only">Načítavam váš dashboard…</span>
		</motion.div>
	);
}
