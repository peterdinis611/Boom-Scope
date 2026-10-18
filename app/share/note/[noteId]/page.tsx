import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { sanitizeNoteHtml } from "@/lib/sanitize-note-html";

type ShareNotePageProps = {
	params: Promise<{ noteId: string }>;
};

export default async function ShareNotePage({ params }: ShareNotePageProps) {
	const { noteId } = await params;
	const note = await fetchQuery(api.notes.getPublic, {
		noteId: noteId as Id<"notes">,
	});

	if (!note) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background px-4">
				<div className="max-w-md text-center">
					<p className="font-mono text-[11px] tracking-[0.2em] text-scope uppercase">
						Share
					</p>
					<h1 className="mt-2 font-heading text-2xl font-semibold">
						Note not available
					</h1>
					<p className="mt-2 text-sm text-muted-foreground">
						This note is private or the link is invalid.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background px-4 py-12">
			<article className="mx-auto max-w-2xl">
				<p className="font-mono text-[11px] tracking-[0.2em] text-scope uppercase">
					Shared note · read-only
				</p>
				<h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight">
					{note.title}
				</h1>
				<div
					className="prose prose-sm mt-8 max-w-none dark:prose-invert"
					// biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized public note HTML
					dangerouslySetInnerHTML={{
						__html: sanitizeNoteHtml(note.content),
					}}
				/>
				<p className="mt-12 text-xs text-muted-foreground">Boom Scope</p>
			</article>
		</div>
	);
}
