import { Link, Navigate, useParams } from 'react-router-dom';
import { DIRECTIONS, findLevel } from '../meta';

export default function DirectionPage() {
  const { level: code } = useParams();
  const level = findLevel(code);
  if (!level) return <Navigate to="/" replace />;

  return (
    <section>
      <Link to="/" className="back">
        Səviyyələr
      </Link>
      <h1 className="title">
        <span className="badge" style={{ background: level.color }}>
          {level.code}
        </span>
        Hansı istiqamətdə öyrənəcəksən?
      </h1>
      <ul className="choices">
        {DIRECTIONS.map((d) => (
          <li key={d.slug}>
            <Link
              to={`/${level.code}/${d.slug}`}
              className="choice"
              style={{ borderLeftColor: level.color }}
            >
              <span className="choice-title">{d.title}</span>
              <span className="choice-hint">{d.hint}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
