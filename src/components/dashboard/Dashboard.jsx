function Dashboard({ stats, recentReassignments, onReassign }) {
  return (
    <section className="dashboard">
      <div className="panel metric">
        <p>Total Projects</p>
        <strong>{stats.totalProjects}</strong>
      </div>
      <div className="panel metric">
        <p>Total Tasks</p>
        <strong>{stats.totalTasks}</strong>
      </div>
      <div className="panel metric">
        <p>Teams</p>
        <strong>{stats.totalTeams}</strong>
      </div>
      <div className="panel metric">
        <p>Recent Reassignments</p>
        {recentReassignments.length ? (
          <ul className="activity-list compact">
            {recentReassignments.map((entry) => (
              <li key={entry.id}>{entry.message}</li>
            ))}
          </ul>
        ) : (
          <small>No movements yet</small>
        )}
      </div>
      <div className="panel metric stretch">
        <div className="metric-header">
          <div>
            <p>Capacity guardrail</p>
            <strong>Reassign Tasks</strong>
          </div>
          <button className="btn accent" onClick={onReassign}>
            Reassign Tasks
          </button>
        </div>
        <p className="small">
          Low/medium priority tasks move automatically from overloaded members to teammates with
          capacity. High priority tasks stay put.
        </p>
      </div>
    </section>
  )
}

export default Dashboard

