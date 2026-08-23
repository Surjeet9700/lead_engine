"use client";

import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const Hero = () => {
	const router = useRouter();

	return (
		<motion.div
			className="flex flex-col gap-16 items-center justify-center py-2 lg:pt-8"
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, amount: 0.15 }}
			transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
		>
			<section className="flex flex-col lg:flex-row items-center justify-between w-full max-xl:gap-6 max-w-7xl lg:max-w-6xl">
				<h1 className="max-md:font-medium text-3xl md:text-5xl lg:text-6xl xl:text-7xl lg:max-w-lg xl:max-w-2xl tracking-tighter text-center lg:text-left text-foreground font-semibold">
					The CRM built for how industrial machinery dealers actually work
				</h1>
				<section className="flex flex-col gap-8">
					<p className="text-md md:text-xl max-w-xl lg:max-w-md text-center lg:text-left text-muted-foreground">
						Stop losing IndiaMart leads to faster competitors. Our engine captures webhooks in &lt;100ms, qualifies multi-category equipment specs, dispatches WhatsApp quotes in &lt;45s, and files automatic BuyLead refunds.
					</p>
					<div className="flex flex-row gap-3 justify-center lg:justify-start">
						<Button
							className="rounded-full max-lg:hidden cursor-pointer"
							size="lg"
							onClick={() => router.push("/dashboard")}
						>
							Launch CRM Dashboard
						</Button>
						<Button
							className="rounded-full max-lg:w-full cursor-pointer"
							variant="outline"
							size="lg"
							onClick={() => router.push("/auth")}
						>
							Sign In
						</Button>
					</div>
				</section>
			</section>
			<div className="relative w-full max-w-7xl flex justify-center">
				<Image
					src="/images/templates/axis/hero.svg"
					alt="Lead Speed CRM Dashboard Preview"
					width={1200}
					height={800}
					className="w-full max-w-7xl h-auto rounded-xl lg:rounded-[2.5rem] border border-border shadow-2xl"
					priority
					sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
				/>
				<div className="max-md:hidden absolute bottom-0 left-0 h-12 lg:h-24 w-full dark:bg-gradient-to-b from-transparent to-background pointer-events-none" />
			</div>
		</motion.div>
	);
};

export default Hero;
