import { NoteList } from "@/components/notes/NoteList";

export default function NotesPage() {
	return (
		<div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8 md:py-10">
			<div className="flex flex-col gap-8">
				<div>
					<h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
						Vaše poznámky
					</h1>
					<p className="text-sm text-muted-foreground">
						Spravujte a organizujte svoje myšlienky k projektu.
					</p>
				</div>
				<NoteList />
			</div>
		</div>
	);
}
