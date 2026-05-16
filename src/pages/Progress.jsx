import { useState, useMemo } from 'react'
import { useStore } from '../store/index'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function Progress() {
  const { sessions, exercises, currentUserId } = useStore()
  const [selectedExId, setSelectedExId] = useState('')

  const mySessions = sessions.filter(s => s.userId === currentUserId)

  const exercisesWithData = useMemo(() => {
    const ids = new Set()
    mySessions.forEach(s => s.exercises.forEach(ex => {
      if (ex.sets.some(s => s.done && s.weight > 0)) ids.add(ex.exerciseId)
    }))
    return exercises.filter(e => ids.has(e.id))
  }, [mySessions, exercises])

  const currentExId = selectedExId || exercisesWithData[0]?.id || ''

  const progressData = useMemo(() => {
    if (!currentExId) return []
    const points = []
    ;[...mySessions].reverse().forEach(session => {
      const ex = session.exercises.find(e => e.exerciseId === currentExId)
      if (!ex) return
      const done = ex.sets.filter(s => s.done)
      if (!done.length) return
      points.push({
        date: session.date,
        maxWeight: Math.max(...done.map(s => s.weight)),
        totalVolume: done.reduce((a, s) => a + s.weight * s.reps, 0),
      })
    })
    return points.slice(-12)
  }, [currentExId, mySessions])

  const maxWeight = progressData.length ? Math.max(...progressData.map(d => d.maxWeight)) : 0
  const maxVolume = progressData.length ? Math.max(...progressData.map(d => d.totalVolume)) : 0

  const weeklyData = useMemo(() => {
    const weeks = {}
    mySessions.forEach(s => {
      const d = new Date(s.date)
      const ws = new Date(d)
      ws.setDate(d.getDate() - d.getDay())
      const key = format(ws, 'dd/MM')
      weeks[key] = (weeks[key] || 0) + 1
    })
    return Object.entries(weeks).slice(-8).map(([week, count]) => ({ week, count }))
  }, [mySessions])

  const maxFreq = weeklyData.length ? Math.max(...weeklyData.map(d => d.count)) : 1

  if (mySessions.length === 0) return (
    <div>
      <h1 className="page-title">Progresso</h1>
      <div className="empty">
        <div className="empty-icon">📈</div>
        <h3>Dados insuficientes</h3>
        <p style={{ fontSize: 14 }}>Complete alguns treinos para ver seu progresso</p>
      </div>
    </div>
  )

  return (
    <div>
      <h1 className="page-title">Progresso</h1>

      {weeklyData.length > 1 && (
        <div style={{ marginBottom: 24 }}>
          <p className="section-title">Treinos por semana</p>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80, padding: '4px 0' }}>
              {weeklyData.map((w, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 700 }}>{w.count}</span>
                  <div style={{ width: '100%', height: Math.max(6, (w.count / maxFreq) * 60), background: 'var(--accent)', borderRadius: '4px 4px 0 0', opacity: i === weeklyData.length - 1 ? 1 : 0.5 }} />
                  <span style={{ fontSize: 9, color: 'var(--text3)', whiteSpace: 'nowrap' }}>{w.week}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {exercisesWithData.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 32 }}>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>Marque séries como concluídas durante o treino para ver o progresso por exercício</p>
        </div>
      ) : (
        <div>
          <p className="section-title">Evolução por exercício</p>
          <div style={{ overflowX: 'auto', marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 8, paddingBottom: 4 }}>
              {exercisesWithData.map(ex => (
                <button key={ex.id} className={`chip ${currentExId === ex.id ? 'active' : ''}`} onClick={() => setSelectedExId(ex.id)} style={{ whiteSpace: 'nowrap' }}>
                  {ex.name}
                </button>
              ))}
            </div>
          </div>

          {progressData.length < 2 ? (
            <div className="card" style={{ textAlign: 'center', padding: 24 }}>
              <p style={{ color: 'var(--text2)', fontSize: 14 }}>Precisa de pelo menos 2 sessões com esse exercício</p>
            </div>
          ) : (
            <>
              <div className="card" style={{ marginBottom: 12 }}>
                <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12 }}>Carga máxima (kg)</p>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 100 }}>
                  {progressData.map((d, i) => {
                    const h = maxWeight > 0 ? Math.max(6, (d.maxWeight / maxWeight) * 80) : 6
                    const isLast = i === progressData.length - 1
                    return (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: 10, color: isLast ? 'var(--accent)' : 'var(--text3)', fontWeight: isLast ? 700 : 400 }}>{d.maxWeight}</span>
                        <div style={{ width: '100%', height: h, background: isLast ? 'var(--accent)' : 'var(--bg3)', borderRadius: '4px 4px 0 0', border: isLast ? 'none' : '1px solid var(--border2)' }} />
                        <span style={{ fontSize: 9, color: 'var(--text3)' }}>{format(new Date(d.date), 'd/M', { locale: ptBR })}</span>
                      </div>
                    )
                  })}
                </div>
                {progressData[progressData.length - 1]?.maxWeight === maxWeight && progressData.length > 1 && (
                  <div style={{ marginTop: 12, padding: '8px 12px', background: '#c8f13515', borderRadius: 8, border: '1px solid #c8f13530' }}>
                    <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 700 }}>🏆 PR atual: {maxWeight} kg</span>
                  </div>
                )}
              </div>

              <div className="card">
                <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12 }}>Volume total (kg × reps)</p>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80 }}>
                  {progressData.map((d, i) => {
                    const h = maxVolume > 0 ? Math.max(6, (d.totalVolume / maxVolume) * 60) : 6
                    const isLast = i === progressData.length - 1
                    return (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: '100%', height: h, background: isLast ? 'var(--blue)' : 'var(--bg3)', borderRadius: '4px 4px 0 0', border: isLast ? 'none' : '1px solid var(--border2)' }} />
                        <span style={{ fontSize: 9, color: 'var(--text3)' }}>{format(new Date(d.date), 'd/M', { locale: ptBR })}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
