import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "Pawmery",
	description: "Your pet. Your story. Your companion.",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
