import Link from "next/link";
import type { ReactNode } from "react";
import { ScopeMark } from "@/components/brand/scope-mark";
import { cn } from "@/lib/utils";

type AuthShellProps = {
	children: ReactNode;
	title: string;
	description: string;
	className?: string;
};

export function AuthShell({
	children,
	title,
	description,
	className,
}: AuthShellProps) {
	return (
		<div className="relative flex min-h-full flex-1 flex-col bg-background">
			<header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10">
				<Link href="/" className="flex items-center gap-3">
					<ScopeMark size="sm" />
					<span className="font-heading text-lg font-semibold tracking-tight">
						Boom Scope
					</span>
				</Link>
				<p className="hidden font-mono text-[11px] tracking-wider text-muted-foreground uppercase sm:block">
					Field workspace
				</p>
			</header>

			<main className="relative z-10 flex flex-1 items-center justify-center px-4 pb-16">
				<div className={cn("w-full max-w-md", className)}>
					<div className="mb-6 space-y-2 text-center sm:text-left">
						<p className="font-mono text-[11px] tracking-[0.2em] text-scope uppercase">
							Access
						</p>
						<h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
							{title}
						</h1>
						<p className="text-sm text-muted-foreground">{description}</p>
					</div>
					{children}
				</div>
			</main>
		</div>
	);
}
