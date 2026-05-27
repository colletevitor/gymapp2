import { useState, useRef } from 'react'
import { useStore } from '../store/index'
import { Download, Upload } from 'lucide-react'

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
  const [msg, setMsg] = useState('')
  const fileInputRef = useRef(null)

  const handleCreate = () => {
    if (!name.trim()) return
    addUser(name.trim(), color)
    setShowNew(false)
    setName('')
  }

  // EXPORTAR — salva todos os dados do usuário selecionado
  const handleExport = (userId) => {
    const state = useStore.getState()
    const user = state.users.find(u => u.id === userId)
    if (!user) return

    const userSessions = state.sessions.filter(s => s.userId === userId)

    // Exercícios usados nas sessões e fichas
    const usedExerciseIds = new Set()
    userSessions.forEach(s => s.exercises.forEach(e => usedExerciseIds.add(e.exerciseId)))
    state.templates.forEach(t => t.exercises.forEach(e => usedExerciseIds.add(e.exerciseId)))

    const exportData = {
      gymapp: true,
      version: 2,
      type: 'profile',
      exportedAt: new Date().toISOString(),
      user,
      sessions: userSessions,
      templates: state.templates,
      exercises: state.exercises.filter(e => usedExerciseIds.has(e.id)),
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `perfil_${user.name.replace(/[^a-z0-9]/gi, '_')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // IMPORTAR — restaura usuário, fichas, exercícios e histórico
  const handleImport = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target.result)

        if (!data.gymapp || data.type !== 'profile' || !data.user) {
          setMsg('❌ Arquivo inválido.')
          setTimeout(() => setMsg(''), 3000)
          return
        }

        const state = useStore.getState()

        // Importa exercícios novos
        data.exercises?.forEach(ex => {
          if (!state.exercises.find(e => e.id === ex.id)) {
            state.addExercise(ex)
          }
        })

        // Importa fichas novas
        data.templates?.forEach(tpl => {
          if (!state.templates.find(t => t.id === tpl.id)) {
            state.addTemplate({ ...tpl })
          }
        })

        // Importa ou atualiza o usuário
        const existingUser = state.users.find(u => u.id === data.user.id)
        if (!existingUser) {
          // Adiciona o usuário preservando o ID original
          useStore.setState(s => ({
            users: [...s.users, data.user]
          }))
        }

        // Importa sessões que ainda não existem
        const existingSessionIds = new Set(state.sessions.map(s => s.id))
        const newSessions = (data.sessions || []).filter(s => !existingSessionIds.has(s.id))
        if (newSessions.length > 0) {
          useStore.setState(s => ({
            sessions: [...newSessions, ...s.sessions]
          }))
        }

        setMsg(`✅ Perfil de ${data.user.name} importado!`)
        setTimeout(() => setMsg(''), 3000)
      } catch {
        setMsg('❌ Erro ao ler o arquivo.')
        setTimeout(() => setMsg(''), 3000)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
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

      {/* Mensagem de feedback */}
      {msg && (
        <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: msg.startsWith('✅') ? '#c8f13515' : '#ff444415', border: `1px solid ${msg.startsWith('✅') ? '#c8f13530' : '#ff444430'}`, color: msg.startsWith('✅') ? 'var(--accent)' : 'var(--red)', fontSize: 14, marginBottom: 14, width: '100%', maxWidth: 320, textAlign: 'center' }}>
          {msg}
        </div>
      )}

      {users.length > 0 && !showNew && (
        <div style={{ width: '100%', maxWidth: 320 }}>
          {users.map(user => (
            <div key={user.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              {/* Botão de entrar */}
              <button
                onClick={() => setCurrentUser(user.id)}
                style={{ flex: 1, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', transition: 'border-color 0.15s', color: 'var(--text)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = user.color}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: user.color + '22', border: `2px solid ${user.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: user.color, fontFamily: 'var(--font-display)', flexShrink: 0 }}>
                  {user.name[0].toUpperCase()}
                </div>
                <span style={{ fontSize: 17, fontWeight: 500 }}>{user.name}</span>
              </button>

              {/* Botão exportar perfil */}
              <button
                onClick={() => handleExport(user.id)}
                title="Exportar perfil"
                style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', background: 'var(--bg2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)', flexShrink: 0, cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = user.color; e.currentTarget.style.color = user.color }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text2)' }}
              >
                <Download size={16} />
              </button>
            </div>
          ))}

          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button onClick={() => setShowNew(true)} className="btn btn-ghost btn-full">
              + Novo perfil
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-ghost"
              style={{ whiteSpace: 'nowrap', gap: 6 }}
              title="Importar perfil"
            >
              <Upload size={14} /> Importar
            </button>
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
          </div>
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

      {/* Importar quando não tem nenhum usuário */}
      {users.length === 0 && !showNew && (
        <div style={{ marginTop: 16 }}>
          <button onClick={() => fileInputRef.current?.click()} className="btn btn-ghost" style={{ gap: 8 }}>
            <Upload size={14} /> Importar perfil existente
          </button>
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
        </div>
      )}
    </div>
  )
}
