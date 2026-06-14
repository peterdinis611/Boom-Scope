import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { NoteList } from "@/components/notes/NoteList";

export default function NotesPage() {
	return (
		<PageContainer className="space-y-6">
			<PageHeader
				title="Poznámky"
				description="Spravujte a organizujte svoje myšlienky k projektu."
			/>
			<NoteList />
		</PageContainer>
	);
}
