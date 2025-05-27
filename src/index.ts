import express from 'express';
import authRouter from "./routes/auth.route";
import studentRoute from './routes/students.route';
import quizzRoute from './routes/quizzes.route';
import chatRoute from './routes/chat.route';
import blockRoute from './routes/block.route';
import roadmapRoute from './routes/roadmap.route';
import cors from "cors";
import { rateLimit } from 'express-rate-limit'

const app = express();
const PORT = process.env.PORT || 3000;


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per window (here, per 15 minutes).
  standardHeaders: 'draft-8', // draft-6: RateLimit-* headers; draft-7 & draft-8: combined RateLimit header
  legacyHeaders: false, // Disable the X-RateLimit-* headers.
  // store: ... , // Redis, Memcached, etc. See below.
})

// Apply the rate limiting middleware to all requests.
app.use(limiter)

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true })) // for form data
var corsOptions = {
  origin: "http://127.0.0.1:3301", // your frontend URL
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true, // if you use cookies, auth, etc.
};

app.use(cors(corsOptions));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/users/students", studentRoute);
app.use("/api/users/quizzes", quizzRoute);
app.use('/api/users/chats', chatRoute);
app.use('/api/users/blocks', blockRoute);
app.use("/api/users/roadmaps", roadmapRoute);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
