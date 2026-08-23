"use client";

import BlurredOrb from "@/components/blurred-orb";
import Navbar from "@/components/templates/axis/navbar";
import Hero from "@/components/templates/axis/hero";
import Companies from "@/components/templates/axis/companies";
import Feature from "@/components/templates/axis/feature";
import ToolFeature from "@/components/templates/axis/tools";
import Stats from "@/components/templates/axis/stats";
import Testimonials from "@/components/templates/axis/testimonials";
import Pricing from "@/components/templates/axis/pricing";
import Footer from "@/components/templates/axis/footer";
import { ThemeToggle } from "@/components/templates/axis/theme-switch";
import Image from "next/image";

export default function LandingPage() {
	return (
		<div className="relative px-4 py-6 mx-auto w-full overflow-hidden bg-background text-foreground">
			{/* Signature Axis Floating Pill Navbar */}
			<Navbar />

			{/* Signature Axis Ambient Hero Radial Gradient Orb */}
			<BlurredOrb
				className="absolute top-0 left-0 h-[45rem] w-[45rem] lg:h-[65rem] lg:w-[65rem] -translate-x-1/2 -translate-y-1/2 opacity-30 blur-[7.5rem] pointer-events-none"
				style={{
					background: `radial-gradient(circle at center, var(--color-hero-start) 0%, var(--color-hero-mid) 100%, var(--color-hero-end) 100%)`,
				}}
			/>

			{/* Main Landing Sections Flow */}
			<div className="flex flex-col gap-24 lg:gap-44 mt-28 mb-14 lg:my-28 mx-auto w-full max-w-7xl">
				<div className="flex flex-col gap-24 lg:gap-16">
					<Hero />
					<Companies />
				</div>
				<Feature />
				<ToolFeature />
				<Stats />
				<Testimonials />
				<Pricing />
				<Footer />
			</div>

			{/* Signature Axis Bottom Toolbar */}
			<section className="flex flex-row items-center justify-between gap-4 border-t border-border py-4 mx-auto max-w-6xl">
				<Image
					src="/logo/templates/axis/discord.svg"
					alt="Discord Logo"
					width={100}
					height={100}
					className="h-10 w-10 bg-muted-foreground/30 dark:bg-muted p-2.5 rounded-full grayscale hover:grayscale-0 transition-all cursor-pointer"
				/>
				<ThemeToggle />
			</section>
		</div>
	);
}
