import express from 'express';
import authRouter from "./src/routes/auth.route";
import students from './src/routes/students.route';
import teacherRoute from './src/routes/teacher.route';

const app = express();
const PORT = 3003;

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/students", students);
app.use("/api/teachers", teacherRoute);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
