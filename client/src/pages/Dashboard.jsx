 import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'
import styles from './Dashboard.module.css'

function StatCard({ label, value, unit = '%' }) {
  return (
    <div className={styles.statCard}>
      <p className={styles.statVal}>{typeof value === 'number' ? Math.round(value) : '—'}{unit}</p>
      <p className={styles.statLabel}>{label}</p>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/api/assessments/stats/summary'),
      api.get('/api/assessments'),
    ]).then(([s, h]) => {
      setStats(s.data)
      setHistory(h.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <p className={styles.loading}>Loading dashboard…</p>

  if (!stats || stats.total === 0) {
    return (
      <div className={styles.empty}>
        <p>No data yet. <Link to="/">Analyze a resume</Link> to see analytics.</p>
      </div>
    )
  }

  const trendData = [...history].reverse().map((item, i) => ({
    index: i + 1,
    ATS: item.ats_score,
    Keywords: item.keyword_match_score,
  }))

  const roleBreakdown = Object.entries(
    history.reduce((acc, item) => {
      const r = item.roleType?.replace(/_/g, ' ') || 'unknown'
      acc[r] = (acc[r] || 0) + 1
      return acc
    }, {})
  ).map(([name, count]) => ({ name, count }))

  const COLORS = ['#2d5be3', '#0f6e56', '#BA7517', '#993556', '#534AB7', '#993C1D']

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Analytics dashboard</h1>
        <p className={styles.subtitle}>Aggregated across {stats.total} assessment{stats.total !== 1 ? 's' : ''}</p>
      </div>

      <div className={styles.statsGrid}>
        <StatCard label="Total assessments" value={stats.total} unit="" />
        <StatCard label="Avg ATS score" value={stats.avg_ats} />
        <StatCard label="Avg keyword match" value={stats.avg_keyword} />
        <StatCard label="Avg format score" value={stats.avg_format} />
      </div>

      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>Score trend</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={trendData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
            <XAxis dataKey="index" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} height={36} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
            <Tooltip formatter={(v) => `${v}%`} />
            <Bar dataKey="ATS" fill="#2d5be3" radius={[3, 3, 0, 0]} maxBarSize={24} />
            <Bar dataKey="Keywords" fill="#0f6e56" radius={[3, 3, 0, 0]} maxBarSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>Assessments by role type</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={roleBreakdown} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" horizontal={false} />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
            <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
            <Tooltip />
            <Bar dataKey="count" radius={[0, 3, 3, 0]} maxBarSize={20}>
              {roleBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}