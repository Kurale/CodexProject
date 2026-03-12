'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Expand, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatTime } from '@/lib/utils';

interface VideoPlayerProps {
  src: string;
  markers?: number[];
  onTimeUpdate?: (time: number, duration: number) => void;
  onLoadedMetadata?: (duration: number) => void;
}

export const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(function VideoPlayer(
  { src, markers = [], onTimeUpdate, onLoadedMetadata },
  ref
) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState(1);

  useImperativeHandle(ref, () => videoRef.current as HTMLVideoElement, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!videoRef.current) return;
      const target = e.target as HTMLElement | null;
      const isTypingTarget =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable;

      if (e.code === 'Space') {
        if (isTypingTarget) return;
        e.preventDefault();
        if (videoRef.current.paused) {
          videoRef.current.play();
        } else {
          videoRef.current.pause();
        }
      }
      if (e.code === 'ArrowRight') videoRef.current.currentTime += 5;
      if (e.code === 'ArrowLeft') videoRef.current.currentTime -= 5;
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div ref={wrapperRef} className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/70 p-3">
      <video
        ref={videoRef}
        src={src}
        className="w-full rounded-lg bg-black"
        onLoadedMetadata={(e) => {
          const d = e.currentTarget.duration;
          setDuration(d);
          onLoadedMetadata?.(d);
        }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => {
          const time = e.currentTarget.currentTime;
          const d = e.currentTarget.duration || 0;
          setCurrentTime(time);
          onTimeUpdate?.(time, d);
        }}
      />

      <div className="relative h-2 rounded bg-slate-800">
        <div className="h-2 rounded bg-cyan-500" style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }} />
        {markers.map((time) => (
          <button
            key={time}
            className="absolute top-1/2 h-3 w-1 -translate-y-1/2 rounded bg-amber-400"
            style={{ left: `${duration ? (time / duration) * 100 : 0}%` }}
            onClick={() => {
              if (videoRef.current) videoRef.current.currentTime = time;
            }}
            title={`Интеракция на ${formatTime(time)}`}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          onClick={() => {
            if (!videoRef.current) return;
            if (videoRef.current.paused) videoRef.current.play();
            else videoRef.current.pause();
          }}
        >
          {playing ? <Pause size={16} /> : <Play size={16} />}
        </Button>
        <input
          type="range"
          className="flex-1"
          min={0}
          max={duration || 0}
          step={0.1}
          value={currentTime}
          onChange={(e) => {
            const value = Number(e.target.value);
            setCurrentTime(value);
            if (videoRef.current) videoRef.current.currentTime = value;
          }}
        />
        <span className="text-sm text-slate-300">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
        <select
          className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-sm"
          value={speed}
          onChange={(e) => {
            const v = Number(e.target.value);
            setSpeed(v);
            if (videoRef.current) videoRef.current.playbackRate = v;
          }}
        >
          {[0.5, 1, 1.25, 1.5, 2].map((item) => (
            <option key={item} value={item}>
              {item}x
            </option>
          ))}
        </select>
        <Button
          variant="secondary"
          onClick={() => {
            if (!wrapperRef.current) return;
            wrapperRef.current.requestFullscreen();
          }}
        >
          <Expand size={16} />
        </Button>
      </div>
    </div>
  );
});
