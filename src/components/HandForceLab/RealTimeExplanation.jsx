
export default function RealTimeExplanation({ explanation, formulaTag }) {
  if (!explanation) return null;

  return (
    <div className="realtime-explanation-bar" aria-live="polite">
      <span className="explanation-icon">💡</span>
      <p className="explanation-text">{explanation}</p>
      {formulaTag && <span className="explanation-formula-tag">{formulaTag}</span>}
    </div>
  );
}
