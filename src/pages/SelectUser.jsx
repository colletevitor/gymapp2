import { useState } from 'react'
import { useStore } from '../store/index'

const COLORS = [
  { value: '#c8f135', label: 'Verde' },
  { value: '#4488ff', label: 'Azul' },
  { value: '#ff8844', label: 'Laranja' },
  { value: '#aa88ff', label: 'Roxo' },
  { value: '#ff6688', label: 'Rosa' },
  { value: '#44ddcc', label: 'Teal' },
]

export default function SelectUser() {
  const { users, setCurrentUser, addUser } = useStore()
  const [showNew, setShowNew] = useState(users.length === 0)
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLORS[0].value)

  const handleCreate = () => {
    if (!name.trim()) return
    addUser(name.trim(), color)
    setShowNew(false)
    setName('')
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', background: 'var(--bg)' }}>
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, background: 'var(--bg2)', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, border: '1px solid var(--border)', margin: '0 auto 16px' }}>
          💪
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, letterSpacing: -1 }}>
          Gym<span style={{ color: 'var(--accent)' }}>App</span>
        </h1>
        <p style={{ color: 'var(--text2)', marginTop: 4, fontSize: 14 }}>Quem vai treinar?</p>
      </div>

      {users.length > 0 && !showNew && (
        <div style={{ width: '100%', maxWidth: 320 }}>
          {users.map(user => (
            <button
              key={user.id}
              onClick={() => setCurrentUser(user.id)}
              style={{ width: '100%', background: 'var(--bg2)', border: `1px solid var(--border)`, borderRadius: 'var(--radius)', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10, cursor: 'pointer', transition: 'border-color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = user.color}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: user.color + '22', border: `2px solid ${user.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: user.color, fontFamily: 'var(--font-display)', flexShrink: 0 }}>
                {user.name[0].toUpperCase()}
              </div>
              <span style={{ fontSize: 17, fontWeight: 500 }}>{user.name}</span>
            </button>
          ))}
          <button onClick={() => setShowNew(true)} className="btn btn-ghost btn-full" style={{ marginTop: 4 }}>
            + Adicionar perfil
          </button>
        </div>
      )}

      {showNew && (
        <div style={{ width: '100%', maxWidth: 320 }}>
          <div className="form-group">
            <label className="form-label">Seu nome</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: João" autoFocus onKeyDown={e => e.key === 'Enter' && handleCreate()} />
          </div>
          <div className="form-group">
            <label className="form-label">Cor</label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {COLORS.map(c => (
                <button key={c.value} onClick={() => setColor(c.value)} style={{ width: 36, height: 36, borderRadius: '50%', background: c.value, border: color === c.value ? '3px solid white' : '2px solid transparent', cursor: 'pointer', transition: 'all 0.15s', outline: color === c.value ? `2px solid ${c.value}` : 'none', outlineOffset: 2 }} />
              ))}
            </div>
          </div>
          <button className="btn btn-primary btn-full" onClick={handleCreate} disabled={!name.trim()}>Entrar</button>
          {users.length > 0 && (
            <button className="btn btn-ghost btn-full" style={{ marginTop: 8 }} onClick={() => setShowNew(false)}>Cancelar</button>
          )}
        </div>
      )}
    </div>
  )
}
