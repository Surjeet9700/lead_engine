"use client";

import { cn } from "@/lib/utils";
import type * as React from "react";

export interface AreaTrendPoint {
	month: string;
	won: number;
	created: number;
}

export function AreaTrend({
	data,
	height = 200,
	formatValue = (v) => String(v),
	className,
}: {
	data: AreaTrendPoint[];
	config?: Record<string, { label: string; color: string }>;
	xKey?: string;
	height?: number;
	variant?: string;
	bloom?: string;
	showLegend?: boolean;
	formatValue?: (v: number | string) => string;
	className?: string;
}) {
	if (!data || data.length === 0) return null;

	const maxVal = Math.max(
		...data.map((d) => Math.max(d.won || 0, d.created || 0)),
		1,
	);
	const pointsCount = data.length;
	const paddingX = 40;
	const paddingY = 25;
	const width = 560;
	const graphWidth = width - paddingX * 2;
	const graphHeight = height - paddingY * 2;

	const getX = (idx: number) => paddingX + (idx / (pointsCount - 1)) * graphWidth;
	const getY = (val: number) => height - paddingY - (val / maxVal) * graphHeight;

	const createdPoints = data.map((d, i) => `${getX(i)},${getY(d.created)}`).join(" ");
	const wonPoints = data.map((d, i) => `${getX(i)},${getY(d.won)}`).join(" ");

	const createdArea = `${createdPoints} ${getX(pointsCount - 1)},${height - paddingY} ${paddingX},${height - paddingY}`;
	const wonArea = `${wonPoints} ${getX(pointsCount - 1)},${height - paddingY} ${paddingX},${height - paddingY}`;

	return (
		<div className={cn("flex flex-col gap-3 px-4", className)}>
			<div className="flex items-center justify-end gap-4 text-xs">
				<div className="flex items-center gap-1.5">
					<span className="h-2 w-2 rounded-full bg-amber-500" />
					<span className="text-muted-foreground">Closed Won</span>
				</div>
				<div className="flex items-center gap-1.5">
					<span className="h-2 w-2 rounded-full bg-sky-500" />
					<span className="text-muted-foreground">New Leads</span>
				</div>
			</div>

			<div className="relative w-full overflow-hidden">
				<svg
					viewBox={`0 0 ${width} ${height}`}
					className="h-auto w-full overflow-visible"
				>
					<defs>
						<linearGradient id="createdGrad" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.3" />
							<stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0" />
						</linearGradient>
						<linearGradient id="wonGrad" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
							<stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
						</linearGradient>
					</defs>

					{/* Grid lines */}
					{[0, 0.5, 1].map((pct) => {
						const y = height - paddingY - pct * graphHeight;
						return (
							<g key={pct}>
								<line
									x1={paddingX}
									y1={y}
									x2={width - paddingX}
									y2={y}
									stroke="currentColor"
									strokeOpacity="0.08"
									strokeDasharray="4 4"
								/>
							</g>
						);
					})}

					{/* Areas */}
					<polygon points={createdArea} fill="url(#createdGrad)" />
					<polygon points={wonArea} fill="url(#wonGrad)" />

					{/* Lines */}
					<polyline
						points={createdPoints}
						fill="none"
						stroke="#0ea5e9"
						strokeWidth="2.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<polyline
						points={wonPoints}
						fill="none"
						stroke="#f59e0b"
						strokeWidth="2.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>

					{/* Points & Labels */}
					{data.map((d, i) => (
						<g key={d.month}>
							<circle
								cx={getX(i)}
								cy={getY(d.created)}
								r="3.5"
								className="fill-sky-400 stroke-background stroke-2"
							/>
							<circle
								cx={getX(i)}
								cy={getY(d.won)}
								r="3.5"
								className="fill-amber-400 stroke-background stroke-2"
							/>
							<text
								x={getX(i)}
								y={height - 6}
								textAnchor="middle"
								className="fill-muted-foreground text-[10px]"
							>
								{d.month}
							</text>
						</g>
					))}
				</svg>
			</div>
		</div>
	);
}

export interface DonutSlice {
	key: string;
	label: string;
	value: number;
	color: string;
	count: number;
}

export function DonutStat({
	data,
	height = 180,
	centerValue,
	centerLabel = "Total",
	className,
}: {
	data: DonutSlice[];
	height?: number;
	centerValue?: string;
	centerLabel?: string;
	formatValue?: (v: number | string) => string;
	className?: string;
}) {
	const total = data.reduce((acc, curr) => acc + curr.value, 0) || 1;
	const radius = 60;
	const strokeWidth = 14;
	const center = 90;
	const circumference = 2 * Math.PI * radius;

	let accumulatedOffset = 0;

	return (
		<div className={cn("relative flex items-center justify-center", className)}>
			<svg width={height} height={height} viewBox="0 0 180 180" className="-rotate-90">
				{data.map((slice) => {
					const strokeDasharray = `${(slice.value / total) * circumference} ${circumference}`;
					const strokeDashoffset = -accumulatedOffset;
					accumulatedOffset += (slice.value / total) * circumference;

					return (
						<circle
							key={slice.key}
							cx={center}
							cy={center}
							r={radius}
							fill="transparent"
							stroke={slice.color}
							strokeWidth={strokeWidth}
							strokeDasharray={strokeDasharray}
							strokeDashoffset={strokeDashoffset}
							strokeLinecap="round"
							className="transition-all duration-500 ease-out"
						/>
					);
				})}
			</svg>

			{/* Center Value */}
			<div className="absolute inset-0 flex flex-col items-center justify-center text-center">
				<span className="font-semibold text-lg text-foreground tracking-tight">{centerValue}</span>
				<span className="text-muted-foreground text-xs uppercase tracking-wider">{centerLabel}</span>
			</div>
		</div>
	);
}
