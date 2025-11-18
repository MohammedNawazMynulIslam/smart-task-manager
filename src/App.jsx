import { useMemo, useState } from 'react'

const PRIORITY_OPTIONS = ['Low', 'Medium', 'High']
const STATUS_OPTIONS = ['Pending', 'In Progress', 'Done']

const makeId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 11)

const formatTime = (value) =>
  new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

function App() {
  const [users, setUsers] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [teams, setTeams] = useState([])
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [activityLog, setActivityLog] = useState([])
  const [message, setMessage] = useState('')

  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
  })
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [teamForm, setTeamForm] = useState({ name: '' })
  const [memberForm, setMemberForm] = useState({
    teamId: '',
    name: '',
    role: '',
    capacity: 3,
  })
  const [projectForm, setProjectForm] = useState({ name: '', teamId: '' })
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    projectId: '',
    memberId: '',
    priority: 'Medium',
    status: 'Pending',
  })
  const [filters, setFilters] = useState({ projectId: 'all', memberId: 'all' })
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [overloadWarning, setOverloadWarning] = useState(null)

  const editingTask = editingTaskId
    ? tasks.find((task) => task.id === editingTaskId)
    : null

  const memberDirectory = useMemo(() => {
    const map = {}
    teams.forEach((team) => {
      team.members.forEach((member) => {
        map[member.id] = { member, teamId: team.id, teamName: team.name }
      })
    })
    return map
  }, [teams])

  const memberTaskCounts = useMemo(() => {
    return tasks.reduce((acc, task) => {
      if (!task.memberId) return acc
      acc[task.memberId] = (acc[task.memberId] || 0) + 1
      return acc
    }, {})
  }, [tasks])

  const getAdjustedLoad = (memberId) => {
    let count = memberTaskCounts[memberId] || 0
    if (editingTask && editingTask.memberId === memberId) {
      count -= 1
    }
    return Math.max(0, count)
  }

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesProject =
        filters.projectId === 'all' || task.projectId === filters.projectId
      const matchesMember =
        filters.memberId === 'all' || task.memberId === filters.memberId
      return matchesProject && matchesMember
    })
  }, [tasks, filters])

  const recentLogEntries = activityLog.slice(0, 10)
  const recentReassignments = activityLog
    .filter((entry) => entry.type === 'reassign')
    .slice(0, 5)

  const selectedProject = projects.find(
    (project) => project.id === taskForm.projectId,
  )
  const selectedTeam = teams.find((team) => team.id === selectedProject?.teamId)
  const taskTeamMembers = selectedTeam?.members || []

  const handleRegister = (event) => {
    event.preventDefault()
    if (!registerForm.name || !registerForm.email || !registerForm.password) {
      setMessage('Please complete every field to register.')
      return
    }

    const exists = users.some(
      (user) => user.email.toLowerCase() === registerForm.email.toLowerCase(),
    )
    if (exists) {
      setMessage('This email is already registered.')
      return
    }

    const newUser = { id: makeId(), ...registerForm }
    setUsers((prev) => [...prev, newUser])
    setCurrentUser(newUser)
    setRegisterForm({ name: '', email: '', password: '' })
    setLoginForm({ email: newUser.email, password: '' })
    setMessage(`Welcome aboard, ${newUser.name}!`)
  }

  const handleLogin = (event) => {
    event.preventDefault()
    const found = users.find(
      (user) =>
        user.email.toLowerCase() === loginForm.email.toLowerCase() &&
        user.password === loginForm.password,
    )

    if (!found) {
      setMessage('Invalid credentials — please try again.')
      return
    }

    setCurrentUser(found)
    setMessage(`Welcome back, ${found.name}!`)
  }

  const handleTeamCreate = (event) => {
    event.preventDefault()
    if (!teamForm.name.trim()) {
      setMessage('Team name is required.')
      return
    }

    const newTeam = {
      id: makeId(),
      name: teamForm.name.trim(),
      createdBy: currentUser.id,
      members: [],
    }
    setTeams((prev) => [...prev, newTeam])
    setTeamForm({ name: '' })
    setMemberForm((prev) => ({ ...prev, teamId: newTeam.id }))
    setProjectForm((prev) => ({ ...prev, teamId: prev.teamId || newTeam.id }))
    setMessage(`Team "${newTeam.name}" created.`)
  }

  const handleMemberAdd = (event) => {
    event.preventDefault()
    if (!memberForm.teamId || !memberForm.name.trim()) {
      setMessage('Please select a team and enter member details.')
      return
    }

    const capacity = Math.max(
      0,
      Math.min(5, Number(memberForm.capacity ?? 0)),
    )
    setTeams((prev) =>
      prev.map((team) =>
        team.id === memberForm.teamId
          ? {
              ...team,
              members: [
                ...team.members,
                {
                  id: makeId(),
                  name: memberForm.name.trim(),
                  role: memberForm.role.trim() || 'Member',
                  capacity,
                },
              ],
            }
          : team,
      ),
    )
    setMemberForm((prev) => ({
      ...prev,
      name: '',
      role: '',
      capacity: 3,
    }))
    setMessage('Member added.')
  }

  const handleProjectCreate = (event) => {
    event.preventDefault()
    if (!projectForm.name.trim() || !projectForm.teamId) {
      setMessage('Project name and owning team are required.')
      return
    }

    const newProject = {
      id: makeId(),
      name: projectForm.name.trim(),
      teamId: projectForm.teamId,
    }
    setProjects((prev) => [...prev, newProject])
    setProjectForm({ name: '', teamId: projectForm.teamId })
    setTaskForm((prev) =>
      prev.projectId
        ? prev
        : {
            ...prev,
            projectId: newProject.id,
          },
    )
    setFilters((prev) => ({
      ...prev,
      projectId: prev.projectId === 'all' ? newProject.id : prev.projectId,
    }))
    setMessage(`Project "${newProject.name}" created.`)
  }

  const persistTask = (payload, isEdit) => {
    setTasks((prev) =>
      isEdit ? prev.map((task) => (task.id === payload.id ? payload : task)) : [...prev, payload],
    )
    setTaskForm({
      title: '',
      description: '',
      projectId: '',
      memberId: '',
      priority: 'Medium',
      status: 'Pending',
    })
    setEditingTaskId(null)
    setOverloadWarning(null)
    setMessage(isEdit ? 'Task updated.' : 'Task created.')
  }

  const attemptTaskSave = (event, force = false) => {
    event?.preventDefault()
    if (!taskForm.title.trim() || !taskForm.projectId) {
      setMessage('Task title and project are required.')
      return
    }

    const payload = {
      id: editingTaskId || makeId(),
      title: taskForm.title.trim(),
      description: taskForm.description.trim(),
      projectId: taskForm.projectId,
      memberId: taskForm.memberId || '',
      priority: taskForm.priority,
      status: taskForm.status,
    }

    const selectedMember = payload.memberId
      ? memberDirectory[payload.memberId]?.member
      : null

    if (selectedMember && !force) {
      let currentLoad = memberTaskCounts[selectedMember.id] || 0
      if (editingTask && editingTask.memberId === selectedMember.id) {
        currentLoad -= 1
      }
      if (currentLoad >= selectedMember.capacity) {
        setOverloadWarning({
          member: selectedMember,
          taskPayload: payload,
          isEdit: Boolean(editingTask),
        })
        return
      }
    }

    persistTask(payload, Boolean(editingTask))
  }

  const handleAutoAssign = () => {
    if (!selectedTeam || taskTeamMembers.length === 0) {
      setMessage('Add team members before auto-assigning.')
      return
    }

    const loads = taskTeamMembers.map((member) => {
      return { member, load: getAdjustedLoad(member.id) }
    })

    const openMembers = loads.filter((entry) => entry.load < entry.member.capacity)
    const candidates = openMembers.length ? openMembers : loads
    const target = candidates.reduce((best, entry) =>
      entry.load < best.load ? entry : best,
    )

    setTaskForm((prev) => ({ ...prev, memberId: target.member.id }))
  }

  const handleEditTask = (task) => {
    setEditingTaskId(task.id)
    setTaskForm({
      title: task.title,
      description: task.description,
      projectId: task.projectId,
      memberId: task.memberId,
      priority: task.priority,
      status: task.status,
    })
  }

  const handleDeleteTask = (taskId) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId))
    if (editingTaskId === taskId) {
      setEditingTaskId(null)
      setTaskForm({
        title: '',
        description: '',
        projectId: '',
        memberId: '',
        priority: 'Medium',
        status: 'Pending',
      })
    }
    setMessage('Task removed.')
  }

  const handleReassignTasks = () => {
    if (!tasks.length) {
      setMessage('There are no tasks to rebalance.')
      return
    }

    const updatedTasks = [...tasks]
    const loadMap = { ...memberTaskCounts }

    teams.forEach((team) =>
      team.members.forEach((member) => {
        if (typeof loadMap[member.id] === 'undefined') {
          loadMap[member.id] = 0
        }
      }),
    )

    const priorityRank = { Low: 0, Medium: 1, High: 2 }
    const reassignEntries = []

    teams.forEach((team) => {
      if (!team.members.length) return

      const getOverloaded = () =>
        team.members.filter((member) => loadMap[member.id] > member.capacity)
      const getAvailable = () =>
        team.members.filter((member) => loadMap[member.id] < member.capacity)

      let guard = 0
      while (getOverloaded().length && getAvailable().length && guard < 1000) {
        guard += 1
        const donor = getOverloaded().sort(
          (a, b) => loadMap[b.id] - loadMap[a.id],
        )[0]

        const movableTasks = updatedTasks
          .map((task, index) => ({ task, index }))
          .filter(
            ({ task }) =>
              task.memberId === donor.id && task.priority !== 'High',
          )
          .sort(
            (a, b) =>
              priorityRank[a.task.priority] - priorityRank[b.task.priority],
          )

        if (!movableTasks.length) break

        const recipient = getAvailable().sort(
          (a, b) => loadMap[a.id] - loadMap[b.id],
        )[0]
        if (!recipient) break

        const { task, index } = movableTasks[0]
        updatedTasks[index] = { ...task, memberId: recipient.id }
        loadMap[donor.id] -= 1
        loadMap[recipient.id] += 1

        reassignEntries.push({
          id: makeId(),
          type: 'reassign',
          timestamp: new Date().toISOString(),
          message: `Task "${task.title}" reassigned from ${donor.name} to ${recipient.name}.`,
        })
      }
    })

    if (!reassignEntries.length) {
      setMessage('No eligible tasks were moved.')
      return
    }

    setTasks(updatedTasks)
    setActivityLog((prev) => [...reassignEntries, ...prev].slice(0, 20))
    setMessage(`Reassigned ${reassignEntries.length} task${reassignEntries.length > 1 ? 's' : ''}.`)
  }

  const assignAnyway = () => {
    if (!overloadWarning?.taskPayload) return
    persistTask(overloadWarning.taskPayload, overloadWarning.isEdit)
  }

  const chooseAnotherMember = () => {
    setOverloadWarning(null)
    setTaskForm((prev) => ({ ...prev, memberId: '' }))
  }

  const dashboardStats = {
    totalProjects: projects.length,
    totalTasks: tasks.length,
    totalTeams: teams.length,
  }
  
  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Smart Task Manager</p>
          <h1>Balance project workload with one click.</h1>
          <p className="lede">
            Create teams, track capacity, auto-assign new tasks, and rebalance
            work instantly when someone is overloaded.
          </p>
        </div>
        {currentUser ? (
          <div className="user-card">
            <p className="label">Logged in as</p>
            <strong>{currentUser.name}</strong>
            <small>{currentUser.email}</small>
            <button
              className="btn ghost"
              onClick={() => {
                setCurrentUser(null)
                setMessage('Signed out.')
              }}
            >
              Log out
            </button>
          </div>
        ) : null}
      </header>

      {message ? <div className="toast">{message}</div> : null}

      {!currentUser ? (
        <section className="auth-grid">
          <form className="panel" onSubmit={handleRegister}>
            <h2>Create account</h2>
            <label>
              <span>Name</span>
              <input
                value={registerForm.name}
                onChange={(event) =>
                  setRegisterForm((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="Riya Sharma"
              />
            </label>
            <label>
              <span>Email</span>
              <input
                value={registerForm.email}
                onChange={(event) =>
                  setRegisterForm((prev) => ({ ...prev, email: event.target.value }))
                }
                placeholder="riya@teams.com"
              />
            </label>
            <label>
              <span>Password</span>
              <input
                type="password"
                value={registerForm.password}
                onChange={(event) =>
                  setRegisterForm((prev) => ({
                    ...prev,
                    password: event.target.value,
                  }))
                }
                placeholder="••••••••"
              />
            </label>
            <button className="btn primary">Register & continue</button>
          </form>

          <form className="panel" onSubmit={handleLogin}>
            <h2>Log in</h2>
            <label>
              <span>Email</span>
              <input
                value={loginForm.email}
                onChange={(event) =>
                  setLoginForm((prev) => ({ ...prev, email: event.target.value }))
                }
                placeholder="you@company.com"
              />
            </label>
            <label>
              <span>Password</span>
              <input
                type="password"
                value={loginForm.password}
                onChange={(event) =>
                  setLoginForm((prev) => ({
                    ...prev,
                    password: event.target.value,
                  }))
                }
                placeholder="••••••••"
              />
            </label>
            <button className="btn secondary">Log in</button>
          </form>
        </section>
      ) : (
        <>
          <section className="dashboard">
            <div className="panel metric">
              <p>Total Projects</p>
              <strong>{dashboardStats.totalProjects}</strong>
            </div>
            <div className="panel metric">
              <p>Total Tasks</p>
              <strong>{dashboardStats.totalTasks}</strong>
            </div>
            <div className="panel metric">
              <p>Teams</p>
              <strong>{dashboardStats.totalTeams}</strong>
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
                <button className="btn accent" onClick={handleReassignTasks}>
                  Reassign Tasks
                </button>
              </div>
              <p className="small">
                Low/medium priority tasks move automatically from overloaded members to
                teammates with capacity. High priority tasks stay put.
              </p>
            </div>
          </section>

          <section className="grid two-columns">
            <form className="panel" onSubmit={handleTeamCreate}>
              <h3>Create team</h3>
              <label>
                <span>Team name</span>
                <input
                  value={teamForm.name}
                  onChange={(event) =>
                    setTeamForm({ name: event.target.value })
                  }
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
                  <button
                    type="button"
                    className="btn ghost"
                    onClick={() => {
                      setEditingTaskId(null)
                      setTaskForm({
                        title: '',
                        description: '',
                        projectId: '',
                        memberId: '',
                        priority: 'Medium',
                        status: 'Pending',
                      })
                    }}
                  >
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

          {overloadWarning ? (
            <div className="panel warning">
              <strong>
                {overloadWarning.member.name} has {getAdjustedLoad(overloadWarning.member.id)}{' '}
                task(s) but capacity is {overloadWarning.member.capacity}. Assign anyway?
              </strong>
              <div className="warning-actions">
                <button className="btn primary" onClick={assignAnyway}>
                  Assign anyway
                </button>
                <button className="btn ghost" onClick={chooseAnotherMember}>
                  Choose another
                </button>
              </div>
            </div>
          ) : null}

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
                    projects.find((project) => project.id === task.projectId)?.name ||
                    'Unknown'
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
                        <button
                          className="btn ghost"
                          onClick={() => handleDeleteTask(task.id)}
                        >
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
        </>
      )}
    </div>
  )
}

export default App
