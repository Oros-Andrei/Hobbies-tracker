import type { ChartPoint } from '../Resources/stats';
import { formatDuration } from '../Resources/mediaLogic';

interface Props { title: string; points: ChartPoint[]; unit: string }

// Simple local bars avoid a network or chart service dependency.
export default function BarChart({ title, points, unit }: Props) {
  const max = Math.max(1, ...points.map(point => point.value));
  const showValue = (value: number) => unit === 'minutes' ? formatDuration(value) : `${value} ${unit}`;
  return <section className="chart-panel" aria-label={title}>
    <h3>{title}</h3>
    <div className="chart-scroll"><div className="chart-bars">
      {points.map(point => <div className="chart-bar" key={point.month} title={`${point.month}: ${showValue(point.value)}`}>
        <span className="chart-bar__value">{point.value ? showValue(point.value) : ''}</span>
        <span className="chart-bar__track"><span style={{ height: `${point.value / max * 100}%` }} /></span>
        <span className="chart-bar__label">{point.month.slice(5)}</span>
      </div>)}
    </div></div>
    <p className="chart-panel__hint">Last 12 months · {unit === 'minutes' ? 'hours and minutes' : unit}</p>
  </section>;
}
