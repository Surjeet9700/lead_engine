import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Verified } from "lucide-react";

const testimonials = [
	{
		avatar: "/illustrations/avatar-1.svg",
		name: "Suresh Reddy",
		handle: "@bharat_pumps",
		content: (
			<>
				Finally a CRM that doesn&apos;t feel like generic bloat.{" "}
				<span className="text-primary font-medium">@leadspeed_crm</span> responds to our IndiaMart inquiries in 2 seconds while I am on the shop floor.
			</>
		),
		verified: true,
	},
	{
		avatar: "/illustrations/avatar-2.svg",
		name: "Venkat Rao",
		handle: "@deccan_industrial",
		content: (
			<>
				I&apos;ve tried three different CRMs.{" "}
				<span className="text-primary font-medium">@leadspeed_crm</span> is the only one that actually matches vertical multistage specs automatically.
			</>
		),
	},
	{
		avatar: "/illustrations/avatar-3.svg",
		name: "K. N. Murthy",
		handle: "@jetl_hyd",
		content: (
			<>
				<span className="text-primary font-medium">@leadspeed_crm</span> The automated BuyLead refund generator saved us ₹14,200 in fake lead credits last month alone.
			</>
		),
	},
	{
		avatar: "/illustrations/avatar-1.svg",
		name: "Arjun Verma",
		handle: "@ramky_infra",
		content: (
			<>
				This feels built for industrial pump dealers, not generic SaaS teams pretending to understand manufacturing. <span className="text-primary font-medium">@leadspeed_crm</span>
			</>
		),
	},
	{
		avatar: "/illustrations/avatar-2.svg",
		name: "Rajesh Goud",
		handle: "@goud_motors",
		content: (
			<>
				<span className="text-primary font-medium">@leadspeed_crm</span> replaced my messy WhatsApp notes and manual IndiaMart portal refreshes. Instant quotations.
			</>
		),
	},
	{
		avatar: "/illustrations/avatar-3.svg",
		name: "P. Srinivas",
		handle: "@sri_balaji_eng",
		content: (
			<>
				The Exotel voice fallback is a lifesaver. Buyers who don&apos;t check WhatsApp get called in Telugu, press 1, and get bridged to my phone.
			</>
		),
		verified: true,
	},
];

const Testimonials = () => {
	return (
		<div id="customers" className="flex flex-col gap-16 px-4">
			<div className="flex flex-col items-center text-center">
				<h2 className="text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
					Loved by industrial dealers &amp; MEP distributors
				</h2>
				<p className="mt-4 text-sm text-muted-foreground sm:text-base">
					See how manufacturers and dealers across India close more leads with LeadSpeed CRM.
				</p>
			</div>
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
				{testimonials.map((testimonial, i) => (
					<Card key={i} className="border-border bg-card/50">
						<CardHeader className="flex flex-row items-center gap-3 space-y-0">
							<Image
								src={testimonial.avatar}
								alt={testimonial.name}
								width={40}
								height={40}
								className="rounded-full"
							/>
							<div className="flex flex-col">
								<div className="flex items-center gap-1">
									<p className="text-sm font-medium">{testimonial.name}</p>
									{testimonial.verified && (
										<Verified className="h-3.5 w-3.5 fill-primary text-primary-foreground" />
									)}
								</div>
								<p className="text-xs text-muted-foreground">
									{testimonial.handle}
								</p>
							</div>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground leading-relaxed">
								{testimonial.content}
							</p>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
};

export default Testimonials;