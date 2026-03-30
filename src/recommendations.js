/**
 * Category-based “word bank”: every item in a category is linked to every other.
 * Typing “ham”, “eggs”, or “bread” matches the same breakfast pool — not only “egg → ham”.
 *
 * Triggers are built from explicit keywords + words derived from item labels.
 * Not a trained embedding model; swap in an API later if needed.
 */

function normalize(s) {
  return String(s).trim().toLowerCase();
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Short tokens we still index from item titles (e.g. “Git”, “UX”). */
const SHORT_WORDS = new Set([
  'egg', 'eggs', 'ham', 'git', 'qa', 'ux', 'ui', 'api', 'ci', 'cd',
]);

function wordFromItemToken(token) {
  const t = normalize(token).replace(/[^a-z0-9]+/g, '');
  if (!t) return null;
  if (t.length >= 3) return t;
  if (SHORT_WORDS.has(t)) return t;
  return null;
}

function expandTriggers(items, extraTriggers) {
  const set = new Set();
  for (const e of extraTriggers) {
    const n = normalize(e);
    if (n) set.add(n);
  }
  for (const item of items) {
    const n = normalize(item);
    if (n) set.add(n);
    for (const part of n.split(/[\s/.-]+/)) {
      const w = wordFromItemToken(part);
      if (w) set.add(w);
    }
  }
  return Array.from(set);
}

/**
 * Categories: more specific / distinctive first so shared words (e.g. “book”) prefer one theme.
 */
const RAW_CATEGORIES = [
  {
    id: 'breakfast_groceries',
    label: 'Breakfast & groceries',
    items: [
      'Sausage',
      'Ham',
      'Eggs',
      'Bread',
      'Milk',
      'Butter',
      'Cheese',
      'Coffee',
      'Orange juice',
      'Cereal',
      'Yogurt',
      'Jam',
      'Avocado',
      'Bananas',
    ],
    triggers: [
      'breakfast', 'brunch', 'grocery', 'groceries', 'supermarket', 'market',
      'pantry', 'shopping', 'food', 'deli',
    ],
  },
  {
    id: 'travel_luggage',
    label: 'Travel & luggage',
    items: [
      'Check passport',
      'Print boarding pass',
      'Weigh luggage',
      'Luggage tags',
      'Travel adapter',
      'Toiletries bag',
      'Pack medications',
      'Power bank',
      'Hotel confirmation',
      'Travel insurance',
      'Download offline maps',
      'Notify bank / card',
    ],
    triggers: [
      'luggage', 'luggae', 'suitcase', 'backpack', 'packing', 'pack', 'unpack',
      'travel', 'trip', 'flight', 'boarding', 'airport', 'vacation', 'holiday',
      'jetlag', 'passport', 'visa', 'hotel', 'itinerary', 'abroad',
    ],
  },
  {
    id: 'code_dev',
    label: 'Code & dev',
    items: [
      'Unit tests',
      'Documentation',
      'Push to Git',
      'Code review',
      'Lint & format',
      'Fix CI pipeline',
      'Update dependencies',
      'Write release notes',
    ],
    triggers: [
      'code', 'coding', 'develop', 'developer', 'dev', 'programming', 'software',
      'refactor', 'debug', 'bugfix', 'commit', 'branch', 'merge', 'pr', 'pull request',
    ],
  },
  {
    id: 'meeting_work',
    label: 'Meetings & work',
    items: [
      'Prepare agenda',
      'Send calendar invite',
      'Book room',
      'Share minutes',
      'Follow up action items',
      'Record meeting',
    ],
    triggers: [
      'meeting', 'meetings', 'standup', 'sync', '1:1', 'workshop', 'presentation',
      'conference', 'call', 'zoom', 'teams',
    ],
  },
  {
    id: 'design_ux',
    label: 'Design & UX',
    items: [
      'Figma prototype',
      'User feedback',
      'Style guide',
      'Accessibility audit',
      'Wireframes',
      'Design handoff',
    ],
    triggers: [
      'design', 'designing', 'ux', 'ui', 'figma', 'prototype', 'wireframe',
      'mockup', 'branding', 'visual',
    ],
  },
  {
    id: 'fitness',
    label: 'Fitness & health',
    items: [
      'Gym session',
      'Stretching',
      'Protein / meal prep',
      'Hydration',
      'Sleep schedule',
      'Steps goal',
    ],
    triggers: [
      'gym', 'workout', 'run', 'running', 'cardio', 'lift', 'fitness', 'jog',
      'exercise', 'training', 'muscle',
    ],
  },
  {
    id: 'study',
    label: 'Study & exams',
    items: [
      'Review notes',
      'Practice past papers',
      'Flashcards',
      'Office hours',
      'Group study',
      'Exam registration',
    ],
    triggers: [
      'study', 'studying', 'exam', 'midterm', 'final', 'quiz', 'homework',
      'assignment', 'course', 'lecture', 'tutorial',
    ],
  },
  {
    id: 'home',
    label: 'Home & chores',
    items: [
      'Laundry',
      'Trash / recycling',
      'Vacuum',
      'Dishwasher',
      'Buy groceries',
      'Pay utilities',
    ],
    triggers: [
      'chore', 'chores', 'clean', 'cleaning', 'laundry', 'household', 'house',
      'apartment', 'utilities',
    ],
  },
  {
    id: 'finance',
    label: 'Finance & admin',
    items: [
      'Pay rent',
      'Credit card bill',
      'Budget review',
      'Tax documents',
      'Subscription audit',
    ],
    triggers: [
      'finance', 'money', 'budget', 'bill', 'bills', 'rent', 'tax', 'invoice',
      'bank', 'salary',
    ],
  },
  {
    id: 'product_launch',
    label: 'Launch & GTM',
    items: [
      'Finalize PRD',
      'Update changelog',
      'Internal demo',
      'Prepare marketing assets',
      'Review analytics tracking',
      'Community announcement',
    ],
    triggers: [
      'launch', 'release', 'gtm', 'go-to-market', 'ship', 'shipping', 'deployment',
      'live', 'production', 'version', 'update', 'announcement', 'marketing',
    ],
  },
  {
    id: 'user_research',
    label: 'Research & Insights',
    items: [
      'Interview script',
      'Recruit participants',
      'Synthesize findings',
      'Competitor analysis',
      'Survey distribution',
      'Persona update',
    ],
    triggers: [
      'research', 'interview', 'user', 'customers', 'feedback', 'insights',
      'survey', 'data', 'discovery', 'competitor', 'benchmark',
    ],
  },
  {
    id: 'events_networking',
    label: 'Events & Networking',
    items: [
      'Update LinkedIn',
      'Prepare business cards',
      'Follow up emails',
      'RSVP to event',
      'Prepare elevator pitch',
      'Review guest list',
    ],
    triggers: [
      'event', 'conference', 'meetup', 'networking', 'mixer', 'talk', 'speech',
      'panel', 'seminar', 'webinar', 'connect', 'linkedin',
    ],
  },
  {
    id: 'self_care',
    label: 'Self-care & Focus',
    items: [
      'Meditation',
      'Journaling',
      'Digital detox',
      'Reading time',
      'Walk in nature',
      'Breathing exercises',
    ],
    triggers: [
      'rest', 'relax', 'mental', 'health', 'meditate', 'journal', 'break',
      'morning', 'evening', 'routine', 'calm', 'stress', 'mindfulness',
    ],
  },
  {
    id: 'career_growth',
    label: 'Career & Growth',
    items: [
      'Update CV/Resume',
      'Skill gap analysis',
      'Portfolio review',
      'Mentorship session',
      'Set quarterly OKRs',
      'Salary benchmarking',
    ],
    triggers: [
      'career', 'job', 'promotion', 'resume', 'cv', 'portfolio', 'interviewing',
      'growth', 'learning', 'mentor', 'mentee', 'goals', 'okr', 'kpi',
    ],
  }
];

const CATEGORIES = RAW_CATEGORIES.map((cat) => ({
  ...cat,
  triggersExpanded: expandTriggers(cat.items, cat.triggers || []),
}));

function findCategoryForText(text) {
  const n = normalize(text);
  if (!n) return null;

  const candidates = [];
  for (const cat of CATEGORIES) {
    const triggers = [...cat.triggersExpanded].sort((a, b) => b.length - a.length);
    for (const trig of triggers) {
      const re = new RegExp(`\\b${escapeRegExp(trig)}\\b`, 'i');
      if (re.test(n)) {
        candidates.push({ category: cat, matchedTrigger: trig });
        break;
      }
    }
  }
  if (candidates.length === 0) return null;

  if (candidates.length === 1) return candidates[0];

  candidates.sort((a, b) => b.matchedTrigger.length - a.matchedTrigger.length);
  return candidates[0];
}

function taskTextsSet(tasks) {
  return new Set(tasks.map((t) => normalize(t.text)));
}

/** Input already names this item (don’t suggest repeating the same line). */
function inputAlreadyMentionsItem(input, itemLabel) {
  const n = normalize(input);
  const item = normalize(itemLabel);
  if (!item) return false;
  const re = new RegExp(`\\b${escapeRegExp(item)}\\b`, 'i');
  return re.test(n);
}

function filterSuggestionsForInput(input, items, existing) {
  return items.filter((item) => {
    if (existing.has(normalize(item))) return false;
    if (inputAlreadyMentionsItem(input, item)) return false;
    return true;
  });
}

/**
 * Returns suggestions from the dictionary + optional boost from the most recent task.
 */
export function getRecommendations(input, tasks) {
  const existing = taskTextsSet(tasks);
  let match = findCategoryForText(input);

  if (!match && tasks.length > 0 && input.trim().length >= 2) {
    const lastText = normalize(tasks[0].text);
    const inp = normalize(input);
    if (lastText.includes(inp) || inp.includes(lastText)) {
      match = findCategoryForText(tasks[0].text);
    }
  }

  if (!match) return null;

  const { category, matchedTrigger } = match;
  const notYetAdded = filterSuggestionsForInput(
    input,
    category.items,
    existing
  );

  if (notYetAdded.length === 0) return null;

  return {
    matchedLabel: category.label,
    matchedCategoryId: category.id,
    matchedTrigger,
    primary: notYetAdded[0],
    alternatives: notYetAdded.slice(1),
  };
}
