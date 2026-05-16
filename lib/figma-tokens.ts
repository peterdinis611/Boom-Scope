function slugify(name: string): string {
	return (
		name
			.toLowerCase()
			.trim()
			.replace(/\s+/g, "-")
			.replace(/[^a-z0-9-]/g, "") || "token"
	);
}

/** DSG / Tokens Studio–friendly variables-style JSON for import experiments */
export function designSystemToFigmaTokensJson(
	colors: { name: string; hex: string }[],
	fonts: string[],
): string {
	const tokenCollection: Record<
		string,
		{ type: string; value: string | { hex: string } }
	> = {};

	colors.forEach((c) => {
		const key = `color/${slugify(c.name)}`;
		tokenCollection[key] = {
			type: "color",
			value: { hex: c.hex },
		};
	});

	fonts.forEach((f, i) => {
		tokenCollection[`fontFamily/${i === 0 ? "primary" : `alt-${i}`}`] = {
			type: "string",
			value: f,
		};
	});

	return JSON.stringify(
		{
			$boomScopeMeta: {
				format: "boom-scope-design-tokens",
				version: 1,
				hint: "Use colors as Figma color styles or Variables; fonts as text styles.",
			},
			tokens: tokenCollection,
		},
		null,
		2,
	);
}
