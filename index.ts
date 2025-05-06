import express from 'express';
import authRouter from "./src/routes/auth.route";
import studentRoute from './src/routes/students.route';
import quizzRoute from './src/routes/quizzes.route';
import chatRoute from './src/routes/chat.route';
import roadmapRoute from './src/routes/roadmap.route';

const app = express();
const PORT = 3003;

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/users/students", studentRoute);
app.use("/api/users/quizzes", quizzRoute);
app.use('/api/users/chats', chatRoute);
app.use("/api/users/roadmaps", roadmapRoute);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
