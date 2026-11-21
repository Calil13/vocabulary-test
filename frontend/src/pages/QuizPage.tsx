import { Navigate, useParams } from 'react-router-dom';
import Quiz from '../components/Quiz';
import { findDirection, findLevel } from '../meta';

export default function QuizPage() {
  const { level: code, dir } = useParams();
  const level = findLevel(code);
  const direction = findDirection(dir);
  if (!level || !direction) return <Navigate to="/" replace />;

  // key: səviyyə və ya istiqamət dəyişəndə sual axını sıfırdan başlasın
  return <Quiz key={`${level.code}-${direction.slug}`} level={level} direction={direction} />;
}
