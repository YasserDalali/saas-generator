import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const authRouter = Router();

// Mock user data (replace with database)
const users = [
  { id: 1, email: "admin@example.com", password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi" } // password: "password"
];

// Login route
authRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "24h" }
    );
    
    res.json({ 
      token,
      user: { id: user.id, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Register route
authRouter.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user (in real app, save to database)
    const newUser = {
      id: users.length + 1,
      email,
      password: hashedPassword
    };
    
    users.push(newUser);
    
    // Generate JWT
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "24h" }
    );
    
    res.status(201).json({ 
      token,
      user: { id: newUser.id, email: newUser.email }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default authRouter; 