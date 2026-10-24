import { openDB } from 'idb';

const DB_NAME = 'ShieldHerDB';
const DB_VERSION = 1;

// Initialize IndexedDB with all object stores
export async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // 1. Evidence Locker (Incidents)
      if (!db.objectStoreNames.contains('incidents')) {
        const incidentStore = db.createObjectStore('incidents', { keyPath: 'id' });
        incidentStore.createIndex('category', 'category');
        incidentStore.createIndex('createdAt', 'createdAt');
      }

      // 2. Safe Journeys
      if (!db.objectStoreNames.contains('journeys')) {
        const journeyStore = db.createObjectStore('journeys', { keyPath: 'id' });
        journeyStore.createIndex('status', 'status');
        journeyStore.createIndex('startTime', 'startTime');
      }

      // 3. Emergency Contacts
      if (!db.objectStoreNames.contains('contacts')) {
        db.createObjectStore('contacts', { keyPath: 'id' });
      }

      // 4. Cached Resources (Police stations, hospitals, transport)
      if (!db.objectStoreNames.contains('resources')) {
        const resourceStore = db.createObjectStore('resources', { keyPath: 'id' });
        resourceStore.createIndex('category', 'category');
      }

      // 5. Digital Privacy Checklist Progress
      if (!db.objectStoreNames.contains('checklist')) {
        db.createObjectStore('checklist', { keyPath: 'id' });
      }

      // 6. Police Request References
      if (!db.objectStoreNames.contains('policeReferences')) {
        db.createObjectStore('policeReferences', { keyPath: 'id' });
      }

      // 7. Offline Safety Guides
      if (!db.objectStoreNames.contains('safetyGuides')) {
        db.createObjectStore('safetyGuides', { keyPath: 'id' });
      }
    },
  });
}

export const SAMPLE_INCIDENTS = [
  {
    id: 'inc_sample_1',
    title: 'Repeated Stalking & Unsolicited DMs on Instagram',
    category: 'Cyber Harassment',
    date: '2026-10-22',
    time: '21:45',
    location: 'Online / Instagram DM (@anonymous_tracker_99)',
    suspect: '@anonymous_tracker_99 (Account created Oct 2026)',
    description: 'Received repeated messages containing photos of my apartment exterior, stating "I know when you reach home from work". Blocked original account, but user created a secondary profile to message again.',
    evidenceCount: 2,
    evidenceFiles: [
      { name: 'screenshot_insta_threat.png', size: '240 KB', type: 'image/png' },
      { name: 'profile_url_metadata.pdf', size: '112 KB', type: 'application/pdf' }
    ],
    analysisReport: {
      riskLevel: 'Potentially Dangerous',
      score: 88,
      detectedPatterns: ['Location Tracking / Stalking', 'Repeated Contact After Block', 'Intimidation'],
      recommendedAction: 'Preserve full headers, submit immediate cyber complaint on cybercrime.gov.in and report to local Women Police Desk.'
    },
    createdAt: '2026-10-22T21:50:00.000Z',
    updatedAt: '2026-10-22T21:50:00.000Z'
  },
  {
    id: 'inc_sample_2',
    title: 'Aggressive Follower on Evening Walk near Janpath',
    category: 'Physical Safety',
    date: '2026-10-18',
    time: '19:20',
    location: 'Janpath Metro Station Gate 2, New Delhi',
    suspect: 'Unknown male, approx 30 yrs, black jacket and helmet',
    description: 'Noticed a two-wheeler matching my walking pace for 3 blocks. Ducked into the Janpath safe haven pharmacy until trusted contact arrived. Recorded vehicle partial number plate (DL-3S-XXXX).',
    evidenceCount: 1,
    evidenceFiles: [
      { name: 'partial_numberplate_note.jpg', size: '1.2 MB', type: 'image/jpeg' }
    ],
    createdAt: '2026-10-18T19:40:00.000Z',
    updatedAt: '2026-10-18T19:40:00.000Z'
  }
];

