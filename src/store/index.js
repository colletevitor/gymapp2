import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const generateId = () => Math.random().toString(36).slice(2, 10)

const defaultExercises = [
  { id: 'ex1', name: 'Supino Reto', muscleGroup: 'Peito' },
  { id: 'ex2', name: 'Supino Inclinado', muscleGroup: 'Peito' },
  { id: 'ex3', name: 'Crucifixo', muscleGroup: 'Peito' },
  { id: 'ex4', name: 'Puxada Frontal', muscleGroup: 'Costas' },
  { id: 'ex5', name: 'Remada Curvada', muscleGroup: 'Costas' },
  { id: 'ex6', name: 'Remada Unilateral', muscleGroup: 'Costas' },
  { id: 'ex7', name: 'Agachamento Livre', muscleGroup: 'Pernas' },
  { id: 'ex8', name: 'Leg Press', muscleGroup: 'Pernas' },
  { id: 'ex9', name: 'Cadeira Extensora', muscleGroup: 'Pernas' },
  { id: 'ex10', name: 'Cadeira Flexora', muscleGroup: 'Pernas' },
  { id: 'ex11', name: 'Desenvolvimento', muscleGroup: 'Ombros' },
  { id: 'ex12', name: 'Elevação Lateral', muscleGroup: 'Ombros' },
  { id: 'ex13', name: 'Rosca Direta', muscleGroup: 'Bíceps' },
  { id: 'ex14', name: 'Rosca Martelo', muscleGroup: 'Bíceps' },
  { id: 'ex15', name: 'Tríceps Corda', muscleGroup: 'Tríceps' },
  { id: 'ex16', name: 'Tríceps Testa', muscleGroup: 'Tríceps' },
  { id: 'ex17', name: 'Panturrilha em Pé', muscleGroup: 'Pernas' },
  { id: 'ex18', name: 'Abdominais', muscleGroup: 'Abdômen' },
]

const defaultTemplates = [
  {
    id: 'tpl1',
    name: 'Treino A — Peito e Tríceps',
    exercises: [
      { exerciseId: 'ex1', defaultSets: 4, defaultReps: 10, defaultWeight: 60 },
      { exerciseId: 'ex2', defaultSets: 3, defaultReps: 12, defaultWeight: 50 },
      { exerciseId: 'ex3', defaultSets: 3, defaultReps: 12, defaultWeight: 20 },
      { exerciseId: 'ex15', defaultSets: 3, defaultReps: 15, defaultWeight: 30 },
      { exerciseId: 'ex16', defaultSets: 3, defaultReps: 12, defaultWeight: 30 },
    ]
  },
  {
    id: 'tpl2',
    name: 'Treino B — Costas e Bíceps',
    exercises: [
      { exerciseId: 'ex4', defaultSets: 4, defaultReps: 10, defaultWeight: 60 },
      { exerciseId: 'ex5', defaultSets: 3, defaultReps: 12, defaultWeight: 60 },
      { exerciseId: 'ex6', defaultSets: 3, defaultReps: 12, defaultWeight: 25 },
      { exerciseId: 'ex13', defaultSets: 3, defaultReps: 12, defaultWeight: 20 },
      { exerciseId: 'ex14', defaultSets: 3, defaultReps: 15, defaultWeight: 16 },
    ]
  },
  {
    id: 'tpl3',
    name: 'Treino C — Pernas',
    exercises: [
      { exerciseId: 'ex7', defaultSets: 4, defaultReps: 8, defaultWeight: 80 },
      { exerciseId: 'ex8', defaultSets: 4, defaultReps: 12, defaultWeight: 140 },
      { exerciseId: 'ex9', defaultSets: 3, defaultReps: 15, defaultWeight: 50 },
      { exerciseId: 'ex10', defaultSets: 3, defaultReps: 15, defaultWeight: 40 },
      { exerciseId: 'ex17', defaultSets: 4, defaultReps: 20, defaultWeight: 60 },
    ]
  },
]

export const useStore = create(
  persist(
    (set, get) => ({
      users: [],
      currentUserId: null,
      exercises: defaultExercises,
      templates: defaultTemplates,
      sessions: [],
      activeSession: null,

      setCurrentUser: (userId) => set({ currentUserId: userId }),

      addUser: (name, color) => {
        const user = { id: generateId(), name, color }
        set(s => ({ users: [...s.users, user], currentUserId: user.id }))
      },

      addExercise: (data) => {
        set(s => ({ exercises: [...s.exercises, { id: generateId(), ...data }] }))
      },
      updateExercise: (id, data) => {
        set(s => ({ exercises: s.exercises.map(e => e.id === id ? { ...e, ...data } : e) }))
      },
      deleteExercise: (id) => {
        set(s => ({ exercises: s.exercises.filter(e => e.id !== id) }))
      },

      addTemplate: (data) => {
        set(s => ({ templates: [...s.templates, { id: generateId(), ...data }] }))
      },
      updateTemplate: (id, data) => {
        set(s => ({ templates: s.templates.map(t => t.id === id ? { ...t, ...data } : t) }))
      },
      deleteTemplate: (id) => {
        set(s => ({ templates: s.templates.filter(t => t.id !== id) }))
      },

      startSession: (templateId) => {
        const { templates, currentUserId } = get()
        const template = templates.find(t => t.id === templateId)
        if (!template || !currentUserId) return
        const session = {
          id: generateId(),
          templateId,
          templateName: template.name,
          userId: currentUserId,
          date: new Date().toISOString(),
          exercises: template.exercises.map(te => ({
            exerciseId: te.exerciseId,
            sets: Array.from({ length: te.defaultSets }, () => ({
              id: generateId(),
              weight: te.defaultWeight,
              reps: te.defaultReps,
              done: false,
            }))
          }))
        }
        set({ activeSession: session })
      },

      updateActiveSession: (session) => set({ activeSession: session }),

      finishSession: (durationMinutes, notes) => {
        const { activeSession } = get()
        if (!activeSession) return
        set(s => ({
          sessions: [{ ...activeSession, durationMinutes, notes }, ...s.sessions],
          activeSession: null
        }))
      },

      cancelSession: () => set({ activeSession: null }),

      deleteSession: (id) => {
        set(s => ({ sessions: s.sessions.filter(s => s.id !== id) }))
      },
    }),
    { name: 'gymapp-v2' }
  )
)
