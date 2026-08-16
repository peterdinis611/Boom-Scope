"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useAction, useQuery } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { PasswordField } from "@/components/auth/PasswordField";
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
import { api } from "@/convex/_generated/api";
import {
	classifySignInResult,
	credentialsSchema,
	firstZodIssueMessage,
} from "@/lib/auth-forms";
import { toastAppError } from "@/lib/errors";

export default function RegisterPage() {
	const { signIn } = useAuthActions();
	const sendRegistrationWelcome = useAction(
		api.emailsNode.sendRegistrationWelcome,
	);
	const transactionalEmailsEnabled = useQuery(
		api.authConfig.transactionalEmailsEnabled,
	);
	const router = useRouter();
	const [submitting, setSubmitting] = useState(false);
	const [navPending, startTransition] = useTransition();
	const busy = submitting || navPending;

	async function completeRegistration(email: string) {
		if (transactionalEmailsEnabled) {
			try {
				const result = await sendRegistrationWelcome({ email });
				if (result.sent) {
					toast.success("Account created!", {
						description: "We sent a registration confirmation to your email.",
					});
				} else {
					toast.success("Account created!");
				}
			} catch {
				toast.success("Account created!");
			}
		} else {
			toast.success("Account created!");
		}

		startTransition(() => {
			router.replace("/dashboard");
			router.refresh();
		});
	}

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
		fd.set("flow", "signUp");

		setSubmitting(true);
		try {
			const result = await signIn("password", fd);
			const outcome = classifySignInResult(result);
			if (outcome === "fail") {
				toast.error("Could not complete registration.", {
					description: "This email may already be registered. Try signing in.",
				});
				return;
			}
			if (outcome === "redirect") {
				return;
			}
			await completeRegistration(parsed.data.email);
		} catch (error) {
			toastAppError("Could not complete registration.", error);
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<AuthShell
			title="Create account"
			description="Sign up with your email and password to access the dashboard."
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
							<PasswordField
								id="password"
								name="password"
								label="Password"
								autoComplete="new-password"
								placeholder="At least 8 characters"
								showStrength
							/>
						</CardContent>
						<CardFooter className="mt-6 flex flex-col items-stretch gap-3">
							<Button type="submit" disabled={busy} size="lg">
								{submitting
									? "Signing up…"
									: navPending
										? "Redirecting…"
										: "Sign up"}
							</Button>
							<p className="text-center text-sm text-muted-foreground">
								Already have an account?{" "}
								<Link
									href="/login"
									className="font-medium text-primary underline-offset-4 hover:underline"
								>
									Sign in
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
