"use client";

import { useState } from "react";

import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { cn } from "@/lib/utils";

type PasswordFieldProps = {
	id: string;
	name: string;
	label: string;
	autoComplete?: string;
	placeholder?: string;
	disabled?: boolean;
	showStrength?: boolean;
	className?: string;
};

export function PasswordField({
	id,
	name,
	label,
	autoComplete,
	placeholder,
	disabled,
	showStrength = false,
	className,
}: PasswordFieldProps) {
	const [password, setPassword] = useState("");

	return (
		<div className={cn("flex flex-col gap-2", className)}>
			<Label htmlFor={id}>{label}</Label>
			<PasswordInput
				id={id}
				name={name}
				autoComplete={autoComplete}
				placeholder={placeholder}
				disabled={disabled}
				value={showStrength ? password : undefined}
				onChange={
					showStrength ? (event) => setPassword(event.target.value) : undefined
				}
			/>
			{showStrength ? <PasswordStrengthMeter password={password} /> : null}
		</div>
	);
}
