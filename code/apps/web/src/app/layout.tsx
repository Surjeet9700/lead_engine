import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import './globals.css';

const inter = Inter({
	subsets: ['latin'],
	variable: '--font-inter',
	weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
	title: 'Lead Speed Engine',
	description: 'IndiaMart leads → WhatsApp in 45 seconds',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning className={inter.variable}>
			<body className="min-h-screen bg-background font-sans text-foreground antialiased selection:bg-amber-500/20 selection:text-amber-200">
				<ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}
