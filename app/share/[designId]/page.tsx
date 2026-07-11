"use client";

import { useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

const KonvaCanvas = dynamic(() => import("@/components/design/KonvaCanvas"), {
	ssr: false,
});

export default function SharePage() {
	const params = useParams();
	const designId = params.designId as Id<"designs">;
	const [zoom, setZoom] = useState(1);

	const design = useQuery(api.designs.getDesign, { designId });

	if (!design) {
		return (
			<div className="flex h-screen w-full items-center justify-center bg-background">
				<div className="flex flex-col items-center gap-6">
					<Loader2 className="size-12 animate-spin text-primary opacity-20" />
					<p className="text-sm text-muted-foreground">Loading project…</p>
				</div>
			</div>
		);
	}

	const elements = JSON.parse(design.elements);

	return (
		<div className="h-screen w-full bg-background overflow-hidden flex flex-col">
			{/* Read Only Badge */}
			<div className="absolute top-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 shadow-sm">
				<div className="size-2 rounded-full bg-primary" />
				<span className="text-sm text-muted-foreground">
					Viewing: <span className="text-foreground">{design.name}</span>
				</span>
			</div>

			<KonvaCanvas
				elements={elements}
				commitElements={() => {}}
				selectedIds={[]}
				onSelectionChange={() => {}}
				onElementPointer={() => {}}
				zoom={zoom}
				setZoom={setZoom}
				canvasSize={design.canvasSize || { width: 1920, height: 1080 }}
				artboardColor={design.artboardColor || null}
				readOnly={true}
			/>

			<div className="absolute right-4 bottom-4 z-50 rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground shadow-sm">
				Boom Scope
			</div>
		</div>
	);
}
