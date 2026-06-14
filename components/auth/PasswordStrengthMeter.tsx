"use client";

import { Check } from "lucide-react";
import {
	evaluatePasswordStrength,
	type PasswordCriteria,
} from "@/lib/password-strength";
import { cn } from "@/lib/utils";

type PasswordStrengthMeterProps = {
	password: string;
	className?: string;
};

const CRITERIA_LABELS: { key: keyof PasswordCriteria; label: string }[] = [
	{ key: "minLength", label: "At least 8 characters" },
	{ key: "hasLowercase", label: "Lowercase letter" },
	{ key: "hasUppercase", label: "Uppercase letter" },
	{ key: "hasNumber", label: "Number" },
	{ key: "hasSpecial", label: "Special character" },
];

const SEGMENT_COLORS: Record<number, string> = {
	0: "bg-destructive",
	1: "bg-orange-500",
	2: "bg-amber-500",
	3: "bg-lime-500",
	4: "bg-emerald-500",
};

const TEXT_COLORS: Record<number, string> = {
	0: "text-destructive",
	1: "text-orange-600 dark:text-orange-400",
	2: "text-amber-600 dark:text-amber-400",
	3: "text-lime-600 dark:text-lime-400",
	4: "text-emerald-600 dark:text-emerald-400",
};

export function PasswordStrengthMeter({
	password,
	className,
}: PasswordStrengthMeterProps) {
	const { score, label, criteria } = evaluatePasswordStrength(password);
	const isActive = password.length > 0;

	if (!isActive) {
		return (
			<p className={cn("text-xs text-muted-foreground", className)}>
				Password must be at least 8 characters.
			</p>
		);
	}

	return (
		<div
			data-slot="password-strength-meter"
			className={cn("flex flex-col gap-2.5", className)}
			aria-live="polite"
		>
			<div className="flex items-center justify-between gap-3">
				<div
					className="flex flex-1 gap-1"
					role="progressbar"
					aria-valuenow={score}
					aria-valuemin={0}
					aria-valuemax={4}
					aria-label="Password strength"
				>
					{[1, 2, 3, 4].map((segment) => (
						<div
							key={segment}
							className={cn(
								"h-1 flex-1 rounded-full transition-all duration-300",
								score >= segment ? SEGMENT_COLORS[score] : "bg-muted",
							)}
						/>
					))}
				</div>
				<span
					className={cn("shrink-0 text-xs font-medium", TEXT_COLORS[score])}
				>
					{label}
				</span>
			</div>

			<ul className="flex flex-wrap gap-x-3 gap-y-1">
				{CRITERIA_LABELS.map(({ key, label: criteriaLabel }) => {
					const met = criteria[key];
					return (
						<li
							key={key}
							className={cn(
								"flex items-center gap-1 text-xs transition-colors",
								met
									? "text-emerald-600 dark:text-emerald-400"
									: "text-muted-foreground/70",
							)}
						>
							{met ? (
								<Check className="size-3 shrink-0" aria-hidden="true" />
							) : (
								<span
									className="size-1 shrink-0 rounded-full bg-muted-foreground/40"
									aria-hidden="true"
								/>
							)}
							{criteriaLabel}
						</li>
					);
				})}
			</ul>
		</div>
	);
}
