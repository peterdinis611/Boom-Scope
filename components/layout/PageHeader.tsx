import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { typography } from "@/lib/typography";

type PageHeaderProps = {
	title: string;
	description?: string;
	actions?: ReactNode;
	className?: string;
};

export function PageHeader({
	title,
	description,
	actions,
	className,
}: PageHeaderProps) {
	return (
		<div
			className={cn(
				"flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
				className,
			)}
		>
			<div className="flex flex-col gap-1.5">
				<h1 className={typography.pageTitle}>{title}</h1>
				{description ? (
					<p className={typography.caption}>{description}</p>
				) : null}
			</div>
			{actions ? (
				<div className="flex shrink-0 flex-wrap items-center gap-2">
					{actions}
				</div>
			) : null}
		</div>
	);
}
