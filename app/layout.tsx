// RootLayout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { auth } from "@/auth";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";
import { SessionProvider } from "next-auth/react";
import { getCurrentCurrency } from "@/actions/currency";
import CurrencyWrapper from "@/components/CurrencyWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "NaCapital",
	description: "Products",
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const session = await auth();
	const exchangeRateDefault = await getCurrentCurrency();

	return (
		<html className="antialiased" lang="pt-BR">
			<body className={inter.className} suppressHydrationWarning>
				<SessionProvider session={session}>
					<ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
						<CurrencyWrapper exchangeRateDefault={exchangeRateDefault}>
							{children}
						</CurrencyWrapper>
					</ThemeProvider>
				</SessionProvider>
			</body>
		</html>
	);
}
