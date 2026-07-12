"use client";

import {
	CircleCheckIcon,
	InfoIcon,
	Loader2Icon,
	OctagonXIcon,
	TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
	const { theme = "system" } = useTheme();

	return (
		<Sonner
			theme={theme as ToasterProps["theme"]}
			className="toaster group"
			richColors
			closeButton
			position="bottom-right"
			icons={{
				success: (
					<CircleCheckIcon className="size-4 text-emerald-600 dark:text-emerald-400" />
				),
				info: <InfoIcon className="size-4 text-sky-600 dark:text-sky-400" />,
				warning: (
					<TriangleAlertIcon className="size-4 text-amber-600 dark:text-amber-400" />
				),
				error: (
					<OctagonXIcon className="size-4 text-rose-600 dark:text-rose-400" />
				),
				loading: (
					<Loader2Icon className="size-4 animate-spin text-violet-600 dark:text-violet-400" />
				),
			}}
			toastOptions={{
				classNames: {
					toast: "cn-toast group-[.toaster]:shadow-lg group-[.toaster]:backdrop-blur-sm",
					title: "group-[.toast]:font-medium",
					description: "group-[.toast]:text-[13px] group-[.toast]:opacity-90",
					actionButton:
						"group-[.toast]:rounded-md group-[.toast]:font-medium",
					cancelButton:
						"group-[.toast]:rounded-md group-[.toast]:font-medium",
					closeButton:
						"group-[.toast]:rounded-md group-[.toast]:border group-[.toast]:border-current/10",
					success: "cn-toast-success",
					error: "cn-toast-error",
					warning: "cn-toast-warning",
					info: "cn-toast-info",
					loading: "cn-toast-loading",
				},
			}}
			{...props}
		/>
	);
};

export { Toaster };
