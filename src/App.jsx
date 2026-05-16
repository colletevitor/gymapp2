import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store/index'
import Layout from './components/Layout'
import SelectUser from './pages/SelectUser'
import Home from './pages/Home'
import ActiveWorkout from './pages/ActiveWorkout'
import History from './pages/History'
import Progress from './pages/Progress'
import Exercises from './pages/Exercises'
import Templates from './pages/Templates'

function darken(hex) {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.max(0, (n >> 16) - 30)
  const g = Math.max(0, ((n >> 8) & 0xff) - 30)
  const b = Math.max(0, (n & 0xff) - 30)
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`
}

function contrastColor(hex) {
  const n = parseInt(hex.slice(1), 16)
  const r = (n >> 16) & 0xff
  const g = (n >> 8) & 0xff
  const b = n & 0xff
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return lum > 0.5 ? '#0f0f0f' : '#ffffff'
}

export default function App() {
  const currentUserId = useStore(s => s.currentUserId)
  const users = useStore(s => s.users)
  const currentUser = users.find(u => u.id === currentUserId)

  useEffect(() => {
    const color = currentUser?.color || '#c8f135'
    document.documentElement.style.setProperty('--accent', color)
    document.documentElement.style.setProperty('--accent2', darken(color))
    document.documentElement.style.setProperty('--accent-text', contrastColor(color))
  }, [currentUser?.color])

  if (!currentUserId || !users.find(u => u.id === currentUserId)) {
    return <SelectUser />
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/treino" element={<ActiveWorkout />} />
        <Route path="/historico" element={<History />} />
        <Route path="/progresso" element={<Progress />} />
        <Route path="/exercicios" element={<Exercises />} />
        <Route path="/fichas" element={<Templates />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}
