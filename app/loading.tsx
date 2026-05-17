"use client";

import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { useEffect, useState } from "react";

const RINGS = [
	{ size: 40, duration: 2.4, delay: 0, opacity: 0.9 },
	{ size: 64, duration: 3.2, delay: 0.3, opacity: 0.5 },
	{ size: 90, duration: 4.0, delay: 0.6, opacity: 0.25 },
	{ size: 118, duration: 5.0, delay: 0.9, opacity: 0.12 },
];

const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
	id: i,
	angle: (i / 12) * 360,
	radius: 56,
	duration: 3 + (i % 3) * 0.6,
	delay: i * 0.1,
	size: i % 3 === 0 ? 4 : i % 3 === 1 ? 3 : 2,
}));

function Counter({ to }: { to: number }) {
	const count = useMotionValue(0);
	const rounded = useTransform(count, (v) => Math.round(v));
	const [display, setDisplay] = useState(0);

	useEffect(() => {
		const unsub = rounded.on("change", setDisplay);
		const controls = animate(count, to, {
			duration: 2.2,
			ease: [0.16, 1, 0.3, 1],
		});
		return () => {
			controls.stop();
			unsub();
		};
	}, [to]);

	return <>{display}</>;
}

export default function GlobalLoading() {
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		// Simulate loading stages
		const t1 = setTimeout(() => setProgress(38), 400);
		const t2 = setTimeout(() => setProgress(67), 1000);
		const t3 = setTimeout(() => setProgress(89), 1800);
		const t4 = setTimeout(() => setProgress(100), 2600);
		return () => [t1, t2, t3, t4].forEach(clearTimeout);
	}, []);

	return (
		<div className="fixed inset-0 z-100 flex flex-col items-center justify-center overflow-hidden bg-background">
			{/* Subtle grid background */}
			<div
				className="pointer-events-none absolute inset-0 opacity-[0.03]"
				style={{
					backgroundImage:
						"linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)",
					backgroundSize: "48px 48px",
				}}
			/>

			{/* Radial glow behind the center */}
			<motion.div
				initial={{ opacity: 0, scale: 0.6 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 1.2, ease: "easeOut" }}
				className="pointer-events-none absolute inset-0 flex items-center justify-center"
			>
				<div
					className="size-85 rounded-full opacity-20 blur-[80px]"
					style={{ background: "var(--primary)" }}
				/>
			</motion.div>

			{/* Main content */}
			<div className="relative flex flex-col items-center gap-10">
				{/* Ring + core system */}
				<div className="relative flex items-center justify-center">
					{/* Expanding pulse rings */}
					{RINGS.map((ring) => (
						<motion.div
							key={ring.size}
							initial={{ opacity: 0, scale: 0.5 }}
							animate={{
								opacity: [0, ring.opacity, 0],
								scale: [0.5, 1, 1.4],
							}}
							transition={{
								duration: ring.duration,
								delay: ring.delay,
								repeat: Infinity,
								ease: "easeOut",
							}}
							className="absolute rounded-full border border-primary"
							style={{ width: ring.size, height: ring.size }}
						/>
					))}

					{/* Orbiting particles */}
					{PARTICLES.map((p) => (
						<motion.div
							key={p.id}
							className="absolute rounded-full bg-primary"
							style={{ width: p.size, height: p.size }}
							animate={{
								x: [
									Math.cos((p.angle * Math.PI) / 180) * p.radius,
									Math.cos(((p.angle + 180) * Math.PI) / 180) * p.radius,
									Math.cos((p.angle * Math.PI) / 180) * p.radius,
								],
								y: [
									Math.sin((p.angle * Math.PI) / 180) * p.radius,
									Math.sin(((p.angle + 180) * Math.PI) / 180) * p.radius,
									Math.sin((p.angle * Math.PI) / 180) * p.radius,
								],
								opacity: [0.2, 1, 0.2],
							}}
							transition={{
								duration: p.duration,
								delay: p.delay,
								repeat: Infinity,
								ease: "easeInOut",
							}}
						/>
					))}

					{/* Rotating arc ring */}
					<motion.svg
						className="absolute"
						width={96}
						height={96}
						viewBox="0 0 96 96"
						animate={{ rotate: 360 }}
						transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
					>
						<circle
							cx={48}
							cy={48}
							r={44}
							fill="none"
							stroke="currentColor"
							strokeWidth={1.5}
							strokeLinecap="round"
							strokeDasharray="60 220"
							className="text-primary"
						/>
					</motion.svg>
					<motion.svg
						className="absolute"
						width={96}
						height={96}
						viewBox="0 0 96 96"
						animate={{ rotate: -360 }}
						transition={{ duration: 3.8, repeat: Infinity, ease: "linear" }}
					>
						<circle
							cx={48}
							cy={48}
							r={44}
							fill="none"
							stroke="currentColor"
							strokeWidth={0.75}
							strokeLinecap="round"
							strokeDasharray="30 250"
							className="text-primary/50"
						/>
					</motion.svg>

					{/* Core diamond */}
					<motion.div
						animate={{
							rotate: [0, 45, 90, 135, 180, 225, 270, 315, 360],
							scale: [1, 1.08, 1],
						}}
						transition={{
							rotate: { duration: 6, repeat: Infinity, ease: "linear" },
							scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
						}}
						className="relative flex size-8 items-center justify-center rounded-sm bg-primary shadow-[0_0_24px_4px_var(--primary)]"
						style={{ boxShadow: "0 0 28px 6px color-mix(in srgb, var(--primary) 60%, transparent)" }}
					>
						<motion.div
							animate={{ opacity: [0.4, 1, 0.4] }}
							transition={{ duration: 1.5, repeat: Infinity }}
							className="size-2 rounded-full bg-background"
						/>
					</motion.div>
				</div>

				{/* Text + progress */}
				<div className="flex flex-col items-center gap-4">
					{/* Brand name */}
					<motion.div
						initial={{ opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
						className="flex flex-col items-center gap-1"
					>
						<h2 className="text-2xl font-bold tracking-[0.15em] text-foreground uppercase">
							Boom Scope
						</h2>
						<div className="flex items-center gap-2 text-xs text-muted-foreground tracking-widest uppercase">
							<span>Pripravujeme prostredie</span>
						</div>
					</motion.div>

					{/* Progress track */}
					<motion.div
						initial={{ opacity: 0, scaleX: 0.7 }}
						animate={{ opacity: 1, scaleX: 1 }}
						transition={{ delay: 0.5, duration: 0.5 }}
						className="flex flex-col items-end gap-1.5 w-52"
					>
						{/* Percentage */}
						<div className="text-xs tabular-nums text-primary font-mono">
							<Counter to={progress} />%
						</div>

						{/* Bar */}
						<div className="relative h-px w-full overflow-hidden rounded-full bg-muted">
							<motion.div
								className="absolute inset-y-0 left-0 rounded-full"
								style={{ background: "var(--primary)" }}
								animate={{ width: `${progress}%` }}
								transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
							/>
							{/* shimmer */}
							<motion.div
								className="absolute inset-y-0 w-16 -translate-x-full"
								style={{
									background:
										"linear-gradient(90deg, transparent, color-mix(in srgb, var(--primary) 80%, white), transparent)",
								}}
								animate={{ x: ["0%", "400%"] }}
								transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
							/>
						</div>

						{/* Stage labels */}
						<motion.p
							key={progress}
							initial={{ opacity: 0, y: 4 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -4 }}
							transition={{ duration: 0.3 }}
							className="text-[10px] text-muted-foreground font-mono tracking-wider"
						>
							{progress < 40
								? "Inicializácia systému..."
								: progress < 70
									? "Načítavanie modulov..."
									: progress < 90
										? "Konfigurácia prostredia..."
										: "Dokončovanie..."}
						</motion.p>
					</motion.div>
				</div>
			</div>
		</div>
	);
}