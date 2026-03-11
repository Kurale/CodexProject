# Interactive Video Quiz Studio (Next.js 14 MVP)

Локальный MVP-конструктор интерактивных видео с квизами (аналог упрощённого H5P/Edpuzzle).

## Стек
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Radix/Lucide-совместимый UI-подход
- Хранение на файловой системе:
  - Видео: `public/uploads`
  - Проекты: `data/projects.json`

## Возможности
- Редактор `/editor`:
  - загрузка MP4 или ссылка на видео
  - плеер с кастомными контролами
  - таймлайн с маркерами
  - CRUD интеракций (single, yes/no, multiple, text)
  - feedback, пауза до ответа, длительность
  - автоcохранение
- Просмотр `/view/[id]`:
  - чистый интерфейс
  - оверлей вопросов по таймкоду
  - мгновенная проверка и feedback
  - итоговая сводка по правильным ответам
- Главная `/`:
  - список проектов
  - быстрый переход в редактор и режим просмотра
  - копирование ссылки

## Запуск
```bash
npm install
npm run dev
```

Откройте: `http://localhost:3000`.

## Структура
- `app/editor/page.tsx` — редактор
- `app/view/[id]/page.tsx` — просмотр
- `app/api/upload/route.ts` — загрузка MP4
- `app/api/projects/route.ts` — CRUD проектов
- `components/*` — плеер, форма, таймлайн, оверлей, список
- `lib/db.ts` — JSON-хранилище
- `lib/types.ts` — типы
