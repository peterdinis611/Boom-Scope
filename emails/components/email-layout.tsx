import {
	Body,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Link,
	Preview,
	Section,
	Text,
} from "@react-email/components";
import type { ReactNode } from "react";
import { emailBrand, getAppUrl } from "../../lib/email-brand";

type EmailLayoutProps = {
	preview: string;
	title: string;
	children: ReactNode;
};

export function EmailLayout({ preview, title, children }: EmailLayoutProps) {
	const appUrl = getAppUrl();

	return (
		<Html lang="sk">
			<Head />
			<Preview>{preview}</Preview>
			<Body
				style={{
					backgroundColor: emailBrand.background,
					fontFamily: emailBrand.fontFamily,
					margin: 0,
					padding: "32px 16px",
				}}
			>
				<Container
					style={{
						backgroundColor: emailBrand.card,
						border: `1px solid ${emailBrand.border}`,
						borderRadius: "12px",
						margin: "0 auto",
						maxWidth: "560px",
						padding: "32px",
					}}
				>
					<Section style={{ marginBottom: "24px" }}>
						<Text
							style={{
								color: emailBrand.primary,
								fontSize: "13px",
								fontWeight: 700,
								letterSpacing: "0.04em",
								margin: 0,
								textTransform: "uppercase",
							}}
						>
							{emailBrand.appName}
						</Text>
						<Heading
							style={{
								color: emailBrand.foreground,
								fontSize: "24px",
								fontWeight: 600,
								lineHeight: "32px",
								margin: "8px 0 0",
							}}
						>
							{title}
						</Heading>
					</Section>

					{children}

					<Hr
						style={{
							borderColor: emailBrand.border,
							margin: "32px 0 20px",
						}}
					/>
					<Text
						style={{
							color: emailBrand.mutedForeground,
							fontSize: "12px",
							lineHeight: "20px",
							margin: 0,
						}}
					>
						Tento email bol odoslaný z{" "}
						<Link
							href={appUrl}
							style={{ color: emailBrand.primary, textDecoration: "none" }}
						>
							{emailBrand.appName}
						</Link>
						. Ak ste oň nežiadali, môžete ho ignorovať.
					</Text>
				</Container>
			</Body>
		</Html>
	);
}
