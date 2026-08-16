import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const alt = `${SITE_NAME} — focused productivity workspace`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
	return new ImageResponse(
		(
			<div
				style={{
					width: "100%",
					height: "100%",
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-between",
					padding: "64px 72px",
					background: "#f4f8fa",
					position: "relative",
					fontFamily: "ui-sans-serif, system-ui, sans-serif",
				}}
			>
				{/* Crosshair */}
				<div
					style={{
						position: "absolute",
						left: "50%",
						top: 0,
						bottom: 0,
						width: 1,
						background: "rgba(14, 165, 180, 0.28)",
					}}
				/>
				<div
					style={{
						position: "absolute",
						top: "50%",
						left: 0,
						right: 0,
						height: 1,
						background: "rgba(14, 165, 180, 0.28)",
					}}
				/>

				<div style={{ display: "flex", alignItems: "center", gap: 18 }}>
					<div
						style={{
							width: 56,
							height: 56,
							borderRadius: 999,
							border: "2px solid rgba(224, 90, 42, 0.45)",
							background: "rgba(224, 90, 42, 0.12)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							position: "relative",
						}}
					>
						<div
							style={{
								position: "absolute",
								width: 28,
								height: 28,
								borderRadius: 999,
								border: "1.5px solid rgba(14, 165, 180, 0.55)",
							}}
						/>
						<div
							style={{
								width: 10,
								height: 10,
								borderRadius: 999,
								background: "#E05A2A",
							}}
						/>
					</div>
					<div
						style={{
							fontSize: 34,
							fontWeight: 700,
							letterSpacing: "-0.03em",
							color: "#1A2438",
						}}
					>
						{SITE_NAME}
					</div>
				</div>

				<div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
					<div
						style={{
							fontSize: 64,
							fontWeight: 800,
							letterSpacing: "-0.04em",
							lineHeight: 1.02,
							color: "#1A2438",
							maxWidth: 900,
						}}
					>
						Ship with focus.
					</div>
					<div
						style={{
							fontSize: 28,
							lineHeight: 1.35,
							color: "#4A5A70",
							maxWidth: 820,
						}}
					>
						{SITE_TAGLINE}
					</div>
				</div>

				<div
					style={{
						display: "flex",
						gap: 12,
						fontSize: 18,
						fontFamily: "ui-monospace, monospace",
						letterSpacing: "0.08em",
						textTransform: "uppercase",
						color: "#0EA5B4",
					}}
				>
					<span>Projects</span>
					<span>·</span>
					<span>Tasks</span>
					<span>·</span>
					<span>Notes</span>
					<span>·</span>
					<span>Design</span>
				</div>
			</div>
		),
		{ ...size },
	);
}
