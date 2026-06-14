import { Section, Text } from "@react-email/components";
import { EmailLayout } from "./components/email-layout";
import { emailBrand } from "../lib/email-brand";

export type VerificationCodeKind = "verify" | "reset";

type VerificationCodeEmailProps = {
	code: string;
	kind: VerificationCodeKind;
};

const copy: Record<
	VerificationCodeKind,
	{ preview: string; title: string; description: string }
> = {
	verify: {
		preview: "Váš overovací kód pre Boom Scope",
		title: "Overte svoj email",
		description:
			"Zadajte tento kód v aplikácii pre dokončenie registrácie alebo prihlásenia.",
	},
	reset: {
		preview: "Kód na obnovenie hesla v Boom Scope",
		title: "Obnovenie hesla",
		description: "Zadajte tento kód spolu s novým heslom na stránke obnovenia.",
	},
};

export function VerificationCodeEmail({
	code,
	kind,
}: VerificationCodeEmailProps) {
	const content = copy[kind];
	const digits = code.split("");

	return (
		<EmailLayout preview={content.preview} title={content.title}>
			<Text
				style={{
					color: emailBrand.foreground,
					fontSize: "16px",
					lineHeight: "26px",
					margin: "0 0 24px",
				}}
			>
				{content.description}
			</Text>

			<Section style={{ margin: "0 0 24px", textAlign: "center" as const }}>
				<table
					cellPadding={0}
					cellSpacing={8}
					role="presentation"
					style={{ margin: "0 auto" }}
				>
					<tbody>
						<tr>
							{digits.map((digit, index) => (
								<td
									key={`${digit}-${index}`}
									style={{
										backgroundColor: emailBrand.background,
										border: `1px solid ${emailBrand.border}`,
										borderRadius: "10px",
										color: emailBrand.foreground,
										fontFamily: "monospace",
										fontSize: "28px",
										fontWeight: 700,
										height: "56px",
										textAlign: "center",
										width: "48px",
									}}
								>
									{digit}
								</td>
							))}
						</tr>
					</tbody>
				</table>
			</Section>

			<Text
				style={{
					color: emailBrand.mutedForeground,
					fontSize: "14px",
					lineHeight: "22px",
					margin: 0,
					textAlign: "center" as const,
				}}
			>
				Kód platí <strong>15 minút</strong>.
			</Text>
		</EmailLayout>
	);
}

export default VerificationCodeEmail;
