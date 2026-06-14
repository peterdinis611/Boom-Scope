"use client";

import { motion, type Variants } from "motion/react";
import { AnimatedSkeleton } from "@/components/ui/animated-skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// ─── Motion variants ──────────────────────────────────────────────────────────

const page: Variants = {
	hidden: { opacity: 0 },
	show: {
		opacity: 1,
		transition: { staggerChildren: 0.07, delayChildren: 0.05 },
	},
};

const slideUp: Variants = {
	hidden: { opacity: 0, y: 14 },
	show: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
	},
};

const fadeIn: Variants = {
	hidden: { opacity: 0 },
	show: { opacity: 1, transition: { duration: 0.3 } },
};

// ─── Tiny helpers ─────────────────────────────────────────────────────────────

function Sk({ className, delay = 0 }: { className: string; delay?: number }) {
	return <AnimatedSkeleton className={className} delay={delay} />;
}

// A horizontal rule that acts as a visual divider inside the sidebar
function SidebarDivider() {
	return <div className="mx-3 h-px bg-sidebar-border/60" />;
}

// ─── Sidebar nav item skeleton ────────────────────────────────────────────────

function SidebarNavItem({
	delay = 0,
	wide = false,
}: {
	delay?: number;
	wide?: boolean;
}) {
	return (
		<div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
			<Sk className="size-5 shrink-0 rounded-md" delay={delay} />
			<Sk
				className={`h-3.5 ${wide ? "w-28" : "w-20"} rounded`}
				delay={delay + 0.02}
			/>
		</div>
	);
}

// ─── Stat card skeleton ───────────────────────────────────────────────────────

function StatCard({ delay = 0 }: { delay?: number }) {
	return (
		<Card className="overflow-hidden">
			<CardHeader className="pb-2">
				<div className="flex items-center justify-between">
					<Sk className="h-3.5 w-24 rounded" delay={delay} />
					<Sk className="size-7 rounded-md" delay={delay + 0.02} />
				</div>
			</CardHeader>
			<CardContent className="flex flex-col gap-2 pt-0">
				<Sk className="h-8 w-20 rounded" delay={delay + 0.04} />
				<div className="flex items-center gap-1.5">
					<Sk className="size-3.5 rounded-full" delay={delay + 0.06} />
					<Sk className="h-3 w-28 rounded" delay={delay + 0.07} />
				</div>
			</CardContent>
		</Card>
	);
}

// ─── Table row skeleton ───────────────────────────────────────────────────────

function TableRow({ delay = 0 }: { delay?: number }) {
	return (
		<div className="flex items-center gap-4 border-b border-border/40 px-4 py-3 last:border-0">
			<Sk className="size-8 shrink-0 rounded-full" delay={delay} />
			<div className="flex flex-1 flex-col gap-1.5">
				<Sk className="h-3.5 w-32 rounded" delay={delay + 0.02} />
				<Sk className="h-3 w-48 rounded" delay={delay + 0.03} />
			</div>
			<Sk
				className="hidden h-5 w-16 rounded-full sm:block"
				delay={delay + 0.04}
			/>
			<Sk className="h-3.5 w-20 rounded" delay={delay + 0.05} />
			<Sk className="size-7 rounded-md" delay={delay + 0.06} />
		</div>
	);
}

// ─── Chart placeholder ────────────────────────────────────────────────────────

function ChartSkeleton({ delay = 0 }: { delay?: number }) {
	// Fake bars at varying heights to look like a bar chart
	const heights = [40, 65, 50, 80, 55, 70, 45, 75, 60, 85, 50, 65];
	return (
		<div className="flex flex-col gap-3">
			{/* Y-axis labels */}
			<div className="flex items-end gap-2 px-1">
				{heights.map((h, i) => (
					<motion.div
						key={i}
						variants={fadeIn}
						className="flex-1 rounded-t-sm bg-muted"
						style={{ height: h }}
						animate={{ opacity: [0.4, 0.7, 0.4] }}
						transition={{
							duration: 2.2,
							delay: delay + i * 0.06,
							repeat: Infinity,
							ease: "easeInOut",
						}}
					/>
				))}
			</div>
			{/* X-axis */}
			<div className="flex gap-2 px-1">
				{heights.map((_, i) => (
					<Sk
						key={i}
						className="h-2.5 flex-1 rounded"
						delay={delay + 0.1 + i * 0.02}
					/>
				))}
			</div>
		</div>
	);
}

// ─── Main component ───────────────────────────────────────────────────────────

