"use client";

import Link from "next/link";
import { ScopeMark } from "@/components/brand/scope-mark";
import { ModeToggle } from "@/components/mode-toggle";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

type LandingHeaderProps = {
	isAuthenticated: boolean;
};

export function LandingHeader({ isAuthenticated }: LandingHeaderProps) {
	return (
		<header className="relative z-20 flex items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-12">
			<div className="flex items-center gap-2.5">
				<ScopeMark size="sm" />
				<span className="font-[family-name:var(--font-landing-display)] text-[15px] font-semibold tracking-tight text-[var(--ink)]">
					Boom Scope
				</span>
			</div>
			<nav className="flex items-center gap-2">
				<ModeToggle />
				{isAuthenticated ? (
					<Link
						href="/dashboard"
						className={cn(
							buttonVariants({ size: "sm" }),
							"rounded-md bg-[var(--brass)] px-4 text-[var(--paper)] hover:bg-[var(--brass)]/90",
						)}
					>
						Open workspace
					</Link>
				) : (
					<>
						<Link
							href="/login"
							className="hidden px-3 py-1.5 text-sm text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)] sm:inline"
						>
							Sign in
						</Link>
						<Link
							href="/register"
							className={cn(
								buttonVariants({ size: "sm" }),
								"rounded-md bg-[var(--brass)] px-4 text-[var(--paper)] shadow-none hover:bg-[var(--brass)]/90",
							)}
						>
							Start free
						</Link>
					</>
				)}
			</nav>
		</header>
	);
}
