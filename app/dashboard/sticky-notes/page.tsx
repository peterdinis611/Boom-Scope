import { StickyNotesPageClient } from "./sticky-notes-page-client";

export default function StickyNotesPage() {
	return (
		<div className="flex h-[calc(100dvh-3.5rem)] flex-col p-4 md:p-6">
			<div className="mb-4 shrink-0">
				<h1 className="text-2xl font-semibold tracking-tight">Sticky Notes</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Drag, resize, and edit notes on your board. Changes sync automatically.
				</p>
			</div>
			<div className="min-h-0 flex-1">
				<StickyNotesPageClient />
			</div>
		</div>
	);
}
