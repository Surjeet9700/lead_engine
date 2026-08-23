"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";

const Footer = () => {
	const links = [
		{ name: "Features", href: "#features" },
		{ name: "Speed Engine", href: "#speed-preview" },
		{ name: "Pricing", href: "#pricing" },
		{ name: "Customers", href: "#customers" },
	];
	const socialLinks: { label: string; href: string; icon: string }[] = [
		{
			label: "X",
			href: "#",
			icon: "/icons/x.svg",
		},
		{
			label: "LinkedIn",
			href: "#",
			icon: "/icons/linkedin.svg",
		},
		{
			label: "Facebook",
			href: "#",
			icon: "/icons/facebook.svg",
		},
		{
			label: "Instagram",
			href: "#",
			icon: "/icons/instagram.svg",
		},
		{
			label: "Tiktok",
			href: "#",
			icon: "/icons/tiktok.svg",
		},
	];
	return (
		<motion.footer
			className="flex flex-col gap-8 items-center justify-center pt-8 pb-4"
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, amount: 0.15 }}
			transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
		>
			<Image
				className="dark:invert h-8 w-auto"
				src="/logo/templates/axis/light-logo.svg"
				alt="Axis Logo"
				width={100}
				height={32}
			/>
			<ul className="grid grid-cols-4 gap-4 md:gap-8 items-center justify-center text-sm">
				{links.map((link) => (
					<li
						key={link.name}
						className="flex flex-row items-center gap-1 hover:text-foreground transition-all duration-300 text-muted-foreground"
					>
						<Link href={link.href}>{link.name}</Link>
					</li>
				))}
			</ul>
			<section className="flex flex-row gap-4">
				{socialLinks.map((link) => (
					<Link key={link.label} href={link.href}>
						<Image
							src={link.icon}
							alt={link.label}
							width={20}
							height={20}
							className="h-5 w-5 bg-muted-foreground/30 dark:bg-muted p-2 rounded-full grayscale hover:grayscale-0 transition-all"
						/>
					</Link>
				))}
			</section>
			<div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
				<span>&copy; 2026 Lead Speed Engine. All rights reserved.</span>
				<span>·</span>
				<Link href="/legal/privacy" className="hover:text-foreground">Privacy Policy</Link>
				<span>·</span>
				<Link href="/legal/terms" className="hover:text-foreground">Terms of Service</Link>
				<span>·</span>
				<Link href="/legal/refunds" className="hover:text-foreground">Refund Policy</Link>
				<span>·</span>
				<Link href="/legal/security" className="hover:text-foreground">Security</Link>
			</div>
		</motion.footer>
	);
};

export default Footer;
