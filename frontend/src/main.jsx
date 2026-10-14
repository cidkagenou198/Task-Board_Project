import React, { useEffect, useState, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const API = '/api';

function App() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, todo: 0, inProgress: 0, done: 0 });
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'table'
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setError('');
      const [resTasks, resStats] = await Promise.all([
        fetch(`${API}/tasks`),
        fetch(`${API}/tasks/stats`)
      ]);
      if (!resTasks.ok || !resStats.ok) throw new Error('API server returned an error');
      setTasks(await resTasks.json());
      setStats(await resStats.json());
    } catch (err) {
      setError(err.message || 'Failed to connect to backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter tasks based on priority and search text
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchPriority = filterPriority === 'ALL' || t.priority === filterPriority;
      const q = search.toLowerCase();
      const matchSearch = !search || 
        t.title.toLowerCase().includes(q) || 
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.assignee && t.assignee.toLowerCase().includes(q));
      return matchPriority && matchSearch;
    });
  }, [tasks, filterPriority, search]);

  const todoTasks = filteredTasks.filter(t => t.status === 'TODO');
  const inProgressTasks = filteredTasks.filter(t => t.status === 'IN_PROGRESS');
  const doneTasks = filteredTasks.filter(t => t.status === 'DONE');

  const updateStatus = async (task, newStatus) => {
    try {
      await fetch(`${API}/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...task, status: newStatus })
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await fetch(`${API}/tasks/${taskId}`, { method: 'DELETE' });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    try {
      await fetch(`${API}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: f.get('title'),
          description: f.get('description'),
          priority: f.get('priority'),
          assignee: f.get('assignee') || 'Sai Charan',
          status: 'TODO'
        })
      });
      form.reset();
      setShowCreateModal(false);
      loadData();
    } catch (err) {
      alert('Failed to create task: ' + err.message);
    }
  };

  const completionPct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <div className="app">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">T</div>
          <div className="brand-info">
            <b>TaskBoard</b>
            <small>DevOps Platform</small>
          </div>
        </div>

        <nav>
          <a className="active">
            <span>▦</span>
            <span>Kanban Board</span>
            <span className="nav-tag">{stats.total}</span>
          </a>
          <a onClick={() => setShowVideoModal(true)}>
            <span>▶</span>
            <span>Demo Video</span>
            <span className="nav-tag" style={{ color: '#34d399' }}>Live</span>
          </a>
          <a href="/docs" target="_blank" rel="noreferrer">
            <span>⚡</span>
            <span>FastAPI Docs</span>
            <span className="nav-tag">/docs</span>
          </a>
          <a href="/metrics" target="_blank" rel="noreferrer">
            <span>📊</span>
            <span>Prometheus</span>
            <span className="nav-tag">/metrics</span>
          </a>
        </nav>

        <div className="side-bottom">
          <div className="env-card">
            <div className="env-card-title">
              <span>●</span> System Environment
            </div>
            <div className="env-item">
              <span>API Backend</span>
              <span className="status-indicator">
                <span className="pulse-dot"></span> UP
              </span>
            </div>
            <div className="env-item">
              <span>PostgreSQL</span>
              <span className="status-indicator">
                <span className="pulse-dot"></span> Ready
              </span>
            </div>
            <div className="env-item">
              <span>Kubernetes</span>
              <span style={{ color: '#818cf8', fontWeight: 600 }}>v1.0.0</span>
            </div>
          </div>

          <div className="profile-bar">
            <div className="avatar-badge">SC</div>
            <div className="profile-details">
              <b>Sai Charan</b>
              <small>DevOps Engineer</small>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="main">
        {/* TOP HEADER */}
        <header className="top-header">
          <div>
            <p className="eyebrow">Production Workspace / Overview</p>
            <h1 className="header-title">Good morning, Sai Charan 👋</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              Real-time TaskBoard microservices deployed across Docker & Kubernetes.
            </p>
          </div>

          <div className="header-actions">
            <button className="btn btn-accent" onClick={() => setShowVideoModal(true)}>
              <span>▶</span> Watch Screen Recording
            </button>
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
              <span>＋</span> New Task
            </button>
          </div>
        </header>

        {error && (
          <div className="alert-box">
            ⚠ <b>Connection Error:</b> {error}. Please ensure PostgreSQL and FastAPI backend containers are running.
          </div>
        )}

        {/* PROGRESS OVERVIEW BAR */}
        <section className="overview-card">
          <div className="progress-info">
            <div className="progress-labels">
              <span>Sprint Velocity & Completion</span>
              <span style={{ color: '#34d399' }}>{completionPct}% Completed</span>
            </div>
            <div className="progress-track">
              <div className="progress-bar" style={{ width: `${completionPct}%` }}></div>
            </div>
          </div>

          <div className="quick-stats">
            <div className="quick-stat">
              <span className="quick-stat-icon">📋</span>
              <div>
                <span className="quick-stat-val">{stats.total}</span>
                <span className="quick-stat-lbl">Total Tasks</span>
              </div>
            </div>
            <div className="quick-stat">
              <span className="quick-stat-icon" style={{ color: '#fbbf24' }}>⏳</span>
              <div>
                <span className="quick-stat-val">{stats.todo}</span>
                <span className="quick-stat-lbl">To Do</span>
              </div>
            </div>
            <div className="quick-stat">
              <span className="quick-stat-icon" style={{ color: '#818cf8' }}>⚡</span>
              <div>
                <span className="quick-stat-val">{stats.inProgress}</span>
                <span className="quick-stat-lbl">In Progress</span>
              </div>
            </div>
            <div className="quick-stat">
              <span className="quick-stat-icon" style={{ color: '#34d399' }}>✅</span>
              <div>
                <span className="quick-stat-val">{stats.done}</span>
                <span className="quick-stat-lbl">Completed</span>
              </div>
            </div>
          </div>
        </section>

        {/* CONTROLS BAR: SEARCH, FILTERS, VIEW TOGGLE */}
        <div className="controls-bar">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search tasks, descriptions, or assignees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Priority:</span>
            {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map(p => (
              <button
                key={p}
                className={`action-pill ${filterPriority === p ? 'success' : ''}`}
                style={filterPriority === p ? { background: '#238636', color: '#fff', borderColor: '#238636' } : {}}
                onClick={() => setFilterPriority(p)}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="view-toggles">
            <button
              className={`view-btn ${viewMode === 'kanban' ? 'active' : ''}`}
              onClick={() => setViewMode('kanban')}
            >
              <span>▦</span> Board
            </button>
            <button
              className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              <span>☰</span> Table
            </button>
          </div>
        </div>

        {/* MAIN DISPLAY: KANBAN BOARD VIEW OR TABLE VIEW */}
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading TaskBoard data...
          </div>
        ) : viewMode === 'kanban' ? (
          <div className="kanban-grid">
            {/* COLUMN: TO DO */}
            <div className="kanban-column">
              <div className="column-header">
                <div className="column-title">
                  <span className="column-dot todo"></span>
                  <span>To Do</span>
                </div>
                <span className="column-badge">{todoTasks.length}</span>
              </div>

              <div className="cards-container">
                {todoTasks.map(t => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    onMove={(status) => updateStatus(t, status)}
                    onDelete={() => deleteTask(t.id)}
                    nextStatus="IN_PROGRESS"
                    nextLabel="Start Task →"
                  />
                ))}
                {!todoTasks.length && <div className="empty-col">No tasks in To Do</div>}
              </div>
            </div>

            {/* COLUMN: IN PROGRESS */}
            <div className="kanban-column">
              <div className="column-header">
                <div className="column-title">
                  <span className="column-dot in_progress"></span>
                  <span>In Progress</span>
                </div>
                <span className="column-badge">{inProgressTasks.length}</span>
              </div>

              <div className="cards-container">
                {inProgressTasks.map(t => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    onMove={(status) => updateStatus(t, status)}
                    onDelete={() => deleteTask(t.id)}
                    prevStatus="TODO"
                    prevLabel="← Back"
                    nextStatus="DONE"
                    nextLabel="Complete ✓"
                  />
                ))}
                {!inProgressTasks.length && <div className="empty-col">No tasks in progress</div>}
              </div>
            </div>

            {/* COLUMN: DONE */}
            <div className="kanban-column">
              <div className="column-header">
                <div className="column-title">
                  <span className="column-dot done"></span>
                  <span>Completed</span>
                </div>
                <span className="column-badge">{doneTasks.length}</span>
              </div>

              <div className="cards-container">
                {doneTasks.map(t => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    onMove={(status) => updateStatus(t, status)}
                    onDelete={() => deleteTask(t.id)}
                    prevStatus="IN_PROGRESS"
                    prevLabel="↺ Reopen"
                  />
                ))}
                {!doneTasks.length && <div className="empty-col">No completed tasks</div>}
              </div>
            </div>
          </div>
        ) : (
          /* TABLE VIEW */
          <div className="table-panel">
            <table>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Assignee</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map(t => (
                  <tr key={t.id}>
                    <td>
                      <b style={{ color: '#fff', display: 'block' }}>{t.title}</b>
                      <small style={{ color: 'var(--text-muted)' }}>{t.description}</small>
                    </td>
                    <td>
                      <div className="card-assignee">
                        <span className="mini-avatar">
                          {t.assignee ? t.assignee.substring(0, 2).toUpperCase() : 'SC'}
                        </span>
                        <span>{t.assignee || 'Sai Charan'}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`priority-tag ${t.priority.toLowerCase()}`}>{t.priority}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: t.status === 'DONE' ? '#34d399' : t.status === 'IN_PROGRESS' ? '#818cf8' : '#fbbf24' }}>
                        {t.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="action-pill"
                        onClick={() => {
                          const next = t.status === 'TODO' ? 'IN_PROGRESS' : t.status === 'IN_PROGRESS' ? 'DONE' : 'TODO';
                          updateStatus(t, next);
                        }}
                      >
                        Advance ↻
                      </button>
                      <button
                        className="card-delete-btn"
                        style={{ marginLeft: '8px' }}
                        onClick={() => deleteTask(t.id)}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
                {!filteredTasks.length && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      No tasks found matching criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* CREATE TASK MODAL */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Create New Task</div>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Task Title *</label>
                <input
                  name="title"
                  required
                  className="form-control"
                  placeholder="e.g. Implement Helm ingress routing"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  className="form-control"
                  placeholder="Describe task requirements, deliverables, and acceptance criteria..."
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Priority</label>
                  <select name="priority" className="form-control" defaultValue="HIGH">
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Assignee</label>
                  <input
                    name="assignee"
                    className="form-control"
                    defaultValue="Sai Charan"
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                Create Task
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EMBEDDED DELIVERABLES VIDEO MODAL */}
      {showVideoModal && (
        <div className="modal-overlay" onClick={() => setShowVideoModal(false)}>
          <div className="video-modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ padding: '20px 24px 10px' }}>
              <div>
                <div className="modal-title">TaskBoard Deliverables Video Demonstration</div>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                  Full end-to-end screen recording demonstrating M1–M10 deliverables
                </p>
              </div>
              <button className="modal-close" onClick={() => setShowVideoModal(false)}>×</button>
            </div>
            <div style={{ background: '#000', width: '100%', aspectRatio: '16/9' }}>
              <video
                controls
                autoPlay
                loop
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              >
                <source src="/deliverables_walkthrough_fast.mp4" type="video/mp4" />
                <source src="/deliverables_walkthrough_fast.webp" type="image/webp" />
                Your browser does not support HTML5 video.
              </video>
            </div>
            <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.4)' }}>
              <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
                <span>Presenter: <b>Sai Charan</b> (DevOps Engineer) • Fast Walkthrough (33s)</span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <a href="/demo.html" target="_blank" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
                  Open Full Page ↗
                </a>
                <a href="/deliverables_walkthrough_fast.mp4" download className="btn btn-primary" style={{ textDecoration: 'none' }}>
                  Download Fast MP4 (5 MB) ⬇
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TaskCard({ task, onMove, onDelete, nextStatus, nextLabel, prevStatus, prevLabel }) {
  const initials = task.assignee
    ? task.assignee.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'SC';

  return (
    <div className="task-card">
      <div className="card-top">
        <span className={`priority-tag ${task.priority.toLowerCase()}`}>{task.priority}</span>
        <button className="card-delete-btn" onClick={onDelete} title="Delete task">✕</button>
      </div>

      <div>
        <div className="task-card-title">{task.title}</div>
        {task.description && <div className="task-card-desc">{task.description}</div>}
      </div>

      <div className="card-meta">
        <div className="card-assignee">
          <span className="mini-avatar">{initials}</span>
          <span>{task.assignee || 'Sai Charan'}</span>
        </div>

        <div className="card-actions">
          {prevStatus && (
            <button className="action-pill" onClick={() => onMove(prevStatus)}>
              {prevLabel}
            </button>
          )}
          {nextStatus && (
            <button className="action-pill success" onClick={() => onMove(nextStatus)}>
              {nextLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
