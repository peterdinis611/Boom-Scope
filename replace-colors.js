const fs = require("fs");
const path = require("path");

const COLOR_MAP = {
	"#3b82f6": "var(--primary)",
	"#2563eb": "var(--primary)", // darker blue
	"#1d4ed8": "var(--primary)", // even darker blue
	"#10b981": "var(--success)", // emerald
	"#059669": "var(--success)",
	"#ef4444": "var(--destructive)",
	"#dc2626": "var(--destructive)",
};

const TAILWIND_COLOR_MAP = {
	"text-[#3b82f6]": "text-primary",
	"bg-[#3b82f6]": "bg-primary",
	"border-[#3b82f6]": "border-primary",
	"text-[#ef4444]": "text-destructive",
	"bg-[#ef4444]": "bg-destructive",
	"border-[#ef4444]": "border-destructive",
};

function walk(dir, callback) {
	fs.readdirSync(dir).forEach((f) => {
		const dirPath = path.join(dir, f);
		const isDirectory = fs.statSync(dirPath).isDirectory();
		if (isDirectory) {
			if (f !== "node_modules" && f !== ".next" && f !== ".git") {
				walk(dirPath, callback);
			}
		} else {
			callback(path.join(dir, f));
		}
	});
}

function replaceColors(filePath) {
	if (!filePath.match(/\.(tsx|ts|js|jsx|css)$/)) return;

	let content = fs.readFileSync(filePath, "utf8");
	const originalContent = content;

	// Replace hex colors in JS/TSX strings
	for (const [hex, variable] of Object.entries(COLOR_MAP)) {
		// Matches hex color in quotes or backticks, or as a value in a style object
		const hexRegex = new RegExp(`(['"\`])${hex}(['"\`])`, "gi");
		content = content.replace(hexRegex, `$1${variable}$2`);

		// Also match it without quotes if it's in a CSS file or template literal
		if (filePath.endsWith(".css")) {
			const cssRegex = new RegExp(`${hex}`, "gi");
			content = content.replace(cssRegex, variable);
		}
	}

	// Replace Tailwind specific hardcoded colors
	for (const [hardcoded, twClass] of Object.entries(TAILWIND_COLOR_MAP)) {
		const twRegex = new RegExp(
			hardcoded.replace("[", "\\[").replace("]", "\\]"),
			"g",
		);
		content = content.replace(twRegex, twClass);
	}

	if (content !== originalContent) {
		fs.writeFileSync(filePath, content, "utf8");
		console.log(`Updated: ${filePath}`);
	}
}

console.log("Starting color replacement...");
walk("./app", replaceColors);
walk("./components", replaceColors);
console.log("Finished color replacement.");
