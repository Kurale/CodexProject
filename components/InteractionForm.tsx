'use client';

import { nanoid } from 'nanoid';
import { Interaction, InteractionType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const typeLabel: Record<InteractionType, string> = {
  single: 'Выбор одного',
  boolean: 'Да / Нет',
  multiple: 'Множественный выбор',
  text: 'Ввод текста'
};

export function InteractionForm({
  value,
  onChange,
  onSave,
  onCancel
}: {
  value: Interaction;
  onChange: (v: Interaction) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const update = <K extends keyof Interaction>(key: K, val: Interaction[K]) => onChange({ ...value, [key]: val });

  const ensureBooleanOptions = (type: InteractionType) => {
    if (type !== 'boolean') return;
    update('options', [
      { id: 'yes', text: 'Да', correct: true },
      { id: 'no', text: 'Нет', correct: false }
    ]);
  };

  return (
    <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <h3 className="font-semibold">Настройка взаимодействия</h3>
      <label className="block text-sm text-slate-300">Таймкод (сек.)</label>
      <Input type="number" min={0} step={0.1} value={value.time} onChange={(e) => update('time', Number(e.target.value))} />

      <label className="block text-sm text-slate-300">Тип</label>
      <select
        className="w-full rounded-md border border-slate-700 bg-slate-900 p-2"
        value={value.type}
        onChange={(e) => {
          const next = e.target.value as InteractionType;
          update('type', next);
          ensureBooleanOptions(next);
        }}
      >
        {Object.entries(typeLabel).map(([k, label]) => (
          <option key={k} value={k}>
            {label}
          </option>
        ))}
      </select>

      <label className="block text-sm text-slate-300">Вопрос</label>
      <Textarea value={value.question} onChange={(e) => update('question', e.target.value)} />

      {value.type !== 'text' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-300">Варианты ответов</p>
            {value.type !== 'boolean' && (
              <Button
                variant="secondary"
                onClick={() =>
                  update('options', [...value.options, { id: nanoid(5), text: '', correct: false }])
                }
              >
                + Вариант
              </Button>
            )}
          </div>
          {value.options.map((option, idx) => (
            <div key={option.id} className="flex gap-2">
              <Input
                value={option.text}
                disabled={value.type === 'boolean'}
                onChange={(e) => {
                  const next = [...value.options];
                  next[idx] = { ...option, text: e.target.value };
                  update('options', next);
                }}
              />
              <label className="flex items-center gap-1 rounded border border-slate-700 px-2 text-xs">
                <input
                  type={value.type === 'single' || value.type === 'boolean' ? 'radio' : 'checkbox'}
                  name="correct"
                  checked={option.correct}
                  onChange={(e) => {
                    const next = value.options.map((item, i) => {
                      if (value.type === 'single' || value.type === 'boolean') {
                        return { ...item, correct: i === idx };
                      }
                      return i === idx ? { ...item, correct: e.target.checked } : item;
                    });
                    update('options', next);
                  }}
                />
                Верный
              </label>
              {value.type !== 'boolean' && (
                <Button
                  variant="ghost"
                  onClick={() => update('options', value.options.filter((o) => o.id !== option.id))}
                >
                  Удалить
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {value.type === 'text' && (
        <div className="grid gap-2">
          <label className="text-sm text-slate-300">Ожидаемый ответ</label>
          <Input value={value.textAnswer || ''} onChange={(e) => update('textAnswer', e.target.value)} />
          <select
            value={value.textMatchMode || 'exact'}
            onChange={(e) => update('textMatchMode', e.target.value as 'exact' | 'includes')}
            className="rounded-md border border-slate-700 bg-slate-900 p-2"
          >
            <option value="exact">Точное совпадение</option>
            <option value="includes">Частичное совпадение</option>
          </select>
        </div>
      )}

      <label className="block text-sm text-slate-300">Feedback (верный ответ)</label>
      <Textarea value={value.feedbackCorrect} onChange={(e) => update('feedbackCorrect', e.target.value)} />
      <label className="block text-sm text-slate-300">Feedback (неверный ответ)</label>
      <Textarea value={value.feedbackIncorrect} onChange={(e) => update('feedbackIncorrect', e.target.value)} />

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={value.pauseUntilAnswered}
          onChange={(e) => update('pauseUntilAnswered', e.target.checked)}
        />
        Пауза видео до ответа
      </label>

      <label className="block text-sm text-slate-300">Длительность оверлея (опционально)</label>
      <Input
        type="number"
        min={1}
        value={value.duration ?? ''}
        onChange={(e) => update('duration', e.target.value ? Number(e.target.value) : undefined)}
      />

      <div className="flex gap-2">
        <Button onClick={onSave}>Сохранить интеракцию</Button>
        <Button variant="secondary" onClick={onCancel}>
          Отмена
        </Button>
      </div>
    </div>
  );
}
