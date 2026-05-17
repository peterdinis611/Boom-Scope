import { useCallback, useState } from "react";
import { toast } from "sonner";

/**
 * A reusable hook to copy text to clipboard with feedback.
 * 
 * @param resetInterval The duration in milliseconds before resetting the copied state.
 */
export function useCopyToClipboard(resetInterval = 2000) {
	const [copiedValue, setCopiedValue] = useState<string | null>(null);

	const copy = useCallback(
		async (value: string, successMessage?: string) => {
			if (!navigator?.clipboard) {
				toast.error("Schránka nie je podporovaná vo vašom prehliadači.");
				return false;
			}
			try {
				await navigator.clipboard.writeText(value);
				setCopiedValue(value);
				toast.success(successMessage || `Skopírované: ${value}`);
				setTimeout(() => {
					setCopiedValue(null);
				}, resetInterval);
				return true;
			} catch (error) {
				console.error("Chyba pri kopírovaní do schránky:", error);
				toast.error("Nepodarilo sa skopírovať.");
				setCopiedValue(null);
				return false;
			}
		},
		[resetInterval],
	);

	return [copiedValue, copy] as const;
}
