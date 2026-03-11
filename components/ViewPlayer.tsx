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
  const [done, setDone] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const sorted = useMemo(() => [...project.interactions].sort((a, b) => a.time - b.time), [project.interactions]);
  const active = sorted.find((x) => x.id === activeId) || null;

  return (
    <div className="space-y-4">
      <div className="relative">
        <VideoPlayer
          ref={videoRef}
          src={project.videoUrl}
          onTimeUpdate={(time, duration) => {
            if (done || activeId) return;
            const trigger = sorted.find((item) => !handled.includes(item.id) && Math.abs(item.time - time) <= 0.35);
            if (trigger) {
              if (trigger.pauseUntilAnswered) {
                videoRef.current?.pause();
              }
              setActiveId(trigger.id);
              setHandled((prev) => [...prev, trigger.id]);
            }
            if (duration > 0 && time >= duration - 0.4) setDone(true);
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
      </div>

      {done && (
        <Card>
          <h3 className="text-xl font-semibold">Результат</h3>
          <p className="text-slate-300">Правильных ответов: {score} из {sorted.length}</p>
          <Button variant="secondary" onClick={() => window.location.reload()}>
            Пройти заново
          </Button>
        </Card>
      )}
    </div>
  );
}
