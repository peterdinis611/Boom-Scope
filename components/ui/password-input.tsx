"use client";

import { Eye, EyeOff } from "lucide-react";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type PasswordInputProps = Omit<React.ComponentProps<"input">, "type">;

function PasswordInput({ className, ...props }: PasswordInputProps) {
	const [visible, setVisible] = React.useState(false);

	return (
		<div data-slot="password-input" className="relative">
			<Input
				{...props}
				type={visible ? "text" : "password"}
				className={cn("pr-10", className)}
			/>
			<button
				type="button"
				onClick={() => setVisible((v) => !v)}
				aria-label={visible ? "Skryť heslo" : "Zobraziť heslo"}
				aria-pressed={visible}
				className={cn(
					"absolute inset-y-0 right-0 flex items-center px-3",
					"text-muted-foreground transition-colors hover:text-foreground",
					"focus-visible:text-foreground focus-visible:outline-none",
					"disabled:pointer-events-none disabled:opacity-50",
				)}
				tabIndex={-1}
			>
				{visible ? (
					<EyeOff className="size-4" aria-hidden="true" />
				) : (
					<Eye className="size-4" aria-hidden="true" />
				)}
			</button>
		</div>
	);
}

export { PasswordInput };
