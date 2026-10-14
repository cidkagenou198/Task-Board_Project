import React, { useEffect, useState, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const API = '/api/tickets';

function App() {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, resolved: 0 });
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
      const [resTickets, resStats] = await Promise.all([
        fetch(API),
        fetch(`${API}/stats`)
      ]);
      if (!resTickets.ok || !resStats.ok) throw new Error('API server returned an error');
      setTickets(await resTickets.json());
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

  // Filter tickets based on priority and search text
  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const matchPriority = filterPriority === 'ALL' || t.priority === filterPriority;
      const q = search.toLowerCase();
      const matchSearch = !search || 
        t.title.toLowerCase().includes(q) || 
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.assignee && t.assignee.toLowerCase().includes(q));
      return matchPriority && matchSearch;
    });
  }, [tickets, filterPriority, search]);

  const openTickets = filteredTickets.filter(t => t.status === 'OPEN' || t.status === 'TODO');
  const inProgressTickets = filteredTickets.filter(t => t.status === 'IN_PROGRESS');
  const resolvedTickets = filteredTickets.filter(t => t.status === 'RESOLVED' || t.status === 'DONE');

  const updateStatus = async (ticket, newStatus) => {
    try {
      await fetch(`${API}/${ticket.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...ticket, status: newStatus })
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTicket = async (ticketId) => {
    if (!confirm('Are you sure you want to resolve and delete this incident ticket?')) return;
    try {
      await fetch(`${API}/${ticketId}`, { method: 'DELETE' });
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
      await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: f.get('title'),
          description: f.get('description'),
          priority: f.get('priority'),
          assignee: f.get('assignee') || 'Sai Charan',
          status: 'OPEN'
        })
      });
      form.reset();
      setShowCreateModal(false);
      loadData();
    } catch (err) {
      alert('Failed to create ticket: ' + err.message);
    }
  };

  const resolutionPct = stats.total > 0 ? Math.round(((stats.resolved || stats.done) / stats.total) * 100) : 0;

  return (
    <div className="app">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">TD</div>
          <div className="brand-info">
            <b>TicketDesk</b>
            <small>IT Service & DevOps</small>
          </div>
        </div>

        <nav>
          <a className="active">
            <span>▦</span>
            <span>Incident Board</span>
            <span className="nav-tag">{stats.total}</span>
          </a>
          <a onClick={() => setShowVideoModal(true)}>
            <span>▶</span>
            <span>Demo Video</span>
            <span className="nav-tag" style={{ color: '#3fb950' }}>33s</span>
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
              <span>●</span> Incident Infrastructure
            </div>
            <div className="env-item">
              <span>FastAPI Backend</span>
              <span className="status-indicator">
                <span className="pulse-dot"></span> UP
              </span>
            </div>
            <div className="env-item">
              <span>PostgreSQL DB</span>
              <span className="status-indicator">
                <span className="pulse-dot"></span> Ready
              </span>
            </div>
            <div className="env-item">
              <span>EKS Cluster</span>
              <span style={{ color: '#58a6ff', fontWeight: 600 }}>v1.0.0</span>
            </div>
          </div>

          <div className="profile-bar">
            <div className="avatar-badge">SC</div>
            <div className="profile-details">
              <b>Sai Charan</b>
              <small>DevOps Support Lead</small>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="main">
        {/* TOP HEADER */}
        <header className="top-header">
          <div>
            <p className="eyebrow">IT Service Desk / Incident Command Center</p>
            <h1 className="header-title">Good morning, Sai Charan 👋</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              Real-time IT helpdesk & production incident tracking running on Docker, Kubernetes & Terraform.
            </p>
          </div>

          <div className="header-actions">
            <a 
              href="/presentation.html" 
              target="_blank" 
              rel="noreferrer"
              className="btn btn-secondary"
              style={{ textDecoration: 'none' }}
              title="Open Capstone Presentation Deck (M1-M10)"
            >
              <span>📊</span> Capstone Slides
            </a>
            <button className="btn btn-accent" onClick={() => setShowVideoModal(true)}>
              <span>▶</span> Watch Screen Recording
            </button>
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
              <span>＋</span> Open Ticket
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
              <span>Incident Resolution SLA Rate</span>
              <span style={{ color: '#3fb950' }}>{resolutionPct}% Resolved</span>
            </div>
            <div className="progress-track">
              <div className="progress-bar" style={{ width: `${resolutionPct}%` }}></div>
            </div>
          </div>

          <div className="quick-stats">
            <div className="quick-stat">
              <span className="quick-stat-icon">🎫</span>
              <div>
                <span className="quick-stat-val">{stats.total}</span>
                <span className="quick-stat-lbl">Total Tickets</span>
              </div>
            </div>
            <div className="quick-stat">
              <span className="quick-stat-icon" style={{ color: '#d29922' }}>⚠️</span>
              <div>
                <span className="quick-stat-val">{stats.open || stats.todo}</span>
                <span className="quick-stat-lbl">Open</span>
              </div>
            </div>
            <div className="quick-stat">
              <span className="quick-stat-icon" style={{ color: '#58a6ff' }}>🔍</span>
              <div>
                <span className="quick-stat-val">{stats.inProgress}</span>
                <span className="quick-stat-lbl">Investigating</span>
              </div>
            </div>
            <div className="quick-stat">
              <span className="quick-stat-icon" style={{ color: '#3fb950' }}>✅</span>
              <div>
                <span className="quick-stat-val">{stats.resolved || stats.done}</span>
                <span className="quick-stat-lbl">Resolved</span>
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
              placeholder="Search incidents, error logs, or assignees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Severity:</span>
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(p => (
              <button
                key={p}
                className="action-pill"
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
            Loading TicketDesk incidents...
          </div>
        ) : viewMode === 'kanban' ? (
          <div className="kanban-grid">
            {/* COLUMN: OPEN */}
            <div className="kanban-column">
              <div className="column-header">
                <div className="column-title">
                  <span className="column-dot todo"></span>
                  <span>Open Tickets</span>
                </div>
                <span className="column-badge">{openTickets.length}</span>
              </div>

              <div className="cards-container">
                {openTickets.map(t => (
                  <TicketCard
                    key={t.id}
                    ticket={t}
                    onMove={(status) => updateStatus(t, status)}
                    onDelete={() => deleteTicket(t.id)}
                    nextStatus="IN_PROGRESS"
                    nextLabel="Investigate →"
                  />
                ))}
                {!openTickets.length && <div className="empty-col">No open tickets</div>}
              </div>
            </div>

            {/* COLUMN: INVESTIGATING */}
            <div className="kanban-column">
              <div className="column-header">
                <div className="column-title">
                  <span className="column-dot in_progress"></span>
                  <span>In Progress / Investigating</span>
                </div>
                <span className="column-badge">{inProgressTickets.length}</span>
              </div>

              <div className="cards-container">
                {inProgressTickets.map(t => (
                  <TicketCard
                    key={t.id}
                    ticket={t}
                    onMove={(status) => updateStatus(t, status)}
                    onDelete={() => deleteTicket(t.id)}
                    prevStatus="OPEN"
                    prevLabel="← Back"
                    nextStatus="RESOLVED"
                    nextLabel="Resolve ✓"
                  />
                ))}
                {!inProgressTickets.length && <div className="empty-col">No tickets being investigated</div>}
              </div>
            </div>

            {/* COLUMN: RESOLVED */}
            <div className="kanban-column">
              <div className="column-header">
                <div className="column-title">
                  <span className="column-dot done"></span>
                  <span>Resolved Incidents</span>
                </div>
                <span className="column-badge">{resolvedTickets.length}</span>
              </div>

              <div className="cards-container">
                {resolvedTickets.map(t => (
                  <TicketCard
                    key={t.id}
                    ticket={t}
                    onMove={(status) => updateStatus(t, status)}
                    onDelete={() => deleteTicket(t.id)}
                    prevStatus="IN_PROGRESS"
                    prevLabel="↺ Reopen"
                  />
                ))}
                {!resolvedTickets.length && <div className="empty-col">No resolved incidents</div>}
              </div>
            </div>
          </div>
        ) : (
          /* TABLE VIEW */
          <div className="table-panel">
            <table>
              <thead>
                <tr>
                  <th>Incident Ticket</th>
                  <th>Assignee</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map(t => (
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
                      <span style={{ fontSize: '11px', fontWeight: 700, color: t.status === 'RESOLVED' || t.status === 'DONE' ? '#3fb950' : t.status === 'IN_PROGRESS' ? '#58a6ff' : '#d29922' }}>
                        {t.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="action-pill"
                        onClick={() => {
                          const next = (t.status === 'OPEN' || t.status === 'TODO') ? 'IN_PROGRESS' : t.status === 'IN_PROGRESS' ? 'RESOLVED' : 'OPEN';
                          updateStatus(t, next);
                        }}
                      >
                        Advance ↻
                      </button>
                      <button
                        className="card-delete-btn"
                        style={{ marginLeft: '8px' }}
                        onClick={() => deleteTicket(t.id)}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
                {!filteredTickets.length && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      No incident tickets found matching criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* CREATE TICKET MODAL */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Open New Support Ticket</div>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Incident / Ticket Title *</label>
                <input
                  name="title"
                  required
                  className="form-control"
                  placeholder="e.g. Ingress Controller 502 Bad Gateway during load spike"
                />
              </div>
              <div className="form-group">
                <label>Issue Description & Reproduction Steps</label>
                <textarea
                  name="description"
                  className="form-control"
                  placeholder="Describe error logs, affected microservices, and priority level..."
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Severity</label>
                  <select name="priority" className="form-control" defaultValue="HIGH">
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Assigned Engineer</label>
                  <input
                    name="assignee"
                    className="form-control"
                    defaultValue="Sai Charan"
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                Open Ticket
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
                <div className="modal-title">TicketDesk Deliverables Video Walkthrough</div>
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
                Your browser does not support HTML5 video.
              </video>
            </div>
            <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#161b22' }}>
              <div style={{ fontSize: '12px', color: '#c9d1d9' }}>
                <span>Presenter: <b>Sai Charan</b> (DevOps Support Lead) • Walkthrough Video (1m 34s)</span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <a href="/demo.html" target="_blank" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
                  Open Full Page ↗
                </a>
                <a href="/deliverables_walkthrough_fast.mp4" download className="btn btn-primary" style={{ textDecoration: 'none' }}>
                  Download Video (31 MB) ⬇
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TicketCard({ ticket, onMove, onDelete, nextStatus, nextLabel, prevStatus, prevLabel }) {
  const initials = ticket.assignee
    ? ticket.assignee.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'SC';

  return (
    <div className="task-card">
      <div className="card-top">
        <span className={`priority-tag ${ticket.priority.toLowerCase()}`}>{ticket.priority}</span>
        <button className="card-delete-btn" onClick={onDelete} title="Resolve & Delete Ticket">✕</button>
      </div>

      <div>
        <div className="task-card-title">{ticket.title}</div>
        {ticket.description && <div className="task-card-desc">{ticket.description}</div>}
      </div>

      <div className="card-meta">
        <div className="card-assignee">
          <span className="mini-avatar">{initials}</span>
          <span>{ticket.assignee || 'Sai Charan'}</span>
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
