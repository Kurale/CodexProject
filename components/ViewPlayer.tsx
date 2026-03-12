'use client';

import { useMemo, useRef, useState } from 'react';
import { Project } from '@/lib/types';
import { VideoPlayer } from '@/components/VideoPlayer';
import { QuestionOverlay } from '@/components/QuestionOverlay';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function ViewPlayer({ project }: { project: Project }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [handled, setHandled] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const sorted = useMemo(() => [...project.interactions].sort((a, b) => a.time - b.time), [project.interactions]);
  const active = sorted.find((x) => x.id === activeId) || null;

  const restartAttempt = () => {
    setHandled([]);
    setScore(0);
    setActiveId(null);
    setShowResult(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      void videoRef.current.play();
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <VideoPlayer
          ref={videoRef}
          src={project.videoUrl}
          onTimeUpdate={(time) => {
            if (showResult || activeId) return;
            const trigger = sorted.find((item) => !handled.includes(item.id) && Math.abs(item.time - time) <= 0.35);
            if (trigger) {
              if (trigger.pauseUntilAnswered) {
                videoRef.current?.pause();
              }
              setActiveId(trigger.id);
              setHandled((prev) => [...prev, trigger.id]);
            }
          }}
          onEnded={() => {
            videoRef.current?.pause();
            setShowResult(true);
          }}
          markers={[]}
        />

        {active && (
          <QuestionOverlay
            interaction={active}
            onComplete={({ correct }) => {
              if (correct) setScore((s) => s + 1);
              setActiveId(null);
              videoRef.current?.play();
            }}
          />
        )}

        {showResult && !active && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 p-4">
            <Card className="w-full max-w-lg border-slate-700 bg-slate-900">
              <h3 className="text-2xl font-semibold">Результаты теста</h3>
              <p className="mt-2 text-slate-300">
                Правильных ответов: <span className="font-semibold text-cyan-300">{score}</span> из{' '}
                <span className="font-semibold text-cyan-300">{sorted.length}</span>
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={restartAttempt}>Пройти заново</Button>
                <Button variant="secondary" onClick={() => setShowResult(false)}>
                  Закрыть
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
