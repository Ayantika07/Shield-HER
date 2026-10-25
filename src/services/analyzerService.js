// Enhanced AI Cyber Harassment & Threat Analysis Engine
// Robust, Context-Aware Natural Language Threat Classifier for SHIELD HER

// ----------------- TEXT NORMALIZATION -----------------
export function normalizeText(text) {
  if (!text) return '';
  let str = text.toLowerCase();

  // Normalize common informal contractions
  str = str
    .replace(/\bi'll\b/g, 'i will')
    .replace(/\bim\b/g, 'i am')
    .replace(/\bi'm\b/g, 'i am')
    .replace(/\bwon't\b/g, 'will not')
    .replace(/\bwont\b/g, 'will not')
    .replace(/\bcan't\b/g, 'cannot')
    .replace(/\bcant\b/g, 'cannot')
    .replace(/\bdon't\b/g, 'do not')
    .replace(/\bdont\b/g, 'do not')
    .replace(/\bgonna\b/g, 'going to')
    .replace(/\bu\b/g, 'you')
    .replace(/\bur\b/g, 'your')
    .replace(/\br\b/g, 'are')
    .replace(/\bplz\b/g, 'please')
    .replace(/\bpls\b/g, 'please');

  // Collapse repeated exclamation or question marks
  str = str.replace(/[!?]{2,}/g, '!');

  return str;
}

// ----------------- CONTEXT FILTERS (Self-worry, Negation, Quoting) -----------------
const SELF_VULNERABILITY_PATTERNS = [
  /\b(i am|i'm|im|feeling|felt)\s+(afraid|scared|worried|terrified|anxious|nervous)\s+(that|someone|he|they|anyone|might|could)\b/i,
  /\b(i am|i'm|im|was)\s+worried\s+(someone|somebody|he|they|anyone)\s+might\s+(hurt|harm|kill|attack|stalk|follow)\s+me\b/i,
  /\b(scared|afraid)\s+someone\s+will\s+(hurt|harm|attack|follow)\s+me\b/i,
  /\b(what if someone|hope nobody|worried about being)\s+(hurt|attacked|stalked|harmed)\b/i
];

const NARRATIVE_CONTEXT_PATTERNS = [
  /\b(character|villain|actor|plot|scene|protagonist)\s+in\s+(this|the|a)\s+(story|book|movie|film|series|show|play|novel)\b/i,
  /\b(in the movie|in the story|in the news|an article about|reading about)\b/i
];

const NEGATED_THREAT_PATTERNS = [
  /\b(i will not|will not|wont|won't|would never|i would never|not going to|never going to|have no intention to|do not want to)\s+(hurt|harm|kill|hit|slap|kick|beat|touch|harass|attack|rape)\s+(you|u|anyone|her|him)\b/i
];

// ----------------- PRIMARY THREAT PATTERNS & WEIGHTS -----------------
const THREAT_RULES = [
  // 1. Direct Physical Threats (Slap, Kick, Hit, Beat, Hurt, Kill, Harm, Attack, Rape, etc.)
  {
    id: 'DIRECT_VIOLENCE_COMBINED',
    category: 'Direct Physical Violence Threat',
    weight: 90,
    severity: 'Dangerous',
    regex: /\b(i will|i'll|i am going to|i'm going to|im going to|we will|we'll|swear to god i will|going to|gonna)\s+(slap|kick|beat|hit|punch|strike|hurt|harm|physically harm|injure|kill|murder|stab|shoot|strangle|choke|break your|cut|burn|destroy|attack|assault|rape|batter|lynch|drown|poison|crack your)\s+(you|u|your\s+\w+)(\s+up)?\b/i,
    explanation: 'Contains an explicit, direct statement of intent to inflict physical violence or bodily injury upon the recipient.'
  },
  {
    id: 'EXTREME_LETHAL_THREATS',
    category: 'Lethal Harm / Death Threat',
    weight: 95,
    severity: 'Dangerous',
    regex: /\b(i will kill you|i'll kill you|you won't survive|your life is over|dead meat|pay with your life|i will murder you|put you six feet under|in a body bag|end you once and for all|make you bleed to death)\b/i,
    explanation: 'Contains an unambiguous threat of homicide, lethal force, or fatal retaliation.'
  },
  {
    id: 'SEXUAL_VIOLENCE',
    category: 'Sexual Violence / Assault Threat',
    weight: 95,
    severity: 'Dangerous',
    regex: /\b(rape you|sexually assault you|force myself on you|violate you|molest you)\b/i,
    explanation: 'Contains an explicit threat of sexual violence or non-consensual sexual assault.'
  },
  {
    id: 'FAMILY_CLOSE_CONTACT_THREAT',
    category: 'Threat Against Family / Loved Ones',
    weight: 85,
    severity: 'Dangerous',
    regex: /\b(i will|i'll|going to)\s+(hurt|harm|kill|attack|destroy|get)\s+(your\s+(family|mother|mom|father|dad|sister|brother|kids|child|children|parents|friends))\b/i,
    explanation: 'Threatens physical harm or violence targeting the recipient’s family members or loved ones.'
  },
  // 2. Stalking, Residential Ambush & Surveillance
  {
    id: 'RESIDENTIAL_AMBUSH',
    category: 'Stalking / Residential Ambush Threat',
    weight: 85,
    severity: 'Dangerous',
    regex: /\b(come to your (house|home|apartment|flat|place|office|workplace)\s+and\s+(hurt|beat|kill|get|attack|harm))\b/i,
    explanation: 'Directly threatens to invade the recipient’s residence or workplace to commit physical violence.'
  },
  {
    id: 'PURSUIT_AND_ATTACK',
    category: 'Pursuit / Location Stalking Threat',
    weight: 85,
    severity: 'Dangerous',
    regex: /\b(find you and (attack|hurt|beat|kill|get|destroy)|hunt you down|track you down and)\b/i,
    explanation: 'Threatens active pursuit, hunting, and physical confrontation.'
  },
  {
    id: 'ACTIVE_SURVEILLANCE',
    category: 'Active Location Surveillance',
    weight: 50,
    severity: 'Suspicious',
    regex: /\b(outside your (house|building|window|door|office)|standing near your|watching you (leave|walk|enter)|waiting for you outside|know where you live|saw you walk into|know your exact address)\b/i,
    explanation: 'Indicates unconsented physical surveillance, monitoring of movements, or stalking of residential premises.'
  },
  // 3. Blackmail, Extortion & Non-Consensual Imagery
  {
    id: 'IMAGE_EXTORTION',
    category: 'Blackmail / Non-Consensual Imagery Extortion',
    weight: 90,
    severity: 'Dangerous',
    regex: /\b((leak|expose|share|post|send)\s+(your|ur)?\s*(nudes|private photos|intimate (photos|videos)|explicit photos|videos|webcam))\b/i,
    explanation: 'Threatens unauthorized dissemination of private or intimate photographs/videos (image-based sexual abuse).'
  },
  {
    id: 'FINANCIAL_EXTORTION',
    category: 'Financial Extortion / Coercion',
    weight: 70,
    severity: 'Dangerous',
    regex: /\b(send (me\s+)?(the\s+)?money\s+(or|by)|wire money|pay me or (else|i will)|ruin your reputation|blackmail you)\b/i,
    explanation: 'Demands monetary payment under threat of reputational or physical harm.'
  },
  // 4. Persistence, Harassment & Boundary Breach
  {
    id: 'AGGRESSIVE_PERSISTENCE',
    category: 'Coercive Persistence & Intimidation',
    weight: 35,
    severity: 'Suspicious',
    regex: /\b(why did you block (me|my calls)|made another account (to|just to)|you can't ignore me|you cannot ignore me|answer me (right now|now)|reply right now or|you will regret not replying|you belong to me)\b/i,
    explanation: 'Demonstrates aggressive circumvention of boundaries, repeated contact after blocking, and coercive urgency.'
  },
  // 5. Abusive Misogynistic Slurs
  {
    id: 'ABUSIVE_SLURS',
    category: 'Abusive Slurs & Derogatory Language',
    weight: 35,
    severity: 'Suspicious',
    regex: /\b(bitch|slut|whore|cunt|ugly whore|disgusting bitch|characterless|prostitute)\b/i,
    explanation: 'Contains targeted misogynistic slurs or dehumanizing verbal abuse.'
  }
];

// ----------------- TEST PRESETS FOR EVALUATION -----------------
export const SAMPLE_MESSAGES = [
  {
    label: 'Physical Threat ("I will slap you.")',
    type: 'Dangerous',
    text: 'I will slap you.'
  },
  {
    label: 'Physical Threat ("I will kick you.")',
    type: 'Dangerous',
    text: 'I will kick you.'
  },
  {
    label: 'Physical Threat ("I will beat you.")',
    type: 'Dangerous',
    text: 'I will beat you.'
  },
  {
    label: 'Physical Threat ("I will hit you.")',
    type: 'Dangerous',
    text: 'I will hit you.'
  },
  {
    label: 'Physical Threat ("I will hurt you.")',
    type: 'Dangerous',
    text: 'I will hurt you.'
  },
  {
    label: 'Lethal Threat ("I will kill you.")',
    type: 'Dangerous',
    text: 'I will kill you.'
  },
  {
    label: 'Pursuit Threat ("I will find you and attack you.")',
    type: 'Dangerous',
    text: 'I will find you and attack you.'
  },
  {
    label: 'Bodily Harm ("I will physically harm you.")',
    type: 'Dangerous',
    text: 'I will physically harm you.'
  },
  {
    label: 'Sexual Assault Threat ("I will rape you.")',
    type: 'Dangerous',
    text: 'I will rape you.'
  },
  {
    label: 'Residential Ambush ("I will come to your house and hurt you.")',
    type: 'Dangerous',
    text: 'I will come to your house and hurt you.'
  },
  {
    label: 'Safe Everyday Greeting ("Have a great day.")',
    type: 'Safe',
    text: 'Have a great day.'
  },
  {
    label: 'Sender Vulnerability ("I am worried someone might hurt me.")',
    type: 'Safe',
    text: 'I am worried someone might hurt me.'
  },
  {
    label: 'Narrative Fiction Context ("The character in this story...")',
    type: 'Safe',
    text: 'The character in this story threatens to kill someone.'
  }
];

// ----------------- MAIN ANALYSIS PIPELINE -----------------
export async function analyzeHarassmentMessage(rawText) {
  if (!rawText || !rawText.trim()) {
    throw new Error('Please enter or paste a message to analyze.');
  }

  const originalText = rawText.trim();
  const normalized = normalizeText(originalText);

  // Step 1: Check for sender expressing personal distress / vulnerability (not a threat)
  for (const regex of SELF_VULNERABILITY_PATTERNS) {
    if (regex.test(normalized)) {
      return {
        classification: 'SAFE / LOW OBSERVABLE RISK',
        statusKey: 'safe',
        badgeColor: 'safe',
        severityLevel: 'Support / Distress Expression (Not a Threat)',
        riskScore: 5,
        confidencePercent: 92,
        detectedFlags: [],
        matchedPhrases: [],
        highlightedTerms: [],
        contextNote: 'The sender appears to be expressing fear or seeking help rather than threatening the recipient.',
        practicalAdvice: [
          'The sender is expressing personal anxiety or fear rather than making an active threat.',
          'If this message is from a loved one seeking safety, verify their well-being and share emergency resources (112 / 1091).',
          'Use the Safe Journey Companion or GPS Safety Map to assist them in finding illuminated, safe public locations.'
        ],
        engine: 'SHIELD HER Context-Aware Heuristics Engine (v3.0)',
        timestamp: new Date().toISOString(),
        disclaimer: 'Automated heuristic classification. This tool highlights potential safety risks and does not replace emergency response.'
      };
    }
  }

  // Step 2: Check for narrative context (mentioning a character/story)
  let isNarrative = false;
  for (const regex of NARRATIVE_CONTEXT_PATTERNS) {
    if (regex.test(normalized)) {
      isNarrative = true;
      break;
    }
  }

  // Step 3: Check for negated statements
  let isNegated = false;
  for (const regex of NEGATED_THREAT_PATTERNS) {
    if (regex.test(normalized)) {
      isNegated = true;
      break;
    }
  }

  if (isNegated) {
    return {
      classification: 'SAFE / LOW OBSERVABLE RISK',
      statusKey: 'safe',
      badgeColor: 'safe',
      severityLevel: 'Negated Statement / No Threat Intent',
      riskScore: 0,
      confidencePercent: 95,
      detectedFlags: [],
      matchedPhrases: [],
      highlightedTerms: [],
      contextNote: 'The message contains reassuring or negated phrases indicating no intent to cause harm.',
      practicalAdvice: [
        'No active threat identified: the message explicitly disavows violent intent.',
        'Always trust your personal intuition if a relationship feels coercive or unhealthy regardless of digital wording.'
      ],
      engine: 'SHIELD HER Context-Aware Heuristics Engine (v3.0)',
      timestamp: new Date().toISOString(),
      disclaimer: 'Automated heuristic classification for personal safety awareness.'
    };
  }

  // Step 4: Evaluate Threat Rules against both original and normalized text
  let totalScore = 0;
  const detectedFlags = [];
  const matchedPhrases = [];
  const highlightedTerms = [];

  for (const rule of THREAT_RULES) {
    // Check against normalized text
    const normMatch = normalized.match(rule.regex);
    // Also check against original text in case of case-sensitive or exact wording
    const origMatch = originalText.match(rule.regex);

    if (normMatch || origMatch) {
      const matchSnippet = origMatch ? origMatch[0] : normMatch[0];

      // Add to score
      totalScore = Math.max(totalScore, rule.weight);
      detectedFlags.push(rule.category);
      matchedPhrases.push({
        phrase: matchSnippet,
        ruleCategory: rule.category,
        explanation: rule.explanation,
        severity: rule.severity
      });
      highlightedTerms.push(matchSnippet);
    }
  }

  // If narrative context was detected, attenuate score
  if (isNarrative && totalScore > 0) {
    totalScore = Math.min(25, Math.round(totalScore * 0.3));
  }

  // Step 5: Final Classification
  let classification = 'SAFE / LOW OBSERVABLE RISK';
  let statusKey = 'safe';
  let badgeColor = 'safe';
  let severityLevel = 'Low / No Observable Threats';
  let practicalAdvice = [];

  if (totalScore >= 60) {
    classification = 'DANGEROUS / THREAT DETECTED';
    statusKey = 'danger';
    badgeColor = 'danger';
    severityLevel = 'High Risk / Severe Threat Detected';
    practicalAdvice = [
      'Preserve this evidence immediately: capture unedited screenshots showing the sender’s full handle, phone number, and timestamps.',
      'Do not engage, negotiate, or provoke the sender. Do not comply with demands for money or private content.',
      'File an official report on the National Cyber Crime Reporting Portal: https://cybercrime.gov.in or dial 1930.',
      'If you believe you are in immediate physical danger, call 112 immediately or proceed to the nearest Women Help Desk.',
      'Save this analysis directly to your Private Evidence Locker below.'
    ];
  } else if (totalScore >= 25) {
    classification = 'SUSPICIOUS / REVIEW RECOMMENDED';
    statusKey = 'warning';
    badgeColor = 'warning';
    severityLevel = 'Moderate Risk / Review Recommended';
    practicalAdvice = [
      'Block the sender across all social media and messaging channels.',
      'Avoid sharing your live location, daily transit routes, or workplace details.',
      'Enable strict privacy controls on your social media accounts (switch to Private, audit followers).',
      'If the sender attempts contact through secondary accounts, document each occurrence in the Evidence Locker.'
    ];
  } else {
    classification = 'SAFE / LOW OBSERVABLE RISK';
    statusKey = 'safe';
    badgeColor = 'safe';
    severityLevel = 'Low Observable Risk';
    practicalAdvice = [
      'No explicit threats of violence, extortion, or harassment patterns were identified.',
      'Always exercise general discretion before sharing personal, financial, or sensitive information online.',
      'Remember that automated tools cannot identify every subtle form of manipulation. Trust your instincts.'
    ];
  }

  const confidence = matchedPhrases.length > 0
    ? Math.min(98, 85 + (matchedPhrases.length * 4))
    : 90;

  return {
    classification,
    statusKey,
    badgeColor,
    severityLevel,
    riskScore: totalScore,
    confidencePercent: confidence,
    detectedFlags: [...new Set(detectedFlags)],
    matchedPhrases,
    highlightedTerms: [...new Set(highlightedTerms)],
    practicalAdvice,
    engine: 'SHIELD HER Context-Aware Heuristics Engine (v3.0)',
    timestamp: new Date().toISOString(),
    disclaimer: 'This automated tool assists in identifying potential threats. It does not replace professional law enforcement, legal, or crisis services.'
  };
}
