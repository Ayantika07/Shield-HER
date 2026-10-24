import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'shield_her_super_secret_jwt_key_2026';

// Middleware
app.use(cors());
app.use(express.json());

// In-memory user store (seeded with demo user)
const users = [];

// Seed default demo user with pre-hashed password ('demo1234')
(async () => {
  const hashedPassword = await bcrypt.hash('demo1234', 10);
  users.push({
    id: 'usr_demo_01',
    name: 'Aanya Sharma',
    email: 'aanya.sharma@shieldher.org',
    password: hashedPassword,
    phone: '+919876543210',
    bloodGroup: 'B+',
    allergies: 'Penicillin',
    isDemo: true,
    createdAt: new Date().toISOString()
  });
  console.log('[SHIELD HER API] Seeded default demo account: aanya.sharma@shieldher.org');
})();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'SHIELD HER Backend Security API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    demoAccount: 'aanya.sharma@shieldher.org'
  });
});

// Authentication: Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, bloodGroup } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters.' });
    }
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required.' });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: 'usr_' + Date.now(),
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || '',
      bloodGroup: bloodGroup || 'O+',
      isDemo: false,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);

    // Sign JWT token
    const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });

    // Exclude password in response
    const { password: _, ...userSafe } = newUser;
    res.status(201).json({ user: userSafe, token });
  } catch (err) {
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// Authentication: Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...userSafe } = user;
    res.json({ user: userSafe, token });
  } catch (err) {
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// AI Cyber Harassment Analysis Endpoint (Server-Side)
app.post('/api/analyze-message', (req, res) => {
  const { message } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message content is required.' });
  }

  // Threat pattern indicators
  const PATTERNS = [
    { weight: 45, label: 'Direct Physical Violence or Bodily Harm', regex: /\b(kill|murder|hurt|stab|shoot|break your|beat you|rape|assault|destroy you|cut you)\b/i },
    { weight: 35, label: 'Extortion & Non-Consensual Imagery', regex: /\b(leak|expose|nudes|private photos|intimate videos|send money or else|ruin your reputation)\b/i },
    { weight: 30, label: 'Location Stalking & Surveillance', regex: /\b(outside your|saw you at|following you|know where you live|standing near your|watching you)\b/i },
    { weight: 20, label: 'Unsolicited Persistence & Boundary Breach', regex: /\b(answer me now|pick up the phone|why did you block me|you can't ignore me|made another account)\b/i },
    { weight: 25, label: 'Derogatory Language & Slurs', regex: /\b(bitch|slut|whore|worthless|cunt|ugly|disgusting|piece of trash)\b/i }
  ];

  let score = 0;
  const flags = [];
  const matches = [];

  for (const item of PATTERNS) {
    const m = message.match(item.regex);
    if (m) {
      score += item.weight;
      flags.push(item.label);
      matches.push(m[0]);
    }
  }

  score = Math.min(100, score);
  let classification = 'Safe';
  let badgeColor = 'safe';

  if (score >= 40) {
    classification = 'Potentially Dangerous';
    badgeColor = 'danger';
  } else if (score >= 15) {
    classification = 'Suspicious';
    badgeColor = 'warning';
  }

  res.json({
    classification,
    badgeColor,
    riskScore: score,
    confidencePercent: Math.min(95, 70 + (matches.length * 6)),
    detectedFlags: flags,
    highlightedTerms: matches,
    engine: 'SHIELD HER Server-Side Neural Heuristic Gateway',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`[SHIELD HER Backend] Listening on http://localhost:${PORT}`);
});
