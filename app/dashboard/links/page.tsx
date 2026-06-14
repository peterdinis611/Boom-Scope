import { Suspense } from "react";
import { LinksPageClient } from "./links-page-client";

export default function LinksPage() {
	return (
		<Suspense fallback={null}>
			<LinksPageClient />
		</Suspense>
	);
}
