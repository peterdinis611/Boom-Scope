export interface CanvasPreset {
	id: string;
	name: string;
	width: number;
	height: number;
	icon: string;
}

export const CANVAS_PRESETS: CanvasPreset[] = [
	{
		id: "fb-post",
		name: "Facebook Post",
		width: 1200,
		height: 630,
		icon: "facebook",
	},
	{
		id: "fb-cover",
		name: "Facebook Cover",
		width: 820,
		height: 312,
		icon: "facebook",
	},
	{
		id: "ig-post",
		name: "Instagram Post",
		width: 1080,
		height: 1080,
		icon: "instagram",
	},
	{
		id: "ig-story",
		name: "Instagram Story",
		width: 1080,
		height: 1920,
		icon: "instagram",
	},
	{
		id: "twitter-post",
		name: "Twitter Post",
		width: 1200,
		height: 675,
		icon: "twitter",
	},
	{
		id: "twitter-header",
		name: "Twitter Header",
		width: 1500,
		height: 500,
		icon: "twitter",
	},
	{
		id: "linkedin-post",
		name: "LinkedIn Post",
		width: 1200,
		height: 627,
		icon: "linkedin",
	},
	{
		id: "iphone-15",
		name: "iPhone 15 / 14",
		width: 393,
		height: 852,
		icon: "smartphone",
	},
	{
		id: "android-large",
		name: "Android Large",
		width: 360,
		height: 800,
		icon: "smartphone",
	},
	{
		id: "ipad-pro",
		name: 'iPad Pro 11"',
		width: 834,
		height: 1194,
		icon: "tablet",
	},
];
