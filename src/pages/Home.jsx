import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/index'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Play, ChevronRight } from 'lucide-react'

export default function Home() {
  const navigate = useNavigate()
  const { users, currentUserId, templates, sessions, activeSession, startSession, setCurrentUser } = useStore()
  const currentUser = users.find(u => u.id === currentUserId)

  const mySessions = sessions.filter(s => s.userId === currentUserId)
  const lastSession = mySessions[0]
  const weekSessions = mySessions.filter(s => {
    const diff = (Date.now() - new Date(s.date).getTime()) / (1000 * 60 * 60 * 24)
    return diff <= 7
  }).length

  const handleStart = (templateId) => {
    if (activeSession && !confirm('Tem um treino em andamento. Cancelar e iniciar novo?')) return
    startSession(templateId)
    navigate('/treino')
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <p style={{ fontSize: 13, color: 'var(--text2)' }}>{format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, letterSpacing: -0.5 }}>
            Oi, {currentUser?.name?.split(' ')[0]} 👋
          </h1>
        </div>
        <button
          onClick={() => setCurrentUser('')}
          style={{ width: 44, height: 44, borderRadius: '50%', background: (currentUser?.color || '#888') + '22', border: `2px solid ${currentUser?.color || '#888'}`, color: currentUser?.color || '#888', fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {currentUser?.name?.[0].toUpperCase()}
        </button>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value">{mySessions.length}</div>
          <div className="stat-label">Total de treinos</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{weekSessions}</div>
          <div className="stat-label">Essa semana</div>
        </div>
      </div>

      {lastSession && (
        <div style={{ marginBottom: 20 }}>
          <p className="section-title">Último treino</p>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontWeight: 500, marginBottom: 2 }}>{lastSession.templateName}</p>
                <p style={{ fontSize: 13, color: 'var(--text2)' }}>
                  {format(new Date(lastSession.date), "d 'de' MMM", { locale: ptBR })}
                  {lastSession.durationMinutes ? ` · ${lastSession.durationMinutes} min` : ''}
                </p>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/historico')}>
                Ver <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <p className="section-title">Suas fichas</p>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/fichas')}>Gerenciar</button>
        </div>
        {templates.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📋</div>
            <h3>Sem fichas</h3>
            <p style={{ fontSize: 14, marginBottom: 16 }}>Crie fichas de treino para começar</p>
            <button className="btn btn-primary" onClick={() => navigate('/fichas')}>Criar ficha</button>
          </div>
        ) : (
          templates.map(template => (
            <div key={template.id} className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontWeight: 500, marginBottom: 4 }}>{template.name}</p>
                  <p style={{ fontSize: 13, color: 'var(--text2)' }}>{template.exercises.length} exercícios</p>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => handleStart(template.id)}>
                  <Play size={14} fill="currentColor" /> Iniciar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
