"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { RedirectingOverlay } from "@/components/auth/RedirectingOverlay";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import {
	classifySignInResult,
	credentialsSchema,
	firstZodIssueMessage,
} from "@/lib/auth-forms";
import { toastAppError } from "@/lib/errors";

export default function LoginPage() {
	const { signIn } = useAuthActions();
	const router = useRouter();
	const [submitting, setSubmitting] = useState(false);
	const [navPending, startTransition] = useTransition();
	const busy = submitting || navPending;

	async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const form = event.currentTarget;
		const parsed = credentialsSchema.safeParse({
			email: String(new FormData(form).get("email") ?? ""),
			password: String(new FormData(form).get("password") ?? ""),
		});
		if (!parsed.success) {
			toast.error("Please check the form", {
				description: firstZodIssueMessage(parsed.error),
			});
			return;
		}

		const fd = new FormData();
		fd.set("email", parsed.data.email);
		fd.set("password", parsed.data.password);
		fd.set("flow", "signIn");

		setSubmitting(true);
		try {
			const result = await signIn("password", fd);
			const outcome = classifySignInResult(result);
			if (outcome === "fail") {
				toast.error("Incorrect email or password.", {
					description:
						"Check your credentials or sign up. Make sure there are no spaces around your email.",
				});
				return;
			}
			if (outcome === "redirect") {
				return;
			}
			toast.success("Welcome back!");
			startTransition(() => {
				router.replace("/dashboard");
				router.refresh();
			});
		} catch (error) {
			toastAppError("Sign-in failed.", error);
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<AuthShell
			title="Sign in"
			description="Enter your email and password to access the dashboard."
		>
			<Card className="border-border/80 bg-card/80 shadow-lg shadow-primary/5 backdrop-blur-sm">
				<form noValidate onSubmit={onSubmit}>
					<fieldset disabled={busy} className="contents">
						<CardContent className="flex flex-col gap-4 pt-6">
							<div className="flex flex-col gap-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									name="email"
									type="email"
									autoComplete="email"
									placeholder="you@company.com"
								/>
							</div>
							<div className="flex flex-col gap-2">
								<div className="flex items-center justify-between gap-2">
									<Label htmlFor="password">Password</Label>
									<Link
										href="/forgot-password"
										className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
									>
										Forgot?
									</Link>
								</div>
								<PasswordInput
									id="password"
									name="password"
									autoComplete="current-password"
									placeholder="••••••••"
								/>
							</div>
						</CardContent>
						<CardFooter className="mt-6 flex flex-col items-stretch gap-3">
							<Button type="submit" disabled={busy} size="lg">
								{submitting
									? "Signing in…"
									: navPending
										? "Redirecting…"
										: "Sign in"}
							</Button>
							<p className="text-center text-sm text-muted-foreground">
								Don't have an account?{" "}
								<Link
									href="/register"
									className="font-medium text-primary underline-offset-4 hover:underline"
								>
									Sign up
								</Link>
							</p>
						</CardFooter>
					</fieldset>
				</form>
			</Card>

			<RedirectingOverlay show={navPending} label="Redirecting to dashboard…" />
		</AuthShell>
	);
}
