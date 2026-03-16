import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, isLoggedIn } from '../api'

export default function Profile() {
  const navigate = useNavigate()
  const [nickname, setNickname] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login')
      return
    }
    api.getMe()
      .then((res) => setNickname(res.profile?.nickname ?? ''))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [navigate])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    api.patchMe({ nickname })
      .then(() => setMessage('保存成功'))
      .catch((e) => setMessage(e.message || '保存失败'))
      .finally(() => setSaving(false))
  }

  if (loading) return <div className="container"><p className="loading">加载中...</p></div>
  if (error) return <div className="container"><p className="error-msg">{error}</p></div>

  return (
    <div className="container">
      <h1 className="page-title">个人资料</h1>
      <form onSubmit={handleSubmit} className="card" style={{ maxWidth: 420 }}>
        <div className="form-group">
          <label>昵称</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="请输入昵称"
          />
        </div>
        {message && (
          <p className={message === '保存成功' ? 'success-msg' : 'error-msg'}>{message}</p>
        )}
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </form>
    </div>
  )
}
