import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// Test route - Render check karega
app.get("/", (req, res) => {
  res.send("Rorabot Server is Running Successfully!");
});

// Aapke bot ka main API
app.post("/api/chat", (req, res) => {
  const { message } = req.body;
  console.log("User message:", message);
  
  // Yaha aapka AI logic aayega
  res.json({ 
    reply: `Aapne kaha: ${message}. Server ready hai!` 
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
