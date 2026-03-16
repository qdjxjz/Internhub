import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { RecommendResult } from '../types'
import { api, isLoggedIn } from '../api'

export default function Recommendations() {
  const navigate = useNavigate()
  const [data, setData] = useState<RecommendResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login')
      return
    }
    api.getRecommendations()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [navigate])

  if (loading) return <div className="container"><p className="loading">加载中...</p></div>
  if (error) return <div className="container"><p className="error-msg">{error}</p></div>
  if (!data) return null

  const { list, summary, ai_used } = data

  return (
    <div className="container">
      <h1 className="page-title">岗位推荐</h1>
      {summary && <p className="page-subtitle">{summary}</p>}
      {ai_used !== undefined && (
        <p className="page-subtitle" style={{ marginTop: '-1rem' }}>
          {ai_used ? '已使用 AI 推荐' : '按时间排序'}
        </p>
      )}
      {list.length === 0 ? (
        <p className="empty">暂无推荐（可能已投递全部职位）</p>
      ) : (
        list.map((item) => (
          <div key={item.job.id} className="card">
            <h3 className="card-job__title">{item.job.title}</h3>
            <p className="card-job__company">{item.job.company}</p>
            {item.reason && <div className="card-reason">{item.reason}</div>}
            {item.job.link && (
              <a href={item.job.link} target="_blank" rel="noopener noreferrer" className="card-job__link" style={{ marginTop: '0.75rem' }}>
                查看链接
              </a>
            )}
          </div>
        ))
      )}
    </div>
  )
}
