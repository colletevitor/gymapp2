import { useState } from 'react'
import { useStore } from '../store/index'
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react'

const MUSCLE_GROUPS = ['Peito', 'Costas', 'Pernas', 'Ombros', 'Bíceps', 'Tríceps', 'Abdômen', 'Glúteo', 'Panturrilha', 'Cardio', 'Outro']

export default function Exercises() {
  const { exercises, addExercise, updateExercise, deleteExercise } = useStore()
  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ name: '', muscleGroup: MUSCLE_GROUPS[0], notes: '' })
  const [search, setSearch] = useState('')
  const [filterGroup, setFilterGroup] = useState('')

  const filtered = exercises.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase())
    const matchGroup = !filterGroup || e.muscleGroup === filterGroup
    return matchSearch && matchGroup
  })

  const grouped = MUSCLE_GROUPS.reduce((acc, g) => {
    const items = filtered.filter(e => e.muscleGroup === g)
    if (items.length) acc[g] = items
    return acc
  }, {})

  const startEdit = (ex) => {
    setEditId(ex.id)
    setForm({ name: ex.name, muscleGroup: ex.muscleGroup, notes: ex.notes || '' })
    setShowAdd(false)
  }

  const handleSave = () => {
    if (!form.name.trim()) return
    if (editId) {
      updateExercise(editId, { name: form.name.trim(), muscleGroup: form.muscleGroup, notes: form.notes })
      setEditId(null)
    } else {
      addExercise({ name: form.name.trim(), muscleGroup: form.muscleGroup, notes: form.notes })
      setShowAdd(false)
    }
    setForm({ name: '', muscleGroup: MUSCLE_GROUPS[0], notes: '' })
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Exercícios</h1>
        <button className="btn btn-primary btn-sm" onClick={() => { setShowAdd(true); setEditId(null); setForm({ name: '', muscleGroup: MUSCLE_GROUPS[0], notes: '' }) }}>
          <Plus size={14} /> Novo
        </button>
      </div>

      {(showAdd || editId) && (
        <div className="card" style={{ marginBottom: 16, borderColor: 'var(--accent)' }}>
          <div className="form-group">
            <label className="form-label">Nome</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Supino Reto" autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Grupo muscular</label>
            <select value={form.muscleGroup} onChange={e => setForm(f => ({ ...f, muscleGroup: e.target.value }))}>
              {MUSCLE_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Obs. (opcional)</label>
            <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Ex: Pegada larga" />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={!form.name.trim()}><Check size={14} /> Salvar</button>
            <button className="btn btn-ghost btn-sm" onClick={() => { setShowAdd(false); setEditId(null) }}><X size={14} /> Cancelar</button>
          </div>
        </div>
      )}

      <div className="form-group">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar exercício..." />
      </div>

      <div className="chip-row" style={{ marginBottom: 16 }}>
        <button className={`chip ${!filterGroup ? 'active' : ''}`} onClick={() => setFilterGroup('')}>Todos</button>
        {MUSCLE_GROUPS.filter(g => exercises.some(e => e.muscleGroup === g)).map(g => (
          <button key={g} className={`chip ${filterGroup === g ? 'active' : ''}`} onClick={() => setFilterGroup(g === filterGroup ? '' : g)}>{g}</button>
        ))}
      </div>

      {Object.entries(grouped).map(([group, items]) => (
        <div key={group} style={{ marginBottom: 20 }}>
          <p className="section-title">{group}</p>
          {items.map(ex => (
            <div key={ex.id} className="card" style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontWeight: 500, marginBottom: ex.notes ? 4 : 0 }}>{ex.name}</p>
                  {ex.notes && <p style={{ fontSize: 12, color: 'var(--text2)' }}>{ex.notes}</p>}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-ghost btn-icon" onClick={() => startEdit(ex)}><Edit2 size={14} /></button>
                  <button className="btn btn-danger btn-icon" onClick={() => { if (confirm(`Deletar "${ex.name}"?`)) deleteExercise(ex.id) }}><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}

      {filtered.length === 0 && <div className="empty"><div className="empty-icon">🔍</div><h3>Nenhum resultado</h3></div>}
    </div>
  )
}
