import { NextRequest } from "next/server";
import satori from "satori";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") ?? "LevelUp";
  const subtitle = searchParams.get("subtitle") ?? "Gamified Habit Tracker";
  const level = searchParams.get("level") ?? "1";
  const xp = searchParams.get("xp") ?? "0";

  const svg = `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0a0a1a"/>
          <stop offset="100%" style="stop-color:#1a1a2e"/>
        </linearGradient>
        <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#8b5cf6"/>
          <stop offset="100%" style="stop-color:#06b6d4"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="630" fill="url(#bg)"/>
      <rect x="50" y="50" width="1100" height="530" rx="20" fill="none" stroke="url(#accent)" stroke-width="2" opacity="0.3"/>
      <text x="600" y="200" text-anchor="middle" fill="#8b5cf6" font-size="64" font-family="system-ui" font-weight="bold">${title}</text>
      <text x="600" y="280" text-anchor="middle" fill="#94a3b8" font-size="28" font-family="system-ui">${subtitle}</text>
      <text x="600" y="400" text-anchor="middle" fill="#06b6d4" font-size="40" font-family="system-ui" font-weight="bold">Level ${level}</text>
      <text x="600" y="460" text-anchor="middle" fill="#8b5cf6" font-size="32" font-family="system-ui">${xp} XP</text>
      <rect x="400" y="510" width="400" height="8" rx="4" fill="#1e1e3a"/>
      <rect x="400" y="510" width="200" height="8" rx="4" fill="url(#accent)"/>
    </svg>
  `;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
