import { formatTime } from '../../utils/date'

function ActivityLog({ recentLogEntries }) {
  return (
    <section className="panel">
      <div className="form-header">
        <h3>Activity log</h3>
        <small>Newest first</small>
      </div>
      {recentLogEntries.length ? (
        <ul className="activity-list">
          {recentLogEntries.map((entry) => (
            <li key={entry.id}>
              <span>{entry.message}</span>
              <small>{formatTime(entry.timestamp)}</small>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty">No activity yet.</p>
      )}
    </section>
  )
}

export default ActivityLog

