/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { QuestCategory, SKILL_METADATA, SkillStats } from '../types';
import { Sparkles, Palette, Users, TrendingUp, Zap, HelpCircle } from 'lucide-react';

interface RadarChartProps {
  stats: SkillStats;
  activeCategory: QuestCategory | null;
  onSelectCategory?: (category: QuestCategory | null) => void;
}

export default function RadarChart({
  stats,
  activeCategory,
  onSelectCategory,
}: RadarChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<QuestCategory | null>(null);

  // Categories in specific order for hexagon layout
  const categories: QuestCategory[] = [
    'technical',
    'design',
    'communication',
    'analytical',
    'teamwork',
    'business',
  ];

  // SVG parameters
  const size = 300;
  const center = size / 2;
  const rMax = 100; // max radius for polygon

  // Calculate dynamic max value (to ensure chart scales beautifully as level scales)
  const maxStatVal = Math.max(...categories.map((c) => stats[c] || 0));
  const scaleMax = maxStatVal < 5 ? 5 : maxStatVal < 10 ? 10 : maxStatVal < 25 ? 25 : maxStatVal + 5;

  // Convert skill value to radius
  const getRadius = (value: number) => {
    return (value / scaleMax) * rMax;
  };

  // Convert (angle, radius) to (x, y)
  const getCoordinates = (index: number, radius: number) => {
    // Offset by -Math.PI / 2 to make the first coordinate start at the very top (12 o'clock)
    const angle = (index * 2 * Math.PI) / categories.length - Math.PI / 2;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    return { x, y };
  };

  // Concentric polygon grids (5 levels: 20%, 40%, 60%, 80%, 100%)
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

  // Map icons to categories
  const getSkillIcon = (cat: QuestCategory, className: string) => {
    switch (cat) {
      case 'technical':
        return <Sparkles className={className} />;
      case 'design':
        return <Palette className={className} />;
      case 'communication':
        return <Zap className={className} />;
      case 'analytical':
        return <TrendingUp className={className} />;
      case 'teamwork':
        return <Users className={className} />;
      case 'business':
        return <HelpCircle className={className} />;
      default:
        return null;
    }
  };

  // Points for current student progression polyline
  const polyPoints = categories
    .map((cat, idx) => {
      const val = stats[cat] || 0;
      const r = getRadius(val);
      const { x, y } = getCoordinates(idx, r);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="flex flex-col items-center bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      {/* Title */}
      <div className="text-center mb-4">
        <h3 className="font-display text-lg text-slate-900 uppercase tracking-wider font-bold">
          🛡️ DIAGRAM STATS (กราฟพลังทักษะ)
        </h3>
        <p className="text-slate-520 text-xs mt-1">
          ระดับสเตตัสเติบโตตามหมวดหมู่งานที่ทำสำเร็จ (ขีดจำกัดสูงสุด: {scaleMax})
        </p>
      </div>

      <div className="relative w-full flex justify-center">
        {/* Radar SVG */}
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full max-w-[280px] h-[280px]"
        >
          {/* Definitions for Glow Shadow filters */}
          <defs>
            <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#f8fafc" stopOpacity="0.0" />
            </radialGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="3" floodColor="#4f46e5" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Background grid glow */}
          <circle cx={center} cy={center} r={rMax} fill="url(#radarGlow)" />

          {/* Web grid rings */}
          {gridLevels.map((lvl, lvlIdx) => {
            const r = rMax * lvl;
            const points = categories
              .map((_, idx) => {
                const { x, y } = getCoordinates(idx, r);
                return `${x},${y}`;
              })
              .join(' ');

            return (
              <polygon
                key={lvlIdx}
                points={points}
                fill="none"
                stroke="#cbd5e1"
                strokeWidth={lvlIdx === gridLevels.length - 1 ? "1.5" : "1"}
                strokeDasharray={lvlIdx !== gridLevels.length - 1 ? "4 2" : undefined}
              />
            );
          })}

          {/* Axes from center to corners */}
          {categories.map((_, idx) => {
            const { x, y } = getCoordinates(idx, rMax);
            return (
              <line
                key={idx}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="#e2e8f0"
                strokeWidth="1.5"
              />
            );
          })}

          {/* Filled user progression region */}
          <polygon
            points={polyPoints}
            fill="rgba(99, 102, 241, 0.15)"
            stroke="#4f46e5"
            strokeWidth="3"
            filter="url(#glow)"
            className="transition-all duration-500 ease-out"
          />

          {/* Data Points / Intersections */}
          {categories.map((cat, idx) => {
            const val = stats[cat] || 0;
            const r = getRadius(val);
            const { x, y } = getCoordinates(idx, r);

            const isHovered = hoveredPoint === cat;
            const isActive = activeCategory === cat;

            return (
              <g
                key={cat}
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredPoint(cat)}
                onMouseLeave={() => setHoveredPoint(null)}
                onClick={() => onSelectCategory?.(isActive ? null : cat)}
              >
                {/* Visual glow indicator */}
                {(isHovered || isActive) && (
                  <circle
                    cx={x}
                    cy={y}
                    r="8"
                    fill="rgba(99, 102, 241, 0.3)"
                    className="animate-ping"
                  />
                )}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered || isActive ? "5.5" : "4"}
                  fill={SKILL_METADATA[cat].color}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  className="transition-all duration-300"
                />
              </g>
            );
          })}

          {/* Labels outside vertices */}
          {categories.map((cat, idx) => {
            // Place labels slightly outside rMax
            const { x, y } = getCoordinates(idx, rMax + 24);
            const val = stats[cat] || 0;

            const isHovered = hoveredPoint === cat;
            const isActive = activeCategory === cat;

            // Anchor alignment based on position
            let textAnchor = 'middle';
            if (x < center - 30) textAnchor = 'end';
            if (x > center + 30) textAnchor = 'start';

            // Vertical adjustment
            let dy = '0.35em';
            if (y < center - rMax + 10) dy = '-0.2em';
            if (y > center + rMax - 10) dy = '0.9em';

            return (
              <text
                key={cat}
                x={x}
                y={y}
                dy={dy}
                textAnchor={textAnchor}
                className={`font-sans cursor-pointer transition-all duration-300 select-none ${
                  isHovered || isActive
                    ? 'fill-indigo-600 font-bold text-[12px]'
                    : 'fill-slate-500 font-medium text-[10px]'
                }`}
                onClick={() => onSelectCategory?.(isActive ? null : cat)}
              >
                {/* Abbreviated name for tight spaces */}
                {cat === 'technical' && '🔮 เทคนิคอล'}
                {cat === 'design' && '🎨 ดีไซน์'}
                {cat === 'communication' && '💬 สื่อสาร'}
                {cat === 'analytical' && '📐 วิเคราะห์'}
                {cat === 'teamwork' && '🤝 ร่วมมือ'}
                {cat === 'business' && '💼 แผนงาน'}
                {` (${val})`}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Dynamic Skill Details Legend */}
      <div className="w-full mt-4 space-y-1.5 border-t border-slate-150 pt-4 text-xs">
        {categories.map((cat) => {
          const val = stats[cat] || 0;
          const meta = SKILL_METADATA[cat];
          const isActive = activeCategory === cat;
          const classBubble = isActive
            ? 'bg-indigo-50/60 border-indigo-200 text-indigo-700 ring-2 ring-indigo-500/10'
            : 'bg-white border-slate-205 text-slate-700 hover:bg-slate-50/70 hover:border-slate-300';

          return (
            <button
              key={cat}
              onClick={() => onSelectCategory?.(isActive ? null : cat)}
              className={`w-full flex items-center justify-between text-left p-2 border rounded-xl transition-all cursor-pointer ${classBubble}`}
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: meta.color }}
                />
                <div className="font-sans leading-tight">
                  <div className="font-semibold text-[11px] sm:text-xs">
                    {cat === 'technical' && '🔮 '}
                    {cat === 'design' && '🎨 '}
                    {cat === 'communication' && '💬 '}
                    {cat === 'analytical' && '📐 '}
                    {cat === 'teamwork' && '🤝 '}
                    {cat === 'business' && '💼 '}
                    {meta.labelTh.split(' (')[0]}
                  </div>
                  {isActive && (
                    <div className="text-[10px] text-slate-500 mt-0.5 max-w-[200px] leading-relaxed">
                      {meta.description}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right font-mono text-xs font-bold ml-1 flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                Lvl <span className="text-indigo-650">{val}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
