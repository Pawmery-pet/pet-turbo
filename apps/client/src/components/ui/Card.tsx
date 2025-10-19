import { ReactNode } from "react";

interface CardProps {
	children: ReactNode;
	className?: string;
	padding?: "none" | "sm" | "md" | "lg";
	hover?: boolean;
}

export function Card({
	children,
	className = "",
	padding = "md",
	hover = false,
}: CardProps) {
	const baseClasses = "bg-white rounded-lg shadow-md border border-gray-100";

	const paddingClasses = {
		none: "",
		sm: "p-4",
		md: "p-6",
		lg: "p-8",
	};

	const hoverClasses = hover
		? "hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
		: "";

	const classes = `${baseClasses} ${paddingClasses[padding]} ${hoverClasses} ${className}`;

	return <div className={classes}>{children}</div>;
}
