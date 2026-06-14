"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { RedirectingOverlay } from "@/components/auth/RedirectingOverlay";
import {
	VERIFICATION_CODE_LENGTH,
	VerificationCodeInput,
} from "@/components/auth/VerificationCodeInput";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import {
	classifySignInResult,
	credentialsSchema,
	firstZodIssueMessage,
} from "@/lib/auth-forms";
import { api } from "@/convex/_generated/api";

export default function LoginPage() {
	const { signIn } = useAuthActions();
	const emailVerificationEnabled = useQuery(api.authConfig.emailVerificationEnabled);
	const router = useRouter();
	const [step, setStep] = useState<"signIn" | { email: string }>("signIn");
	const [verificationCode, setVerificationCode] = useState("");
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
			toast.error("Skontrolujte formulár", {
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
				toast.error("Nesprávny email alebo heslo.", {
					description:
						"Skontrolujte údaje alebo sa zaregistrujte. Uistite sa, že nemáte medzery okolo emailu.",
				});
				return;
			}
			if (outcome === "redirect") {
				return;
			}
			if (outcome === "pending") {
				toast.success("Overovací kód bol odoslaný.", {
					description:
						"Skontrolujte doručenú poštu aj spam. Pri testovacej doméne Maileroo musí byť váš email v Authorized Recipients.",
				});
				setStep({ email: parsed.data.email });
				setVerificationCode("");
				return;
			}
			toast.success("Vitajte späť!");
			// Soft navigation triggers app/dashboard/loading.tsx Suspense fallback while
			// the dashboard segment streams in. router.refresh() re-runs the root layout
			// so server cookies + Convex serverState pick up the new session.
			startTransition(() => {
				router.replace("/dashboard");
				router.refresh();
			});
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Prihlásenie zlyhalo.";
			toast.error("Prihlásenie zlyhalo.", { description: message });
		} finally {
			setSubmitting(false);
		}
	}

	async function onVerify(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (step === "signIn") return;

		const code = verificationCode.trim();
		if (code.length !== VERIFICATION_CODE_LENGTH) {
			toast.error("Zadajte celý 8-miestny kód z emailu.");
			return;
		}

		const fd = new FormData();
		fd.set("email", step.email);
		fd.set("code", code);
		fd.set("flow", "email-verification");

		setSubmitting(true);
		try {
			const result = await signIn("password", fd);
			const outcome = classifySignInResult(result);
			if (outcome === "fail" || outcome === "pending") {
				toast.error("Neplatný alebo expirovaný kód.");
				return;
			}
			if (outcome === "redirect") {
				return;
			}
			toast.success("Email bol overený!");
			startTransition(() => {
				router.replace("/dashboard");
				router.refresh();
			});
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Overenie zlyhalo.";
			toast.error("Overenie zlyhalo.", { description: message });
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div className="relative flex flex-1 items-center justify-center bg-background px-4 py-16">
			<div className="w-full max-w-md">
				<Card>
					<CardHeader>
						<CardTitle>
							{step === "signIn" ? "Prihlásenie" : "Overenie emailu"}
						</CardTitle>
						<CardDescription>
							{step === "signIn"
								? "Zadajte svoj email a heslo pre vstup do dashboardu."
								: `Zadajte 8-miestny kód odoslaný na ${step.email}.`}
						</CardDescription>
					</CardHeader>
					{step === "signIn" ? (
					<form noValidate onSubmit={onSubmit}>
						<fieldset disabled={busy} className="contents">
							<CardContent className="flex flex-col gap-4">
								<div className="flex flex-col gap-2">
									<Label htmlFor="email">Email</Label>
									<Input
										id="email"
										name="email"
										type="email"
										autoComplete="email"
										placeholder="vy@firma.sk"
									/>
								</div>
								<div className="flex flex-col gap-2">
									<Label htmlFor="password">Heslo</Label>
									<PasswordInput
										id="password"
										name="password"
										autoComplete="current-password"
										placeholder="••••••••"
									/>
								</div>
								<p className="text-right text-sm">
									{emailVerificationEnabled ? (
										<Link
											href="/forgot-password"
											className="text-primary underline-offset-4 hover:underline"
										>
											Zabudnuté heslo?
										</Link>
									) : null}
								</p>
							</CardContent>
							<CardFooter className="mt-6 flex flex-col items-stretch gap-3">
								<Button type="submit" disabled={busy} size="lg">
									{submitting
										? "Prihlasujem…"
										: navPending
											? "Presmerúvam…"
											: "Prihlásiť sa"}
								</Button>
								<p className="text-center text-sm text-muted-foreground">
									Nemáte účet?{" "}
									<Link
										href="/register"
										className="font-medium text-primary underline-offset-4 hover:underline"
									>
										Zaregistrovať sa
									</Link>
								</p>
							</CardFooter>
						</fieldset>
					</form>
					) : (
						<form noValidate onSubmit={onVerify}>
							<fieldset disabled={busy} className="contents">
								<CardContent className="flex flex-col gap-4">
									<VerificationCodeInput
										value={verificationCode}
										onChange={setVerificationCode}
										disabled={busy}
									/>
								</CardContent>
								<CardFooter className="mt-6 flex flex-col items-stretch gap-3">
									<Button
										type="submit"
										disabled={
											busy ||
											verificationCode.length !== VERIFICATION_CODE_LENGTH
										}
										size="lg"
									>
										{submitting ? "Overujem…" : "Overiť a pokračovať"}
									</Button>
									<Button
										type="button"
										variant="ghost"
										onClick={() => {
											setStep("signIn");
											setVerificationCode("");
										}}
										disabled={busy}
									>
										Späť
									</Button>
								</CardFooter>
							</fieldset>
						</form>
					)}
				</Card>
			</div>

			<RedirectingOverlay show={navPending} label="Presmerúvam na dashboard…" />
		</div>
	);
}
