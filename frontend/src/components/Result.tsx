import { Link } from 'react-router-dom';

interface Props {
  correct: number;
  wrong: number;
  onRestart: () => void;
}

export default function Result({ correct, wrong, onRestart }: Props) {
  const total = correct + wrong;
  const percent = total === 0 ? 0 : Math.round((correct / total) * 100);

  return (
    <section className="result">
      <h1 className="title">Bitdi</h1>
      <p className="lead">Bu səviyyədəki bütün sözləri keçdin.</p>

      <p className="percent">
        {percent}
        <span className="percent-sign">%</span>
      </p>

      <div
        className="split"
        role="img"
        aria-label={`${total} sualdan ${correct} düz, ${wrong} səhv`}
      >
        <div className="split-good" style={{ flexGrow: correct }} />
        <div className="split-bad" style={{ flexGrow: wrong }} />
      </div>

      <dl className="stats">
        <div className="stat stat-good">
          <dt>Düz</dt>
          <dd>{correct}</dd>
        </div>
        <div className="stat stat-bad">
          <dt>Səhv</dt>
          <dd>{wrong}</dd>
        </div>
        <div className="stat">
          <dt>Cəmi</dt>
          <dd>{total}</dd>
        </div>
      </dl>

      <div className="actions">
        <button type="button" className="btn" onClick={onRestart}>
          Yenidən başla
        </button>
        <Link to="/" className="btn btn-ghost">
          Səviyyələrə qayıt
        </Link>
      </div>
    </section>
  );
}
