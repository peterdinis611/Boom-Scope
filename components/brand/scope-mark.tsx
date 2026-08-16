import { cn } from "@/lib/utils";

type ScopeMarkProps = {
	className?: string;
	size?: "sm" | "md" | "lg";
};

const sizeClasses = {
	sm: "size-7",
	md: "size-9",
	lg: "size-12",
} as const;

export function ScopeMark({ className, size = "md" }: ScopeMarkProps) {
	return (
		<span
			aria-hidden="true"
			className={cn(
				"relative inline-flex shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--scope)_35%,transparent)]",
				sizeClasses[size],
				className,
			)}
		>
			<span className="absolute inset-[22%] rounded-full border border-scope/50" />
			<span className="absolute h-px w-[62%] bg-primary/80" />
			<span className="absolute h-[62%] w-px bg-scope/70" />
			<span className="absolute size-1.5 rounded-full bg-primary shadow-[0_0_0_3px_color-mix(in_oklab,var(--boom)_25%,transparent)]" />
		</span>
	);
}
