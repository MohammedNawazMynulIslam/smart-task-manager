function AuthPanel({
  authView,
  setAuthView,
  registerForm,
  setRegisterForm,
  loginForm,
  setLoginForm,
  handleRegister,
  handleLogin,
}) {
  const isLogin = authView === 'login'

  return (
    <section className="auth-grid">
      {isLogin ? (
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
                setLoginForm((prev) => ({ ...prev, password: event.target.value }))
              }
              placeholder="••••••••"
            />
          </label>
          <button className="btn secondary">Log in</button>
          <p className="small">
            Need an account?{' '}
            <button
              type="button"
              className="btn ghost"
              onClick={() => setAuthView('signup')}
            >
              Sign up
            </button>
          </p>
        </form>
      ) : (
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
          <p className="small">
            Already have an account?{' '}
            <button
              type="button"
              className="btn ghost"
              onClick={() => setAuthView('login')}
            >
              Back to login
            </button>
          </p>
        </form>
      )}
    </section>
  )
}

export default AuthPanel

