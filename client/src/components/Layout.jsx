import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import styles from './Layout.module.css'

export default function Layout() {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    document.body.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <rect width="22" height="22" rx="6" fill="#2d5be3" />
            <path d="M6 16V7l5 3 5-3v9" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className={styles.brandName}>ProfileIQ</span>
        </div>
        <nav className={styles.nav}>
          <NavLink to="/" end className={({ isActive }) => isActive ? styles.navLinkActive : styles.navLink}>Analyze</NavLink>
          <NavLink to="/history" className={({ isActive }) => isActive ? styles.navLinkActive : styles.navLink}>History</NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? styles.navLinkActive : styles.navLink}>Dashboard</NavLink>
          <button className={styles.themeBtn} onClick={() => setDark(!dark)}>
            {dark ? '☀️' : '🌙'}
          </button>
          {user && (
            <div className={styles.userWrap}>
              <span className={styles.userName}>👤 {user.name}</span>
              <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
            </div>
          )}
        </nav>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}