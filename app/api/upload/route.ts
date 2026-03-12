import { promises as fs } from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) return NextResponse.json({ error: 'Файл не найден' }, { status: 400 });
    if (file.type !== 'video/mp4') return NextResponse.json({ error: 'Разрешены только MP4' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const name = `${Date.now()}-${nanoid(6)}.mp4`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, name), buffer);

    return NextResponse.json({ url: `/uploads/${name}` });
  } catch {
    return NextResponse.json({ error: 'Ошибка загрузки видео' }, { status: 500 });
  }
}
