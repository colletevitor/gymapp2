import { useState } from 'react'
import { useStore } from '../store/index'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react'

export default function History() {
  const { sessions, exercises, currentUserId, deleteSession } = useStore()
  const [expanded, setExpanded] = useState(null)
  const [showAll, setShowAll] = useState(false)

  const mySessions = sessions.filter(s => s.userId === currentUserId)
  const displayed = showAll ? mySessions : mySessions.slice(0, 20)

  const getExerciseName = (id) => exercises.find(e => e.id === id)?.name || id

  const getVolume = (session) =>
    session.exercises.reduce((t, ex) => t + ex.sets.filter(s => s.done).reduce((a, s) => a + s.weight * s.reps, 0), 0)

  if (mySessions.length === 0) return (
    <div>
      <h1 className="page-title">Histórico</h1>
      <div className="empty">
        <div className="empty-icon">📖</div>
        <h3>Sem treinos ainda</h3>
        <p style={{ fontSize: 14 }}>Complete seu primeiro treino para ver o histórico</p>
      </div>
    </div>
  )

  return (
    <div>
      <h1 className="page-title">Histórico</h1>
      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-value">{mySessions.length}</div>
          <div className="stat-label">Total de treinos</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {Math.round(mySessions.reduce((a, s) => a + (s.durationMinutes || 0), 0) / mySessions.length || 0)} min
          </div>
          <div className="stat-label">Duração média</div>
        </div>
      </div>

      {displayed.map(session => {
        const isOpen = expanded === session.id
        const vol = getVolume(session)
        const doneSets = session.exercises.reduce((a, ex) => a + ex.sets.filter(s => s.done).length, 0)
        const totalSets = session.exercises.reduce((a, ex) => a + ex.sets.length, 0)

        return (
          <div key={session.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <button onClick={() => setExpanded(isOpen ? null : session.id)} style={{ width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, background: 'none', cursor: 'pointer', color: 'var(--text)' }}>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <p style={{ fontWeight: 600, marginBottom: 3 }}>{session.templateName}</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, color: 'var(--text2)' }}>{format(new Date(session.date), "d 'de' MMM, HH:mm", { locale: ptBR })}</span>
                  {session.durationMinutes && <span className="badge badge-accent" style={{ fontSize: 11 }}>{session.durationMinutes} min</span>}
                  <span className="badge badge-blue" style={{ fontSize: 11 }}>{doneSets}/{totalSets} séries</span>
                  {vol > 0 && <span className="badge" style={{ fontSize: 11, background: 'var(--bg3)', color: 'var(--text2)' }}>{vol.toLocaleString('pt-BR')} kg vol.</span>}
                </div>
              </div>
              {isOpen ? <ChevronUp size={16} color="var(--text2)" /> : <ChevronDown size={16} color="var(--text2)" />}
            </button>

            {isOpen && (
              <div style={{ padding: '0 16px 14px', borderTop: '1px solid var(--border)' }}>
                {session.exercises.map((ex, i) => (
                  <div key={i} style={{ marginTop: 12 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>{getExerciseName(ex.exerciseId)}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {ex.sets.map((set, j) => (
                        <span key={j} style={{ fontSize: 12, padding: '4px 8px', borderRadius: 6, background: set.done ? '#c8f13515' : 'var(--bg3)', color: set.done ? 'var(--accent)' : 'var(--text3)', border: `1px solid ${set.done ? '#c8f13530' : 'var(--border)'}` }}>
                          {set.weight}kg × {set.reps}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {session.notes && <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 12, fontStyle: 'italic' }}>"{session.notes}"</p>}
                <button className="btn btn-danger btn-sm" style={{ marginTop: 14 }} onClick={() => { if (confirm('Deletar esse treino?')) deleteSession(session.id) }}>
                  <Trash2 size={13} /> Deletar
                </button>
              </div>
            )}
          </div>
        )
      })}

      {mySessions.length > 20 && !showAll && (
        <button className="btn btn-ghost btn-full" style={{ marginTop: 10 }} onClick={() => setShowAll(true)}>Ver todos ({mySessions.length})</button>
      )}
    </div>
  )
}
