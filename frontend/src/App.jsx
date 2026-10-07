import { useEffect, useState } from "react";

function App() {
  const [students, setStudents] = useState([]);

  const [form, setForm] = useState({
    name: "",
    room: "",
    course: "",
    phone: ""
  });

  const roomCount = new Set(students.map((student) => student.room)).size;

  const stats = [
    {
      label: "Residents",
      value: students.length,
      tone: "primary"
    },
    {
      label: "Rooms Used",
      value: roomCount,
      tone: "success"
    },
    {
      label: "Status",
      value: students.length ? "Active" : "Empty",
      tone: "neutral"
    }
  ];

  const loadStudents = async () => {
    try {
      const response = await fetch("/api/students");
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  };

  const addStudent = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        alert("Failed to add student");
        return;
      }

      setForm({
        name: "",
        room: "",
        course: "",
        phone: ""
      });

      loadStudents();
    } catch (error) {
      alert("Backend connection failed");
    }
  };

  const deleteStudent = async (id) => {
    await fetch(`/api/students/${id}`, {
      method: "DELETE"
    });

    loadStudents();
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <span className="brand-mark">🏠</span>
          <div>
            <p className="eyebrow">Resident dashboard</p>
            <h1>Hostel Management System</h1>
          </div>
        </div>
        <button className="ghost-btn" type="button">
          + New Entry
        </button>
      </header>

      <main className="dashboard">
        <section className="hero card">
          <div>
            <p className="eyebrow raised">Overview</p>
            <h2>Keep every room and resident in sync.</h2>
            <p className="subtitle">
              Manage occupancy, student records, and room details from one
              clean dashboard.
            </p>
          </div>
          <div className="hero-badge">
            <span>Live</span>
            <strong>{students.length} active students</strong>
          </div>
        </section>

        <section className="stats-grid">
          {stats.map((item) => (
            <article key={item.label} className={`stat-card ${item.tone}`}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </article>
          ))}
        </section>

        <section className="content-grid">
          <div className="card form-card">
            <div className="section-heading">
              <h3>Add student</h3>
            </div>

            <form onSubmit={addStudent} className="student-form">
              <input
                name="name"
                placeholder="Student Name"
                value={form.name}
                onChange={handleChange}
                required
              />

              <input
                name="room"
                placeholder="Room Number"
                value={form.room}
                onChange={handleChange}
                required
              />

              <input
                name="course"
                placeholder="Course"
                value={form.course}
                onChange={handleChange}
                required
              />

              <input
                name="phone"
                placeholder="Phone Number"
                value={form.phone}
                onChange={handleChange}
                required
              />

              <button type="submit" className="primary-btn">
                Add Student
              </button>
            </form>
          </div>

          <div className="card table-card">
            <div className="section-heading">
              <h3>Students</h3>
              <span>{students.length} records</span>
            </div>

            {students.length === 0 ? (
              <div className="empty-state">
                <p>No students found.</p>
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Room</th>
                      <th>Course</th>
                      <th>Phone</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {students.map((student) => (
                      <tr key={student._id}>
                        <td>{student.name}</td>
                        <td>{student.room}</td>
                        <td>{student.course}</td>
                        <td>{student.phone}</td>
                        <td>
                          <button
                            className="delete"
                            onClick={() => deleteStudent(student._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer>
        <p>Hostel Management System • DevOps Project</p>
      </footer>
    </div>
  );
}

export default App;
