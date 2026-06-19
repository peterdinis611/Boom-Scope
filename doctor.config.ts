import type { ReactDoctorConfig } from "react-doctor/api";

export default {
	deadCode: false,
	ignore: {
		files: [
			"convex/**",
			"emails/**",
			"convex/_generated/**",
			".next/**",
			"coverage/**",
			"**/*.d.ts",
		],
		tags: ["test-noise", "design", "migration-hint"],
	},
} satisfies ReactDoctorConfig;
