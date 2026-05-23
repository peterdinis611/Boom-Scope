"use client";

import {
	Brain,
	Clock,
	Coffee,
	LucideIcon,
	Pause,
	Play,
	RotateCcw,
	Settings2,
	SkipForward,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { type PomodoroMode, usePomodoro } from "./pomodoro-context";

export function PomodoroTimer() {
	const {
		timeLeft,
		isActive,
		mode,
		settings,
		progress,
		toggleTimer,
		resetTimer,
		skipMode,
		setMode,
		updateSettings,
	} = usePomodoro();

	const [isSettingsOpen, setIsSettingsOpen] = useState(false);

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
	};

	const modeConfig: Record<
		PomodoroMode,
		{ label: string; icon: LucideIcon; color: string; description: string }
	> = {
		focus: {
			label: "Focus",
			icon: Brain,
			color: "text-primary",
			description: "Time to concentrate on your tasks",
		},
		shortBreak: {
			label: "Short Break",
			icon: Coffee,
			color: "text-success",
			description: "Quick rest to recharge",
		},
		longBreak: {
			label: "Long Break",
			icon: Clock,
			color: "text-primary",
			description: "Extended rest for deeper recovery",
		},
	};

	const { label, icon: Icon, color, description } = modeConfig[mode];

	return (
		<div className="flex flex-col items-center justify-center gap-8 p-4 md:p-8 max-w-2xl mx-auto">
			<div className="flex flex-wrap items-center justify-center gap-2 mb-4">
				{(["focus", "shortBreak", "longBreak"] as PomodoroMode[]).map((m) => (
					<Button
						key={m}
						variant={mode === m ? "default" : "ghost"}
						size="sm"
						onClick={() => setMode(m)}
						className={cn(
							"rounded-full transition-all duration-300",
							mode === m && "shadow-lg scale-105",
						)}
					>
						{mode === m && (
							<motion.span
								layoutId="active-bg"
								className="absolute inset-0 bg-primary rounded-full -z-10"
							/>
						)}
						{modeConfig[m].label}
					</Button>
				))}
			</div>

			<Card className="w-full relative overflow-hidden border-none bg-card/50 backdrop-blur-xl shadow-2xl">
				<div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />

				<CardHeader className="text-center relative z-10">
					<div className="flex items-center justify-center gap-2 text-primary mb-2">
						<Icon className={cn("size-5", color)} />
						<CardTitle className="text-2xl font-bold tracking-tight">
							{label}
						</CardTitle>
					</div>
					<CardDescription>{description}</CardDescription>
				</CardHeader>

				<CardContent className="flex flex-col items-center gap-8 relative z-10 py-8">
					{/* Circular Progress Indicator */}
					<div className="relative size-64 md:size-80 flex items-center justify-center">
						<svg className="size-full -rotate-90 transform">
							<circle
								cx="50%"
								cy="50%"
								r="45%"
								fill="transparent"
								stroke="currentColor"
								strokeWidth="8"
								className="text-muted/20"
							/>
							<motion.circle
								cx="50%"
								cy="50%"
								r="45%"
								fill="transparent"
								stroke="currentColor"
								strokeWidth="8"
								strokeDasharray="100 100"
								initial={{ pathLength: 0 }}
								animate={{ pathLength: progress / 100 }}
								transition={{ duration: 0.5, ease: "linear" }}
								className={cn("transition-colors duration-500", color)}
								style={{ strokeLinecap: "round" }}
							/>
						</svg>

						<div className="absolute inset-0 flex flex-col items-center justify-center text-center">
							<AnimatePresence mode="wait">
								<motion.span
									key={timeLeft}
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -10 }}
									className="text-6xl md:text-7xl font-mono font-bold tracking-tighter"
								>
									{formatTime(timeLeft)}
								</motion.span>
							</AnimatePresence>
							<span className="text-sm font-medium text-muted-foreground mt-2 uppercase tracking-widest">
								{isActive ? "Sústredenie..." : "Pripravený"}
							</span>
						</div>
					</div>

					{/* Controls */}
					<div className="flex items-center gap-4">
						<Button
							variant="outline"
							size="icon-lg"
							onClick={resetTimer}
							className="rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
							title="Reset"
						>
							<RotateCcw className="size-6" />
						</Button>

						<Button
							size="icon-lg"
							onClick={toggleTimer}
							className={cn(
								"size-20 rounded-full shadow-xl transition-all duration-300 hover:scale-105 active:scale-95",
								isActive
									? "bg-secondary text-secondary-foreground"
									: "bg-primary text-primary-foreground",
							)}
						>
							{isActive ? (
								<Pause className="size-10 fill-current" />
							) : (
								<Play className="size-10 fill-current ml-1" />
							)}
						</Button>

						<Button
							variant="outline"
							size="icon-lg"
							onClick={skipMode}
							className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
							title="Preskočiť"
						>
							<SkipForward className="size-6" />
						</Button>
					</div>
				</CardContent>

				<div className="absolute top-4 right-4 z-20">
					<Popover open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
						<PopoverTrigger asChild>
							<Button variant="ghost" size="icon-sm" className="rounded-full">
								<Settings2 className="size-5 text-muted-foreground hover:text-foreground transition-colors" />
							</Button>
						</PopoverTrigger>
						<PopoverContent
							className="w-80 p-6 bg-card/95 backdrop-blur-lg border-primary/10 shadow-2xl"
							align="end"
						>
							<div className="space-y-6">
								<div className="space-y-2">
									<h4 className="font-bold leading-none flex items-center gap-2">
										<Settings2 className="size-4" />
										Nastavenia časovača
									</h4>
									<p className="text-sm text-muted-foreground">
										Prispôsobte si dĺžku jednotlivých intervalov.
									</p>
								</div>

								<div className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="focus">Focus (minút)</Label>
										<Input
											id="focus"
											type="number"
											defaultValue={settings.focusDuration / 60}
											onChange={(e) =>
												updateSettings({
													focusDuration: Number(e.target.value) * 60,
												})
											}
											className="bg-background/50"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="shortBreak">Krátka prestávka (minút)</Label>
										<Input
											id="shortBreak"
											type="number"
											defaultValue={settings.shortBreakDuration / 60}
											onChange={(e) =>
												updateSettings({
													shortBreakDuration: Number(e.target.value) * 60,
												})
											}
											className="bg-background/50"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="longBreak">Dlhá prestávka (minút)</Label>
										<Input
											id="longBreak"
											type="number"
											defaultValue={settings.longBreakDuration / 60}
											onChange={(e) =>
												updateSettings({
													longBreakDuration: Number(e.target.value) * 60,
												})
											}
											className="bg-background/50"
										/>
									</div>
								</div>

								<div className="pt-2">
									<Button
										className="w-full"
										variant="secondary"
										onClick={() => setIsSettingsOpen(false)}
									>
										Uložiť a zavrieť
									</Button>
								</div>
							</div>
						</PopoverContent>
					</Popover>
				</div>
			</Card>

			{/* Stats or Tips (Optional) */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
				<Card className="bg-card/30 border-none backdrop-blur-sm">
					<CardContent className="pt-6 flex flex-col items-center text-center gap-2">
						<Brain className="size-5 text-primary" />
						<div className="text-xl font-bold">25m</div>
						<div className="text-xs text-muted-foreground uppercase tracking-wider">
							Ideálny focus
						</div>
					</CardContent>
				</Card>
				<Card className="bg-card/30 border-none backdrop-blur-sm">
					<CardContent className="pt-6 flex flex-col items-center text-center gap-2">
						<Coffee className="size-5 text-success" />
						<div className="text-xl font-bold">5m</div>
						<div className="text-xs text-muted-foreground uppercase tracking-wider">
							Krátky relax
						</div>
					</CardContent>
				</Card>
				<Card className="bg-card/30 border-none backdrop-blur-sm">
					<CardContent className="pt-6 flex flex-col items-center text-center gap-2">
						<RotateCcw className="size-5 text-muted-foreground" />
						<div className="text-xl font-bold">4 cykly</div>
						<div className="text-xs text-muted-foreground uppercase tracking-wider">
							Pred dlhou pauzou
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
