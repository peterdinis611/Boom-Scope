import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { NotesPageClient } from "./notes-page-client";

export default function NotesPage() {
	return (
		<PageContainer className="space-y-6">
			<PageHeader
				title="Notes"
				description="Manage and organize your project thoughts."
			/>
			<NotesPageClient />
		</PageContainer>
	);
}
