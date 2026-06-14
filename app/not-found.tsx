import { ErrorFallback } from "@/components/error/ErrorFallback";

export default function NotFound() {
	return (
		<ErrorFallback kind="not-found" variant="page" homeHref="/dashboard" />
	);
}
