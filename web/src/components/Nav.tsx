import { Link, useLocation } from 'react-router-dom'
import { isLoggedIn, clearToken } from '../api'

export default function Nav() {
  const loc = useLocation()
  const loggedIn = isLoggedIn()

  const navLink = (to: string, label: string) => {
    const active = loc.pathname === to
    return (
      <Link
        to={to}
        className="nav-link"
        style={{
          color: active ? 'var(--accent)' : 'var(--text-muted)',
          fontWeight: active ? 600 : 500,
        }}
      >
        {label}
      </Link>
    )
  }

  return (
    <header className="nav-header">
      <div className="nav-inner">
        <Link to="/" className="nav-logo">
          InternHub
        </Link>
        <nav className="nav-links">
          {navLink('/jobs', '职位')}
          {loggedIn && navLink('/applications', '我的投递')}
          {loggedIn && navLink('/recommendations', '推荐')}
          {loggedIn && navLink('/profile', '资料')}
        </nav>
        <div className="nav-right">
          {loggedIn ? (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                clearToken()
                window.location.href = '/jobs'
              }}
            >
              退出
            </button>
          ) : (
            <>
              {navLink('/login', '登录')}
              <Link to="/register" className="btn btn-primary">
                注册
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
