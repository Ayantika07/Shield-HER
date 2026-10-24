// AI Cyber Harassment & Threat Analysis Engine
// Dual mode: Heuristic natural-language pattern classifier + optional Google Gemini API

// Threat indicators categorized by risk severity
const PATTERN_CATEGORIES = {
  SEVERE_THREATS: {
    weight: 45,
    label: 'Direct Physical Violence or Bodily Harm',
    patterns: [
      /\b(kill|murder|hurt|stab|shoot|strangle|break your|beat you|rape|assault|destroy you|cut you|burn you)\b/i,
      /\b(watch your back|you won't survive|your life is over|dead meat|i will find you and)\b/i,
      /\b(pay with your life|grave|end you|gonna choke you)\b/i
    ]
  },
  EXTORTION_BLACKMAIL: {
    weight: 35,
    label: 'Extortion, Blackmail & Non-Consensual Imagery',
    patterns: [
      /\b(leak|expose|nudes|private photos|intimate videos|send money or else|ruin your reputation|share with your family|send to your boss)\b/i,
      /\b(blackmail|pay me|wire money|bitcoin|unless you do what i say|send more photos or i will)\b/i,
      /\b(webcam video|recorded you|compromised photos)\b/i
    ]
  },
  STALKING_TRACKING: {
    weight: 30,
    label: 'Location Stalking, Surveillance & Intimidation',
    patterns: [
      /\b(outside your|saw you at|following you|know where you live|standing near your|watching you|at your window)\b/i,
      /\b(know your address|know which college|know where you work|track you|wearing that blue|saw you leave)\b/i,
      /\b(i am right behind you|waiting downstairs|your car plate)\b/i
    ]
  },
  COERCION_PERSISTENCE: {
    weight: 20,
    label: 'Unsolicited Persistence, Harassment & Boundary Breach',
    patterns: [
      /\b(answer me now|pick up the phone|why did you block me|you can't ignore me|made another account to text you)\b/i,
      /\b(delete this or|who was that guy|you belong to me|nobody else can have you|regret not replying)\b/i,
      /\b(stop ignoring|reply right now or else|unblock me)\b/i
    ]
  },
  ABUSIVE_SLURS: {
    weight: 25,
    label: 'Derogatory Language, Misogynistic Slurs & Harassment',
    patterns: [
      /\b(bitch|slut|whore|worthless|cunt|ugly|disgusting|piece of trash|die alone)\b/i,
      /\b(prostitute|shameless woman|characterless)\b/i
    ]
  },
  SUSPICIOUS_PHISHING: {
    weight: 15,
    label: 'Suspicious Verification Urgency / Phishing Trap',
    patterns: [
      /\b(verify account or delete|urgent otp|click this link to claim|police notice regarding your photos|court summons link)\b/i,
      /\b(bit\.ly|tinyurl|is\.gd|shorturl|suspicious-login)\b/i
    ]
  }
};

export const SAMPLE_MESSAGES = [
  {
    label: 'Safe Everyday Message',
    type: 'Safe',
    text: 'Hey Aanya! Are we still meeting for coffee at the Connaught Place cafe around 5 PM? Let me know if you need me to pick you up from the metro station.'
  },
  {
    label: 'Suspicious / Coercive Message',
    type: 'Suspicious',
    text: 'Why did you block my calls? You cannot just ignore me after everything. I made another account just to reach you. Reply right now or you will regret not talking to me.'
  },
  {
    label: 'High-Risk Threat / Harassment Message',
    type: 'Dangerous',
    text: 'I know where you live and I saw you walk into your apartment wearing that red jacket. Send me the money by tonight or I will leak your private photos to your family and workplace. Watch your back when you step outside.'
  }
];

export async function analyzeHarassmentMessage(text, apiKey = '') {
  if (!text || text.trim().length === 0) {
    throw new Error('Please enter or paste a message to analyze.');
  }

  const cleanText = text.trim();

  // If a valid Gemini API key is provided, attempt LLM analysis with fallback
  if (apiKey && apiKey.startsWith('AIza')) {
    try {
      const geminiResult = await callGeminiAPI(cleanText, apiKey);
      if (geminiResult) return geminiResult;
    } catch (err) {
      console.warn('Gemini API call failed, falling back to local heuristic analyzer:', err);
    }
  }

  // Local Rule-Based Heuristic Detection Engine
  return analyzeLocalHeuristics(cleanText);
}

function analyzeLocalHeuristics(text) {
  let totalScore = 0;
  const detectedFlags = [];
  const highlightedTerms = [];

  for (const [key, category] of Object.entries(PATTERN_CATEGORIES)) {
    let categoryMatched = false;
    for (const regex of category.patterns) {
      const match = text.match(regex);
      if (match) {
        if (!categoryMatched) {
          totalScore += category.weight;
          detectedFlags.push(category.label);
          categoryMatched = true;
        }
        highlightedTerms.push(match[0]);
      }
    }
  }

  // Cap score at 100
  totalScore = Math.min(100, totalScore);

  let classification = 'Safe';
  let badgeColor = 'safe';
  let severityLevel = 'Low Risk';
  let practicalAdvice = [];

  if (totalScore >= 40) {
    classification = 'Potentially Dangerous';
    badgeColor = 'danger';
    severityLevel = 'Critical / High Severity';
    practicalAdvice = [
      'Preserve this evidence immediately: capture full screenshots with timestamps, sender username, and profile URL.',
      'Do not engage, negotiate, or reply directly to threats of harm or extortion.',
      'File an immediate report on the National Cyber Crime Reporting Portal: https://cybercrime.gov.in or dial helpline 1930.',
      'If you believe you are in immediate physical danger, dial 112 or visit your nearest Women Help Desk.',
      'Save this message directly to your Private Evidence Locker below.'
    ];
  } else if (totalScore >= 15) {
    classification = 'Suspicious';
    badgeColor = 'warning';
    severityLevel = 'Moderate Risk / Caution Advised';
    practicalAdvice = [
      'Block the sender across all social media and messaging channels.',
      'Avoid sharing your live location, daily routines, or workplace details.',
      'Enable strict privacy settings on social accounts (Private account, reject unknown requests).',
      'Document repeated communication patterns if the sender attempts to reach you from new accounts.',
      'Save to Evidence Locker if unwanted behavior persists.'
    ];
  } else {
    classification = 'Safe';
    badgeColor = 'safe';
    severityLevel = 'Low / No Observable Threats';
    practicalAdvice = [
      'No explicit harassment, intimidation, or extortion patterns were identified.',
      'Always exercise general discretion before sharing personal, financial, or location information with unfamiliar contacts.',
      'Trust your instincts: if something feels uncomfortable, prioritize your privacy and disengage.'
    ];
  }

  const confidence = Math.min(95, Math.max(70, 70 + (highlightedTerms.length * 6)));

  return {
    classification,
    badgeColor,
    severityLevel,
    riskScore: totalScore,
    confidencePercent: confidence,
    detectedFlags: [...new Set(detectedFlags)],
    highlightedTerms: [...new Set(highlightedTerms)],
    practicalAdvice,
    engine: 'Rule-Based Safety Heuristics Engine (v2.1)',
    timestamp: new Date().toISOString(),
    disclaimer: 'This automated heuristic classifier flags recognized harassment, stalking, and extortion patterns. It does not replace professional legal, law enforcement, or crisis consultation.'
  };
}

async function callGeminiAPI(text, apiKey) {
  const prompt = `You are a specialized Women's Digital Protection and Cyber Harassment safety expert.
Analyze the following digital message and return ONLY valid JSON without markdown wrapping:
Message: "${text}"

JSON schema required:
{
  "classification": "Safe" | "Suspicious" | "Potentially Dangerous",
  "riskScore": number (0 to 100),
  "confidencePercent": number (0 to 100),
  "severityLevel": string,
  "detectedFlags": string[],
  "highlightedTerms": string[],
  "practicalAdvice": string[]
}`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1, responseMimeType: 'application/json' }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawJson) return null;

  const parsed = JSON.parse(rawJson);
  let badgeColor = 'safe';
  if (parsed.classification === 'Potentially Dangerous') badgeColor = 'danger';
  else if (parsed.classification === 'Suspicious') badgeColor = 'warning';

  return {
    ...parsed,
    badgeColor,
    engine: 'Google Gemini 1.5 Safety Classifier',
    timestamp: new Date().toISOString(),
    disclaimer: 'Automated AI analysis provided for initial risk assessment. Always contact 112 or local authorities in genuine emergencies.'
  };
}
