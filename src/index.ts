import express, { Request, Response } from 'express';

const app = express();
const PORT = 3003;

// Middleware
app.use(express.json());

// Routes
app.get('/', (req: Request, res: Response) => {
  res.send('wellcome to wmad ai bot');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
