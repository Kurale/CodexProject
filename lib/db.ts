import { promises as fs } from 'fs';
import path from 'path';
import { Project, ProjectsStore } from '@/lib/types';

const dataPath = path.join(process.cwd(), 'data', 'projects.json');

async function ensureStore() {
  try {
    await fs.access(dataPath);
  } catch {
    await fs.mkdir(path.dirname(dataPath), { recursive: true });
    await fs.writeFile(dataPath, JSON.stringify({ projects: [] }, null, 2), 'utf-8');
  }
}

export async function readProjects(): Promise<ProjectsStore> {
  await ensureStore();
  const raw = await fs.readFile(dataPath, 'utf-8');
  return JSON.parse(raw) as ProjectsStore;
}

export async function writeProjects(store: ProjectsStore) {
  await fs.writeFile(dataPath, JSON.stringify(store, null, 2), 'utf-8');
}

export async function getProjectById(id: string) {
  const store = await readProjects();
  return store.projects.find((p) => p.id === id) || null;
}

export async function upsertProject(project: Project) {
  const store = await readProjects();
  const idx = store.projects.findIndex((p) => p.id === project.id);
  if (idx >= 0) {
    store.projects[idx] = project;
  } else {
    store.projects.unshift(project);
  }
  await writeProjects(store);
  return project;
}

export async function deleteProject(id: string) {
  const store = await readProjects();
  store.projects = store.projects.filter((p) => p.id !== id);
  await writeProjects(store);
}
