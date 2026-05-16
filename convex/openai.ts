import { ConvexError, v } from "convex/values";
import OpenAI from "openai";
import { action } from "./_generated/server";

function getOpenAI(): OpenAI {
	const apiKey = process.env.OPENAI_API_KEY;
	if (!apiKey) {
		throw new ConvexError(
			"Chýba OPENAI_API_KEY v Convex prostredí. Pridajte ho cez `npx convex env set OPENAI_API_KEY <key>`.",
		);
	}
	return new OpenAI({ apiKey });
}

export const analyzeDesignSystem = action({
	args: {
		imageUrls: v.array(v.string()), // Can be base64 or storage URLs
	},
	handler: async (ctx, args) => {
		const openai = getOpenAI();
		const response = await openai.chat.completions.create({
			model: "gpt-4o-mini",
			messages: [
				{
					role: "system",
					content:
						'You are a professional brand designer and UI/UX expert. Analyze the provided images and extract a comprehensive design system. Return a JSON object with: { "colors": [ { "name": "...", "hex": "#...", "rgb": "rgb(...)" } ], "fonts": [ "Font Name 1", "Font Name 2" ], "description": "Short brand description...", "goodThings": ["List of good design elements found..."], "badThings": ["List of potential design issues or mistakes found..."], "suggestions": ["Actionable suggestions to improve the design..."] }. Ensure the colors are harmonious and extracted from the imagery. Return ONLY valid JSON.',
				},
				{
					role: "user",
					content: [
						{
							type: "text",
							text: "Analyze these inspiration images and create a professional design system.",
						},
						...args.imageUrls.map((url) => ({
							type: "image_url" as const,
							image_url: { url },
						})),
					],
				},
			],
			response_format: { type: "json_object" },
		});

		const content = response.choices[0].message.content;
		if (!content) throw new ConvexError("Failed to get response from OpenAI");

		return JSON.parse(content);
	},
});
export const generateDesignFromImages = action({
	args: {
		imageUrls: v.array(v.string()),
	},
	handler: async (ctx, args) => {
		const openai = getOpenAI();
		const response = await openai.chat.completions.create({
			model: "gpt-4o-mini",
			messages: [
				{
					role: "system",
					content: `You are a professional UI/UX designer and design engineer. 
Analyze the provided images and generate a high-quality UI layout or component (like a professional button, card, or hero section) inspired by them.
Return a JSON object with: 
{ 
  "name": "Design Name",
  "canvasSize": { "width": 1920, "height": 1080 },
  "elements": [
    {
      "id": "unique-id",
      "type": "rect" | "circle" | "text" | "star" | "arrow",
      "x": number,
      "y": number,
      "width": number,
      "height": number,
      "stroke": "color-hex",
      "fill": "color-hex" | "none",
      "strokeWidth": number,
      "rotation": number (0-360),
      "opacity": number (0-1),
      "cornerRadius": number (for rect),
      "text": "string" (for text),
      "fontSize": number (for text),
      "fontFamily": "string" (for text)
    }
  ]
}
Ensure coordinates (x, y) and sizes (width, height) fit within the canvas size. 
Create a sophisticated, premium-looking design with harmonious colors and balanced spacing. 
Return ONLY valid JSON.`,
				},
				{
					role: "user",
					content: [
						{
							type: "text",
							text: "Generate a beautiful UI design based on these inspiration images. Use at least 5-10 elements to create a cohesive section.",
						},
						...args.imageUrls.map((url) => ({
							type: "image_url" as const,
							image_url: { url },
						})),
					],
				},
			],
			response_format: { type: "json_object" },
		});

		const content = response.choices[0].message.content;
		if (!content) throw new ConvexError("Failed to get response from OpenAI");

		return JSON.parse(content);
	},
});
