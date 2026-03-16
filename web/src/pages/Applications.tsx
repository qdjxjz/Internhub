import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Application, Job } from '../types'
import { api, isLoggedIn } from '../api'

export default function Applications() {
  const navigate = useNavigate()
  const [list, setList] = useState<Application[]>([])
  const [jobs, setJobs] = useState<Record<number, Job>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login')
      return
    }
    api.getMyApplications()
      .then((apps) => {
        setList(apps)
        return api.getJobs()
      })
      .then((jobList) => {
        const map: Record<number, Job> = {}
        jobList.forEach((j) => { map[j.id] = j })
        setJobs(map)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [navigate])

  if (loading) return <div className="container"><p className="loading">加载中...</p></div>
  if (error) return <div className="container"><p className="error-msg">{error}</p></div>

  return (
    <div className="container">
      <h1 className="page-title">我的投递</h1>
      {list.length === 0 ? (
        <p className="empty">暂无投递记录</p>
      ) : (
        list.map((app) => {
          const job = jobs[app.job_id]
          return (
            <div key={app.id} className="card">
              <h3 className="card-job__title">{job ? job.title : `职位 #${app.job_id}`}</h3>
              {job && <p className="card-job__company">{job.company}</p>}
              <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <span className={`badge badge-${app.status === 'accepted' ? 'success' : app.status === 'rejected' ? 'rejected' : 'pending'}`}>
                  {app.status === 'pending' ? '待处理' : app.status === 'viewed' ? '已查看' : app.status === 'accepted' ? '已通过' : app.status === 'rejected' ? '已拒绝' : app.status}
                </span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  {new Date(app.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
