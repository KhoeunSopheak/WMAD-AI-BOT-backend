import express from 'express';
import authRouter from "./src/routes/auth.route";

const app = express();
const PORT = 3003;

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRouter);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