export function DashboardSkeleton() {
	return (
		<motion.div
			role="status"
			aria-label="Loading dashboard"
			aria-live="polite"
			aria-busy="true"
			variants={page}
			initial="hidden"
			animate="show"
			className="flex min-h-0 flex-1 bg-background"
		>
			{/* ── Desktop sidebar ── */}
			<motion.aside
				variants={fadeIn}
				className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex"
			>
				{/* Logo */}
				<div className="flex h-14 items-center gap-3 border-b border-sidebar-border px-4">
					<Sk className="size-7 rounded-md" />
					<Sk className="h-4 w-24" />
				</div>

				{/* Workspace switcher */}
				<div className="flex items-center justify-between px-4 py-3">
					<Sk className="h-3 w-16 rounded" delay={0.05} />
					<Sk className="size-4 rounded" delay={0.07} />
				</div>

				<SidebarDivider />

				{/* Nav section */}
				<div className="flex flex-col gap-0.5 px-1 py-2">
					{[
						{ wide: true, delay: 0.08 },
						{ wide: false, delay: 0.11 },
						{ wide: true, delay: 0.14 },
						{ wide: false, delay: 0.17 },
						{ wide: true, delay: 0.2 },
					].map((p, i) => (
						<SidebarNavItem key={i} {...p} />
					))}
				</div>

				<SidebarDivider />

				{/* Secondary section */}
				<div className="flex flex-col gap-0.5 px-1 py-2">
					<div className="px-3 py-1.5">
						<Sk className="h-2.5 w-12 rounded" delay={0.22} />
					</div>
					{[0.25, 0.28].map((d, i) => (
						<SidebarNavItem key={i} delay={d} />
					))}
				</div>

				{/* User footer */}
				<div className="mt-auto border-t border-sidebar-border px-3 py-3">
					<div className="flex items-center gap-3 rounded-lg px-2 py-2">
						<Sk className="size-8 rounded-full" delay={0.3} />
						<div className="flex flex-col gap-1.5">
							<Sk className="h-3 w-24 rounded" delay={0.32} />
							<Sk className="h-2.5 w-32 rounded" delay={0.34} />
						</div>
						<Sk className="ml-auto size-4 rounded" delay={0.36} />
					</div>
				</div>
			</motion.aside>

			{/* ── Main column ── */}
			<div className="flex min-w-0 flex-1 flex-col">
				{/* Header */}
				<motion.header
					variants={slideUp}
					className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur supports-backdrop-filter:bg-background/75 md:px-6"
				>
					{/* Mobile menu button */}
					<Sk className="size-8 rounded-md md:hidden" />
					{/* Breadcrumb */}
					<div className="hidden items-center gap-2 md:flex">
						<Sk className="h-4 w-20 rounded" />
						<span className="text-border/60">/</span>
						<Sk className="h-4 w-28 rounded" delay={0.04} />
					</div>
					<div className="ml-auto flex items-center gap-2">
						<Sk className="size-8 rounded-md" delay={0.05} />
						<Sk className="size-8 rounded-md" delay={0.07} />
						{/* Avatar pill */}
						<div className="flex items-center gap-2 rounded-full border border-border py-1 pr-1.5 pl-1">
							<Sk className="size-7 rounded-full" delay={0.09} />
							<Sk className="hidden h-3 w-20 rounded sm:block" delay={0.11} />
							<Sk className="size-6 rounded-md" delay={0.13} />
						</div>
					</div>
				</motion.header>

				{/* Page body */}
				<motion.main
					variants={page}
					className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 md:px-8"
				>
					{/* Page title */}
					<motion.div variants={slideUp} className="flex flex-col gap-2">
						<Sk className="h-8 w-52 rounded-md" />
						<Sk className="h-4 w-80 rounded" delay={0.04} />
					</motion.div>

					{/* Stat cards */}
					<motion.div
						variants={slideUp}
						className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
					>
						{[0, 1, 2].map((i) => (
							<StatCard key={i} delay={i * 0.06} />
						))}
					</motion.div>

					{/* Chart + mini-panel row */}
					<motion.div variants={slideUp} className="grid gap-4 lg:grid-cols-3">
						{/* Chart card — spans 2 cols */}
						<Card className="overflow-hidden lg:col-span-2">
							<CardHeader className="pb-3">
								<div className="flex items-center justify-between">
									<div className="flex flex-col gap-1.5">
										<Sk className="h-4 w-36 rounded" />
										<Sk className="h-3 w-52 rounded" delay={0.03} />
									</div>
									{/* Tab strip */}
									<div className="flex gap-1">
										{[0, 0.04, 0.08].map((d, i) => (
											<Sk key={i} className="h-7 w-12 rounded-md" delay={d} />
										))}
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<ChartSkeleton delay={0.1} />
							</CardContent>
						</Card>

						{/* Side panel */}
						<Card className="overflow-hidden">
							<CardHeader className="pb-3">
								<Sk className="h-4 w-28 rounded" />
							</CardHeader>
							<CardContent className="flex flex-col gap-3">
								{[0, 0.06, 0.12, 0.18].map((d, i) => (
									<div key={i} className="flex items-center gap-3">
										<Sk className="size-9 shrink-0 rounded-full" delay={d} />
										<div className="flex flex-1 flex-col gap-1.5">
											<Sk className="h-3 w-24 rounded" delay={d + 0.02} />
											<Sk className="h-2.5 w-16 rounded" delay={d + 0.03} />
										</div>
										<Sk className="h-4 w-10 rounded" delay={d + 0.04} />
									</div>
								))}
							</CardContent>
						</Card>
					</motion.div>

					{/* Table card */}
					<motion.div variants={slideUp}>
						<Card className="overflow-hidden">
							<CardHeader className="pb-0">
								<div className="flex items-center justify-between">
									<div className="flex flex-col gap-1.5">
										<Sk className="h-4 w-40 rounded" />
										<Sk className="h-3 w-64 rounded" delay={0.04} />
									</div>
									<div className="flex gap-2">
										<Sk className="h-8 w-24 rounded-md" delay={0.06} />
										<Sk className="h-8 w-8 rounded-md" delay={0.08} />
									</div>
								</div>

								{/* Table header */}
								<div className="mt-4 flex items-center gap-4 border-b border-border/40 px-4 pb-2">
									{[
										"w-28",
										"flex-1",
										"w-16 hidden sm:block",
										"w-20",
										"w-7",
									].map((w, i) => (
										<Sk
											key={i}
											className={`h-3 ${w} rounded`}
											delay={0.1 + i * 0.02}
										/>
									))}
								</div>
							</CardHeader>

							<CardContent className="p-0">
								{[0, 0.06, 0.12, 0.18, 0.24].map((d, i) => (
									<TableRow key={i} delay={d} />
								))}
							</CardContent>
						</Card>
					</motion.div>
				</motion.main>
			</div>

			<span className="sr-only">Loading your dashboard…</span>
		</motion.div>
	);
}
