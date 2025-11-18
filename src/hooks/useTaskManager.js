import { useMemo, useState } from 'react'

export const PRIORITY_OPTIONS = ['Low', 'Medium', 'High']
export const STATUS_OPTIONS = ['Pending', 'In Progress', 'Done']

const makeId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 11)

const INITIAL_REGISTER_FORM = { name: '', email: '', password: '' }
const INITIAL_LOGIN_FORM = { email: '', password: '' }
const INITIAL_TEAM_FORM = { name: '' }
const INITIAL_MEMBER_FORM = { teamId: '', name: '', role: '', capacity: 3 }
const INITIAL_PROJECT_FORM = { name: '', teamId: '' }
const INITIAL_TASK_FORM = {
  title: '',
  description: '',
  projectId: '',
  memberId: '',
  priority: 'Medium',
  status: 'Pending',
}

const useTaskManager = () => {
  const [users, setUsers] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [teams, setTeams] = useState([])
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [activityLog, setActivityLog] = useState([])
  const [message, setMessage] = useState('')

  const [registerForm, setRegisterForm] = useState(INITIAL_REGISTER_FORM)
  const [loginForm, setLoginForm] = useState(INITIAL_LOGIN_FORM)
  const [teamForm, setTeamForm] = useState(INITIAL_TEAM_FORM)
  const [memberForm, setMemberForm] = useState(INITIAL_MEMBER_FORM)
  const [projectForm, setProjectForm] = useState(INITIAL_PROJECT_FORM)
  const [taskForm, setTaskForm] = useState(INITIAL_TASK_FORM)
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

  const dashboardStats = {
    totalProjects: projects.length,
    totalTasks: tasks.length,
    totalTeams: teams.length,
  }

  const resetTaskForm = () => {
    setTaskForm(INITIAL_TASK_FORM)
    setEditingTaskId(null)
  }

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
    setRegisterForm(INITIAL_REGISTER_FORM)
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

  const handleLogout = () => {
    setCurrentUser(null)
    setMessage('Signed out.')
  }

  const handleTeamCreate = (event) => {
    event.preventDefault()
    if (!currentUser) {
      setMessage('You need to log in first.')
      return
    }
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
    setTeamForm(INITIAL_TEAM_FORM)
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
    resetTaskForm()
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

    const loads = taskTeamMembers.map((member) => ({
      member,
      load: getAdjustedLoad(member.id),
    }))

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

  const cancelTaskEdit = () => {
    resetTaskForm()
  }

  const handleDeleteTask = (taskId) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId))
    if (editingTaskId === taskId) {
      resetTaskForm()
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

  return {
    // state
    currentUser,
    message,
    teams,
    projects,
    tasks,
    activityLog,
    registerForm,
    loginForm,
    teamForm,
    memberForm,
    projectForm,
    taskForm,
    filters,
    editingTask,
    overloadWarning,
    // setters
    setRegisterForm,
    setLoginForm,
    setTeamForm,
    setMemberForm,
    setProjectForm,
    setTaskForm,
    setFilters,
    // derived
    memberDirectory,
    memberTaskCounts,
    getAdjustedLoad,
    filteredTasks,
    recentLogEntries,
    recentReassignments,
    taskTeamMembers,
    selectedTeam,
    dashboardStats,
    // actions
    setMessage,
    handleRegister,
    handleLogin,
    handleLogout,
    handleTeamCreate,
    handleMemberAdd,
    handleProjectCreate,
    attemptTaskSave,
    handleAutoAssign,
    handleEditTask,
    handleDeleteTask,
    handleReassignTasks,
    assignAnyway,
    chooseAnotherMember,
    cancelTaskEdit,
  }
}

export default useTaskManager

