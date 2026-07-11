"use client";

import {
	Brain,
	Clock,
	Coffee,
	type LucideIcon,
	Pause,
	Play,
	RotateCcw,
	Settings2,
	SkipForward,
	X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
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

const MODES: PomodoroMode[] = ["focus", "shortBreak", "longBreak"];

export function PomodoroTimer() {
	const {
		timeLeft,
		isActive,
		mode,
		settings,
		progress,
		focusTarget,
		toggleTimer,
		resetTimer,
		skipMode,
		setMode,
		updateSettings,
		clearFocusOnTask,
	} = usePomodoro();

	const [isSettingsOpen, setIsSettingsOpen] = useState(false);

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
	};

	const formatMinutes = (seconds: number) => `${Math.round(seconds / 60)}m`;

	const modeConfig: Record<
		PomodoroMode,
		{ label: string; icon: LucideIcon; color: string; description: string }
	> = {
		focus: {
			label: "Focus",
			icon: Brain,
			color: "text-primary",
			description: "Time for focused work",
		},
		shortBreak: {
			label: "Short break",
			icon: Coffee,
			color: "text-success",
			description: "Quick rest",
		},
		longBreak: {
			label: "Long break",
			icon: Clock,
			color: "text-primary",
			description: "Longer rest to recharge",
		},
	};

	const { label, icon: Icon, color, description } = modeConfig[mode];

	return (
		<div className="w-full">
			<Card className="relative overflow-hidden shadow-sm">
				{focusTarget ? (
					<div className="flex items-center justify-between gap-3 border-b border-primary/20 bg-primary/5 px-4 py-3">
						<div className="min-w-0">
							<p className="text-xs font-medium uppercase tracking-wide text-primary">
								Focusing on
							</p>
							<p className="truncate text-sm font-medium">{focusTarget.taskTitle}</p>
						</div>
						<Button
							type="button"
							variant="ghost"
							size="icon-sm"
							onClick={clearFocusOnTask}
							aria-label="Clear task focus"
						>
							<X className="size-4" />
						</Button>
					</div>
				) : null}
				<div className="border-b border-border bg-muted/20 p-2">
					<div
						className="grid grid-cols-3 gap-1 rounded-lg bg-background/70 p-1"
						role="tablist"
						aria-label="Pomodoro mode"
					>
						{MODES.map((m) => (
							<Button
								key={m}
								type="button"
								role="tab"
								aria-selected={mode === m}
								variant={mode === m ? "default" : "ghost"}
								size="sm"
								onClick={() => setMode(m)}
								className={cn(
									"h-9 rounded-md text-xs sm:text-sm",
									mode === m && "shadow-sm",
								)}
							>
								{modeConfig[m].label}
							</Button>
						))}
					</div>
				</div>

				<Popover open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
					<PopoverTrigger asChild>
						<Button
							variant="ghost"
							size="icon-sm"
							className="absolute top-3 right-3 z-20 rounded-full"
							aria-label="Timer settings"
						>
							<Settings2 className="size-4 text-muted-foreground" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-80 p-6" align="end">
						<div className="space-y-6">
							<div className="space-y-2">
								<h4 className="flex items-center gap-2 font-bold leading-none">
									<Settings2 className="size-4" />
									Timer settings
								</h4>
								<p className="text-sm text-muted-foreground">
									Customize the length of each interval.
								</p>
							</div>

							<div className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="focus">Focus (minutes)</Label>
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
									<Label htmlFor="shortBreak">Short break (minutes)</Label>
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
									<Label htmlFor="longBreak">Long break (minutes)</Label>
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

							<Button
								className="w-full"
								variant="secondary"
								onClick={() => setIsSettingsOpen(false)}
							>
								Save and close
							</Button>
						</div>
					</PopoverContent>
				</Popover>

				<CardHeader className="pb-2 pt-5 text-center">
					<div className="mb-1 flex items-center justify-center gap-2">
						<Icon className={cn("size-5", color)} />
						<CardTitle className="text-2xl font-bold tracking-tight">
							{label}
						</CardTitle>
					</div>
					<CardDescription>{description}</CardDescription>
				</CardHeader>

				<CardContent className="flex flex-col items-center gap-6 px-4 pb-6 sm:px-8">
					<div className="relative flex size-56 items-center justify-center sm:size-64">
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
									className="font-mono text-5xl font-bold tracking-tighter sm:text-6xl"
								>
									{formatTime(timeLeft)}
								</motion.span>
							</AnimatePresence>
							<span className="mt-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
								{isActive ? "Focus..." : "Ready"}
							</span>
						</div>
					</div>

					<div className="flex items-center gap-3 sm:gap-4">
						<Button
							variant="outline"
							size="icon-lg"
							onClick={resetTimer}
							className="rounded-full hover:bg-destructive/10 hover:text-destructive"
							title="Reset"
						>
							<RotateCcw className="size-5" />
						</Button>

						<Button
							size="icon-lg"
							onClick={toggleTimer}
							className={cn(
								"size-16 rounded-full shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 sm:size-[4.5rem]",
								isActive
									? "bg-secondary text-secondary-foreground"
									: "bg-primary text-primary-foreground",
							)}
							aria-label={isActive ? "Pause timer" : "Start timer"}
						>
							{isActive ? (
								<Pause className="size-8 fill-current sm:size-9" />
							) : (
								<Play className="ml-0.5 size-8 fill-current sm:size-9" />
							)}
						</Button>

						<Button
							variant="outline"
							size="icon-lg"
							onClick={skipMode}
							className="rounded-full hover:bg-primary/10 hover:text-primary"
							title="Skip"
						>
							<SkipForward className="size-5" />
						</Button>
					</div>
				</CardContent>

				<CardFooter className="grid grid-cols-3 gap-2 border-t bg-muted/15 px-4 py-4 sm:px-6">
					<div className="rounded-lg border border-border/60 bg-background/60 px-3 py-2.5 text-center">
						<p className="text-sm font-semibold tabular-nums">
							{formatMinutes(settings.focusDuration)}
						</p>
						<p className="text-[11px] text-muted-foreground">Ideal focus session</p>
					</div>
					<div className="rounded-lg border border-border/60 bg-background/60 px-3 py-2.5 text-center">
						<p className="text-sm font-semibold tabular-nums">
							{formatMinutes(settings.shortBreakDuration)}
						</p>
						<p className="text-[11px] text-muted-foreground">Short break</p>
					</div>
					<div className="rounded-lg border border-border/60 bg-background/60 px-3 py-2.5 text-center">
						<p className="text-sm font-semibold tabular-nums">4 cycles</p>
						<p className="text-[11px] text-muted-foreground">Before long break</p>
					</div>
				</CardFooter>
			</Card>
		</div>
	);
}
