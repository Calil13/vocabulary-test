import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchOrder, fetchQuestion, postAnswer } from '../api';
import type { DirectionMeta, LevelMeta } from '../meta';
import type { AnswerResult, Question } from '../types';
import Result from './Result';

type Phase = 'loading' | 'playing' | 'empty' | 'done' | 'error';

/** Sual, seçilmiş variant və cavab bir yerdə saxlanır ki, dəyişiklik atomik olsun. */
interface Card {
  question: Question;
  selected: number | null;
  result: AnswerResult | null;
}

interface Props {
  level: LevelMeta;
  direction: DirectionMeta;
}

export default function Quiz({ level, direction }: Props) {
  const [phase, setPhase] = useState<Phase>('loading');
  const [errorSource, setErrorSource] = useState<'order' | 'question'>('order');
  const [ids, setIds] = useState<number[]>([]);
  const [index, setIndex] = useState(0);
  const [card, setCard] = useState<Card | null>(null);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [notice, setNotice] = useState<string | null>(null);
  const [runKey, setRunKey] = useState(0); // dəyişəndə yeni təsadüfi sıra alınır
  const [questionKey, setQuestionKey] = useState(0); // dəyişəndə cari sual yenidən yüklənir

  const checking = useRef(false);
  const prefetched = useRef<{ id: number; promise: Promise<Question> } | null>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  const question = card?.question ?? null;
  const selected = card?.selected ?? null;
  const result = card?.result ?? null;

  // 1) Səhifə açılanda və ya "yenidən başla" olanda: yeni təsadüfi sıra, 1-ci sualdan.
  useEffect(() => {
    const ctrl = new AbortController();
    setPhase('loading');
    setIds([]);
    setIndex(0);
    setCard(null);
    setScore({ correct: 0, wrong: 0 });
    setNotice(null);
    prefetched.current = null;

    fetchOrder(level.code, ctrl.signal)
      .then((list) => {
        if (ctrl.signal.aborted) return;
        setIds(list);
        setPhase(list.length === 0 ? 'empty' : 'playing');
      })
      .catch(() => {
        if (ctrl.signal.aborted) return;
        setErrorSource('order');
        setPhase('error');
      });
    return () => ctrl.abort();
  }, [level.code, runKey]);

  // 2) Cari sualı yüklə, sonrakını arxa planda əvvəlcədən gətir.
  useEffect(() => {
    if (phase !== 'playing') return;
    const id = ids[index];
    let cancelled = false;

    setCard(null);
    setNotice(null);

    const cached = prefetched.current;
    const promise =
      cached && cached.id === id ? cached.promise : fetchQuestion(id, direction.value);
    prefetched.current = null;

    promise
      .then((q) => {
        if (cancelled) return;
        setCard({ question: q, selected: null, result: null });
        const nextId = ids[index + 1];
        if (nextId !== undefined) {
          const p = fetchQuestion(nextId, direction.value);
          p.catch(() => {}); // uğursuz olsa, sual lazım olanda yenidən yüklənəcək
          prefetched.current = { id: nextId, promise: p };
        }
      })
      .catch(() => {
        if (cancelled) return;
        setErrorSource('question');
        setPhase('error');
      });
    return () => {
      cancelled = true;
    };
  }, [phase, ids, index, direction.value, questionKey]);

  // Cavab göstəriləndə fokus "Növbəti" düyməsinə keçir (klaviatura üçün).
  useEffect(() => {
    if (result) nextRef.current?.focus();
  }, [result]);

  const choose = useCallback(
    async (optionId: number) => {
      if (!card || card.result || checking.current) return;
      const wordId = card.question.wordId;
      checking.current = true;
      setCard((c) => (c && c.question.wordId === wordId ? { ...c, selected: optionId } : c));
      setNotice(null);
      try {
        const r = await postAnswer(wordId, direction.value, optionId);
        setCard((c) => (c && c.question.wordId === wordId ? { ...c, result: r } : c));
        setScore((s) => (r.correct ? { ...s, correct: s.correct + 1 } : { ...s, wrong: s.wrong + 1 }));
      } catch {
        setCard((c) => (c && c.question.wordId === wordId ? { ...c, selected: null } : c));
        setNotice('Cavab göndərilmədi. Variantı yenidən seç.');
      } finally {
        checking.current = false;
      }
    },
    [card, direction.value],
  );

  const next = useCallback(() => {
    if (!card?.result) return;
    if (index + 1 >= ids.length) setPhase('done');
    else setIndex((i) => i + 1);
  }, [card, index, ids.length]);

  // Klaviatura: 1-5 variant seçir, Enter və → növbəti suala keçir.
  // Ən son vəziyyət ref-də saxlanır ki, dinləyici yenilənənə qədərki anda basılan düymə itməsin.
  const latest = useRef({ phase, question, choose, next });
  useLayoutEffect(() => {
    latest.current = { phase, question, choose, next };
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const { phase: p, question: q, choose: pick, next: goNext } = latest.current;
      if (e.metaKey || e.ctrlKey || e.altKey || p !== 'playing') return;
      if (/^[1-9]$/.test(e.key)) {
        const option = q?.options[Number(e.key) - 1];
        if (option) void pick(option.id);
      } else if (e.key === 'ArrowRight') {
        goNext();
      } else if (e.key === 'Enter') {
        // Fokus düymə və ya linkdədirsə, brauzer özü klik edəcək
        if ((e.target as HTMLElement).closest('button, a')) return;
        goNext();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const retry = () => {
    if (errorSource === 'order') {
      setRunKey((k) => k + 1);
    } else {
      setPhase('playing');
      setQuestionKey((k) => k + 1);
    }
  };

  if (phase === 'loading') {
    return (
      <p className="status" aria-busy="true">
        Yüklənir…
      </p>
    );
  }

  if (phase === 'error') {
    return (
      <div className="box" role="alert">
        <p>Serverə qoşulmaq alınmadı. İnternetini yoxla və yenidən cəhd et.</p>
        <button type="button" className="btn" onClick={retry}>
          Yenidən cəhd et
        </button>
      </div>
    );
  }

  if (phase === 'empty') {
    return (
      <div className="box">
        <p>
          <strong>{level.code}</strong> səviyyəsində hələ söz yoxdur.
        </p>
        <Link to="/" className="btn">
          Başqa səviyyə seç
        </Link>
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <Result
        correct={score.correct}
        wrong={score.wrong}
        onRestart={() => setRunKey((k) => k + 1)}
      />
    );
  }

  const total = ids.length;
  const answered = index + (result ? 1 : 0);
  const isLast = index + 1 >= total;

  return (
    <section style={{ ['--accent' as string]: level.color }}>
      <div className="quiz-top">
        <Link to="/" className="back">
          Çıx
        </Link>
        <div className="scores" aria-label="Nəticə">
          <span className="score score-good">
            <span className="dot" aria-hidden="true" />
            Düz {score.correct}
          </span>
          <span className="score score-bad">
            <span className="dot" aria-hidden="true" />
            Səhv {score.wrong}
          </span>
        </div>
      </div>

      <div
        className="progress"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={answered}
      >
        <div className="progress-fill" style={{ width: `${(answered / total) * 100}%` }} />
      </div>
      <p className="count">
        {index + 1} / {total}
      </p>

      {question ? (
        <>
          <h1 className="word" lang={direction.questionLang}>
            {question.question}
          </h1>
          <p className="prompt">{direction.prompt}</p>

          <ul className="options" lang={direction.answerLang}>
            {question.options.map((option, i) => {
              const state = result
                ? option.id === result.correctWordId
                  ? 'correct'
                  : option.id === selected
                    ? 'wrong'
                    : 'dim'
                : option.id === selected
                  ? 'picked'
                  : '';
              return (
                <li key={option.id}>
                  <button
                    type="button"
                    className={`option ${state}`}
                    aria-disabled={result !== null || selected !== null}
                    onClick={() => void choose(option.id)}
                  >
                    <span className="key" aria-hidden="true">
                      {i + 1}
                    </span>
                    <span className="option-text">{option.text}</span>
                    {state === 'correct' && <Icon kind="check" />}
                    {state === 'wrong' && <Icon kind="cross" />}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="footer-row">
            <p className="verdict" role="status">
              {notice ? (
                <span className="verdict-bad">{notice}</span>
              ) : result ? (
                result.correct ? (
                  <span className="verdict-good">Düzgün!</span>
                ) : (
                  <span className="verdict-bad">
                    Səhv. Düzgün cavab: <strong lang={direction.answerLang}>{result.correctText}</strong>
                  </span>
                )
              ) : null}
            </p>
            <button
              type="button"
              ref={nextRef}
              className="next"
              aria-disabled={!result}
              onClick={next}
            >
              {isLast ? 'Nəticəyə bax' : 'Növbəti'}
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path
                  d="M5 12h14m-6-6 6 6-6 6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </>
      ) : (
        <p className="status" aria-busy="true">
          Yüklənir…
        </p>
      )}
    </section>
  );
}

function Icon({ kind }: { kind: 'check' | 'cross' }) {
  return (
    <svg className="option-icon" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      {kind === 'check' ? (
        <path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="m6.5 6.5 11 11m0-11-11 11" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      )}
    </svg>
  );
}
