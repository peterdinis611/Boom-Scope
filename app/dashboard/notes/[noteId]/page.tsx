import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { NoteForm } from "@/components/notes/NoteForm";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

async function getCachedNote(noteId: Id<"notes">, token: string | undefined) {
	"use cache";
	return fetchQuery(api.notes.get, { noteId }, { token });
}

export default async function EditNotePage({
	params,
}: {
	params: Promise<{ noteId: string }>;
}) {
	const { noteId } = await params;
	const token = await convexAuthNextjsToken();

	const note = await getCachedNote(noteId as Id<"notes">, token);

	if (note === null) {
		return (
			<div className="flex h-[60vh] flex-col items-center justify-center gap-4">
				<AlertCircle className="size-12 text-destructive" />
				<h2 className="text-xl font-semibold">Poznámka sa nenašla</h2>
				<Link href="/dashboard/notes">
					<Button>Späť na zoznam</Button>
				</Link>
			</div>
		);
	}

	return (
		<div className="mx-auto w-full max-w-4xl px-4 py-8 md:px-8 md:py-10">
			<NoteForm initialData={note} />
		</div>
	);
}
