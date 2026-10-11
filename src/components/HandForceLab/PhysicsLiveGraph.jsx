import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Play, Pause, RotateCcw, TrendingUp } from 'lucide-react';

export default function PhysicsLiveGraph({
  activeExperiment,
  physicsData,
  mass = 1.0,
  springK = 25.0
}) {
  const [isPaused, setIsPaused] = useState(false);
  const [dataPoints, setDataPoints] = useState([]);

  const expId = activeExperiment?.id || 'newton';
  const config = activeExperiment?.graphConfig || {
    title: 'Real-Time Physics Graph',
    xLabel: 'X',
    yLabel: 'Y',
    xUnit: '',
    yUnit: '',
    relationship: 'Live physics measurements recorded from simulation.'
  };

  // Adjust state during render when experiment changes
  const [prevExpId, setPrevExpId] = useState(expId);
  if (prevExpId !== expId) {
    setPrevExpId(expId);
    setDataPoints([]);
  }

  const physicsDataRef = useRef(physicsData);
  useEffect(() => {
    physicsDataRef.current = physicsData;
  }, [physicsData]);

  // Periodic timer samples simulation data every 100ms
  useEffect(() => {
    if (isPaused) return;

    const intervalId = setInterval(() => {
      const cur = physicsDataRef.current;
      if (!cur) return;

      let x = 0;
      let y = 0;

      if (expId === 'newton') {
        x = Number((cur.force || 0).toFixed(2));
        y = Number((cur.acceleration || 0).toFixed(2));
      } else if (expId === 'impulse') {
        x = Number(((cur.simTime || 0) % 10).toFixed(1));
        y = Number((cur.force || 0).toFixed(2));
      } else if (expId === 'hooke') {
        x = Number((cur.displacement || 0).toFixed(2));
        y = Number((cur.springForce || 0).toFixed(2));
      } else if (expId === 'collision') {
        x = Number(((cur.simTime || 0) % 10).toFixed(1));
        y = Number((cur.pTotal || 0).toFixed(2));
      } else if (expId === 'projectile') {
        x = Number(((cur.range || 0) > 0 ? (cur.range || 0) : 0).toFixed(2));
        y = Number((cur.maxHeight || 0).toFixed(2));
      }

      setDataPoints((prev) => {
        const next = [...prev, { x, y, timestamp: Date.now() }];
        return next.slice(-40);
      });
    }, 100);

    return () => clearInterval(intervalId);
  }, [isPaused, expId]);

  // Compute graph bounds
  const bounds = useMemo(() => {
    if (expId === 'newton') {
      return { minX: 0, maxX: 15, minY: 0, maxY: 15 };
    } else if (expId === 'impulse') {
      const maxF = Math.max(10, ...dataPoints.map((d) => d.y));
      return { minX: 0, maxX: 10, minY: 0, maxY: Math.ceil(maxF * 1.2) };
    } else if (expId === 'hooke') {
      return { minX: -0.8, maxX: 0.8, minY: -40, maxY: 40 };
    } else if (expId === 'collision') {
      const maxP = Math.max(5, ...dataPoints.map((d) => d.y));
      return { minX: 0, maxX: 10, minY: 0, maxY: Math.ceil(maxP * 1.2) };
    } else if (expId === 'projectile') {
      const maxR = Math.max(5, ...dataPoints.map((d) => d.x));
      const maxH = Math.max(3, ...dataPoints.map((d) => d.y));
      return { minX: 0, maxX: Math.max(6, Math.ceil(maxR * 1.2)), minY: 0, maxY: Math.max(3, Math.ceil(maxH * 1.3)) };
    }
    return { minX: 0, maxX: 10, minY: 0, maxY: 10 };
  }, [expId, dataPoints]);

  // Coordinate mapping for SVG (width 320, height 140, padding 30)
  const svgWidth = 320;
  const svgHeight = 140;
  const padLeft = 38;
  const padRight = 15;
  const padTop = 15;
  const padBottom = 26;

  const plotW = svgWidth - padLeft - padRight;
  const plotH = svgHeight - padTop - padBottom;

  const mapX = useCallback((val) => {
    const range = bounds.maxX - bounds.minX || 1;
    return padLeft + ((val - bounds.minX) / range) * plotW;
  }, [bounds.maxX, bounds.minX, plotW]);

  const mapY = useCallback((val) => {
    const range = bounds.maxY - bounds.minY || 1;
    return padTop + plotH - ((val - bounds.minY) / range) * plotH;
  }, [bounds.maxY, bounds.minY, plotH]);

  // Generate SVG polyline points
  const pointsString = useMemo(() => {
    if (dataPoints.length === 0) return '';
    return dataPoints
      .map((p) => `${mapX(p.x).toFixed(1)},${mapY(p.y).toFixed(1)}`)
      .join(' ');
  }, [dataPoints, mapX, mapY]);

  // Theoretical reference line
  const theoreticalLine = useMemo(() => {
    if (expId === 'newton') {
      // a = F / m
      const x1 = bounds.minX;
      const y1 = x1 / (mass || 1);
      const x2 = bounds.maxX;
      const y2 = x2 / (mass || 1);
      return {
        x1: mapX(x1),
        y1: mapY(y1),
        x2: mapX(x2),
        y2: mapY(y2)
      };
    } else if (expId === 'hooke') {
      // F = -k * x
      const x1 = bounds.minX;
      const y1 = -springK * x1;
      const x2 = bounds.maxX;
      const y2 = -springK * x2;
      return {
        x1: mapX(x1),
        y1: mapY(y1),
        x2: mapX(x2),
        y2: mapY(y2)
      };
    }
    return null;
  }, [expId, bounds, mass, springK, mapX, mapY]);

  const zeroY = mapY(0);
  const zeroX = mapX(0);

  return (
    <div className="physics-live-graph-card" aria-label="Physics Simulation Graph">
      <div className="graph-header-row">
        <div className="graph-title-group">
          <TrendingUp className="graph-icon" />
          <div>
            <h4>{config.title}</h4>
            <span className="graph-subtitle">
              {config.xLabel} vs. {config.yLabel}
            </span>
          </div>
        </div>

        <div className="graph-controls-group">
          <button
            type="button"
            className="graph-btn"
            onClick={() => setIsPaused((p) => !p)}
            title={isPaused ? "Resume graph logging" : "Pause graph logging"}
          >
            {isPaused ? <Play className="btn-icon-xs" /> : <Pause className="btn-icon-xs" />}
            {isPaused ? "Live" : "Hold"}
          </button>
          <button
            type="button"
            className="graph-btn"
            onClick={() => setDataPoints([])}
            title="Clear graph history"
          >
            <RotateCcw className="btn-icon-xs" />
            Clear
          </button>
        </div>
      </div>

      <div className="graph-canvas-wrap">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="graph-svg"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="plotGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38d9ff" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#38d9ff" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={padLeft}
            y1={padTop}
            x2={padLeft + plotW}
            y2={padTop}
            stroke="rgba(56, 217, 255, 0.12)"
            strokeDasharray="3 3"
          />
          <line
            x1={padLeft}
            y1={padTop + plotH * 0.5}
            x2={padLeft + plotW}
            y2={padTop + plotH * 0.5}
            stroke="rgba(56, 217, 255, 0.12)"
            strokeDasharray="3 3"
          />

          {/* Zero baseline */}
          {zeroY >= padTop && zeroY <= padTop + plotH && (
            <line
              x1={padLeft}
              y1={zeroY}
              x2={padLeft + plotW}
              y2={zeroY}
              stroke="rgba(103, 232, 249, 0.35)"
              strokeWidth="1.2"
            />
          )}

          {/* Y Axis line */}
          <line
            x1={zeroX >= padLeft && zeroX <= padLeft + plotW ? zeroX : padLeft}
            y1={padTop}
            x2={zeroX >= padLeft && zeroX <= padLeft + plotW ? zeroX : padLeft}
            y2={padTop + plotH}
            stroke="rgba(103, 232, 249, 0.35)"
            strokeWidth="1.2"
          />

          {/* Theoretical reference line (dashed yellow) */}
          {theoreticalLine && (
            <line
              x1={theoreticalLine.x1}
              y1={theoreticalLine.y1}
              x2={theoreticalLine.x2}
              y2={theoreticalLine.y2}
              stroke="#ffbb33"
              strokeWidth="1.5"
              strokeDasharray="4 3"
              opacity="0.75"
            />
          )}

          {/* Real simulation data polyline */}
          {pointsString && (
            <polyline
              fill="none"
              stroke="#38d9ff"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={pointsString}
            />
          )}

          {/* Real data dots */}
          {dataPoints.map((p, idx) => (
            <circle
              key={p.timestamp || idx}
              cx={mapX(p.x)}
              cy={mapY(p.y)}
              r={idx === dataPoints.length - 1 ? 3.5 : 2}
              fill={idx === dataPoints.length - 1 ? "#31f2a1" : "#38d9ff"}
              stroke="#071220"
              strokeWidth="1"
            />
          ))}

          {/* Ticks & Labels */}
          {/* Y Max */}
          <text
            x={padLeft - 4}
            y={padTop + 8}
            className="graph-axis-text"
            textAnchor="end"
          >
            {bounds.maxY} {config.yUnit}
          </text>
          {/* Y Min */}
          <text
            x={padLeft - 4}
            y={padTop + plotH}
            className="graph-axis-text"
            textAnchor="end"
          >
            {bounds.minY} {config.yUnit}
          </text>
          {/* X Min */}
          <text
            x={padLeft}
            y={svgHeight - 6}
            className="graph-axis-text"
            textAnchor="start"
          >
            {bounds.minX}
          </text>
          {/* X Max */}
          <text
            x={padLeft + plotW}
            y={svgHeight - 6}
            className="graph-axis-text"
            textAnchor="end"
          >
            {bounds.maxX} {config.xUnit}
          </text>
        </svg>
      </div>

      {/* Educational physics explanation badge */}
      <div className="graph-insight-box">
        <p>
          <strong>Scientific Note:</strong> {config.relationship}
        </p>
      </div>
    </div>
  );
}
