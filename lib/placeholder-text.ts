export const LOREM_WORDS = [
	"lorem",
	"ipsum",
	"dolor",
	"sit",
	"amet",
	"consectetur",
	"adipiscing",
	"elit",
	"sed",
	"do",
	"eiusmod",
	"tempor",
	"incididunt",
	"ut",
	"labore",
	"et",
	"dolore",
	"magna",
	"aliqua",
	"enim",
	"ad",
	"minim",
	"veniam",
	"quis",
	"nostrud",
	"exercitation",
	"ullamco",
	"laboris",
	"nisi",
	"aliquip",
	"ex",
	"ea",
	"commodo",
	"consequat",
	"duis",
	"aute",
	"irure",
	"in",
	"reprehenderit",
	"voluptate",
	"velit",
	"esse",
	"cillum",
	"fugiat",
	"nulla",
	"pariatur",
	"excepteur",
	"sint",
	"occaecat",
	"cupidatat",
	"non",
	"proident",
	"sunt",
	"culpa",
	"qui",
	"officia",
	"deserunt",
	"mollit",
	"anim",
	"id",
	"est",
	"laborum",
] as const;

export type PlaceholderTextUnit = "paragraphs" | "sentences" | "words";

export type PlaceholderTextParams = {
	unit: PlaceholderTextUnit;
	count: number;
	startWithLorem: boolean;
};

export const PLACEHOLDER_TEXT_LIMITS = {
	paragraphs: { min: 1, max: 10, default: 3 },
	sentences: { min: 1, max: 20, default: 5 },
	words: { min: 1, max: 500, default: 50 },
} as const;

export const PLACEHOLDER_TEXT_PRESETS = [
	{ label: "1 paragraph", unit: "paragraphs" as const, count: 1 },
	{ label: "3 paragraphs", unit: "paragraphs" as const, count: 3 },
	{ label: "5 sentences", unit: "sentences" as const, count: 5 },
	{ label: "50 words", unit: "words" as const, count: 50 },
	{ label: "100 words", unit: "words" as const, count: 100 },
] as const;

const LOREM_IPSUM_OPENING =
	"Lorem ipsum dolor sit amet, consectetur adipiscing elit.";

function randomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickWord(): string {
	return LOREM_WORDS[randomInt(0, LOREM_WORDS.length - 1)] ?? "lorem";
}

function capitalize(word: string): string {
	return word.charAt(0).toUpperCase() + word.slice(1);
}

export function generateSentence(minWords = 8, maxWords = 16): string {
	const length = randomInt(minWords, maxWords);
	const words = Array.from({ length }, () => pickWord());
	words[0] = capitalize(words[0] ?? "lorem");
	return `${words.join(" ")}.`;
}

export function generateParagraph(sentenceCount?: number): string {
	const count = sentenceCount ?? randomInt(3, 6);
	return Array.from({ length: count }, () => generateSentence()).join(" ");
}

export function generateWords(count: number, startWithLorem: boolean): string {
	if (count <= 0) return "";

	if (startWithLorem) {
		const openingWords = LOREM_IPSUM_OPENING.replace(/\.$/, "").split(" ");
		if (count <= openingWords.length) {
			return `${openingWords.slice(0, count).join(" ")}.`;
		}

		const remaining = count - openingWords.length;
		const extra = Array.from({ length: remaining }, () => pickWord());
		return `${openingWords.join(" ")} ${extra.join(" ")}.`;
	}

	const words = Array.from({ length: count }, () => pickWord());
	words[0] = capitalize(words[0] ?? "lorem");
	return `${words.join(" ")}.`;
}

export function clampPlaceholderTextCount(
	unit: PlaceholderTextUnit,
	count: number,
): number {
	const limits = PLACEHOLDER_TEXT_LIMITS[unit];
	return Math.min(limits.max, Math.max(limits.min, Math.round(count)));
}

export function generateLoremIpsum(params: PlaceholderTextParams): string {
	const count = clampPlaceholderTextCount(params.unit, params.count);

	if (params.unit === "words") {
		return generateWords(count, params.startWithLorem);
	}

	if (params.unit === "sentences") {
		const sentences = Array.from({ length: count }, (_, index) => {
			if (params.startWithLorem && index === 0) {
				return LOREM_IPSUM_OPENING;
			}
			return generateSentence();
		});
		return sentences.join(" ");
	}

	const paragraphs = Array.from({ length: count }, (_, index) => {
		if (params.startWithLorem && index === 0) {
			const rest = generateParagraph(randomInt(2, 4));
			return `${LOREM_IPSUM_OPENING} ${rest}`;
		}
		return generateParagraph();
	});

	return paragraphs.join("\n\n");
}

export function countPlaceholderTextStats(text: string): {
	words: number;
	characters: number;
	paragraphs: number;
} {
	const trimmed = text.trim();
	if (!trimmed) {
		return { words: 0, characters: 0, paragraphs: 0 };
	}

	return {
		words: trimmed.split(/\s+/).length,
		characters: trimmed.length,
		paragraphs: trimmed.split(/\n\s*\n/).filter(Boolean).length,
	};
}
