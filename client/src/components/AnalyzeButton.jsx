export default function AnalyzeButton({ disabled, loading }) {
  return <button className="primary-button" type="submit" disabled={disabled || loading}>{loading ? 'Processing...' : 'Analyze Skills'}<span aria-hidden="true">-&gt;</span></button>
}
