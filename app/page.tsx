import Link from 'next/link';
import { ProjectList } from '@/components/ProjectList';
import { Button } from '@/components/ui/button';
import { readProjects } from '@/lib/db';

export default async function HomePage() {
  const store = await readProjects();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Сохранённые проекты</h1>
        <Link href="/editor">
          <Button>Создать проект</Button>
        </Link>
      </div>
      <ProjectList projects={store.projects} />
    </div>
  );
}
