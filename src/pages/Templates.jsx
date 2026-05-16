import { useState } from 'react'
import { useStore } from '../store/index'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, Edit2, Play, ChevronDown, ChevronUp, X, Check } from 'lucide-react'

export default function Templates() {
  const navigate = useNavigate()
  const { templates, exercises, addTemplate, updateTemplate, deleteTemplate, startSession, activeSession } = useStore()
  const [expanded, setExpanded] = useState(null)
  const [editing, setEditing] = useState(null)
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ name: '', exercises: [] })

  const startEdit = (tplId) => {
    const tpl = templates.find(t => t.id === tplId)
    if (!tpl) return
    setForm({ name: tpl.name, exercises: [...tpl.exercises] })
    setEditing(tplId)
    setShowNew(false)
  }

  const startNew = () => {
    setForm({ name: '', exercises: [] })
    setShowNew(true)
    setEditing(null)
  }

  const handleSave = () => {
    if (!form.name.trim() || form.exercises.length === 0) return
    if (editing) {
      updateTemplate(editing, { name: form.name.trim(), exercises: form.exercises })
      setEditing(null)
    } else {
      addTemplate({ name: form.name.trim(), exercises: form.exercises })
      setShowNew(false)
    }
  }

  const addExToForm = (exerciseId) => {
    if (form.exercises.find(e => e.exerciseId === exerciseId)) return
    setForm(f => ({ ...f, exercises: [...f.exercises, { exerciseId, defaultSets: 3, defaultReps: 12, defaultWeight: 20 }] }))
  }

  const removeExFromForm = (idx) => setForm(f => ({ ...f, exercises: f.exercises.filter((_, i) => i !== idx) }))

  const updateExInForm = (idx, field, value) => setForm(f => ({
    ...f, exercises: f.exercises.map((e, i) => i === idx ? { ...e, [field]: value } : e)
  }))

  const handleStart = (templateId) => {
    if (activeSession && !confirm('Tem um treino em andamento. Cancelar e iniciar novo?')) return
    startSession(templateId)
    navigate('/treino')
  }

  const isFormOpen = showNew || editing !== null

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Fichas</h1>
        <button className="btn btn-primary btn-sm" onClick={startNew}><Plus size={14} /> Nova</button>
      </div>

      {isFormOpen && (
        <div className="card" style={{ marginBottom: 16, borderColor: 'var(--accent)' }}>
          <div className="form-group">
            <label className="form-label">Nome da ficha</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Treino A — Peito e Tríceps" autoFocus />
          </div>

          <label className="form-label" style={{ marginBottom: 8 }}>Exercícios</label>
          {form.exercises.map((fe, i) => {
            const ex = exercises.find(e => e.id === fe.exerciseId)
            return (
              <div key={i} style={{ background: 'var(--bg3)', borderRadius: 8, padding: '10px 12px', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <p style={{ fontSize: 14, fontWeight: 500 }}>{ex?.name}</p>
                  <button className="btn btn-danger btn-icon" style={{ padding: 4 }} onClick={() => removeExFromForm(i)}><X size={14} /></button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  {[['Séries', 'defaultSets', fe.defaultSets], ['Reps', 'defaultReps', fe.defaultReps], ['Kg', 'defaultWeight', fe.defaultWeight]].map(([label, field, value]) => (
                    <div key={field}>
                      <label style={{ fontSize: 10, color: 'var(--text2)', display: 'block', marginBottom: 2 }}>{label}</label>
                      <input type="number" value={value} onChange={e => updateExInForm(i, field, parseFloat(e.target.value) || 0)} style={{ padding: '6px 8px', fontSize: 14 }} />
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          <div style={{ marginTop: 8, marginBottom: 14 }}>
            <label className="form-label">Adicionar exercício</label>
            <select value="" onChange={e => { if (e.target.value) addExToForm(e.target.value) }}>
              <option value="">Selecione...</option>
              {exercises.filter(e => !form.exercises.find(fe => fe.exerciseId === e.id)).map(e => (
                <option key={e.id} value={e.id}>{e.name} — {e.muscleGroup}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={!form.name.trim() || form.exercises.length === 0}><Check size={14} /> Salvar</button>
            <button className="btn btn-ghost btn-sm" onClick={() => { setShowNew(false); setEditing(null) }}><X size={14} /> Cancelar</button>
          </div>
        </div>
      )}

      {templates.length === 0 && !isFormOpen && (
        <div className="empty">
          <div className="empty-icon">📋</div>
          <h3>Sem fichas</h3>
          <p style={{ fontSize: 14, marginBottom: 16 }}>Crie fichas de treino para começar</p>
          <button className="btn btn-primary" onClick={startNew}>Criar ficha</button>
        </div>
      )}

      {templates.map(tpl => {
        const isOpen = expanded === tpl.id
        return (
          <div key={tpl.id} className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 10 }}>
            <button onClick={() => setExpanded(isOpen ? null : tpl.id)} style={{ width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', cursor: 'pointer', color: 'var(--text)' }}>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontWeight: 600 }}>{tpl.name}</p>
                <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>{tpl.exercises.length} exercícios</p>
              </div>
              {isOpen ? <ChevronUp size={16} color="var(--text2)" /> : <ChevronDown size={16} color="var(--text2)" />}
            </button>

            {isOpen && (
              <div style={{ padding: '0 16px 14px', borderTop: '1px solid var(--border)' }}>
                {tpl.exercises.map((te, i) => {
                  const ex = exercises.find(e => e.id === te.exerciseId)
                  return (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < tpl.exercises.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <span style={{ fontSize: 14 }}>{ex?.name || te.exerciseId}</span>
                      <span style={{ fontSize: 12, color: 'var(--text2)' }}>{te.defaultSets}×{te.defaultReps} · {te.defaultWeight}kg</span>
                    </div>
                  )
                })}
                <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                  <button className="btn btn-primary btn-sm" onClick={() => handleStart(tpl.id)}><Play size={13} fill="currentColor" /> Iniciar</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => startEdit(tpl.id)}><Edit2 size={13} /> Editar</button>
                  <button className="btn btn-danger btn-sm" onClick={() => { if (confirm(`Deletar "${tpl.name}"?`)) deleteTemplate(tpl.id) }}><Trash2 size={13} /></button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
