"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { LogOut } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { AnimatedSkeleton } from "@/components/ui/animated-skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
			toast.success("Boli ste odhlásený.", {
				description: "Dovidenia! Vraciame vás na prihlásenie.",
			});
			startTransition(() => {
				router.replace("/login");
				router.refresh();
			});
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Skúste to znova prosím.";
			toast.error("Odhlásenie zlyhalo.", { description: message });
			setSigningOut(false);
		}
	}

	const isLoading = viewer === undefined;
	const email = viewer?.email ?? null;
	const name = viewer?.name ?? null;
	const image = viewer?.image ?? undefined;
	const display = name ?? email ?? "Neznámy používateľ";
	const busy = signingOut || navPending;

	return (
		<div
			data-slot="user-menu"
			aria-busy={isLoading || busy}
			className="flex items-center gap-3 rounded-full border border-border bg-background py-1 pr-1 pl-1 shadow-xs"
		>
			<AnimatePresence mode="wait" initial={false}>
				{isLoading ? (
					<motion.div
						key="user-skeleton"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						className="flex items-center gap-3"
					>
						<AnimatedSkeleton className="size-8 rounded-full" />
						<div className="flex flex-col gap-1.5">
							<AnimatedSkeleton className="h-3 w-24" delay={0.05} />
							<AnimatedSkeleton className="h-2.5 w-32" delay={0.1} />
						</div>
						<AnimatedSkeleton className="size-7 rounded-md" delay={0.15} />
					</motion.div>
				) : (
					<motion.div
						key="user-info"
						initial={{ opacity: 0, y: 4 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.3, ease: "easeOut" }}
						className="flex items-center gap-3"
					>
						<Avatar className="size-8">
							{image ? <AvatarImage src={image} alt={display} /> : null}
							<AvatarFallback>{getInitials(name ?? email)}</AvatarFallback>
						</Avatar>

						<div className="flex flex-col leading-tight">
							<span className="text-xs font-medium text-foreground">
								{display}
							</span>
							{email && name ? (
								<span className="text-[11px] text-muted-foreground">
									{email}
								</span>
							) : null}
						</div>

						<Button
							type="button"
							variant="ghost"
							size="icon-sm"
							onClick={handleSignOut}
							disabled={busy}
							aria-label="Odhlásiť sa"
							title="Odhlásiť sa"
						>
							<LogOut />
						</Button>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
