import { useState } from 'react';
import { RotateCcw, Play, Pause, FileText } from 'lucide-react';

export default function PhysicsEventTimeline({
  events = [],
  onReset,
  isPaused = false,
  onTogglePause,
  onOpenReport
}) {
  const [selectedEvent, setSelectedEvent] = useState(null);

  return (
    <div className="event-timeline-panel" aria-label="Physics Event Timeline">
      <div className="timeline-header">
        <span className="timeline-title">⏱️ EVENT TIMELINE</span>
        <span className="timeline-count">{events.length} EVENTS</span>
      </div>

      <div className="events-list">
        {events.length === 0 ? (
          <div className="events-empty-msg">
            No physics events recorded yet. Move your hand!
          </div>
        ) : (
          [...events].reverse().map((ev) => (
            <div
              key={ev.id}
              className={`event-row ${selectedEvent?.id === ev.id ? 'active' : ''}`}
              onClick={() => setSelectedEvent(selectedEvent?.id === ev.id ? null : ev)}
              title="Click to inspect event data"
            >
              <span className="event-time">{ev.formattedTime}s</span>
              <span className="event-label">{ev.typeLabel}</span>
            </div>
          ))
        )}
      </div>

      {selectedEvent && (
        <div className="event-modal-popup">
          <div className="event-modal-header">
            <strong>🔍 {selectedEvent.typeLabel} ({selectedEvent.formattedTime}s)</strong>
            <button
              type="button"
              className="event-modal-close"
              onClick={() => setSelectedEvent(null)}
              title="Close details"
            >
              ×
            </button>
          </div>
          <div>Force: {selectedEvent.estimatedForce ? `${selectedEvent.estimatedForce} N` : 'N/A'}</div>
          <div>Acceleration: {selectedEvent.acceleration ? `${selectedEvent.acceleration} m/s²` : 'N/A'}</div>
          <div>Velocity: {selectedEvent.velocityAfter ? `${selectedEvent.velocityAfter} m/s` : 'N/A'}</div>
          <div style={{ marginTop: '4px', color: '#8fe8ff' }}>
            <em>Why it happened:</em> {selectedEvent.explanation}
          </div>
        </div>
      )}

      {/* Fixed bottom controls: Reset, Resume, and Report buttons */}
      <div className="timeline-actions-footer">
        <button
          type="button"
          className="btn-hud-action"
          onClick={onReset}
          title="Reset object to origin / equilibrium"
        >
          <RotateCcw className="btn-icon-xs" />
          Reset
        </button>

        <button
          type="button"
          className={`btn-hud-action ${isPaused ? 'active' : ''}`}
          onClick={onTogglePause}
          title={isPaused ? 'Resume simulation' : 'Pause simulation'}
        >
          {isPaused ? <Play className="btn-icon-xs" /> : <Pause className="btn-icon-xs" />}
          {isPaused ? 'Resume' : 'Pause'}
        </button>

        {onOpenReport && (
          <button
            type="button"
            className="btn-hud-action report-btn"
            onClick={onOpenReport}
            title="Generate official experiment lab report"
          >
            <FileText className="btn-icon-xs" />
            Report
          </button>
        )}
      </div>
    </div>
  );
}

