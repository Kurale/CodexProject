'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Interaction } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type AnswerValue = string | string[];

function isCorrect(interaction: Interaction, value: AnswerValue) {
  if (interaction.type === 'text') {
    const answer = (interaction.textAnswer || '').trim().toLowerCase();
    const user = String(value).trim().toLowerCase();
    if (!answer) return false;
    return interaction.textMatchMode === 'includes' ? user.includes(answer) : user === answer;
  }

  const correct = interaction.options.filter((o) => o.correct).map((o) => o.id);

  if (interaction.type === 'multiple') {
    const selected = Array.isArray(value) ? value : [];
    return selected.length === correct.length && selected.every((id) => correct.includes(id));
  }

  return correct.includes(String(value));
}

export function QuestionOverlay({
  interaction,
  onComplete
}: {
  interaction: Interaction;
  onComplete: (result: { correct: boolean }) => void;
}) {
  const [value, setValue] = useState<AnswerValue>(interaction.type === 'multiple' ? [] : '');
  const [checked, setChecked] = useState<boolean | null>(null);
  const completeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const canSubmit = useMemo(() => {
    if (interaction.type === 'text') return String(value).trim().length > 0;
    if (interaction.type === 'multiple') return (value as string[]).length > 0;
    return String(value).length > 0;
  }, [interaction.type, value]);

  useEffect(() => {
    if (!interaction.duration || checked !== null) return;

    const timeoutId = setTimeout(() => {
      setChecked(false);
      completeTimeoutRef.current = setTimeout(() => onComplete({ correct: false }), 800);
    }, interaction.duration * 1000);

    return () => clearTimeout(timeoutId);
  }, [interaction.duration, checked, onComplete]);

  useEffect(() => {
    return () => {
      if (completeTimeoutRef.current) {
        clearTimeout(completeTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-xl rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-2xl">
        <h3 className="mb-4 text-lg font-semibold">{interaction.question}</h3>

        <div className="space-y-2">
          {interaction.type === 'text' && <Input value={String(value)} onChange={(e) => setValue(e.target.value)} />}

          {(interaction.type === 'single' || interaction.type === 'boolean') &&
            interaction.options.map((option) => (
              <label key={option.id} className="flex cursor-pointer items-center gap-2 rounded border border-slate-700 p-2">
                <input
                  type="radio"
                  name="answer"
                  checked={value === option.id}
                  onChange={() => setValue(option.id)}
                />
                {option.text}
              </label>
            ))}

          {interaction.type === 'multiple' &&
            interaction.options.map((option) => {
              const selected = value as string[];
              return (
                <label key={option.id} className="flex cursor-pointer items-center gap-2 rounded border border-slate-700 p-2">
                  <input
                    type="checkbox"
                    checked={selected.includes(option.id)}
                    onChange={(e) => {
                      if (e.target.checked) setValue([...selected, option.id]);
                      else setValue(selected.filter((id) => id !== option.id));
                    }}
                  />
                  {option.text}
                </label>
              );
            })}
        </div>

        {checked !== null && (
          <div className={`mt-4 rounded p-3 text-sm ${checked ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
            {checked ? interaction.feedbackCorrect : interaction.feedbackIncorrect}
          </div>
        )}

        <div className="mt-4 flex gap-2">
          {checked === null ? (
            <Button
              disabled={!canSubmit}
              onClick={() => {
                const result = isCorrect(interaction, value);
                setChecked(result);
              }}
            >
              Проверить
            </Button>
          ) : (
            <Button onClick={() => onComplete({ correct: checked })}>Продолжить</Button>
          )}
        </div>
      </div>
    </div>
  );
}
