"use client";

import { Moon, Sun } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useTheme } from "next-themes";
import * as React from "react";

import { Button } from "@/components/ui/button";

export function ModeToggle() {
	const { resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = React.useState(false);

	React.useEffect(() => {
		const timeout = setTimeout(() => setMounted(true), 0);
		return () => clearTimeout(timeout);
	}, []);

	if (!mounted) {
		return (
			<Button
				variant="outline"
				size="icon-sm"
				className="shrink-0"
				disabled
				aria-hidden
			>
				<Sun className="size-4 opacity-0" />
			</Button>
		);
	}

	const isDark = resolvedTheme === "dark";
	const Icon = isDark ? Sun : Moon;

	return (
		<Button
			type="button"
			variant="outline"
			size="icon-sm"
			className="relative shrink-0 overflow-hidden"
			onClick={() => setTheme(isDark ? "light" : "dark")}
			aria-label={isDark ? "Prepnúť na svetlý režim" : "Prepnúť na tmavý režim"}
			title={isDark ? "Svetlý režim" : "Tmavý režim"}
		>
			<span className="relative grid size-4 place-items-center">
				<AnimatePresence mode="wait" initial={false}>
					<motion.span
						key={isDark ? "sun" : "moon"}
						initial={{ y: -14, opacity: 0, rotate: -90, scale: 0.6 }}
						animate={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
						exit={{ y: 14, opacity: 0, rotate: 90, scale: 0.6 }}
						transition={{
							duration: 0.32,
							ease: [0.22, 1, 0.36, 1],
						}}
						className="absolute inset-0 grid place-items-center"
					>
						<Icon className="size-4" aria-hidden />
					</motion.span>
				</AnimatePresence>
			</span>
		</Button>
	);
}