// ----------------- INCIDENTS (Evidence Locker) -----------------
export async function getAllIncidents() {
  const db = await getDB();
  let incidents = await db.getAll('incidents');
  if (incidents.length === 0) {
    for (const inc of SAMPLE_INCIDENTS) {
      await db.put('incidents', inc);
    }
    incidents = SAMPLE_INCIDENTS;
  }
  return incidents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function saveIncident(incident) {
  const db = await getDB();
  const id = incident.id || 'inc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
  const record = {
    ...incident,
    id,
    createdAt: incident.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  await db.put('incidents', record);
  return record;
}

export async function deleteIncident(id) {
  const db = await getDB();
  await db.delete('incidents', id);
  return true;
}

// ----------------- JOURNEYS -----------------
export async function getActiveJourney() {
  const db = await getDB();
  const journeys = await db.getAll('journeys');
  return journeys.find(j => j.status === 'active' || j.status === 'paused') || null;
}

export async function getAllJourneys() {
  const db = await getDB();
  const journeys = await db.getAll('journeys');
  return journeys.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
}

export async function saveJourney(journey) {
  const db = await getDB();
  const id = journey.id || 'jny_' + Date.now();
  const record = { ...journey, id, updatedAt: new Date().toISOString() };
  await db.put('journeys', record);
  return record;
}

// ----------------- EMERGENCY CONTACTS -----------------
export const DEFAULT_CONTACTS = [
  { id: 'c1', name: 'Ritu Sharma', relationship: 'Mother', phone: '+919876543210', isPrimary: true },
  { id: 'c2', name: 'Pooja Verma', relationship: 'Sister / Flatmate', phone: '+919811223344', isPrimary: false },
  { id: 'c3', name: 'Aakash Mehta', relationship: 'Trusted Colleague', phone: '+919822334455', isPrimary: false }
];

export async function getEmergencyContacts() {
  const db = await getDB();
  const contacts = await db.getAll('contacts');
  if (contacts.length === 0) {
    for (const c of DEFAULT_CONTACTS) {
      await db.put('contacts', c);
    }
    return DEFAULT_CONTACTS;
  }
  return contacts;
}

export async function saveContact(contact) {
  const db = await getDB();
  const id = contact.id || 'cnt_' + Date.now();
  const record = { ...contact, id };
  await db.put('contacts', record);
  return record;
}

export async function deleteContact(id) {
  const db = await getDB();
  await db.delete('contacts', id);
  return true;
}

// ----------------- CACHED SAFETY RESOURCES -----------------
export const DEFAULT_RESOURCES = [
  {
    id: 'res_1',
    name: 'Connaught Place Women Police Station',
    category: 'police',
    isWomenDesk: true,
    address: 'B-Block, Connaught Place, New Delhi 110001',
    phone: '011-23747100',
    lat: 28.6315,
    lng: 77.2167,
    verified: true,
    available247: true,
    officialLink: 'https://delhipolice.gov.in',
    notes: 'Dedicated 24x7 Women Help Desk with female officers on duty.'
  },
  {
    id: 'res_2',
    name: 'Parliament Street Police Station',
    category: 'police',
    isWomenDesk: true,
    address: 'Parliament Street, New Delhi 110001',
    phone: '011-23361100',
    lat: 28.6250,
    lng: 77.2120,
    verified: true,
    available247: true,
    officialLink: 'https://delhipolice.gov.in'
  },
  {
    id: 'res_3',
    name: 'Lady Hardinge Medical College & Hospital',
    category: 'hospital',
    address: 'Shaheed Bhagat Singh Marg, DIZ Area, Connaught Place, New Delhi',
    phone: '011-23363728',
    lat: 28.6342,
    lng: 77.2135,
    verified: true,
    available247: true,
    notes: '24/7 Emergency Trauma care & Women Special Care Wing.'
  },
  {
    id: 'res_4',
    name: 'Dr. Ram Manohar Lohia (RML) Hospital',
    category: 'hospital',
    address: 'Baba Kharak Singh Marg, Connaught Place, New Delhi 110001',
    phone: '011-23365525',
    lat: 28.6241,
    lng: 77.2023,
    verified: true,
    available247: true,
    notes: 'Level-1 Emergency Trauma & Crisis Support Unit.'
  },
  {
    id: 'res_5',
    name: 'Rajiv Chowk Metro Station & Safe Zone',
    category: 'transit',
    address: 'Underground Connaught Place, Central Delhi',
    phone: '011-23417910',
    lat: 28.6328,
    lng: 77.2195,
    verified: true,
    available247: false,
    notes: 'Dedicated CISF Women Assistance Booth at Gate No. 2 & Gate No. 7.'
  },
  {
    id: 'res_6',
    name: 'New Delhi Railway Station Police Post & Help Booth',
    category: 'transit',
    address: 'Paharganj Side & Ajmeri Gate Side, New Delhi',
    phone: '139',
    lat: 28.6430,
    lng: 77.2223,
    verified: true,
    available247: true,
    notes: 'RPF Meri Saheli team stationed for female traveler safety.'
  },
  {
    id: 'res_7',
    name: 'Janpath 24x7 Safe Haven & Pharmacy Hub',
    category: 'public',
    address: 'Janpath Road, near Tolstoy Marg, New Delhi',
    phone: '011-23321500',
    lat: 28.6225,
    lng: 77.2185,
    verified: true,
    available247: true,
    notes: 'High security street presence, continuous CCTV surveillance and 24x7 chemist.'
  }
];

export async function getCachedResources(category = 'all') {
  const db = await getDB();
  let resources = await db.getAll('resources');
  if (resources.length === 0) {
    for (const r of DEFAULT_RESOURCES) {
      await db.put('resources', r);
    }
    resources = DEFAULT_RESOURCES;
  }
  if (category && category !== 'all') {
    return resources.filter(r => r.category === category);
  }
  return resources;
}

export async function saveResource(resource) {
  const db = await getDB();
  const id = resource.id || 'res_' + Date.now();
  const record = { ...resource, id };
  await db.put('resources', record);
  return record;
}

// ----------------- PRIVACY CHECKLIST -----------------
export const DEFAULT_CHECKLIST = [
  {
    id: 'chk_1',
    category: 'Account Security',
    title: 'Enable Two-Factor Authentication (2FA) on Email & Primary Accounts',
    description: 'Use an authenticator app (Google Authenticator or Aegis) rather than SMS where possible to prevent SIM-swap attacks.',
    actionStep: 'Go to Google/Apple Account > Security > 2-Step Verification > Add Authenticator.',
    completed: true,
    completedAt: '2026-10-20T10:00:00.000Z'
  },
  {
    id: 'chk_2',
    category: 'Account Security',
    title: 'Audit Password Strength & Replace Shared Passwords',
    description: 'Ensure each banking, social media, and communication account has a unique 14+ character passphrase.',
    actionStep: 'Use a password manager (e.g. Bitwarden, KeePassXC) to audit duplicate or breached passwords.',
    completed: true,
    completedAt: '2026-10-21T14:30:00.000Z'
  },
  {
    id: 'chk_3',
    category: 'Social Media & Privacy',
    title: 'Lock Down Instagram & Facebook Audience Visibility',
    description: 'Prevent strangers from viewing your past stories, tagged photos, and friend connections.',
    actionStep: 'Settings > Privacy > Switch Account to Private. Turn off "Suggest your account to others".',
    completed: false
  },
  {
    id: 'chk_4',
    category: 'Device & Location',
    title: 'Review Continuous Location Permissions on Mobile Apps',
    description: 'Food delivery, cab, and shopping apps do not require "Always Allow" location access.',
    actionStep: 'Phone Settings > Privacy > Permission Manager > Location > Change to "Only while using app".',
    completed: false
  },
  {
    id: 'chk_5',
    category: 'Phishing & Harassment',
    title: 'Recognize Suspicious Urgency and OTP/Payment Impersonation',
    description: 'Never share OTPs, click unexpected courier tracking links, or send photos under emotional extortion.',
    actionStep: 'Remember: Police and banks NEVER ask for OTPs or demand immediate webcam verification.',
    completed: true,
    completedAt: '2026-10-22T09:15:00.000Z'
  },
  {
    id: 'chk_6',
    category: 'Account Recovery',
    title: 'Verify Emergency Recovery Phone and Backup Emails',
    description: 'Check that an ex-partner or unverified party is not listed as your secondary account recovery contact.',
    actionStep: 'Open Google Account / Apple ID > Security > Recovery Info > Remove outdated numbers.',
    completed: false
  },
  {
    id: 'chk_7',
    category: 'Evidence & Records',
    title: 'Learn How to Capture Forensic Digital Evidence',
    description: 'Always capture full screenshots showing the sender’s full handle, profile URL, date, and timestamp.',
    actionStep: 'Store unedited screenshots immediately in SHIELD HER Private Evidence Locker.',
    completed: true,
    completedAt: '2026-10-23T11:00:00.000Z'
  }
];

export async function getChecklistItems() {
  const db = await getDB();
  const stored = await db.getAll('checklist');
  if (stored.length === 0) {
    for (const item of DEFAULT_CHECKLIST) {
      await db.put('checklist', item);
    }
    return DEFAULT_CHECKLIST;
  }
  return stored;
}

export async function toggleChecklistItem(id, completed) {
  const db = await getDB();
  const item = await db.get('checklist', id);
  if (item) {
    item.completed = completed;
    item.completedAt = completed ? new Date().toISOString() : null;
    await db.put('checklist', item);
    return item;
  }
  return null;
}

export async function resetChecklist() {
  const db = await getDB();
  await db.clear('checklist');
  for (const item of DEFAULT_CHECKLIST) {
    await db.put('checklist', { ...item, completed: false, completedAt: null });
  }
  return getChecklistItems();
}

// ----------------- POLICE OFFICIAL REFERENCES -----------------
export async function getPoliceReferences() {
  const db = await getDB();
  return db.getAll('policeReferences');
}

export async function savePoliceReference(ref) {
  const db = await getDB();
  const id = ref.id || 'ref_' + Date.now();
  const record = { ...ref, id, createdAt: new Date().toISOString() };
  await db.put('policeReferences', record);
  return record;
}

// ----------------- DATABASE PURGE / RESET -----------------
export async function clearAllLocalData() {
  const db = await getDB();
  await db.clear('incidents');
  await db.clear('journeys');
  await db.clear('contacts');
  await db.clear('checklist');
  await db.clear('policeReferences');
  // Re-seed default contacts & checklist
  for (const c of DEFAULT_CONTACTS) await db.put('contacts', c);
  for (const item of DEFAULT_CHECKLIST) await db.put('checklist', item);
  return true;
}
