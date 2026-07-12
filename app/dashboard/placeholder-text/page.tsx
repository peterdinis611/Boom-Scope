import { PlaceholderTextStudio } from "@/components/placeholder-text/placeholder-text-studio";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";

export default function PlaceholderTextPage() {
	return (
		<PageContainer className="space-y-8">
			<PageHeader
				title="Placeholder Text"
				description="Generate random lorem ipsum for mockups, wireframes, and design previews — then copy it instantly."
			/>
			<PlaceholderTextStudio />
		</PageContainer>
	);
}
