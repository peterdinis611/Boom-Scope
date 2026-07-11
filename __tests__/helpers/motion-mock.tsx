import type React from "react";

export const motionReactMock = {
	motion: {
		div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
			<div {...props}>{children}</div>
		),
		span: ({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
			<span {...props}>{children}</span>
		),
		circle: ({ children, ...props }: React.SVGProps<SVGCircleElement>) => (
			<circle {...props}>{children}</circle>
		),
	},
	AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
};
