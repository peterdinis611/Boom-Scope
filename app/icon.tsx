import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
	return new ImageResponse(
		(
			<div
				style={{
					width: "100%",
					height: "100%",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					background: "#F4F8FA",
					borderRadius: 8,
					position: "relative",
				}}
			>
				<div
					style={{
						width: 22,
						height: 22,
						borderRadius: 999,
						border: "2px solid #E05A2A",
						background: "rgba(224, 90, 42, 0.15)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<div
						style={{
							width: 6,
							height: 6,
							borderRadius: 999,
							background: "#E05A2A",
						}}
					/>
				</div>
				<span style={{ position: "absolute", width: 1, height: 1, opacity: 0 }}>
					{SITE_NAME}
				</span>
			</div>
		),
		{ ...size },
	);
}
