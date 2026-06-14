import { Button, Section, Text } from "@react-email/components";
import { emailBrand, getAppUrl } from "../lib/email-brand";
import { EmailLayout } from "./components/email-layout";

type RegistrationWelcomeEmailProps = {
	name?: string | null;
};

export function RegistrationWelcomeEmail({
	name,
}: RegistrationWelcomeEmailProps = {}) {
	const greeting = name?.trim() ? `Hi ${name.trim()},` : "Hi,";
	const dashboardUrl = `${getAppUrl()}/dashboard`;

	return (
		<EmailLayout
			preview="Your Boom Scope registration was successful."
			title="Registration successful"
		>
			<Text
				style={{
					color: emailBrand.foreground,
					fontSize: "16px",
					lineHeight: "26px",
					margin: "0 0 16px",
				}}
			>
				{greeting}
			</Text>
			<Text
				style={{
					color: emailBrand.foreground,
					fontSize: "16px",
					lineHeight: "26px",
					margin: "0 0 16px",
				}}
			>
				welcome to <strong>Boom Scope</strong>. Your account is ready and you
				can start working on projects right away.
			</Text>

			<Section
				style={{
					backgroundColor: emailBrand.background,
					borderRadius: "10px",
					margin: "24px 0",
					padding: "16px 20px",
				}}
			>
				<Text
					style={{
						color: emailBrand.mutedForeground,
						fontSize: "14px",
						lineHeight: "22px",
						margin: "0 0 8px",
					}}
				>
					What you can do:
				</Text>
				<Text
					style={{
						color: emailBrand.foreground,
						fontSize: "14px",
						lineHeight: "24px",
						margin: 0,
					}}
				>
					• create projects and notes
					<br />• work in the canvas editor and AI generator
					<br />• manage your project design system
				</Text>
			</Section>

			<Button
				href={dashboardUrl}
				style={{
					backgroundColor: emailBrand.primary,
					borderRadius: "10px",
					color: emailBrand.primaryForeground,
					display: "inline-block",
					fontSize: "14px",
					fontWeight: 600,
					padding: "12px 24px",
					textDecoration: "none",
				}}
			>
				Go to dashboard
			</Button>
		</EmailLayout>
	);
}

export default RegistrationWelcomeEmail;
