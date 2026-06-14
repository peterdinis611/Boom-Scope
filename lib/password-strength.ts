export type PasswordStrengthLevel = 0 | 1 | 2 | 3 | 4;

export type PasswordCriteria = {
	minLength: boolean;
	hasLowercase: boolean;
	hasUppercase: boolean;
	hasNumber: boolean;
	hasSpecial: boolean;
};

export type PasswordStrengthResult = {
	score: PasswordStrengthLevel;
	label: string;
	percent: number;
	criteria: PasswordCriteria;
	metCount: number;
};

const STRENGTH_LABELS: Record<PasswordStrengthLevel, string> = {
	0: "Very weak",
	1: "Weak",
	2: "Fair",
	3: "Strong",
	4: "Very strong",
};

export function getPasswordCriteria(password: string): PasswordCriteria {
	return {
		minLength: password.length >= 8,
		hasLowercase: /[a-záäčďéíĺľňóôŕšťúýž]/.test(password),
		hasUppercase: /[A-ZÁÄČĎÉÍĹĽŇÓÔŔŠŤÚÝŽ]/.test(password),
		hasNumber: /\d/.test(password),
		hasSpecial: /[^a-zA-Z0-9áäčďéíĺľňóôŕšťúýžÁÄČĎÉÍĹĽŇÓÔŔŠŤÚÝŽ]/.test(password),
	};
}

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
	if (!password) {
		return {
			score: 0,
			label: STRENGTH_LABELS[0],
			percent: 0,
			criteria: getPasswordCriteria(password),
			metCount: 0,
		};
	}

	const criteria = getPasswordCriteria(password);
	const metCount = Object.values(criteria).filter(Boolean).length;
	const score = Math.min(4, Math.max(0, metCount)) as PasswordStrengthLevel;
	const percent = score * 25;

	return {
		score,
		label: STRENGTH_LABELS[score],
		percent,
		criteria,
		metCount,
	};
}
