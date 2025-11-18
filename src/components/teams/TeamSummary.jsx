function TeamSummary({ teams, memberTaskCounts }) {
  return (
    <section className="panel">
      <div className="form-header">
        <h3>Team summary</h3>
        <small>Live workload vs capacity</small>
      </div>
      <div className="team-grid">
        {teams.length ? (
          teams.map((team) => (
            <div key={team.id} className="team-card">
              <div className="team-card-header">
                <strong>{team.name}</strong>
                <small>{team.members.length} members</small>
              </div>
              {team.members.length ? (
                <ul>
                  {team.members.map((member) => {
                    const currentLoad = memberTaskCounts[member.id] || 0
                    const overloaded = currentLoad > member.capacity
                    return (
                      <li key={member.id}>
                        <div>
                          <p>{member.name}</p>
                          <small>{member.role}</small>
                        </div>
                        <span className={`chip ${overloaded ? 'chip-alert' : ''}`}>
                          {currentLoad}/{member.capacity}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <p className="empty">No members yet.</p>
              )}
            </div>
          ))
        ) : (
          <p className="empty">Create a team to get started.</p>
        )}
      </div>
    </section>
  )
}

export default TeamSummary

