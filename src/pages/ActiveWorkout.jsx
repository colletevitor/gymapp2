import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/index'
import { Check, Plus, X, CheckCircle } from 'lucide-react'

function Stopwatch({ startTime }) {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    const start = new Date(startTime).getTime()
    const interval = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000)
    return () => clearInterval(interval)
  }, [startTime])
  const h = Math.floor(elapsed / 3600)
  const m = Math.floor((elapsed % 3600) / 60)
  const s = elapsed % 60
  const parts = h > 0
    ? [h, m, s].map(v => String(v).padStart(2, '0')).join(':')
    : [m, s].map(v => String(v).padStart(2, '0')).join(':')
  return <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>{parts}</span>
}

export default function ActiveWorkout() {
  const navigate = useNavigate()
  const { activeSession, exercises, updateActiveSession, finishSession, cancelSession } = useStore()
  const [notes, setNotes] = useState('')
  const [showFinish, setShowFinish] = useState(false)

  if (!activeSession) { navigate('/'); return null }

  const getExercise = (id) => exercises.find(e => e.id === id)

  const updateSet = (exIdx, setIdx, field, value) => {
    const updated = { ...activeSession }
    updated.exercises = updated.exercises.map((ex, i) => i !== exIdx ? ex : {
      ...ex, sets: ex.sets.map((s, j) => j !== setIdx ? s : { ...s, [field]: value })
    })
    updateActiveSession(updated)
  }

  const toggleSetDone = (exIdx, setIdx) => {
    const updated = { ...activeSession }
    updated.exercises = updated.exercises.map((ex, i) => i !== exIdx ? ex : {
      ...ex, sets: ex.sets.map((s, j) => j !== setIdx ? s : { ...s, done: !s.done })
    })
    updateActiveSession(updated)
  }

  const addSet = (exIdx) => {
    const updated = { ...activeSession }
    const lastSet = updated.exercises[exIdx].sets.slice(-1)[0]
    updated.exercises = updated.exercises.map((ex, i) => i !== exIdx ? ex : {
      ...ex, sets: [...ex.sets, { id: Math.random().toString(36).slice(2), weight: lastSet?.weight || 0, reps: lastSet?.reps || 10, done: false }]
    })
    updateActiveSession(updated)
  }

  const removeSet = (exIdx, setIdx) => {
    const updated = { ...activeSession }
    updated.exercises = updated.exercises.map((ex, i) => i !== exIdx ? ex : {
      ...ex, sets: ex.sets.filter((_, j) => j !== setIdx)
    })
    updateActiveSession(updated)
  }

  const handleCancel = () => {
    if (confirm('Cancelar o treino? O progresso será perdido.')) {
      cancelSession()
      navigate('/')
    }
  }

  const handleFinish = () => {
    const duration = Math.max(1, Math.round((Date.now() - new Date(activeSession.date).getTime()) / 60000))
    finishSession(duration, notes)
    navigate('/')
  }

  const totalSets = activeSession.exercises.reduce((a, ex) => a + ex.sets.length, 0)
  const doneSets = activeSession.exercises.reduce((a, ex) => a + ex.sets.filter(s => s.done).length, 0)
  const progress = totalSets > 0 ? (doneSets / totalSets) * 100 : 0

  return (
    <div className="app" style={{ background: 'var(--bg)' }}>
      {/* Header — só cronômetro e progresso */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'var(--bg)', borderBottom: '1px solid var(--border)', padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div>
            <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 2 }}>{activeSession.templateName}</p>
            <Stopwatch startTime={activeSession.date} />
          </div>
          <span style={{ fontSize: 13, color: 'var(--text2)' }}>{doneSets}/{totalSets} séries</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Exercises */}
      <div style={{ padding: '16px', overflowY: 'auto', flex: 1 }}>
        {activeSession.exercises.map((ex, exIdx) => {
          const exercise = getExercise(ex.exerciseId)
          const allDone = ex.sets.length > 0 && ex.sets.every(s => s.done)
          return (
            <div key={exIdx} className="card" style={{ marginBottom: 12, borderColor: allDone ? 'var(--accent)' : 'var(--border)' }}>
              <div className="card-header">
                <div>
                  <p style={{ fontWeight: 600, fontSize: 15 }}>{exercise?.name || 'Exercício'}</p>
                  <span className="badge badge-accent" style={{ fontSize: 11, marginTop: 2 }}>{exercise?.muscleGroup}</span>
                </div>
                {allDone && <CheckCircle size={20} color="var(--accent)" />}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 1fr 44px', gap: 8, padding: '4px 0', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'center' }}>#</span>
                <span style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'center' }}>Kg</span>
                <span style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'center' }}>Reps</span>
                <span style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'center' }}>✓</span>
              </div>

              {ex.sets.map((set, setIdx) => (
                <div key={set.id} className="set-row" style={{ opacity: set.done ? 0.6 : 1 }}>
                  <span className="set-num" style={{ cursor: 'pointer' }} onClick={() => removeSet(exIdx, setIdx)} title="Clique para remover">
                    {setIdx + 1}
                  </span>
                  <input type="number" value={set.weight} onChange={e => updateSet(exIdx, setIdx, 'weight', parseFloat(e.target.value) || 0)} style={{ textAlign: 'center', padding: '8px', fontSize: 15 }} step="0.5" />
                  <input type="number" value={set.reps} onChange={e => updateSet(exIdx, setIdx, 'reps', parseInt(e.target.value) || 0)} style={{ textAlign: 'center', padding: '8px', fontSize: 15 }} />
                  <button className={`set-done ${set.done ? 'checked' : ''}`} onClick={() => toggleSetDone(exIdx, setIdx)}>
                    <Check size={16} />
                  </button>
                </div>
              ))}

              <button className="btn btn-ghost btn-sm btn-full" style={{ marginTop: 10, borderStyle: 'dashed' }} onClick={() => addSet(exIdx)}>
                <Plus size={14} /> Série
              </button>
            </div>
          )
        })}

        {/* Botões Finalizar e Cancelar no final da página */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8, paddingBottom: 32 }}>
          <button
            className="btn btn-primary btn-full"
            style={{ padding: '16px', fontSize: 16, fontWeight: 700 }}
            onClick={() => setShowFinish(true)}
          >
            <Check size={18} /> Finalizar Treino
          </button>
          <button
            className="btn btn-danger btn-full"
            style={{ padding: '14px', fontSize: 15 }}
            onClick={handleCancel}
          >
            <X size={16} /> Cancelar Treino
          </button>
        </div>
      </div>

      {/* Modal finalizar */}
      {showFinish && (
        <div className="modal-overlay" onClick={() => setShowFinish(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Finalizar treino</h2>
            <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 20 }}>{doneSets}/{totalSets} séries concluídas</p>
            <div className="form-group">
              <label className="form-label">Observações (opcional)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Como foi o treino?" rows={3} style={{ resize: 'none' }} />
            </div>
            <button className="btn btn-primary btn-full" style={{ marginBottom: 10 }} onClick={handleFinish}>
              <Check size={16} /> Salvar treino
            </button>
            <button className="btn btn-ghost btn-full" onClick={() => setShowFinish(false)}>
              Continuar treinando
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
