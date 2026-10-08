import React, { useState } from 'react';

export default function PhysicsEventTimeline({ events = [] }) {
  const [selectedEvent, setSelectedEvent] = useState(null);

  return (
    <div className="event-timeline-panel">
      <div className="timeline-header">
        <span className="timeline-title">⏱️ EVENT TIMELINE</span>
        <span className="timeline-count">{events.length} EVENTS</span>
      </div>

      <div className="events-list">
        {events.length === 0 ? (
          <div style={{ color: '#688c9f', fontSize: '9px', textAlign: 'center', padding: '10px 0' }}>
            No physics events recorded yet. Move your hand!
          </div>
        ) : (
          events.slice(-6).reverse().map((ev) => (
            <div
              key={ev.id}
              className="event-row"
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
          <strong>🔍 {selectedEvent.typeLabel} ({selectedEvent.formattedTime}s)</strong>
          <div>Force: {selectedEvent.estimatedForce ? `${selectedEvent.estimatedForce} N` : 'N/A'}</div>
          <div>Acceleration: {selectedEvent.acceleration ? `${selectedEvent.acceleration} m/s²` : 'N/A'}</div>
          <div>Velocity: {selectedEvent.velocityAfter ? `${selectedEvent.velocityAfter} m/s` : 'N/A'}</div>
          <div style={{ marginTop: '4px', color: '#8fe8ff' }}>
            <em>Why it happened:</em> {selectedEvent.explanation}
          </div>
        </div>
      )}
    </div>
  );
}
