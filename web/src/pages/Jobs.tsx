import { useEffect, useState } from 'react'
import type { Job } from '../types'
import { api, isLoggedIn } from '../api'

export default function Jobs() {
  const [list, setList] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [applying, setApplying] = useState<Record<number, boolean>>({})

  useEffect(() => {
    api.getJobs()
      .then(setList)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const handleApply = (jobId: number) => {
    if (!isLoggedIn()) {
      window.location.href = '/login'
      return
    }
    setApplying((p) => ({ ...p, [jobId]: true }))
    api.createApplication(jobId)
      .then(() => {
        setApplying((p) => ({ ...p, [jobId]: false }))
        alert('投递成功')
      })
      .catch((e) => {
        setApplying((p) => ({ ...p, [jobId]: false }))
        alert(e.message || '投递失败')
      })
  }

  if (loading) return <div className="container"><p className="loading">加载中...</p></div>
  if (error) return <div className="container"><p className="error-msg">{error}</p></div>

  return (
    <div className="container">
      <h1 className="page-title">职位列表</h1>
      {list.length === 0 ? (
        <p className="empty">暂无职位</p>
      ) : (
        list.map((job) => (
          <div key={job.id} className="card card-job">
            <div className="card-job__main">
              <h3 className="card-job__title">{job.title}</h3>
              <p className="card-job__company">{job.company}</p>
              {job.link && (
                <a href={job.link} target="_blank" rel="noopener noreferrer" className="card-job__link">
                  查看链接
                </a>
              )}
            </div>
            {isLoggedIn() && (
              <button
                type="button"
                className="btn btn-primary"
                disabled={!!applying[job.id]}
                onClick={() => handleApply(job.id)}
              >
                {applying[job.id] ? '投递中...' : '投递'}
              </button>
            )}
          </div>
        ))
      )}
    </div>
  )
}
