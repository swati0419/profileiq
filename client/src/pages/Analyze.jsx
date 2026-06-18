import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import styles from './Analyze.module.css'

const ROLE_TYPES = [
  { value: 'software_engineer', label: 'Software engineer' },
  { value: 'internship', label: 'SWE internship' },
  { value: 'frontend', label: 'Frontend developer' },
  { value: 'backend', label: 'Backend developer' },
  { value: 'fullstack', label: 'Full-stack developer' },
  { value: 'ml_engineer', label: 'ML / AI engineer' },
  { value: 'data_engineer', label: 'Data engineer' },
]

const LOADING_MSGS = [
  'Parsing resume content…',
  'Matching keywords against JD…',
  'Scoring ATS compatibility…',
  'Detecting skill gaps…',
  'Generating improvement suggestions…',
]

export default function Analyze() {
  const [resumeText, setResumeText] = useState('')
  const [jdText, setJdText] = useState('')
  const [roleType, setRoleType] = useState('software_engineer')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)
  const msgTimerRef = useRef(null)
  const navigate = useNavigate()

  function handleFile(f) {
    if (!f) return
    if (!['application/pdf', 'text/plain'].includes(f.type)) {
      setError('Only PDF or .txt files are supported.')
      return
    }
    setFile(f)
    setError('')
    if (f.type === 'text/plain') {
      const reader = new FileReader()
      reader.onload = (e) => setResumeText(e.target.result)
      reader.readAsText(f)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!jdText.trim()) { setError('Please paste a job description.'); return }
    if (!resumeText.trim() && !file) { setError('Please upload a resume or paste resume text.'); return }

    setLoading(true)
    let idx = 0
    setLoadingMsg(LOADING_MSGS[0])
    msgTimerRef.current = setInterval(() => {
      idx = (idx + 1) % LOADING_MSGS.length
      setLoadingMsg(LOADING_MSGS[idx])
    }, 2000)

    try {
      const formData = new FormData()
      if (file && file.type === 'application/pdf') formData.append('resume', file)
      formData.append('resumeText', resumeText)
      formData.append('jobDescription', jdText)
      formData.append('roleType', roleType)

      const { data } = await api.post('/api/resume/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      clearInterval(msgTimerRef.current)
      navigate(`/results/${data.id}`)
    } catch (err) {
      clearInterval(msgTimerRef.current)
      setError(err.response?.data?.error || 'Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Evaluate your resume</h1>
        <p className={styles.subtitle}>Upload your resume and a job description to get ATS scoring, keyword analysis, and skill-gap detection.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={styles.card}>
          <p className={styles.cardLabel}>Resume</p>
          <div
            className={`${styles.dropzone} ${file ? styles.dropzoneHasFile : ''} ${dragOver ? styles.dropzoneDrag : ''}`}
            onClick={() => fileInputRef.current.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt"
              style={{ display: 'none' }}
              onChange={(e) => handleFile(e.target.files[0])}
            />
            {file ? (
              <>
                <span className={styles.fileIcon}>📄</span>
                <p className={styles.fileName}>{file.name}</p>
                <p className={styles.fileHint}>Click to change file</p>
              </>
            ) : (
              <>
                <span className={styles.uploadIcon}>↑</span>
                <p className={styles.dropLabel}>Click to upload PDF or .txt</p>
                <p className={styles.dropHint}>or drag and drop</p>
              </>
            )}
          </div>

          <p className={styles.orDivider}>or paste text below</p>
          <textarea
            className={styles.textarea}
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your full resume content here…"
            rows={6}
          />
        </div>

        <div className={styles.card}>
          <p className={styles.cardLabel}>Job description</p>
          <textarea
            className={styles.textarea}
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste the job description you're targeting…"
            rows={6}
            required
          />

          <div className={styles.row}>
            <div className={styles.selectWrap}>
              <p className={styles.cardLabel}>Role type</p>
              <select className={styles.select} value={roleType} onChange={(e) => setRoleType(e.target.value)}>
                {ROLE_TYPES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <button type="submit" className={styles.btn} disabled={loading}>
              {loading ? loadingMsg : 'Analyze resume →'}
            </button>
          </div>
        </div>

        {error && <p className={styles.error}>{error}</p>}
      </form>
    </div>
  )
} 
