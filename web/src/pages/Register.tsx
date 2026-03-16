import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'

export default function Register() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    api.register(email, password, name)
      .then(() => {
        navigate('/login')
      })
      .catch((e) => setError(e.message || '注册失败'))
      .finally(() => setLoading(false))
  }

  return (
    <div className="container">
      <h1 className="page-title">注册</h1>
      <form onSubmit={handleSubmit} className="card" style={{ maxWidth: 400 }}>
        <div className="form-group">
          <label>邮箱</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="your@email.com" />
        </div>
        <div className="form-group">
          <label>密码</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} placeholder="至少 8 位" />
        </div>
        <div className="form-group">
          <label>昵称 / 姓名</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="显示名称" />
        </div>
        {error && <p className="error-msg">{error}</p>}
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '注册中...' : '注册'}
          </button>
          <Link to="/login" style={{ fontSize: '0.95rem' }}>已有账号？去登录</Link>
        </div>
      </form>
    </div>
  )
}
