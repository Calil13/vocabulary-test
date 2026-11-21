import { Link } from 'react-router-dom';
import { LEVELS } from '../meta';

export default function LevelsPage() {
  return (
    <section>
      <h1 className="title">İngilis dili lüğəti</h1>
      <p className="lead">Səviyyəni seç və sözləri test et.</p>
      <ul className="tiles">
        {LEVELS.map((level) => (
          <li key={level.code}>
            <Link to={`/${level.code}`} className="tile" style={{ background: level.color }}>
              <span className="tile-code">{level.code}</span>
              <span className="tile-name">{level.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
