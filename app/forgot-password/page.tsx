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
import { toastAppError } from "@/lib/errors";
import { api } from "@/convex/_generated/api";

type Step = "request" | { email: string };

export default function ForgotPasswordPage() {
	const { signIn } = useAuthActions();
	const emailVerificationEnabled = useQuery(api.authConfig.emailVerificationEnabled);
	const router = useRouter();
	const [step, setStep] = useState<Step>("request");
	const [verificationCode, setVerificationCode] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [navPending, startTransition] = useTransition();
	const busy = submitting || navPending;

	if (emailVerificationEnabled === false) {
		return (
			<div className="flex flex-1 items-center justify-center bg-background px-4 py-16">
				<Card className="w-full max-w-md">
					<CardHeader>
						<CardTitle>Obnovenie hesla</CardTitle>
						<CardDescription>
							Reset hesla cez email je dostupný až po nastavení vlastnej
							overenej domény v Maileroo.
						</CardDescription>
					</CardHeader>
					<CardFooter>
						<Link
							href="/login"
							className="text-sm font-medium text-primary underline-offset-4 hover:underline"
						>
							Späť na prihlásenie
						</Link>
					</CardFooter>
				</Card>
			</div>
		);
	}

	async function onRequestReset(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const form = event.currentTarget;
		const email = String(new FormData(form).get("email") ?? "").trim();
		const parsed = credentialsSchema.shape.email.safeParse(email);
		if (!parsed.success) {
			toast.error("Skontrolujte formulár", {
				description: firstZodIssueMessage(parsed.error),
			});
			return;
		}

		const fd = new FormData();
		fd.set("email", parsed.data);
		fd.set("flow", "reset");

		setSubmitting(true);
		try {
			const result = await signIn("password", fd);
			const outcome = classifySignInResult(result);
			if (outcome === "fail") {
				toast.error("Nepodarilo sa odoslať kód.");
				return;
			}
			toast.success("Kód bol odoslaný.", {
				description: "Skontrolujte svoj email.",
			});
			setStep({ email: parsed.data });
			setVerificationCode("");
		} catch (error) {
			toastAppError("Nepodarilo sa odoslať kód.", error);
		} finally {
			setSubmitting(false);
		}
	}

	async function onResetPassword(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (step === "request") return;

		const form = event.currentTarget;
		const code = verificationCode.trim();
		const newPassword = String(new FormData(form).get("newPassword") ?? "");

		if (code.length !== VERIFICATION_CODE_LENGTH) {
			toast.error("Zadajte celý 8-miestny kód z emailu.");
			return;
		}

		const parsed = credentialsSchema.shape.password.safeParse(newPassword);
		if (!parsed.success) {
			toast.error("Skontrolujte formulár", {
				description: firstZodIssueMessage(parsed.error),
			});
			return;
		}

		const fd = new FormData();
		fd.set("email", step.email);
		fd.set("code", code);
		fd.set("newPassword", parsed.data);
		fd.set("flow", "reset-verification");

		setSubmitting(true);
		try {
			const result = await signIn("password", fd);
			const outcome = classifySignInResult(result);
			if (outcome === "fail") {
				toast.error("Neplatný kód alebo heslo.");
				return;
			}
			toast.success("Heslo bolo zmenené.");
			startTransition(() => {
				router.replace("/login");
				router.refresh();
			});
		} catch (error) {
			toastAppError("Nepodarilo sa zmeniť heslo.", error);
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div className="relative flex flex-1 items-center justify-center bg-background px-4 py-16">
			<div className="w-full max-w-md">
				<Card>
					<CardHeader>
						<CardTitle>Obnovenie hesla</CardTitle>
						<CardDescription>
							{step === "request"
								? "Zadajte email a pošleme vám overovací kód."
								: `Zadajte kód z emailu ${step.email} a nové heslo.`}
						</CardDescription>
					</CardHeader>

					{step === "request" ? (
						<form noValidate onSubmit={onRequestReset}>
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
								</CardContent>
								<CardFooter className="mt-6 flex flex-col items-stretch gap-3">
									<Button type="submit" disabled={busy} size="lg">
										{submitting ? "Odosielam…" : "Odoslať kód"}
									</Button>
									<p className="text-center text-sm text-muted-foreground">
										<Link
											href="/login"
											className="font-medium text-primary underline-offset-4 hover:underline"
										>
											Späť na prihlásenie
										</Link>
									</p>
								</CardFooter>
							</fieldset>
						</form>
					) : (
						<form noValidate onSubmit={onResetPassword}>
							<fieldset disabled={busy} className="contents">
								<CardContent className="flex flex-col gap-4">
									<VerificationCodeInput
										value={verificationCode}
										onChange={setVerificationCode}
										disabled={busy}
									/>
									<div className="flex flex-col gap-2">
										<Label htmlFor="newPassword">Nové heslo</Label>
										<PasswordInput
											id="newPassword"
											name="newPassword"
											autoComplete="new-password"
											placeholder="Aspoň 8 znakov"
										/>
									</div>
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
										{submitting ? "Ukladám…" : "Nastaviť nové heslo"}
									</Button>
									<Button
										type="button"
										variant="ghost"
										onClick={() => {
											setStep("request");
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

			<RedirectingOverlay show={navPending} label="Presmerúvam na prihlásenie…" />
		</div>
	);
}
