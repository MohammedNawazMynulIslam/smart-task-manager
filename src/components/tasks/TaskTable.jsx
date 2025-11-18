function TaskTable({
  filteredTasks,
  projects,
  memberDirectory,
  filters,
  setFilters,
  handleEditTask,
  handleDeleteTask,
}) {
  return (
    <section className="panel">
      <div className="form-header">
        <h3>Tasks</h3>
        <div className="filters">
          <select
            value={filters.projectId}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, projectId: event.target.value }))
            }
          >
            <option value="all">All projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          <select
            value={filters.memberId}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, memberId: event.target.value }))
            }
          >
            <option value="all">All members</option>
            {Object.values(memberDirectory).map(({ member }) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
            <option value="">Unassigned</option>
          </select>
        </div>
      </div>
      {filteredTasks.length ? (
        <div className="table">
          <div className="table-head">
            <span>Title</span>
            <span>Project</span>
            <span>Assignee</span>
            <span>Priority</span>
            <span>Status</span>
            <span />
          </div>
          {filteredTasks.map((task) => {
            const projectName =
              projects.find((project) => project.id === task.projectId)?.name || 'Unknown'
            const assignee = memberDirectory[task.memberId]?.member?.name || 'Unassigned'
            return (
              <div className="table-row" key={task.id}>
                <span className="task-title">{task.title}</span>
                <span>{projectName}</span>
                <span>{assignee}</span>
                <span className={`tag priority-${task.priority.toLowerCase()}`}>
                  {task.priority}
                </span>
                <span>{task.status}</span>
                <span className="actions">
                  <button className="btn subtle" onClick={() => handleEditTask(task)}>
                    Edit
                  </button>
                  <button className="btn ghost" onClick={() => handleDeleteTask(task.id)}>
                    Delete
                  </button>
                </span>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="empty">No tasks match the selected filters.</p>
      )}
    </section>
  )
}

export default TaskTable

