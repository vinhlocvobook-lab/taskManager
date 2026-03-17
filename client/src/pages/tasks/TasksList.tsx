import { useState } from 'react'

interface Task {
  id: string
  title: string
  description: string
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  dueDate?: string
}

const mockTasks: Task[] = [
  { id: '1', title: 'Setup project structure', description: 'Initialize the project with proper folders', status: 'DONE', priority: 'HIGH' },
  { id: '2', title: 'Design database schema', description: 'Create Prisma schema for multi-tenant', status: 'IN_PROGRESS', priority: 'URGENT' },
  { id: '3', title: 'Implement authentication', description: 'JWT auth with login/register', status: 'DONE', priority: 'HIGH' },
  { id: '4', title: 'Build dashboard UI', description: 'Create sidebar and layout', status: 'TODO', priority: 'MEDIUM' },
  { id: '5', title: 'Add task CRUD', description: 'Create, read, update, delete tasks', status: 'TODO', priority: 'HIGH' },
]

const statusColors: Record<string, { bg: string; text: string }> = {
  TODO: { bg: '#edf2f7', text: '#4a5568' },
  IN_PROGRESS: { bg: '#fef3c7', text: '#92400e' },
  REVIEW: { bg: '#dbeafe', text: '#1e40af' },
  DONE: { bg: '#d1fae5', text: '#065f46' },
}

const priorityColors: Record<string, string> = {
  LOW: '#718096',
  MEDIUM: '#d69e2e',
  HIGH: '#e53e3e',
  URGENT: '#9b2c2c',
}

export default function TasksList() {
  const [tasks] = useState<Task[]>(mockTasks)
  const [filter, setFilter] = useState<string>('ALL')

  const filteredTasks = filter === 'ALL' 
    ? tasks 
    : tasks.filter(t => t.status === filter)

  return (
    <div style={styles.container}>
      {/* Actions bar */}
      <div style={styles.actions}>
        <div style={styles.filters}>
          {['ALL', 'TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={{
                ...styles.filterBtn,
                ...(filter === status ? styles.filterBtnActive : {}),
              }}
            >
              {status}
            </button>
          ))}
        </div>
        <button style={styles.addBtn}>
          + New Task
        </button>
      </div>

      {/* Task list */}
      <div style={styles.taskList}>
        {filteredTasks.map((task) => (
          <div key={task.id} style={styles.taskCard}>
            <div style={styles.taskHeader}>
              <span style={{ 
                ...styles.priorityDot, 
                background: priorityColors[task.priority] 
              }} />
              <h3 style={styles.taskTitle}>{task.title}</h3>
            </div>
            <p style={styles.taskDesc}>{task.description}</p>
            <div style={styles.taskFooter}>
              <span style={{
                ...styles.statusBadge,
                background: statusColors[task.status].bg,
                color: statusColors[task.status].text,
              }}>
                {task.status.replace('_', ' ')}
              </span>
              {task.dueDate && (
                <span style={styles.dueDate}>📅 {task.dueDate}</span>
              )}
            </div>
          </div>
        ))}
        
        {filteredTasks.length === 0 && (
          <div style={styles.empty}>
            No tasks found
          </div>
        )}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
  },
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filters: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap' as const,
  },
  filterBtn: {
    padding: '0.5rem 1rem',
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#4a5568',
    transition: 'all 0.15s',
  },
  filterBtnActive: {
    background: '#667eea',
    color: 'white',
    borderColor: '#667eea',
  },
  addBtn: {
    padding: '0.625rem 1.25rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  taskList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  taskCard: {
    background: 'white',
    borderRadius: '0.75rem',
    padding: '1.25rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    border: '1px solid #e2e8f0',
  },
  taskHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.5rem',
  },
  priorityDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
  },
  taskTitle: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: '600',
    color: '#2d3748',
  },
  taskDesc: {
    margin: '0 0 1rem',
    color: '#718096',
    fontSize: '0.875rem',
  },
  taskFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  statusBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '1rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'capitalize' as const,
  },
  dueDate: {
    fontSize: '0.8rem',
    color: '#718096',
  },
  empty: {
    textAlign: 'center' as const,
    padding: '3rem',
    color: '#a0aec0',
    background: 'white',
    borderRadius: '0.75rem',
    border: '1px dashed #e2e8f0',
  },
}
