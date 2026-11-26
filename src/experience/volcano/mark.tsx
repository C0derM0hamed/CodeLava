import { useId } from "react";
import { seams, pathData } from "./geometry";

export function VolcanoMark() {
  const id = useId();
  return (
    <svg
      className="cl-volcano-mark"
      aria-hidden="true"
      viewBox="0 0 200 108"
      fill="none"
    >
      <defs>
        <linearGradient id={id + "ash"} x2=".25" y2="1">
          <stop stopColor="var(--ash-50)" />
          <stop offset=".54" stopColor="var(--ash-50)" />
          <stop offset="1" stopColor="var(--ash-500)" />
        </linearGradient>
        <linearGradient id={id + "lava"} x2=".65" y2="1">
          <stop stopColor="var(--lava-300)" />
          <stop offset=".54" stopColor="var(--lava-500)" />
          <stop offset="1" stopColor="var(--lava-700)" />
        </linearGradient>
        <linearGradient id={id + "rock"} x2=".45" y2="1">
          <stop stopColor="var(--obsidian-500)" />
          <stop offset=".6" stopColor="var(--obsidian-800)" />
          <stop offset="1" stopColor="var(--obsidian-950)" />
        </linearGradient>
      </defs>
      <g
        className="cl-volcano-brackets"
        strokeWidth="14"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        <path pathLength="1" d={pathData(seams[0])} stroke={`url(#${id}ash)`} />
        <path
          pathLength="1"
          d={pathData(seams[4])}
          stroke={`url(#${id}lava)`}
        />
      </g>
      <path
        d="M64 7 10 43m128-36 51 35"
        stroke="var(--ash-50)"
        strokeWidth="1.5"
        opacity=".62"
      />
      <path
        d="m19 96 29-17 24-19 20-24 7 2 6-2 20 23 23 18 31 17-40-7-27 3-15 9-22-11-28 3Z"
        fill={`url(#${id}rock)`}
      />
      <path d="m19 96 53-36 20-24-13 29-19 14Z" fill="var(--obsidian-500)" />
      <path d="m45 90 34-25 13-25-5 26-17 11Z" fill="var(--obsidian-700)" />
      <path
        d="m99 39-6 20 9 9-2 8-8 12-17-1 11-17Z"
        fill="var(--obsidian-850)"
      />
      <path d="m105 38 20 22 27 20-14-3-19-11Z" fill="var(--obsidian-500)" />
      <path d="m105 40 5 23 18 16-15-8-11-16Z" fill="var(--obsidian-700)" />
      {seams.slice(1, 4).map((points, i) => (
        <g key={i} strokeLinejoin="round">
          <path
            d={pathData(points)}
            stroke="var(--lava-600)"
            opacity=".32"
            strokeWidth="5"
          />
          <path
            d={pathData(points)}
            stroke={`url(#${id}lava)`}
            strokeWidth={i === 1 ? 1.85 : 1.4}
          />
        </g>
      ))}
      <path
        d="m90 39 7-3 5 2 4-1m-8 2-4 12"
        stroke="var(--ember)"
        strokeWidth="1.7"
      />
    </svg>
  );
}
