export type TriageDestination = "note" | "task" | "sticky";

export type TriageSuggestion = {
	destination: TriageDestination;
	confidence: "high" | "medium" | "low";
	reason: string;
};

const TASK_HINTS =
	/\b(todo|to-do|fix|ship|deadline|due|remind|follow[- ]?up|call|email|buy|send|schedule|meeting|asap|blocker)\b/i;
const STICKY_HINTS =
	/\b(idea|brainstorm|random|remember|jot|snippet|quick thought)\b/i;
const URL_HINT = /https?:\/\/\S+/i;

/**
 * Lightweight heuristics for inbox triage suggestions (no AI required).
 */
export function suggestInboxTriage(body: string): TriageSuggestion {
	const text = body.trim();
	if (!text) {
		return {
			destination: "note",
			confidence: "low",
			reason: "Empty capture — default to note",
		};
	}

	const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
	const looksLikeChecklist =
		lines.length >= 2 &&
		lines.every((line) => /^[-*•]|\d+[.)]/.test(line) || line.length < 80);

	if (URL_HINT.test(text) && text.length < 180) {
		return {
			destination: "note",
			confidence: "medium",
			reason: "Looks like a link to save",
		};
	}

	if (STICKY_HINTS.test(text) && !TASK_HINTS.test(text)) {
		return {
			destination: "sticky",
			confidence: "medium",
			reason: "Idea language → sticky note",
		};
	}

	if (TASK_HINTS.test(text) || looksLikeChecklist || text.length < 90) {
		return {
			destination: "task",
			confidence: TASK_HINTS.test(text) || looksLikeChecklist ? "high" : "medium",
			reason: looksLikeChecklist
				? "Checklist-style lines → task"
				: text.length < 90
					? "Short capture → likely a task"
					: "Action language → task",
		};
	}

	if (text.length < 140) {
		return {
			destination: "sticky",
			confidence: "medium",
			reason: "Short idea → sticky note",
		};
	}

	return {
		destination: "note",
		confidence: "medium",
		reason: "Longer prose → note",
	};
}
