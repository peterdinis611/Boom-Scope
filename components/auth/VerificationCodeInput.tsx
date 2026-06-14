"use client";

import { REGEXP_ONLY_DIGITS } from "input-otp";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";

export const VERIFICATION_CODE_LENGTH = 8;

type VerificationCodeInputProps = {
	id?: string;
	label?: string;
	value: string;
	onChange: (value: string) => void;
	disabled?: boolean;
};

export function VerificationCodeInput({
	id = "verification-code",
	label = "Verification code",
	value,
	onChange,
	disabled = false,
}: VerificationCodeInputProps) {
	return (
		<div className="flex flex-col gap-3">
			<Label htmlFor={id}>{label}</Label>
			<InputOTP
				id={id}
				maxLength={VERIFICATION_CODE_LENGTH}
				pattern={REGEXP_ONLY_DIGITS}
				inputMode="numeric"
				autoComplete="one-time-code"
				value={value}
				onChange={onChange}
				disabled={disabled}
				containerClassName="justify-center sm:justify-start"
			>
				<InputOTPGroup className="gap-0">
					{Array.from({ length: VERIFICATION_CODE_LENGTH }).map((_, index) => (
						<InputOTPSlot
							key={index}
							index={index}
							className="size-11 text-lg font-medium sm:size-12"
						/>
					))}
				</InputOTPGroup>
			</InputOTP>
			<p className="text-xs text-muted-foreground">
				Enter the {VERIFICATION_CODE_LENGTH}-digit code from your email. You can
				also paste the full code at once.
			</p>
		</div>
	);
}
