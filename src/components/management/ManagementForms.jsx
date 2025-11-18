import { PRIORITY_OPTIONS, STATUS_OPTIONS } from '../../hooks/useTaskManager'

function ManagementForms({
  teams,
  projects,
  teamForm,
  setTeamForm,
  memberForm,
  setMemberForm,
  projectForm,
  setProjectForm,
  taskForm,
  setTaskForm,
  selectedTeam,
  taskTeamMembers,
  editingTask,
  handleTeamCreate,
  handleMemberAdd,
  handleProjectCreate,
  attemptTaskSave,
  handleAutoAssign,
  cancelTaskEdit,
  getAdjustedLoad,
}) {
  return (
    <>
      <section className="grid two-columns">
        <form className="panel" onSubmit={handleTeamCreate}>
          <h3>Create team</h3>
          <label>
            <span>Team name</span>
            <input
              value={teamForm.name}
              onChange={(event) => setTeamForm({ name: event.target.value })}
              placeholder="Design Guild"
            />
          </label>
          <button className="btn primary">Create team</button>
        </form>

        <form className="panel" onSubmit={handleMemberAdd}>
          <h3>Add team member</h3>
          <label>
            <span>Team</span>
            <select
              value={memberForm.teamId}
              onChange={(event) =>
                setMemberForm((prev) => ({ ...prev, teamId: event.target.value }))
              }
            >
              <option value="">Select a team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Name</span>
            <input
              value={memberForm.name}
              onChange={(event) =>
                setMemberForm((prev) => ({ ...prev, name: event.target.value }))
              }
              placeholder="Farhan Ali"
            />
          </label>
          <label>
            <span>Role</span>
            <input
              value={memberForm.role}
              onChange={(event) =>
                setMemberForm((prev) => ({ ...prev, role: event.target.value }))
              }
              placeholder="Product Designer"
            />
          </label>
          <label>
            <span>Capacity (tasks)</span>
            <input
              type="number"
              min="0"
              max="5"
              value={memberForm.capacity}
              onChange={(event) =>
                setMemberForm((prev) => ({
                  ...prev,
                  capacity: Number(event.target.value),
                }))
              }
            />
          </label>
          <button className="btn secondary">Add member</button>
        </form>
      </section>

      <section className="grid two-columns">
        <form className="panel" onSubmit={handleProjectCreate}>
          <h3>Create project</h3>
          <label>
            <span>Project name</span>
            <input
              value={projectForm.name}
              onChange={(event) =>
                setProjectForm((prev) => ({ ...prev, name: event.target.value }))
              }
              placeholder="Website refresh"
            />
          </label>
          <label>
            <span>Project team</span>
            <select
              value={projectForm.teamId}
              onChange={(event) =>
                setProjectForm((prev) => ({ ...prev, teamId: event.target.value }))
              }
            >
              <option value="">Select a team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </label>
          <button className="btn primary">Create project</button>
        </form>

        <form className="panel" onSubmit={attemptTaskSave}>
          <div className="form-header">
            <h3>{editingTask ? 'Edit task' : 'Create task'}</h3>
            {editingTask ? (
              <button type="button" className="btn ghost" onClick={cancelTaskEdit}>
                Cancel edit
              </button>
            ) : null}
          </div>
          <label>
            <span>Title</span>
            <input
              value={taskForm.title}
              onChange={(event) =>
                setTaskForm((prev) => ({ ...prev, title: event.target.value }))
              }
              placeholder="UI polish"
            />
          </label>
          <label>
            <span>Description</span>
            <textarea
              rows="3"
              value={taskForm.description}
              onChange={(event) =>
                setTaskForm((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              placeholder="Refine the navigation experience"
            />
          </label>
          <label>
            <span>Project</span>
            <select
              value={taskForm.projectId}
              onChange={(event) =>
                setTaskForm((prev) => ({
                  ...prev,
                  projectId: event.target.value,
                  memberId: '',
                }))
              }
            >
              <option value="">Select project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Assigned member</span>
            <div className="assign-row">
              <select
                value={taskForm.memberId}
                onChange={(event) =>
                  setTaskForm((prev) => ({ ...prev, memberId: event.target.value }))
                }
                disabled={!selectedTeam}
              >
                <option value="">Unassigned</option>
                {taskTeamMembers.map((member) => {
                  const currentLoad = getAdjustedLoad(member.id)
                  const label = `${member.name} (${currentLoad}/${member.capacity})`
                  return (
                    <option key={member.id} value={member.id}>
                      {label}
                    </option>
                  )
                })}
              </select>
              <button
                type="button"
                className="btn subtle"
                onClick={handleAutoAssign}
                disabled={!taskTeamMembers.length}
              >
                Auto-assign
              </button>
            </div>
          </label>
          <div className="split">
            <label>
              <span>Priority</span>
              <select
                value={taskForm.priority}
                onChange={(event) =>
                  setTaskForm((prev) => ({ ...prev, priority: event.target.value }))
                }
              >
                {PRIORITY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Status</span>
              <select
                value={taskForm.status}
                onChange={(event) =>
                  setTaskForm((prev) => ({ ...prev, status: event.target.value }))
                }
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button className="btn primary">
            {editingTask ? 'Update task' : 'Create task'}
          </button>
        </form>
      </section>
    </>
  )
}

export default ManagementForms

