"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import Image from "next/image";
import { motion } from "motion/react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useRouter } from "next/navigation";

const features = [
	"Sub-45s IndiaMart webhook capture",
	"Automated WhatsApp quotation dispatch",
	"Dynamic spec & attribute qualification",
	"Junk BuyLead refund dispute generator",
	"Exotel AI voice fallback calls",
	"Cloudflare D1 & Hono backend engine",
	"Dedicated B2B industrial support",
];

const Pricing = () => {
	const isMobile = useMediaQuery("(max-width: 768px)");
	const router = useRouter();

	return (
		<motion.div
			id="pricing"
			style={{
				backgroundImage: isMobile
					? "url('/images/templates/axis/pricing-mobile.svg')"
					: "url('/images/templates/axis/pricing.svg')",
				backgroundSize: "cover",
				backgroundPosition: "center",
			}}
			className="rounded-4xl px-6 pt-16 pb-8 md:px-12 md:py-20 max-w-7xl mx-auto w-full"
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, amount: 0.15 }}
			transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
		>
			<div className="mx-auto max-w-4xl">
				<div className="mb-12 flex flex-col items-center text-center">
					<h2 className="text-3xl font-medium tracking-tight text-white sm:text-4xl">
						Run your industrial sales with zero lead latency
					</h2>
					<p className="mt-4 text-sm text-white/70 sm:text-base">
						Deploy in minutes. Connect your IndiaMart Push API and dominate your market.
					</p>
				</div>

				<Card className="overflow-hidden rounded-2xl border-0 bg-background/85 p-0 shadow-xl backdrop-blur-md">
					<div className="flex flex-col md:flex-row">
						<div className="flex flex-col border-b border-border/30 p-8 md:basis-2/5 md:border-b-0 md:border-r md:p-10">
							<h3 className="text-center text-4xl font-medium text-foreground">
								Professional
							</h3>
							<p className="mt-1 text-center text-lg text-muted-foreground">
								For industrial machinery
								<br />
								&amp; equipment dealers
							</p>

							<p className="mt-8 text-center text-3xl font-bold text-foreground">
								₹4,999 <span className="text-sm font-normal text-muted-foreground">/ month</span>
							</p>

							<div className="mt-8 flex flex-col gap-3">
								<Button
									className="w-full rounded-full cursor-pointer"
									onClick={() => router.push("/dashboard")}
								>
									Launch CRM Dashboard
								</Button>
								<Button
									variant="outline"
									className="w-full rounded-full border-foreground/20 bg-transparent cursor-pointer"
									onClick={() => router.push("/auth")}
								>
									Sign In &rarr;
								</Button>
							</div>

							<p className="mt-8 text-center text-xs text-muted-foreground font-light">
								Includes 45s SLA guarantee, BuyLead dispute claims, and voice fallback.
							</p>
						</div>

						<div className="flex flex-col justify-between p-8 md:basis-3/5 md:p-10">
							<ul className="flex flex-col gap-3">
								{features.map((feature, i) => (
									<li key={i} className="flex items-center gap-3">
										<Check className="h-4 w-4 text-primary" strokeWidth={2.5} />
										<span className="text-sm text-foreground font-medium">{feature}</span>
									</li>
								))}
							</ul>

							<div className="mt-8 border-t border-border/30 pt-6">
								<p className="text-xs leading-relaxed text-muted-foreground">
									Trusted by major industrial hubs across Hyderabad, Coimbatore, and Chennai. Supported brands &amp; partners:
								</p>
								<div className="mt-4 flex flex-col md:flex-row items-center gap-6 md:gap-8">
									<Image
										src="/logo/templates/axis/logoipsum-1.svg"
										alt="Company logo"
										width={80}
										height={24}
										className="h-6 md:h-7 lg:h-8 w-auto opacity-80 dark:invert"
									/>
									<Image
										src="/logo/templates/axis/logoipsum-2.svg"
										alt="Company logo"
										width={80}
										height={24}
										className="h-6 md:h-7 lg:h-8 w-auto opacity-80 dark:invert"
									/>
									<Image
										src="/logo/templates/axis/shopify-2.svg"
										alt="Shopify"
										width={80}
										height={24}
										className="h-6 md:h-7 lg:h-8 w-auto opacity-80 dark:invert"
									/>
								</div>
							</div>
						</div>
					</div>
				</Card>
			</div>
		</motion.div>
	);
};

export default Pricing;
