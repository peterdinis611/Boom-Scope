import { PlaceholderImageStudio } from "@/components/images/placeholder-image-studio";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";

export default function PlaceholderImagesPage() {
	return (
		<PageContainer className="space-y-8">
			<PageHeader
				title="Placeholder Images"
				description="Generate optimized placeholder images with custom size, seed, grayscale, and blur — then download them instantly."
			/>
			<PlaceholderImageStudio />
		</PageContainer>
	);
}
