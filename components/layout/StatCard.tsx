import type { LucideIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
	title: string;
	value: string | number;
	description?: string;
	icon?: LucideIcon;
	href?: Route;
	className?: string;
	footer?: ReactNode;
};

export function StatCard({
	title,
	value,
	description,
	icon: Icon,
	href,
	className,
	footer,
}: StatCardProps) {
	const content = (
		<Card
			className={cn(
				"transition-colors",
				href && "hover:border-primary/40",
				className,
			)}
		>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium">{title}</CardTitle>
				{Icon ? <Icon className="size-4 text-muted-foreground" /> : null}
			</CardHeader>
			<CardContent>
				<div className="text-2xl font-semibold tabular-nums">{value}</div>
				{description ? (
					<p className="mt-1 text-xs text-muted-foreground">{description}</p>
				) : null}
				{footer}
			</CardContent>
		</Card>
	);

	if (href) {
		return (
			<Link href={href as Route} className="block">
				{content}
			</Link>
		);
	}

	return content;
}
