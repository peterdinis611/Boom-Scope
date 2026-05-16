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
			<div className="flex h-screen w-full items-center justify-center bg-[#0a0a0a]">
				<div className="flex flex-col items-center gap-6">
					<Loader2 className="size-12 animate-spin text-primary opacity-20" />
					<p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">
						Načítavam váš projekt...
					</p>
				</div>
			</div>
		);
	}

	const elements = JSON.parse(design.elements);

	return (
		<div className="h-screen w-full bg-[#0a0a0a] overflow-hidden flex flex-col">
			{/* Read Only Badge */}
			<div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-8 py-4 rounded-full bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl">
				<div className="size-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
				<span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60">
					Režim prezerania: <span className="text-white">{design.name}</span>
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

			<div className="absolute bottom-8 right-8 z-50 p-6 rounded-3xl bg-black/40 border border-white/5 backdrop-blur-3xl shadow-2xl">
				<p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 text-right">
					Boom Scope Design Editor
				</p>
				<p className="text-[8px] font-bold text-white/10 uppercase tracking-widest mt-1 text-right">
					Vytvorené v aplikácii Boom Scope
				</p>
			</div>
		</div>
	);
}
