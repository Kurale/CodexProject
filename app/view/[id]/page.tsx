import { notFound } from 'next/navigation';
import { getProjectById } from '@/lib/db';
import { ViewPlayer } from '@/components/ViewPlayer';
import { Card } from '@/components/ui/card';
import { isEmbeddableVideo, toEmbedUrl } from '@/lib/utils';

export default async function ViewPage({ params }: { params: { id: string } }) {
  const project = await getProjectById(params.id);
  if (!project) notFound();

  if (isEmbeddableVideo(project.videoUrl)) {
    return (
      <Card>
        <h1 className="mb-3 text-xl font-semibold">{project.title}</h1>
        <iframe src={toEmbedUrl(project.videoUrl)} className="aspect-video w-full rounded-lg" allowFullScreen />
        <p className="mt-2 text-sm text-slate-400">Для embed-источников в MVP включён только режим просмотра видео.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">{project.title}</h1>
      <ViewPlayer project={project} />
    </div>
  );
}
