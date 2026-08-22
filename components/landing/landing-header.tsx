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
				<span className="font-heading text-[15px] font-semibold tracking-tight text-foreground">
					Boom Scope
				</span>
			</div>
			<nav className="flex items-center gap-2">
				<ModeToggle />
				{isAuthenticated ? (
					<Link href="/dashboard" className={cn(buttonVariants({ size: "sm" }), "px-4")}>
						Open workspace
					</Link>
				) : (
					<>
						<Link
							href="/login"
							className="hidden px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline"
						>
							Sign in
						</Link>
						<Link
							href="/register"
							className={cn(buttonVariants({ size: "sm" }), "px-4 shadow-none")}
						>
							Start free
						</Link>
					</>
				)}
			</nav>
		</header>
	);
}
