'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { nanoid } from 'nanoid';
import { Interaction, Project } from '@/lib/types';
import { VideoPlayer } from '@/components/VideoPlayer';
import { Timeline } from '@/components/Timeline';
import { InteractionForm } from '@/components/InteractionForm';
import { QuestionOverlay } from '@/components/QuestionOverlay';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { isEmbeddableVideo, toEmbedUrl } from '@/lib/utils';

const blankInteraction = (time = 0): Interaction => ({
  id: nanoid(8),
  time,
  type: 'single',
  question: '',
  options: [
    { id: nanoid(5), text: '', correct: true },
    { id: nanoid(5), text: '', correct: false }
  ],
  feedbackCorrect: 'Верно!',
  feedbackIncorrect: 'Неверно',
  pauseUntilAnswered: true
});

export default function EditorPage() {
  const params = useSearchParams();
  const [project, setProject] = useState<Project>({
    id: nanoid(12),
    title: 'Новый проект',
    sourceType: 'upload',
    videoUrl: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interactions: []
  });
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [editing, setEditing] = useState<Interaction | null>(null);
  const [preview, setPreview] = useState(false);
  const [activePreview, setActivePreview] = useState<Interaction | null>(null);
  const [previewQueue, setPreviewQueue] = useState<string[]>([]);
  const [errors, setErrors] = useState<string>('');

  useEffect(() => {
    const id = params.get('id');
    if (!id) return;
    fetch(`/api/projects?id=${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.project) setProject(data.project);
      });
  }, [params]);

  useEffect(() => {
    if (!project.videoUrl) return;
    const timeout = setTimeout(() => {
      saveProject();
    }, 1200);
    return () => clearTimeout(timeout);
  }, [project]);

  const sortedInteractions = useMemo(
    () => [...project.interactions].sort((a, b) => a.time - b.time),
    [project.interactions]
  );

  const validateInteraction = (item: Interaction) => {
    if (!item.question.trim()) return 'Вопрос не может быть пустым';
    if (item.type === 'text' && !item.textAnswer?.trim()) return 'Укажите ответ для текстового вопроса';
    if (item.type !== 'text') {
      if (item.options.some((o) => !o.text.trim())) return 'Варианты ответа не должны быть пустыми';
      if (!item.options.some((o) => o.correct)) return 'Нужен минимум один правильный ответ';
    }
    return '';
  };

  const saveProject = async () => {
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...project, updatedAt: new Date().toISOString() })
    });
    const data = await response.json();
    if (data.project) setProject(data.project);
  };

  const uploadVideo = async (file: File) => {
    const form = new FormData();
    form.append('file', file);
    const response = await fetch('/api/upload', { method: 'POST', body: form });
    const data = await response.json();
    if (data.error) return setErrors(data.error);
    setProject((prev) => ({ ...prev, sourceType: 'upload', videoUrl: data.url }));
  };

  const onPreviewTime = (time: number) => {
    setCurrentTime(time);
    if (!preview) return;

    // Основная логика: ловим ближайшую неотработанную интеракцию с допуском ~0.35 сек.
    const trigger = sortedInteractions.find(
      (item) => !previewQueue.includes(item.id) && Math.abs(item.time - time) <= 0.35
    );

    if (trigger) {
      setPreviewQueue((prev) => [...prev, trigger.id]);
      setActivePreview(trigger);
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[2fr,1fr]">
      <div className="space-y-4">
        <Card className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-slate-300">Название проекта</label>
              <Input value={project.title} onChange={(e) => setProject({ ...project, title: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Видео URL (YouTube/Vimeo/MP4)</label>
              <Input
                placeholder="https://..."
                onBlur={(e) => {
                  if (!e.target.value) return;
                  setProject({ ...project, sourceType: 'url', videoUrl: e.target.value });
                }}
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-300">Загрузка MP4</label>
            <Input type="file" accept="video/mp4" onChange={(e) => e.target.files?.[0] && uploadVideo(e.target.files[0])} />
          </div>
          {errors && <p className="text-sm text-rose-400">{errors}</p>}
        </Card>

        {project.videoUrl && !isEmbeddableVideo(project.videoUrl) && (
          <div className="relative">
            <VideoPlayer
              src={project.videoUrl}
              markers={sortedInteractions.map((x) => x.time)}
              onLoadedMetadata={setDuration}
              onTimeUpdate={(t) => onPreviewTime(t)}
            />
            {preview && activePreview && (
              <QuestionOverlay
                interaction={activePreview}
                onComplete={() => {
                  setActivePreview(null);
                }}
              />
            )}
          </div>
        )}

        {project.videoUrl && isEmbeddableVideo(project.videoUrl) && (
          <Card>
            <iframe src={toEmbedUrl(project.videoUrl)} className="aspect-video w-full rounded-lg" allowFullScreen />
            <p className="mt-2 text-xs text-amber-300">
              Для YouTube/Vimeo в MVP доступен embed-предпросмотр. Интерактивная синхронизация поддерживается для MP4.
            </p>
          </Card>
        )}

        <Timeline
          duration={duration || 1}
          interactions={sortedInteractions}
          onSeek={(time) => setCurrentTime(time)}
          onSelect={(id) => setEditing(project.interactions.find((x) => x.id === id) || null)}
        />
      </div>

      <div className="space-y-4">
        <Card className="space-y-2">
          <Button onClick={() => setEditing(blankInteraction(currentTime))}>Добавить взаимодействие @ {currentTime.toFixed(1)}s</Button>
          <Button variant="secondary" onClick={() => setPreview((p) => !p)}>
            {preview ? 'Остановить предпросмотр' : 'Предпросмотр'}
          </Button>
          <Button variant="ghost" onClick={saveProject}>
            Сохранить проект
          </Button>
          <p className="text-xs text-slate-400">Ссылка просмотра: /view/{project.id}</p>
        </Card>

        {editing && (
          <InteractionForm
            value={editing}
            onChange={setEditing}
            onCancel={() => setEditing(null)}
            onSave={() => {
              const error = validateInteraction(editing);
              if (error) return setErrors(error);
              setErrors('');
              setProject((prev) => {
                const exists = prev.interactions.some((x) => x.id === editing.id);
                const interactions = exists
                  ? prev.interactions.map((x) => (x.id === editing.id ? editing : x))
                  : [...prev.interactions, editing];
                return { ...prev, interactions };
              });
              setEditing(null);
            }}
          />
        )}

        <Card>
          <h3 className="mb-3 font-semibold">Интеракции</h3>
          <div className="space-y-2">
            {sortedInteractions.map((item) => (
              <div key={item.id} className="rounded border border-slate-800 p-2 text-sm">
                <p className="font-medium">{item.time.toFixed(1)}s · {item.question}</p>
                <div className="mt-2 flex gap-2">
                  <Button variant="secondary" onClick={() => setEditing(item)}>Редактировать</Button>
                  <Button
                    variant="destructive"
                    onClick={() => setProject((prev) => ({ ...prev, interactions: prev.interactions.filter((x) => x.id !== item.id) }))}
                  >
                    Удалить
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
