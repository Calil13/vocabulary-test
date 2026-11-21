import { Link, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import LevelsPage from './pages/LevelsPage';
import DirectionPage from './pages/DirectionPage';
import QuizPage from './pages/QuizPage';

function Shell() {
  return (
    <div className="shell">
      <header className="bar">
        <Link to="/" className="brand">
          Lüğət
        </Link>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route index element={<LevelsPage />} />
        <Route path=":level" element={<DirectionPage />} />
        <Route path=":level/:dir" element={<QuizPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
