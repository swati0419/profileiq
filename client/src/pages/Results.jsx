import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'
import styles from './Results.module.css'

function ScoreCircle({ value, label }) {
  const color = value >= 75 ? 'var(--success)' : value >= 50 ? 'var(--warning)' : 'var(--danger)'
  const r = 30, circ = 2 * Math.PI * r
  const dash = (value / 100) * circ
  return (
    <div className={styles.scoreCircleWrap}>
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="none" stroke="var(--border)" strokeWidth="6" />
        <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 40 40)" />
        <text x="40" y="44" textAnchor="middle" fontSize="16" fontWeight="600" fill={color}>{value}</text>
      </svg>
      <p className={styles.scoreLabel}>{label}</p>
    </div>
  )
}

function ScoreBar({ name, score }) {
  const color = score >= 75 ? 'var(--success)' : score >= 50 ? 'var(--warning)' : 'var(--danger)'
  return (
    <div className={styles.barRow}>
      <div className={styles.barMeta}>
        <span>{name}</span>
        <span style={{ color }}>{score}%</span>
      </div>
      <div className={styles.barBg}>
        <div className={styles.barFill} style={{ width: `${score}%`, background: color }} />
      </div>
    </div>
  )
}

function Tag({ text, type }) {
  return <span className={`${styles.tag} ${styles[`tag_${type}`]}`}>{text}</span>
}

export default function Results() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    axios.get(`/api/assessments/${id}`)
      .then((r) => setData(r.data))
      .catch(() => setError('Could not load assessment.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className={styles.loading}>Loading assessment…</div>
  if (error) return <div className={styles.error}>{error} <Link to="/">Go back</Link></div>

  const radarData = data.sections.map((s) => ({ subject: s.name.replace(' ', '\n'), score: s.score, fullMark: 100 }))

  return (
    <div>
      <div className={styles.pageHeader}>
        <Link to="/" className={styles.back}>← New analysis</Link>
        <h1 className={styles.title}>Resume assessment</h1>
        <p className={styles.meta}>{data.roleType?.replace(/_/g, ' ')} · {new Date(data.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
      </div>

      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>ATS scores</h2>
        <div className={styles.scoreRow}>
          <ScoreCircle value={data.ats_score} label="ATS score" />
          <ScoreCircle value={data.keyword_match_score} label="Keyword match" />
          <ScoreCircle value={data.format_score} label="Format score" />
        </div>
        <div className={styles.bars}>
          {data.sections.map((s) => <ScoreBar key={s.name} name={s.name} score={s.score} />)}
        </div>
      </div>

      <div className={styles.twoCol}>
        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>Skill radar</h2>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData} outerRadius={70} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: 'var(--text-muted)', whiteSpace: 'pre' }} width={80} />
              <Tooltip formatter={(v) => `${v}%`} />
              <Radar name="Score" dataKey="score" stroke="#2d5be3" fill="#2d5be3" fillOpacity={0.18} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>Keyword analysis</h2>
          <p className={styles.kwLabel}>Found</p>
          <div className={styles.tags}>{data.keywords.found.map((k) => <Tag key={k} text={k} type="found" />)}</div>
          <p className={styles.kwLabel} style={{ marginTop: 12 }}>Missing</p>
          <div className={styles.tags}>{data.keywords.missing.map((k) => <Tag key={k} text={k} type="missing" />)}</div>
          {data.keywords.partial?.length > 0 && <>
            <p className={styles.kwLabel} style={{ marginTop: 12 }}>Partial</p>
            <div className={styles.tags}>{data.keywords.partial.map((k) => <Tag key={k} text={k} type="partial" />)}</div>
          </>}
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>Skill-gap analysis</h2>
        {data.skill_gaps.map((g) => (
          <div key={g.skill} className={styles.gapRow}>
            <div className={styles.barMeta}>
              <span>{g.skill}</span>
              <span className={styles.gapHint}>yours {g.resume_level}% · needed {g.required_level}%</span>
            </div>
            <div className={styles.barBg} style={{ position: 'relative' }}>
              <div className={styles.barFill} style={{ width: `${g.resume_level}%`, background: 'var(--accent)' }} />
              <div className={styles.gapMarker} style={{ left: `${g.required_level}%` }} />
            </div>
          </div>
        ))}
        <p className={styles.gapLegend}>
          <span className={styles.legendBlue} /> Your level &nbsp;
          <span className={styles.legendRed} /> Required level
        </p>
      </div>

      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>Improvement suggestions</h2>
       <ol className={styles.suggestions}>
  {data.suggestions.map((s, i) => <li key={i}>{s}</li>)}
</ol>
      </div>
    </div>
  )
}