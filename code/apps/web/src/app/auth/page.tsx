"use client";

import { AuthHeading, AuthShell } from "@/components/crm/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Lock, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function AuthPage() {
	const router = useRouter();
	const [email, setEmail] = useState("owner@bharatpumps.in");
	const [password, setPassword] = useState("••••••••••••");
	const [loading, setLoading] = useState(false);

	const handleSignIn = (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setTimeout(() => {
			router.push("/dashboard");
		}, 500);
	};

	return (
		<AuthShell>
			<AuthHeading
				title="Welcome back"
				description="Sign in to your Bharat Pumps & Equipment CRM workspace."
			/>

			{/* Social Sign-in Buttons */}
			<div className="flex flex-col gap-2.5">
				<Button
					type="button"
					variant="outline"
					className="w-full justify-center gap-2.5 bg-muted/30 hover:bg-muted font-normal text-sm"
					onClick={() => {
						setLoading(true);
						setTimeout(() => router.push("/dashboard"), 400);
					}}
				>
					<svg className="size-4 shrink-0" viewBox="0 0 24 24">
						<path
							fill="#4285F4"
							d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
						/>
						<path
							fill="#34A853"
							d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
						/>
						<path
							fill="#FBBC05"
							d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
						/>
						<path
							fill="#EA4335"
							d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
						/>
					</svg>
					<span>Continue with Google</span>
				</Button>

				<Button
					type="button"
					variant="outline"
					className="w-full justify-center gap-2.5 bg-muted/30 hover:bg-muted font-normal text-sm"
					onClick={() => {
						setLoading(true);
						setTimeout(() => router.push("/dashboard"), 400);
					}}
				>
					<svg className="size-4 shrink-0" viewBox="0 0 23 23">
						<path fill="#f35325" d="M1 1h10v10H1z" />
						<path fill="#81bc06" d="M12 1h10v10H12z" />
						<path fill="#05a6f0" d="M1 12h10v10H1z" />
						<path fill="#ffba08" d="M12 12h10v10H12z" />
					</svg>
					<span>Continue with Microsoft</span>
				</Button>
			</div>

			<div className="relative flex items-center justify-center">
				<div className="absolute inset-0 flex items-center">
					<div className="w-full border-t border-border/80" />
				</div>
				<span className="relative bg-background px-3 text-[11px] uppercase tracking-wider text-muted-foreground">
					Or continue with email
				</span>
			</div>

			<form onSubmit={handleSignIn} className="flex flex-col gap-4">
				<div className="space-y-1.5">
					<Label htmlFor="email" className="text-xs font-medium text-foreground">
						Work Email
					</Label>
					<div className="relative">
						<Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
						<Input
							id="email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="owner@bharatpumps.in"
							className="pl-9"
							required
						/>
					</div>
				</div>

				<div className="space-y-1.5">
					<div className="flex items-center justify-between">
						<Label htmlFor="password" className="text-xs font-medium text-foreground">
							Password
						</Label>
						<Link href="#" className="text-xs text-muted-foreground hover:text-foreground hover:underline">
							Forgot password?
						</Link>
					</div>
					<div className="relative">
						<Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
						<Input
							id="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="pl-9"
							required
						/>
					</div>
				</div>

				<Button type="submit" className="w-full mt-1 gap-2" disabled={loading}>
					{loading ? (
						<span>Launching workspace…</span>
					) : (
						<>
							<span>Sign in to CRM</span>
							<ArrowRight className="h-4 w-4" />
						</>
					)}
				</Button>
			</form>

			<div className="rounded-lg border border-border/60 bg-muted/40 p-3 text-xs text-muted-foreground flex items-center gap-2">
				<ShieldCheck className="h-4 w-4 text-amber-400 shrink-0" />
				<span>Enterprise SLA Enabled: 45s WhatsApp Response Active.</span>
			</div>
		</AuthShell>
	);
}
