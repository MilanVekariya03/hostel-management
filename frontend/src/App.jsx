import { useEffect, useState } from "react";

/* ── tiny icon components (inline SVG, no extra deps) ─────────────── */
const Icon = ({ d, size = 20, stroke = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const Icons = {
  home:    "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  users:   "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  door:    "M3 3h18v18H3z M8 12h8 M12 8v8",
  bell:    "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0",
  plus:    "M12 5v14 M5 12h14",
  trash:   "M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2",
  search:  "M21 21l-4.35-4.35 M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0",
  close:   "M18 6 6 18 M6 6l12 12",
  trend:   "M22 7 13.5 15.5l-5-5L2 17 M16 7h6v6",
  check:   "M20 6 9 17l-5-5",
  rooms:   "M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4",
};

/* ── avatar initials helper ───────────────────────────────────────── */
function Avatar({ name, size = 36 }) {
  const initials = name
    ? name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";
  const hue = (name || "").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <span className="avatar" style={{
      width: size, height: size, fontSize: size * 0.36,
      background: `hsl(${hue},55%,55%)`,
    }}>
      {initials}
    </span>
  );
}

/* ── badge component ───────────────────────────────────────────────── */
function Badge({ label, tone = "neutral" }) {
  return <span className={`badge badge-${tone}`}>{label}</span>;
}

/* ════════════════════════════════════════════════════════════════════ */
export default function App() {
  const [students, setStudents]   = useState([]);
  const [search, setSearch]       = useState("");
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast]         = useState(null);
  const [deleting, setDeleting]   = useState(null);
  const [activeNav, setActiveNav] = useState("dashboard");

  const [form, setForm] = useState({ name: "", room: "", course: "", phone: "" });

  /* ── data helpers ─────────────────────────────────────────────── */
  const loadStudents = async () => {
    try {
      const res = await fetch("/api/students");
      setStudents(await res.json());
    } catch { /* backend may be offline during dev */ }
  };

  useEffect(() => { loadStudents(); }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addStudent = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) { showToast("Failed to add student", "error"); return; }
      setForm({ name: "", room: "", course: "", phone: "" });
      setShowModal(false);
      await loadStudents();
      showToast("Student added successfully");
    } catch { showToast("Backend connection failed", "error"); }
  };

  const deleteStudent = async (id) => {
    setDeleting(id);
    await fetch(`/api/students/${id}`, { method: "DELETE" });
    await loadStudents();
    setDeleting(null);
    showToast("Student removed");
  };

  /* ── derived stats ────────────────────────────────────────────── */
  const roomCount     = new Set(students.map((s) => s.room)).size;
  const occupancyRate = roomCount ? Math.round((students.length / (roomCount * 2)) * 100) : 0;

  const filtered = students.filter((s) =>
    [s.name, s.room, s.course, s.phone]
      .join(" ").toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    { label: "Total Residents", value: students.length, icon: Icons.users,  tone: "blue",   sub: "Active students" },
    { label: "Rooms Occupied",  value: roomCount,        icon: Icons.rooms,  tone: "purple", sub: "Unique rooms" },
    { label: "Occupancy Rate",  value: `${occupancyRate}%`, icon: Icons.trend, tone: "green",  sub: "vs. capacity" },
    { label: "Pending Dues",    value: "₹ 0",            icon: Icons.bell,   tone: "amber",  sub: "All clear" },
  ];

  const navItems = [
    { id: "dashboard", label: "Dashboard",  icon: Icons.home  },
    { id: "students",  label: "Residents",  icon: Icons.users },
    { id: "rooms",     label: "Rooms",      icon: Icons.rooms },
  ];

  /* ════════════════════════════════════════════════════════════════ */
  return (
    <div className="shell">

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">🏠</span>
          <div>
            <p className="brand-sub">Management System</p>
            <p className="brand-title">HostelHub</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeNav === item.id ? "nav-active" : ""}`}
              onClick={() => setActiveNav(item.id)}
            >
              <Icon d={item.icon} size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <Avatar name="Admin User" size={34} />
          <div className="sidebar-user">
            <p className="sidebar-username">Admin</p>
            <p className="sidebar-role">Super Admin</p>
          </div>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────── */}
      <div className="main">

        {/* Topbar */}
        <header className="topbar">
          <div>
            <p className="topbar-eyebrow">Welcome back, Admin 👋</p>
            <h1 className="topbar-title">Resident Dashboard</h1>
          </div>
          <div className="topbar-actions">
            <div className="search-wrap">
              <Icon d={Icons.search} size={16} />
              <input
                className="search-input"
                placeholder="Search students…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              <Icon d={Icons.plus} size={16} />
              Add Student
            </button>
          </div>
        </header>

        {/* Stats row */}
        <section className="stats-row">
          {stats.map((s) => (
            <div key={s.label} className={`stat-card tone-${s.tone}`}>
              <div className="stat-icon-wrap">
                <Icon d={s.icon} size={20} />
              </div>
              <div className="stat-body">
                <p className="stat-label">{s.label}</p>
                <p className="stat-value">{s.value}</p>
                <p className="stat-sub">{s.sub}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Table section */}
        <section className="table-section">
          <div className="table-header">
            <div>
              <h2 className="table-title">Student Directory</h2>
              <p className="table-sub">{filtered.length} of {students.length} records</p>
            </div>
            <Badge label={students.length ? "Active" : "Empty"} tone={students.length ? "green" : "gray"} />
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state">
              <span style={{ fontSize: "2.5rem" }}>🎓</span>
              <p className="empty-title">{search ? "No results found" : "No students yet"}</p>
              <p className="empty-sub">
                {search ? 'Try a different search term.' : 'Click "Add Student" to get started.'}
              </p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Room</th>
                    <th>Course</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr key={s._id}>
                      <td>
                        <div className="student-cell">
                          <Avatar name={s.name} size={34} />
                          <span className="student-name">{s.name}</span>
                        </div>
                      </td>
                      <td><span className="room-badge">Room {s.room}</span></td>
                      <td>{s.course}</td>
                      <td className="phone-cell">{s.phone}</td>
                      <td><Badge label="Active" tone="green" /></td>
                      <td>
                        <button
                          className="btn-delete"
                          onClick={() => deleteStudent(s._id)}
                          disabled={deleting === s._id}
                        >
                          {deleting === s._id ? "…" : <Icon d={Icons.trash} size={14} />}
                          {deleting === s._id ? "Removing" : "Remove"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* ── Add Student Modal ────────────────────────────────────── */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Student</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <Icon d={Icons.close} size={18} />
              </button>
            </div>
            <form onSubmit={addStudent} className="modal-form">
              <div className="field-group">
                <label>Full Name</label>
                <input name="name" placeholder="e.g. Priya Sharma" value={form.name} onChange={handleChange} required />
              </div>
              <div className="field-group">
                <label>Room Number</label>
                <input name="room" placeholder="e.g. 204" value={form.room} onChange={handleChange} required />
              </div>
              <div className="field-group">
                <label>Course</label>
                <input name="course" placeholder="e.g. B.Tech CSE" value={form.course} onChange={handleChange} required />
              </div>
              <div className="field-group">
                <label>Phone Number</label>
                <input name="phone" placeholder="e.g. +91 98765 43210" value={form.phone} onChange={handleChange} required />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">
                  <Icon d={Icons.check} size={16} />
                  Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Toast ───────────────────────────────────────────────── */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          <Icon d={toast.type === "success" ? Icons.check : Icons.close} size={16} />
          {toast.msg}
        </div>
      )}
    </div>
  );
}
