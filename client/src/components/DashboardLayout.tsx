import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LogoutButton from './LogoutButton'

export default function DashboardLayout() {
  const { user } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const navItems = [
    { path: '/tasks', label: 'Tasks', icon: '📋' },
    { path: '/team', label: 'Team', icon: '👥' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ]

  return (
    <div style={styles.layout}>
      {/* Sidebar */}
      <aside style={{
        ...styles.sidebar,
        width: sidebarOpen ? '240px' : '64px',
      }}>
        <div style={styles.sidebarHeader}>
          {sidebarOpen && <span style={styles.logo}>✓ TaskManager</span>}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            style={styles.toggleBtn}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <nav style={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {}),
              })}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div style={styles.sidebarFooter}>
          {sidebarOpen && (
            <div style={styles.userInfo}>
              <div style={styles.avatar}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div style={styles.userDetails}>
                <div style={styles.userName}>{user?.name || 'User'}</div>
                <div style={styles.userRole}>{user?.role}</div>
              </div>
            </div>
          )}
          <LogoutButton />
        </div>
      </aside>

      {/* Main content */}
      <main style={styles.main}>
        {/* Header */}
        <header style={styles.header}>
          <h1 style={styles.pageTitle}>
            {navItems.find(i => location.pathname.startsWith(i.path))?.label || 'Dashboard'}
          </h1>
          <div style={styles.headerRight}>
            <button style={styles.iconButton}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>
            <div style={styles.avatar}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Content */}
        <div style={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
    background: '#f7fafc',
  },
  sidebar: {
    width: '240px',
    background: 'white',
    borderRight: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column' as const,
    transition: 'width 0.2s',
    position: 'fixed' as const,
    height: '100vh',
    zIndex: 10,
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem',
    borderBottom: '1px solid #e2e8f0',
  },
  logo: {
    fontWeight: '700',
    fontSize: '1.125rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#718096',
    padding: '0.25rem',
    fontSize: '0.75rem',
  },
  nav: {
    flex: 1,
    padding: '1rem 0.5rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    color: '#4a5568',
    textDecoration: 'none',
    borderRadius: '0.5rem',
    fontSize: '0.95rem',
    fontWeight: '500',
    transition: 'background 0.15s, color 0.15s',
  },
  navItemActive: {
    background: '#edf2f7',
    color: '#667eea',
  },
  navIcon: {
    fontSize: '1.125rem',
    width: '24px',
    textAlign: 'center' as const,
  },
  sidebarFooter: {
    padding: '1rem',
    borderTop: '1px solid #e2e8f0',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: '0.875rem',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontWeight: '600',
    fontSize: '0.875rem',
    color: '#2d3748',
  },
  userRole: {
    fontSize: '0.75rem',
    color: '#718096',
    textTransform: 'capitalize' as const,
  },
  main: {
    flex: 1,
    marginLeft: '240px',
    display: 'flex',
    flexDirection: 'column' as const,
    transition: 'margin-left 0.2s',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 2rem',
    background: 'white',
    borderBottom: '1px solid #e2e8f0',
    position: 'sticky' as const,
    top: 0,
    zIndex: 5,
  },
  pageTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1a202c',
    margin: 0,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  iconButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.5rem',
    color: '#4a5568',
    borderRadius: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: '2rem',
  },
}
