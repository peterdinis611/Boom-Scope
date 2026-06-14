"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { ChevronDown, LogOut, Settings } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { AnimatedSkeleton } from "@/components/ui/animated-skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/convex/_generated/api";

function getInitials(value: string | null | undefined) {
	if (!value) return "?";
	const trimmed = value.trim();
	if (trimmed.length === 0) return "?";
	const [local] = trimmed.split("@");
	return local.slice(0, 2).toUpperCase();
}

export function UserMenu() {
	const viewer = useQuery(api.users.viewer);
	const { signOut } = useAuthActions();
	const router = useRouter();
	const [signingOut, setSigningOut] = useState(false);
	const [navPending, startTransition] = useTransition();

	async function handleSignOut() {
		setSigningOut(true);
		try {
			await signOut();
			toast.success("You have been signed out.", {
				description: "Goodbye! Redirecting you to sign in.",
			});
			startTransition(() => {
				router.replace("/login");
				router.refresh();
			});
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Please try again.";
			toast.error("Sign out failed.", { description: message });
			setSigningOut(false);
		}
	}

	const isLoading = viewer === undefined;
	const email = viewer?.email ?? null;
	const name = viewer?.name ?? null;
	const image = viewer?.image ?? undefined;
	const display = name ?? email ?? "Unknown user";
	const busy = signingOut || navPending;

	if (isLoading) {
		return (
			<div
				data-slot="user-menu"
				aria-busy
				className="flex size-9 items-center justify-center"
			>
				<AnimatedSkeleton className="size-8 rounded-full" />
			</div>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					type="button"
					variant="ghost"
					disabled={busy}
					aria-label="Account menu"
					className="h-9 max-w-[220px] gap-2 rounded-full border border-border/60 bg-background px-1.5 pr-2 shadow-xs hover:bg-accent/60"
				>
					<Avatar className="size-7">
						{image ? <AvatarImage src={image} alt={display} /> : null}
						<AvatarFallback className="text-[10px] font-semibold">
							{getInitials(name ?? email)}
						</AvatarFallback>
					</Avatar>
					<span className="hidden min-w-0 truncate text-sm font-medium sm:inline">
						{display}
					</span>
					<ChevronDown className="size-4 shrink-0 text-muted-foreground" />
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end" className="w-64 p-2">
				<div className="flex items-center gap-3 rounded-lg px-2 py-2.5">
					<Avatar className="size-10">
						{image ? <AvatarImage src={image} alt={display} /> : null}
						<AvatarFallback>{getInitials(name ?? email)}</AvatarFallback>
					</Avatar>
					<div className="min-w-0 flex-1">
						<p className="truncate text-sm font-semibold text-foreground">
							{display}
						</p>
						{email ? (
							<p className="truncate text-xs text-muted-foreground">{email}</p>
						) : null}
					</div>
				</div>

				<DropdownMenuSeparator className="my-1.5" />

				<DropdownMenuItem asChild className="gap-2 rounded-lg px-2 py-2">
					<Link href={"/dashboard/settings" as Route}>
						<Settings className="size-4" />
						Settings
					</Link>
				</DropdownMenuItem>

				<DropdownMenuSeparator className="my-1.5" />

				<DropdownMenuItem
					variant="destructive"
					disabled={busy}
					onClick={handleSignOut}
					className="gap-2 rounded-lg px-2 py-2"
				>
					<LogOut className="size-4" />
					Sign out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
