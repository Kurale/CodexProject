import { nanoid } from 'nanoid';
import { NextRequest, NextResponse } from 'next/server';
import { deleteProject, getProjectById, readProjects, upsertProject } from '@/lib/db';
import { Project } from '@/lib/types';

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');
  if (id) {
    const project = await getProjectById(id);
    if (!project) return NextResponse.json({ error: 'Не найдено' }, { status: 404 });
    return NextResponse.json({ project });
  }

  const store = await readProjects();
  return NextResponse.json(store);
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<Project>;

  if (!body.title?.trim()) return NextResponse.json({ error: 'Название обязательно' }, { status: 400 });
  if (!body.videoUrl?.trim()) return NextResponse.json({ error: 'Видео обязательно' }, { status: 400 });

  const now = new Date().toISOString();
  const project: Project = {
    id: body.id || nanoid(12),
    title: body.title,
    sourceType: body.sourceType || 'upload',
    videoUrl: body.videoUrl,
    interactions: (body.interactions || []).sort((a, b) => a.time - b.time),
    createdAt: body.createdAt || now,
    updatedAt: now
  };

  await upsertProject(project);
  return NextResponse.json({ project });
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id обязателен' }, { status: 400 });
  await deleteProject(id);
  return NextResponse.json({ ok: true });
}
