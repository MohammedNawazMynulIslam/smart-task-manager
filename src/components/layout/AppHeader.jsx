function AppHeader({ currentUser, onLogout }) {
  return (
    <header className="app-header">
      <div>
        <p className="eyebrow">Smart Task Manager</p>
        <h1>Balance project workload with one click.</h1>
        <p className="lede">
          Create teams, track capacity, auto-assign new tasks, and rebalance work instantly when
          someone is overloaded.
        </p>
      </div>
      {currentUser ? (
        <div className="user-card">
          <p className="label">Logged in as</p>
          <strong>{currentUser.name}</strong>
          <small>{currentUser.email}</small>
          <button className="btn ghost" onClick={onLogout}>
            Log out
          </button>
        </div>
      ) : null}
    </header>
  )
}

export default AppHeader

