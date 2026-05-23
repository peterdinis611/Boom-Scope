import type * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
	return (
		<textarea
			data-slot="textarea"
			className={cn(
				"flex field-sizing-content min-h-16 w-full rounded-2xl border border-border bg-background/40 backdrop-blur-sm px-4 py-3 text-base shadow-sm transition-all duration-300 outline-none placeholder:text-muted-foreground/45 focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-black/20 dark:border-white/10 dark:focus-visible:border-primary/50",
				className,
			)}
			{...props}
		/>
	);
}

export { Textarea };
