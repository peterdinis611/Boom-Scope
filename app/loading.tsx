import { Loader2 } from "lucide-react";

export default function GlobalLoading() {
	return (
		<div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background">
			<Loader2 className="size-8 animate-spin text-primary" aria-hidden />
			<p className="text-sm text-muted-foreground">Načítavam…</p>
		</div>
	);
}
