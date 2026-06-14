import { Button, Section, Text } from "@react-email/components";
import { EmailLayout } from "./components/email-layout";
import { emailBrand, getAppUrl } from "../lib/email-brand";

type RegistrationWelcomeEmailProps = {
	name?: string | null;
};

export function RegistrationWelcomeEmail({
	name,
}: RegistrationWelcomeEmailProps = {}) {
	const greeting = name?.trim() ? `Ahoj ${name.trim()},` : "Ahoj,";
	const dashboardUrl = `${getAppUrl()}/dashboard`;

	return (
		<EmailLayout
			preview="Vaša registrácia vo Boom Scope prebehla úspešne."
			title="Registrácia úspešná"
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
				vitajte vo <strong>Boom Scope</strong>. Váš účet je pripravený a môžete
				ihneď začať pracovať na projektoch.
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
					Čo môžete robiť:
				</Text>
				<Text
					style={{
						color: emailBrand.foreground,
						fontSize: "14px",
						lineHeight: "24px",
						margin: 0,
					}}
				>
					• vytvárať projekty a poznámky
					<br />• pracovať v canvas editore a AI generátore
					<br />• spravovať design system projektu
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
				Prejsť do dashboardu
			</Button>
		</EmailLayout>
	);
}

export default RegistrationWelcomeEmail;
