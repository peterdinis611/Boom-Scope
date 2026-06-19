"use client";

import { MinusIcon } from "lucide-react";
import type * as React from "react";

function InputOTPSeparator({ ...props }: React.ComponentProps<"span">) {
	return (
		<span
			data-slot="input-otp-separator"
			aria-hidden="true"
			className="flex items-center [&_svg:not([class*='size-'])]:size-4"
			{...props}
		>
			<MinusIcon />
		</span>
	);
}

export { InputOTPSeparator };
