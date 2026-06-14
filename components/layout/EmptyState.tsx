import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
	icon?: LucideIcon;
	title: string;
	description?: string;
	action?: ReactNode;
	className?: string;
};

export function EmptyState({
	icon: Icon,
	title,
	description,
	action,
	className,
}: EmptyStateProps) {
	return (
		<div
			className={cn(
				"flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center",
				className,
			)}
		>
			{Icon ? (
				<div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-muted">
					<Icon className="size-6 text-muted-foreground" />
				</div>
			) : null}
			<h3 className="text-sm font-medium text-foreground">{title}</h3>
			{description ? (
				<p className="mt-1 max-w-sm text-sm text-muted-foreground">
					{description}
				</p>
			) : null}
			{action ? <div className="mt-4">{action}</div> : null}
		</div>
	);
}
