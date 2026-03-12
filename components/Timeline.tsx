'use client';

import { Interaction } from '@/lib/types';
import { formatTime } from '@/lib/utils';

export function Timeline({
  duration,
  interactions,
  onSeek,
  onSelect
}: {
  duration: number;
  interactions: Interaction[];
  onSeek: (time: number) => void;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
      <h3 className="mb-2 text-sm font-semibold text-slate-300">Таймлайн взаимодействий</h3>
      <div className="relative h-8 rounded bg-slate-800" onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const ratio = (e.clientX - rect.left) / rect.width;
        onSeek(duration * ratio);
      }}>
        {interactions.map((item) => (
          <button
            key={item.id}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(item.id);
              onSeek(item.time);
            }}
            className="absolute top-1/2 h-5 w-2 -translate-y-1/2 rounded bg-cyan-400"
            style={{ left: `${duration ? (item.time / duration) * 100 : 0}%` }}
            title={`${formatTime(item.time)} · ${item.question}`}
          />
        ))}
      </div>
    </div>
  );
}
