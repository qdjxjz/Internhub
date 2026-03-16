import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, setToken } from '../api'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    api.login(email, password)
      .then((res) => {
        setToken(res.access_token)
        navigate('/jobs')
        window.location.reload()
      })
      .catch((e) => setError(e.message || '登录失败'))
      .finally(() => setLoading(false))
  }

  return (
    <div className="container">
      <h1 className="page-title">登录</h1>
      <form onSubmit={handleSubmit} className="card" style={{ maxWidth: 400 }}>
        <div className="form-group">
          <label>邮箱</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="your@email.com" />
        </div>
        <div className="form-group">
          <label>密码</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="请输入密码" />
        </div>
        {error && <p className="error-msg">{error}</p>}
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '登录中...' : '登录'}
          </button>
          <Link to="/register" style={{ fontSize: '0.95rem' }}>没有账号？去注册</Link>
        </div>
      </form>
    </div>
  )
}
