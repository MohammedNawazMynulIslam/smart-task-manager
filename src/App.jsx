import { useState } from 'react'
import useTaskManager from './hooks/useTaskManager'
import AppHeader from './components/layout/AppHeader'
import AuthPanel from './components/auth/AuthPanel'
import Dashboard from './components/dashboard/Dashboard'
import ManagementForms from './components/management/ManagementForms'
import TeamSummary from './components/teams/TeamSummary'
import TaskTable from './components/tasks/TaskTable'
import ActivityLog from './components/activity/ActivityLog'
import OverloadWarning from './components/warnings/OverloadWarning'

function App() {
  const [authView, setAuthView] = useState('login')
  const {
    currentUser,
    message,
    registerForm,
    setRegisterForm,
    loginForm,
    setLoginForm,
    teamForm,
    setTeamForm,
    memberForm,
    setMemberForm,
    projectForm,
    setProjectForm,
    taskForm,
    setTaskForm,
    filters,
    setFilters,
    editingTask,
    overloadWarning,
    memberDirectory,
    memberTaskCounts,
    getAdjustedLoad,
    filteredTasks,
    recentLogEntries,
    recentReassignments,
    taskTeamMembers,
    teams,
    projects,
    selectedTeam,
    dashboardStats,
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
  } = useTaskManager()

  const onLogout = () => {
    handleLogout()
    setAuthView('login')
  }

  return (
    <div className="app-shell">
      <AppHeader currentUser={currentUser} onLogout={onLogout} />
      {message ? <div className="toast">{message}</div> : null}

      {!currentUser ? (
        <AuthPanel
          authView={authView}
          setAuthView={setAuthView}
          registerForm={registerForm}
          setRegisterForm={setRegisterForm}
          loginForm={loginForm}
          setLoginForm={setLoginForm}
          handleRegister={handleRegister}
          handleLogin={handleLogin}
        />
      ) : (
        <>
          <Dashboard
            stats={dashboardStats}
            recentReassignments={recentReassignments}
            onReassign={handleReassignTasks}
          />

          <ManagementForms
            teams={teams}
            projects={projects}
            teamForm={teamForm}
            setTeamForm={setTeamForm}
            memberForm={memberForm}
            setMemberForm={setMemberForm}
            projectForm={projectForm}
            setProjectForm={setProjectForm}
            taskForm={taskForm}
            setTaskForm={setTaskForm}
            selectedTeam={selectedTeam}
            taskTeamMembers={taskTeamMembers}
            editingTask={editingTask}
            handleTeamCreate={handleTeamCreate}
            handleMemberAdd={handleMemberAdd}
            handleProjectCreate={handleProjectCreate}
            attemptTaskSave={attemptTaskSave}
            handleAutoAssign={handleAutoAssign}
            cancelTaskEdit={cancelTaskEdit}
            getAdjustedLoad={getAdjustedLoad}
          />

          <OverloadWarning
            overloadWarning={overloadWarning}
            getAdjustedLoad={getAdjustedLoad}
            assignAnyway={assignAnyway}
            chooseAnotherMember={chooseAnotherMember}
          />

          <TeamSummary teams={teams} memberTaskCounts={memberTaskCounts} />

          <TaskTable
            filteredTasks={filteredTasks}
            projects={projects}
            memberDirectory={memberDirectory}
            filters={filters}
            setFilters={setFilters}
            handleEditTask={handleEditTask}
            handleDeleteTask={handleDeleteTask}
          />

          <ActivityLog recentLogEntries={recentLogEntries} />
        </>
      )}
    </div>
  )
}

export default App
