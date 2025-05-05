import express from 'express';
import authRouter from "./src/routes/auth.route";
import studentRoute from './src/routes/students.route';

const app = express();
const PORT = 3003;

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/users/students", studentRoute);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
