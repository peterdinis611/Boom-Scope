import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageContainerProps = {
	children: ReactNode;
	className?: string;
	size?: "default" | "wide" | "full";
};

const sizeClasses = {
	default: "max-w-6xl",
	wide: "max-w-7xl",
	full: "max-w-none",
};

export function PageContainer({
	children,
	className,
	size = "default",
}: PageContainerProps) {
	return (
		<div
			className={cn(
				"mx-auto w-full px-4 py-6 md:px-8",
				sizeClasses[size],
				className,
			)}
		>
			{children}
		</div>
	);
}
