import { useEffect, useState } from "react";

export function useImage(src: string) {
	const [image, setImage] = useState<HTMLImageElement | null>(null);
	const [status, setStatus] = useState<"loading" | "loaded" | "failed">(
		src ? "loading" : "failed",
	);

	const [prevSrc, setPrevSrc] = useState(src);
	if (src !== prevSrc) {
		setPrevSrc(src);
		setImage(null);
		setStatus(!src ? "failed" : "loading");
	}

	useEffect(() => {
		if (!src) return;

		const img = new Image();
		let cancelled = false;

		const handleLoad = () => {
			if (cancelled) return;
			setImage(img);
			setStatus("loaded");
		};

		const handleError = () => {
			if (cancelled) return;
			setImage(null);
			setStatus("failed");
		};

		img.addEventListener("load", handleLoad);
		img.addEventListener("error", handleError);
		img.src = src;
		img.crossOrigin = "Anonymous";

		return () => {
			cancelled = true;
			img.removeEventListener("load", handleLoad);
			img.removeEventListener("error", handleError);
		};
	}, [src]);

	return [image, status] as const;
}
