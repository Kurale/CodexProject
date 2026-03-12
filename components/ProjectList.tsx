'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Project } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function ProjectList({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const origin = typeof window === 'undefined' ? '' : window.location.origin;

  const remove = async (id: string) => {
    await fetch(`/api/projects?id=${id}`, { method: 'DELETE' });
    router.refresh();
  };

  return (
    <div className="grid gap-4">
      {projects.length === 0 && <Card>Пока нет проектов. Создайте первый в редакторе.</Card>}
      {projects.map((project) => (
        <Card key={project.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold">{project.title}</h3>
            <p className="text-sm text-slate-400">
              Взаимодействий: {project.interactions.length} · Обновлён: {new Date(project.updatedAt).toLocaleString('ru-RU')}
            </p>
            <code className="text-xs text-cyan-300">{`${origin}/view/${project.id}`}</code>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/editor?id=${project.id}`}>
              <Button variant="secondary">Редактировать</Button>
            </Link>
            <Link href={`/view/${project.id}`}>
              <Button>Открыть просмотр</Button>
            </Link>
            <Button variant="ghost" onClick={() => navigator.clipboard.writeText(`${origin}/view/${project.id}`)}>
              Копировать ссылку
            </Button>
            <Button variant="destructive" onClick={() => remove(project.id)}>
              Удалить
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
