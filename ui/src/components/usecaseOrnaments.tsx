/**
 * Simple line-art ornaments for use-case discovery cards and hero banners. Shapes use currentColor; parent sets color.
 */

import type { FC, ReactNode } from 'react';
import { useComputedColorScheme, useMantineTheme } from '@mantine/core';
import type { MantineColor } from '@mantine/core';

export interface OrnamentProps {
  className?: string;
  /** Rendered size; viewBox stays 48×40. Defaults 48×40. */
  width?: number;
  height?: number;
}

const VB_W = 48;
const VB_H = 40;

const DEFAULT_PATH = '/writing-prompts';

function SvgShell({
  children,
  width,
  height,
  className,
}: {
  children: ReactNode;
  width?: number;
  height?: number;
  className?: string;
}) {
  const explicitSize = width !== undefined && height !== undefined;
  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      width={explicitSize ? width : undefined}
      height={explicitSize ? height : undefined}
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={className}
    >
      {children}
    </svg>
  );
}

/** Resolved theme shade for a use case primary palette (cards + hero). */
export function useUseCaseAccentColor(primaryColor: MantineColor): string {
  const theme = useMantineTheme();
  const colorScheme = useComputedColorScheme('light');
  const shade = colorScheme === 'dark' ? 5 : 6;
  const palette = theme.colors[primaryColor];
  return palette?.[shade] ?? theme.colors.blue[shade];
}

/** Inner `<g>` only — for SVG `<pattern>` embedding (same paths as full ornaments). */
export function OrnamentInner({ path }: { path: string }): ReactNode {
  const Cmp = INNER_BY_PATH[path] ?? INNER_BY_PATH[DEFAULT_PATH];
  return <Cmp />;
}

/** Dots + spark — prompts / ideas */
function WritingPromptsInner() {
  return (
    <g stroke="currentColor" strokeWidth={1.25} strokeLinecap="round">
      {Array.from({ length: 9 }, (_, i) => {
        const r = Math.floor(i / 3);
        const c = i % 3;
        return (
          <circle key={i} cx={10 + c * 14} cy={10 + r * 10} r={1.8} fill="currentColor" stroke="none" />
        );
      })}
      <path d="M 32 8 L 40 6 M 36 12 L 42 10" />
    </g>
  );
}

function WritingPromptsOrnament({ className, width, height }: OrnamentProps) {
  return (
    <SvgShell width={width} height={height} className={className}>
      <WritingPromptsInner />
    </SvgShell>
  );
}

/** Rings + gems — fantasy names */
function FantasyNamesInner() {
  return (
    <g stroke="currentColor" strokeWidth={1.2}>
      <circle cx={24} cy={18} r={10} fill="none" />
      <circle cx={24} cy={18} r={6} fill="none" opacity={0.65} />
      <circle cx={14} cy={26} r={2.5} fill="currentColor" stroke="none" />
      <circle cx={34} cy={26} r={2.5} fill="currentColor" stroke="none" />
      <circle cx={24} cy={8} r={2} fill="currentColor" stroke="none" />
    </g>
  );
}

function FantasyNamesOrnament({ className, width, height }: OrnamentProps) {
  return (
    <SvgShell width={width} height={height} className={className}>
      <FantasyNamesInner />
    </SvgShell>
  );
}

/** Compass rose dots — places / maps */
function PlaceNamesInner() {
  return (
    <g stroke="currentColor" strokeWidth={1.2}>
      <circle cx={24} cy={20} r={3} fill="currentColor" stroke="none" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const r = 14;
        return (
          <circle
            key={i}
            cx={24 + Math.cos(rad) * r}
            cy={20 + Math.sin(rad) * r}
            r={1.6}
            fill="currentColor"
            stroke="none"
          />
        );
      })}
      <circle cx={24} cy={20} r={12} fill="none" opacity={0.45} strokeDasharray="2 3" />
    </g>
  );
}

function PlaceNamesOrnament({ className, width, height }: OrnamentProps) {
  return (
    <SvgShell width={width} height={height} className={className}>
      <PlaceNamesInner />
    </SvgShell>
  );
}

/** Sentence lines */
function RandomSentencesInner() {
  return (
    <g stroke="currentColor" strokeWidth={1.4} strokeLinecap="round">
      <path d="M 6 10 H 38" opacity={0.9} />
      <path d="M 6 18 H 32" opacity={0.75} />
      <path d="M 6 26 H 40" opacity={0.9} />
      <path d="M 6 34 H 28" opacity={0.6} />
    </g>
  );
}

function RandomSentencesOrnament({ className, width, height }: OrnamentProps) {
  return (
    <SvgShell width={width} height={height} className={className}>
      <RandomSentencesInner />
    </SvgShell>
  );
}

/** Geometric pattern — SVG / vector */
function SvgGeneratorInner() {
  return (
    <g stroke="currentColor" strokeWidth={1.15}>
      <rect x={10} y={8} width={14} height={14} fill="none" transform="rotate(15 17 15)" />
      <polygon points="34,28 42,28 38,20" fill="none" />
      <circle cx={22} cy={28} r={3} fill="currentColor" stroke="none" opacity={0.85} />
      <path d="M 6 32 L 10 28 L 6 24" fill="none" />
    </g>
  );
}

function SvgGeneratorOrnament({ className, width, height }: OrnamentProps) {
  return (
    <SvgShell width={width} height={height} className={className}>
      <SvgGeneratorInner />
    </SvgShell>
  );
}

/** Table / sheet grid — character sheet */
function CharacterSheetInner() {
  return (
    <g stroke="currentColor" strokeWidth={1.1}>
      <rect x={10} y={8} width={28} height={24} rx={1} fill="none" />
      <path d="M 10 16 H 38 M 10 24 H 38 M 18 8 V 32 M 30 8 V 32" opacity={0.7} />
      <rect x={12} y={10} width={10} height={4} fill="currentColor" stroke="none" opacity={0.35} />
    </g>
  );
}

function CharacterSheetOrnament({ className, width, height }: OrnamentProps) {
  return (
    <SvgShell width={width} height={height} className={className}>
      <CharacterSheetInner />
    </SvgShell>
  );
}

const INNER_BY_PATH: Record<string, FC> = {
  '/writing-prompts': WritingPromptsInner,
  '/fantasy-names': FantasyNamesInner,
  '/place-names': PlaceNamesInner,
  '/random-sentences': RandomSentencesInner,
  '/svg-generator': SvgGeneratorInner,
  '/character-sheet': CharacterSheetInner,
};

const ORNAMENTS: Record<string, FC<OrnamentProps>> = {
  '/writing-prompts': WritingPromptsOrnament,
  '/fantasy-names': FantasyNamesOrnament,
  '/place-names': PlaceNamesOrnament,
  '/random-sentences': RandomSentencesOrnament,
  '/svg-generator': SvgGeneratorOrnament,
  '/character-sheet': CharacterSheetOrnament,
};

export type UsecaseOrnamentVariant = 'card' | 'hero';

export function UsecaseCardOrnament({
  path,
  className,
  width,
  height,
  variant = 'card',
}: {
  path: string;
  className?: string;
  width?: number;
  height?: number;
  /** `hero`: no intrinsic pixel size — parent sets height (e.g. full banner). */
  variant?: UsecaseOrnamentVariant;
}) {
  const Cmp = ORNAMENTS[path] ?? RandomSentencesOrnament;
  const w = variant === 'hero' ? undefined : width ?? VB_W;
  const h = variant === 'hero' ? undefined : height ?? VB_H;
  return <Cmp className={className} width={w} height={h} />;
}
