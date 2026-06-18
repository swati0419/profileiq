import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import styles from './History.module.css'

function ScoreBadge({ value }) {
  const cls = value >= 75 ? styles.badgeGreen : value >= 50 ? styles.badgeAmber : styles.badgeRed
  return <span className={`${styles.badge} ${cls}`}>{value}%</span>
}

export default function History() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/assessments')
      .then((r) => setItems(r.data))
      .finally(() => setLoading(false))
  }, [])

  async function deleteItem(id) {
    if (!confirm('Delete this assessment?')) return
    await api.delete(`/api/assessments/${id}`)
    setItems((prev) => prev.filter((i) => i._id !== id))
  }

  if (loading) return <p className={styles.loading}>Loading history…</p>

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Assessment history</h1>
        <p className={styles.subtitle}>{items.length} resume{items.length !== 1 ? 's' : ''} analyzed</p>
      </div>

      {items.length === 0 ? (
        <div className={styles.empty}>
          <p>No assessments yet.</p>
          <Link to="/">Analyze your first resume →</Link>
        </div>
      ) : (
        <div className={styles.list}>
          {items.map((item) => (
            <div key={item._id} className={styles.row}>
              <div className={styles.rowMain}>
                <p className={styles.rowTitle}>{item.fileName || 'Pasted resume'}</p>
                <p className={styles.rowMeta}>{item.roleType?.replace(/_/g, ' ')} · {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
              <div className={styles.rowScores}>
                <ScoreBadge value={item.ats_score} />
                <span className={styles.scoreHint}>ATS</span>
                <ScoreBadge value={item.keyword_match_score} />
                <span className={styles.scoreHint}>KW</span>
              </div>
              <div className={styles.rowActions}>
                <Link to={`/results/${item._id}`} className={styles.viewBtn}>View →</Link>
                <button className={styles.deleteBtn} onClick={() => deleteItem(item._id)}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}