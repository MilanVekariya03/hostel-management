const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5001;
const MONGO_URL =
  process.env.MONGO_URL || "mongodb://127.0.0.1:27017/hosteldb";

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    room: {
      type: String,
      required: true
    },
    course: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const Student = mongoose.model("Student", studentSchema);

app.get("/", (req, res) => {
  res.json({
    message: "Hostel Management API is running"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "backend"
  });
});

app.get("/api/students", async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch students"
    });
  }
});

app.post("/api/students", async (req, res) => {
  try {
    const { name, room, course, phone } = req.body;

    if (!name || !room || !course || !phone) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const student = await Student.create({
      name,
      room,
      course,
      phone
    });

    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create student"
    });
  }
});

app.delete("/api/students/:id", async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);

    res.json({
      message: "Student deleted"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete student"
    });
  }
});

mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("MongoDB connected");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Backend running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  });
