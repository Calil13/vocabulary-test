import type { AnswerResult, Direction, LevelCode, Question } from './types';

// Front və backend eyni serverdən verildiyi üçün ünvanlar nisbidir.
async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    throw new Error(`Sorğu alınmadı (${res.status})`);
  }
  return res.json() as Promise<T>;
}

/** Səviyyədəki bütün sözlərin id-ləri, hər çağırışda yeni təsadüfi sırada. */
export function fetchOrder(level: LevelCode, signal?: AbortSignal): Promise<number[]> {
  return request<number[]>(`/api/quiz/order?level=${level}`, { signal });
}

export function fetchQuestion(wordId: number, direction: Direction): Promise<Question> {
  return request<Question>(`/api/quiz/questions/${wordId}?direction=${direction}`);
}

export function postAnswer(
  wordId: number,
  direction: Direction,
  selectedWordId: number,
): Promise<AnswerResult> {
  return request<AnswerResult>(`/api/quiz/questions/${wordId}/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ direction, selectedWordId }),
  });
}
