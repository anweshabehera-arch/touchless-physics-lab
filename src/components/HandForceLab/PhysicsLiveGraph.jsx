import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Play, Pause, RotateCcw, TrendingUp, Info } from 'lucide-react';
import {
  computeNewtonAcceleration,
  computeSpringRestoringForce,
  computeProjectileTheoretical,
  computeOpticsRays,
  computeInclinedPlanePhysics
} from '../../physics/physicsFormulas';

export default function PhysicsLiveGraph({
  activeExperiment,
  physicsData = {},
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

  // Reset data points when experiment changes
  const [prevExpId, setPrevExpId] = useState(expId);
  if (prevExpId !== expId) {
    setPrevExpId(expId);
    setDataPoints([]);
  }

  const physicsDataRef = useRef(physicsData);
  useEffect(() => {
    physicsDataRef.current = physicsData;
  }, [physicsData]);

  // Periodic sampling every 100ms
  useEffect(() => {
    if (isPaused) return;

    const intervalId = setInterval(() => {
      const cur = physicsDataRef.current;
      if (!cur) return;

      let x = null;
      let y = null;
      let hasActivity = false;

      if (expId === 'newton') {
        const f = Number((cur.force || 0).toFixed(2));
        const a = Number((cur.acceleration || 0).toFixed(2));
        if (f > 0.05 || a > 0.05) {
          x = f;
          y = a;
          hasActivity = true;
        }
      } else if (expId === 'impulse') {
        const f = Number((cur.peakForce || cur.force || 0).toFixed(2));
        const t = Number((cur.contactTime || cur.time || 0).toFixed(2));
        if (f > 0.1 || cur.impulseJ > 0.01) {
          x = t;
          y = f;
          hasActivity = true;
        }
      } else if (expId === 'hooke') {
        const disp = Number((cur.displacement || 0).toFixed(2));
        const fSpring = Number((cur.springForce || 0).toFixed(2));
        if (Math.abs(disp) > 0.01 || Math.abs(fSpring) > 0.1) {
          x = disp;
          y = fSpring;
          hasActivity = true;
        }
      } else if (expId === 'collision') {
        const pTot = Number((cur.pTotal || 0).toFixed(2));
        const t = Number((cur.time || 0).toFixed(1));
        if (cur.v1 > 0.05 || cur.v2 > 0.05 || pTot > 0.05) {
          x = t;
          y = pTot;
          hasActivity = true;
        }
      } else if (expId === 'projectile') {
        if (cur.range > 0 || cur.maxHeight > 0) {
          x = Number((cur.range || 0).toFixed(2));
          y = Number((cur.maxHeight || 0).toFixed(2));
          hasActivity = true;
        }
      } else if (expId === 'pendulum') {
        const thDeg = Number((cur.thetaDeg || 0).toFixed(1));
        const t = Number((cur.time || 0).toFixed(1));
        if (Math.abs(thDeg) > 0.5 || Math.abs(cur.omega || 0) > 0.05) {
          x = t;
          y = thDeg;
          hasActivity = true;
        }
      } else if (expId === 'electric') {
        const dist = Number((cur.probeDist || 0).toFixed(2));
        const eMag = Number((cur.eFieldMag || 0).toFixed(2));
        if (dist > 0.05 && eMag > 0.1) {
          x = dist;
          y = eMag;
          hasActivity = true;
        }
      } else if (expId === 'wave') {
        const phaseDeg = Number((cur.wavePhaseDeg || 0).toFixed(0));
        const aRes = Number((cur.waveResultantAmp || 0).toFixed(2));
        x = phaseDeg;
        y = aRes;
        hasActivity = true;
      } else if (expId === 'optics') {
        const thetaI = Number((cur.thetaIncidentDeg || 0).toFixed(1));
        const thetaT = cur.isTIR ? 90.0 : Number((cur.thetaRefractDeg || 0).toFixed(1));
        x = thetaI;
        y = thetaT;
        hasActivity = true;
      } else if (expId === 'incline') {
        const angle = Number((cur.inclineAngle || 0).toFixed(1));
        const accel = Number((cur.inclineAccel || 0).toFixed(2));
        x = angle;
        y = accel;
        hasActivity = true;
      }

      if (hasActivity && x !== null && y !== null) {
        setDataPoints((prev) => {
          const next = [...prev, { x, y, timestamp: Date.now() }];
          return next.slice(-40);
        });
      }
    }, 100);

    return () => clearInterval(intervalId);
  }, [isPaused, expId]);

  // Compute graph bounds tailored to each experiment
  const bounds = useMemo(() => {
    if (expId === 'newton') {
      const maxY = Math.max(12, Math.ceil(computeNewtonAcceleration(12, mass) * 1.15));
      return { minX: 0, maxX: 12, minY: 0, maxY };
    } else if (expId === 'impulse') {
      const maxF = Math.max(25, ...dataPoints.map((d) => d.y));
      return { minX: 0, maxX: Math.max(1, ...dataPoints.map((d) => d.x)), minY: 0, maxY: Math.ceil(maxF * 1.2) };
    } else if (expId === 'hooke') {
      const maxF = Math.max(30, Math.ceil(springK * 0.7));
      return { minX: -0.7, maxX: 0.7, minY: -maxF, maxY: maxF };
    } else if (expId === 'collision') {
      const maxP = Math.max(6, ...dataPoints.map((d) => d.y));
      const maxT = Math.max(10, ...dataPoints.map((d) => d.x));
      return { minX: 0, maxX: maxT, minY: 0, maxY: Math.ceil(maxP * 1.25) };
    } else if (expId === 'projectile') {
      const theo = computeProjectileTheoretical(physicsData.projV0 || 5.0, physicsData.projAngle || 45);
      const maxX = Math.max(6, Math.ceil(theo.range * 1.25));
      const maxY = Math.max(3, Math.ceil(theo.maxHeight * 1.3));
      return { minX: 0, maxX, minY: 0, maxY };
    } else if (expId === 'pendulum') {
      const maxT = Math.max(10, ...dataPoints.map((d) => d.x));
      return { minX: 0, maxX: maxT, minY: -60, maxY: 60 };
    } else if (expId === 'electric') {
      return { minX: 0.1, maxX: 1.5, minY: 0, maxY: 60 };
    } else if (expId === 'wave') {
      return { minX: 0, maxX: 360, minY: 0, maxY: 4.0 };
    } else if (expId === 'optics') {
      return { minX: 0, maxX: 90, minY: 0, maxY: 90 };
    } else if (expId === 'incline') {
      return { minX: 0, maxX: 60, minY: 0, maxY: 10 };
    }
    return { minX: 0, maxX: 10, minY: 0, maxY: 10 };
  }, [expId, dataPoints, mass, springK, physicsData]);

  // Coordinate mapping for SVG
  const svgWidth = 330;
  const svgHeight = 155;
  const padLeft = 40;
  const padRight = 16;
  const padTop = 16;
  const padBottom = 26;

  const plotW = svgWidth - padLeft - padRight;
  const plotH = svgHeight - padTop - padBottom;

  const mapX = useCallback(
    (val) => {
      const range = bounds.maxX - bounds.minX || 1;
      return padLeft + ((val - bounds.minX) / range) * plotW;
    },
    [bounds.maxX, bounds.minX, plotW]
  );

  const mapY = useCallback(
    (val) => {
      const range = bounds.maxY - bounds.minY || 1;
      return padTop + plotH - ((val - bounds.minY) / range) * plotH;
    },
    [bounds.maxY, bounds.minY, plotH]
  );

  // Generate SVG polyline points
  const pointsString = useMemo(() => {
    if (dataPoints.length === 0) return '';
    return dataPoints
      .map((p) => `${mapX(p.x).toFixed(1)},${mapY(p.y).toFixed(1)}`)
      .join(' ');
  }, [dataPoints, mapX, mapY]);

  // Theoretical reference line / curves
  const theoreticalLine = useMemo(() => {
    if (expId === 'newton') {
      const x1 = bounds.minX;
      const y1 = computeNewtonAcceleration(x1, mass);
      const x2 = bounds.maxX;
      const y2 = computeNewtonAcceleration(x2, mass);
      return { x1: mapX(x1), y1: mapY(y1), x2: mapX(x2), y2: mapY(y2), label: 'a = F/m' };
    } else if (expId === 'hooke') {
      const x1 = bounds.minX;
      const y1 = computeSpringRestoringForce(springK, x1);
      const x2 = bounds.maxX;
      const y2 = computeSpringRestoringForce(springK, x2);
      return { x1: mapX(x1), y1: mapY(y1), x2: mapX(x2), y2: mapY(y2), label: 'F = -kx' };
    } else if (expId === 'optics') {
      const n1 = physicsData.n1 || 1.0;
      const n2 = physicsData.n2 || 1.5;
      const pts = [];
      for (let deg = 0; deg <= 85; deg += 5) {
        const res = computeOpticsRays(deg, n1, n2);
        if (res.thetaRefractDeg !== null) {
          pts.push(`${mapX(deg).toFixed(1)},${mapY(res.thetaRefractDeg).toFixed(1)}`);
        }
      }
      return { polyline: pts.join(' '), label: "Snell's Law" };
    } else if (expId === 'incline') {
      const muS = physicsData.muStatic || 0.45;
      const muK = physicsData.muKinetic || 0.30;
      const pts = [];
      for (let deg = 0; deg <= 60; deg += 3) {
        const res = computeInclinedPlanePhysics(2.0, deg, muS, muK);
        pts.push(`${mapX(deg).toFixed(1)},${mapY(res.acceleration).toFixed(1)}`);
      }
      return { polyline: pts.join(' '), label: 'a = g(sinθ - μk cosθ)' };
    }
    return null;
  }, [expId, bounds, mass, springK, physicsData, mapX, mapY]);

  const zeroY = mapY(0);
  const zeroX = mapX(0);

  const hasData = dataPoints.length > 0;

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
            title={isPaused ? 'Resume graph logging' : 'Pause graph logging'}
          >
            {isPaused ? <Play className="btn-icon-xs" /> : <Pause className="btn-icon-xs" />}
            {isPaused ? 'Live' : 'Hold'}
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

      <div className="graph-canvas-wrap" style={{ position: 'relative' }}>
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="graph-svg"
          preserveAspectRatio="none"
        >
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

          {/* Theoretical reference line (dashed amber) */}
          {theoreticalLine?.x1 !== undefined && (
            <line
              x1={theoreticalLine.x1}
              y1={theoreticalLine.y1}
              x2={theoreticalLine.x2}
              y2={theoreticalLine.y2}
              stroke="#ffbb33"
              strokeWidth="1.5"
              strokeDasharray="4 3"
              opacity="0.8"
            />
          )}

          {theoreticalLine?.polyline && (
            <polyline
              fill="none"
              stroke="#ffbb33"
              strokeWidth="1.5"
              strokeDasharray="4 3"
              opacity="0.8"
              points={theoreticalLine.polyline}
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
              fill={idx === dataPoints.length - 1 ? '#31f2a1' : '#38d9ff'}
              stroke="#071220"
              strokeWidth="1"
            />
          ))}

          {/* Ticks & Labels */}
          <text
            x={padLeft - 4}
            y={padTop + 8}
            className="graph-axis-text"
            textAnchor="end"
          >
            {bounds.maxY} {config.yUnit}
          </text>
          <text
            x={padLeft - 4}
            y={padTop + plotH}
            className="graph-axis-text"
            textAnchor="end"
          >
            {bounds.minY} {config.yUnit}
          </text>
          <text
            x={padLeft}
            y={svgHeight - 6}
            className="graph-axis-text"
            textAnchor="start"
          >
            {bounds.minX}
          </text>
          <text
            x={padLeft + plotW}
            y={svgHeight - 6}
            className="graph-axis-text"
            textAnchor="end"
          >
            {bounds.maxX} {config.xUnit}
          </text>
        </svg>

        {/* Empty state overlay before measurements are collected */}
        {!hasData && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(7, 18, 32, 0.72)',
              backdropFilter: 'blur(3px)',
              borderRadius: '8px',
              padding: '12px',
              textAlign: 'center'
            }}
          >
            <Info style={{ width: '18px', height: '18px', color: '#67e8f9', marginBottom: '6px' }} />
            <span style={{ fontSize: '11px', color: '#e0f2fe', fontWeight: 600 }}>
              Awaiting telemetry measurements…
            </span>
            <small style={{ fontSize: '10px', color: '#94a3b8', marginTop: '3px' }}>
              Interact with the simulation or adjust parameters to plot data.
            </small>
          </div>
        )}
      </div>

      {/* Legend & Educational physics explanation */}
      <div style={{ display: 'flex', gap: '12px', margin: '6px 0 4px', fontSize: '10px', color: '#94a3b8' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '12px', height: '2px', backgroundColor: '#38d9ff', display: 'inline-block' }} />
          Simulated Measurement
        </span>
        {theoreticalLine && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '12px', height: '2px', borderTop: '2px dashed #ffbb33', display: 'inline-block' }} />
            Theoretical Reference ({theoreticalLine.label})
          </span>
        )}
      </div>

      <div className="graph-insight-box">
        <p>
          <strong>Scientific Note:</strong> {config.relationship}
        </p>
      </div>
    </div>
  );
}
