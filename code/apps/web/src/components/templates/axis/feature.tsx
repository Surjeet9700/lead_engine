"use client";

import Image from "next/image";
import { motion } from "motion/react";

const features = [
	{
		title: "Sub-45s Speed to Lead",
		description:
			"Capture IndiaMart webhooks in <100ms and dispatch verified WhatsApp quotes before competitors even open the portal.",
	},
	{
		title: "Machinery & Technical Spec Matching",
		description:
			"Dynamic catalog matching for Industrial Pumps, Air Compressors, Diesel Generators, Motors, and Heavy Equipment.",
	},
	{
		title: "Automatic BuyLead Refunds",
		description:
			"Identify spam, student projects, and fake inquiries instantly and generate dispute claims for credit reversals.",
	},
	{
		title: "Exotel Voice Fallback",
		description:
			"Trigger automated AI voice calls when high-priority buyers don't open WhatsApp messages within 120 seconds.",
	},
];

const Feature = () => {
	return (
		<motion.section
			id="features"
			className="relative mx-auto max-w-7xl px-4"
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, amount: 0.15 }}
			transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
		>
			<div className="mb-12 text-center lg:mb-16 max-lg:hidden">
				<h2 className="text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
					Engineered for high-velocity industrial B2B sales
				</h2>
				<p className="mt-4 text-sm text-muted-foreground sm:text-lg">
					Everything you need to capture, qualify, and close IndiaMart leads—without manual delay.
				</p>
			</div>

			<div className="hidden lg:grid lg:grid-cols-[1fr_2.5fr_1fr] lg:items-center lg:gap-12">
				<section className="flex flex-col gap-32 pb-24">
					<div className="max-w-[240px]">
						<h3 className="mb-2 text-lg font-medium text-foreground">
							{features[0].title}
						</h3>
						<p className="text-sm leading-relaxed text-muted-foreground">
							{features[0].description}
						</p>
					</div>
					<div className="max-w-[240px]">
						<h3 className="mb-2 text-lg font-medium text-foreground">
							{features[1].title}
						</h3>
						<p className="text-sm leading-relaxed text-muted-foreground">
							{features[1].description}
						</p>
					</div>
				</section>
				<div className="flex justify-center">
					<Image
						src="/images/templates/axis/feature.svg"
						alt="Lead Speed CRM Feature Visual"
						width={500}
						height={500}
						className="h-auto w-full max-w-[420px]"
					/>
				</div>
				<section className="flex flex-col gap-32 pb-24">
					<div className="max-w-[240px]">
						<h3 className="mb-2 text-lg font-medium text-foreground">
							{features[2].title}
						</h3>
						<p className="text-sm leading-relaxed text-muted-foreground">
							{features[2].description}
						</p>
					</div>
					<div className="max-w-[240px]">
						<h3 className="mb-2 text-lg font-medium text-foreground">
							{features[3].title}
						</h3>
						<p className="text-sm leading-relaxed text-muted-foreground">
							{features[3].description}
						</p>
					</div>
				</section>
			</div>

			<div className="flex flex-col gap-8 lg:hidden">
				<div className="text-center">
					<h2 className="text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
						Engineered for high-velocity industrial B2B sales
					</h2>
					<p className="mt-2 text-sm text-muted-foreground">
						Capture, score, and quote machinery inquiries in seconds.
					</p>
				</div>
				<div className="flex justify-center">
					<Image
						src="/images/templates/axis/feature.svg"
						alt="Lead Speed CRM Feature Visual"
						width={400}
						height={400}
						className="h-auto w-full max-w-[320px]"
					/>
				</div>
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
					{features.map((feature, index) => (
						<div key={index} className="rounded-xl border border-border p-4">
							<h3 className="mb-1 text-base font-medium text-foreground">
								{feature.title}
							</h3>
							<p className="text-sm leading-relaxed text-muted-foreground">
								{feature.description}
							</p>
						</div>
					))}
				</div>
			</div>
		</motion.section>
	);
};

export default Feature;
