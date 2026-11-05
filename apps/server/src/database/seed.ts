import { Database } from './index';
import { logger } from '../utils/logger';
import {
  Activity,
  AffirmationModel,
  AchievementModel,
  ResourceModel,
} from '../models';

export const SEED_ACTIVITIES = [
  {
    slug: 'box-breathing',
    title: 'Box Breathing (Sama Vritti)',
    description: 'A powerful technique used by athletes and yogis to instantly calm the nervous system and regain focus.',
    category: 'breathing',
    duration: 240, // 4 minutes
    difficulty: 'beginner',
    instructions: [
      'Inhale slowly and smoothly through your nose for 4 counts.',
      'Gently hold your breath with full lungs for 4 counts.',
      'Exhale smoothly through your mouth for 4 counts.',
      'Hold your breath with empty lungs for 4 counts.',
      'Repeat this cycle until you feel grounded.',
    ],
    isActive: true,
  },
  {
    slug: '4-7-8-breathing',
    title: '4-7-8 Relaxing Breath',
    description: 'Dr. Andrew Weil’s natural tranquilizer for the nervous system, ideal before sleep or when feeling anxious.',
    category: 'breathing',
    duration: 300, // 5 minutes
    difficulty: 'beginner',
    instructions: [
      'Place the tip of your tongue against the ridge behind your upper front teeth.',
      'Exhale completely through your mouth with a whoosh sound.',
      'Close your mouth and inhale quietly through your nose for 4 counts.',
      'Hold your breath for a count of 7.',
      'Exhale completely through your mouth for a count of 8.',
      'Repeat for 4 to 8 cycles.',
    ],
    isActive: true,
  },
  {
    slug: 'sensory-grounding-54321',
    title: '5-4-3-2-1 Sensory Grounding',
    description: 'An evidence-based cognitive grounding technique that pulls you out of runaway thoughts into the present moment.',
    category: 'grounding',
    duration: 360, // 6 minutes
    difficulty: 'beginner',
    instructions: [
      'Notice 5 things you can SEE around you right now.',
      'Notice 4 things you can physically TOUCH or FEEL.',
      'Notice 3 distinct sounds you can HEAR in your environment.',
      'Notice 2 things you can SMELL (or favorite scents).',
      'Notice 1 thing you can TASTE or one thing you are grateful for.',
    ],
    isActive: true,
  },
  {
    slug: 'loving-kindness-meditation',
    title: 'Loving-Kindness Meditation (Metta)',
    description: 'Cultivate profound self-compassion, reduce negative self-talk, and foster emotional warmth.',
    category: 'meditation',
    duration: 480, // 8 minutes
    difficulty: 'intermediate',
    instructions: [
      'Sit comfortably and bring your attention to your heart center.',
      'Silently recite: May I be happy. May I be healthy. May I be safe. May I live with ease.',
      'Feel the warmth of these intentions spreading through your body.',
      'Gently extend this wish to a loved one, a neutral person, and all beings.',
    ],
    isActive: true,
  },
  {
    slug: 'body-scan-sleep',
    title: 'Gentle Body Scan for Sleep',
    description: 'Systematically release muscular tension from toes to crown to prepare mind and body for deep restorative sleep.',
    category: 'meditation',
    duration: 600, // 10 minutes
    difficulty: 'beginner',
    instructions: [
      'Lie comfortably on your back with arms loosely at your sides.',
      'Bring gentle awareness to the soles of your feet and toes, releasing any tightness.',
      'Slowly migrate your focus up your calves, knees, and thighs, inviting softness.',
      'Release tension in your stomach, chest, hands, neck, and jaw.',
      'Let your whole body sink weightlessly into your mattress.',
    ],
    isActive: true,
  },
  {
    slug: 'morning-gratitude-reflection',
    title: 'Morning Gratitude Reflection',
    description: 'Start your day by rewiring your brain toward positivity, resilience, and calm optimism.',
    category: 'journaling',
    duration: 300, // 5 minutes
    difficulty: 'beginner',
    instructions: [
      'Name one simple physical comfort you are grateful for today.',
      'Name one person whose presence brings you warmth or peace.',
      'Acknowledge one personal strength that helped you overcome a recent hurdle.',
      'Set an intention to approach your day with gentle patience.',
    ],
    isActive: true,
  },
  {
    slug: 'mindful-forest-walk',
    title: 'Mindful Outdoor Movement (Shinrin-yoku)',
    description: 'Take a meditative stroll outdoors, syncing your steps with rhythmic breathing to lower cortisol.',
    category: 'movement',
    duration: 900, // 15 minutes
    difficulty: 'beginner',
    instructions: [
      'Walk at an unhurried, natural pace without looking at screens.',
      'Match your breath to your footsteps (e.g. 3 steps inhale, 3 steps exhale).',
      'Observe the play of light on leaves, the breeze, and the soil beneath you.',
      'Whenever the mind wanders to to-do lists, gently bring focus back to the sensation of walking.',
    ],
    isActive: true,
  },
  {
    slug: 'progressive-muscle-relaxation',
    title: 'Progressive Muscle Relaxation',
    description: 'Tense and then deliberately release individual muscle groups to dissolve physical stress holding patterns.',
    category: 'movement',
    duration: 420, // 7 minutes
    difficulty: 'intermediate',
    instructions: [
      'Take a deep breath and clench your fists tightly for 5 seconds.',
      'Exhale and abruptly release, noticing the immediate sensation of limp relaxation.',
      'Move up to your shoulders: shrug them tightly up to your ears for 5 seconds, then drop them.',
      'Tighten your facial muscles, then release completely.',
      'Enjoy the wave of calm tingling throughout your body.',
    ],
    isActive: true,
  },
];

export const SEED_AFFIRMATIONS = [
  {
    slug: 'take-up-space',
    text: 'I am allowed to take up space, take my time, and move at my own gentle pace.',
    category: 'self-compassion',
    tags: ['self-worth', 'patience', 'gentleness'],
    language: 'en',
    isActive: true,
  },
  {
    slug: 'peace-conscious-breath',
    text: 'Peace begins the very moment I choose to take a conscious, deep breath.',
    category: 'calm',
    tags: ['breath', 'peace', 'grounding'],
    language: 'en',
    isActive: true,
  },
  {
    slug: 'not-carry-all',
    text: 'I do not have to carry everything all at once. One moment, one breath is enough.',
    category: 'calm',
    tags: ['overwhelm', 'simplicity', 'balance'],
    language: 'en',
    isActive: true,
  },
  {
    slug: 'feelings-clouds',
    text: 'My feelings are valid, and like weather, they will pass across the vast sky of my mind.',
    category: 'mindfulness',
    tags: ['acceptance', 'emotions', 'clouds'],
    language: 'en',
    isActive: true,
  },
  {
    slug: 'choose-gentleness',
    text: 'Today I choose gentleness over judgment and kindness over criticism toward myself.',
    category: 'self-compassion',
    tags: ['kindness', 'inner-critic', 'grace'],
    language: 'en',
    isActive: true,
  },
  {
    slug: 'in-this-moment-safe',
    text: 'In this exact present moment, right here and now, I am safe and whole.',
    category: 'grounding',
    tags: ['safety', 'presence', 'anxiety'],
    language: 'en',
    isActive: true,
  },
  {
    slug: 'survived-every-day',
    text: 'I have survived 100% of my most difficult days so far. My resilience is quiet and steady.',
    category: 'resilience',
    tags: ['strength', 'hope', 'endurance'],
    language: 'en',
    isActive: true,
  },
  {
    slug: 'small-steps-forward',
    text: 'Even tiny, gentle steps are progress. Resting when tired is also part of the journey.',
    category: 'resilience',
    tags: ['growth', 'rest', 'progress'],
    language: 'en',
    isActive: true,
  },
  {
    slug: 'release-tension-exhale',
    text: 'With every inhale I receive fresh vitality; with every exhale I release what no longer serves me.',
    category: 'calm',
    tags: ['release', 'exhale', 'vitality'],
    language: 'en',
    isActive: true,
  },
  {
    slug: 'honor-my-energy',
    text: 'Today I honor my energy by saying yes to my peace and setting healthy, loving boundaries.',
    category: 'self-compassion',
    tags: ['boundaries', 'energy', 'peace'],
    language: 'en',
    isActive: true,
  },
  {
    slug: 'grounded-present-rooted',
    text: 'I am grounded like a deep-rooted tree, steady through the passing winds of thought.',
    category: 'grounding',
    tags: ['nature', 'rooted', 'stability'],
    language: 'en',
    isActive: true,
  },
  {
    slug: 'peace-highest-priority',
    text: 'My mental clarity and inner peace are valuable treasures worthy of protection.',
    category: 'calm',
    tags: ['clarity', 'treasure', 'calm'],
    language: 'en',
    isActive: true,
  },
];

export const SEED_ACHIEVEMENTS = [
  {
    criteria: 'first_checkin',
    title: 'First Step',
    description: 'Checked in with your inner emotional world for the very first time.',
    icon: 'heart',
    category: 'mood',
    isActive: true,
  },
  {
    criteria: 'first_journal',
    title: 'Soul Reflector',
    description: 'Put your authentic thoughts and feelings into words in your private journal.',
    icon: 'book-open',
    category: 'journal',
    isActive: true,
  },
  {
    criteria: 'first_activity',
    title: 'Mindful Seeker',
    description: 'Completed your first guided wellness exercise in Solace AI.',
    icon: 'sparkles',
    category: 'wellness',
    isActive: true,
  },
  {
    criteria: 'first_breathing',
    title: 'Deep Breather',
    description: 'Centered your autonomic nervous system through a complete breathing session.',
    icon: 'wind',
    category: 'breathing',
    isActive: true,
  },
  {
    criteria: 'streak_3_days',
    title: 'Consistency Spark',
    description: 'Maintained your personal wellness practice for 3 continuous days.',
    icon: 'flame',
    category: 'streak',
    isActive: true,
  },
  {
    criteria: 'streak_7_days',
    title: 'Week of Serenity',
    description: 'Dedicated time to your mental wellness every day for a full week.',
    icon: 'sun',
    category: 'streak',
    isActive: true,
  },
  {
    criteria: 'streak_14_days',
    title: 'Rooted Oak',
    description: 'Reached a remarkable 14-day continuous self-care streak.',
    icon: 'shield',
    category: 'streak',
    isActive: true,
  },
  {
    criteria: 'all_categories',
    title: 'Solace Explorer',
    description: 'Engaged with mood, breathwork, journaling, and mindful meditations.',
    icon: 'award',
    category: 'milestone',
    isActive: true,
  },
];

export const SEED_RESOURCES = [
  {
    slug: 'crisis-helplines',
    title: '24/7 Global Mental Health & Crisis Helplines',
    description: 'Immediate, confidential, professional telephone and text support lines available anytime worldwide.',
    category: 'helpline',
    contentType: 'helpline',
    contentUrl: 'https://findahelpline.com/',
    language: 'en',
    isActive: true,
  },
  {
    slug: 'sleep-hygiene-guide',
    title: 'The Neuroscience of Deep, Restorative Sleep',
    description: 'Evidence-based protocols to optimize circadian rhythms, sleep onset, and morning alertness.',
    category: 'sleep',
    contentType: 'article',
    contentUrl: 'https://hubermanlab.com/toolkit-for-sleep/',
    language: 'en',
    isActive: true,
  },
  {
    slug: 'panic-anxiety-toolkit',
    title: 'Acute Panic & Rapid De-escalation Protocol',
    description: 'Step-by-step physical interventions (dive reflex, physiological sighs) to dissolve panic surges.',
    category: 'anxiety',
    contentType: 'guide',
    contentUrl: '',
    language: 'en',
    isActive: true,
  },
  {
    slug: 'vagus-nerve-box-breathing',
    title: 'How Controlled Respiration Calms the Vagus Nerve',
    description: 'Understanding heart rate variability (HRV) and the physiology behind rhythmic breathing.',
    category: 'breathing',
    contentType: 'guide',
    contentUrl: '',
    language: 'en',
    isActive: true,
  },
  {
    slug: 'micro-gratitude-habit',
    title: 'Micro-Gratitude: Rewiring the Negativity Bias',
    description: 'How 2-minute daily gratitude journaling triggers neuroplastic changes in the prefrontal cortex.',
    category: 'mindfulness',
    contentType: 'article',
    contentUrl: '',
    language: 'en',
    isActive: true,
  },
  {
    slug: '54321-sensory-guide',
    title: 'Sensory Grounding Illustrated Reference',
    description: 'A printable and mobile reference card for the 5-4-3-2-1 grounding technique.',
    category: 'grounding',
    contentType: 'guide',
    contentUrl: '',
    language: 'en',
    isActive: true,
  },
];

export const seedDatabase = async (): Promise<void> => {
  logger.info('🌱 Starting Solace AI idempotent database seed sequence...');

  // 1. Seed Activities
  logger.info(`Seeding ${SEED_ACTIVITIES.length} Wellness Activities...`);
  for (const act of SEED_ACTIVITIES) {
    await Activity.findOneAndUpdate(
      { slug: act.slug },
      { $set: act },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  // 2. Seed Affirmations
  logger.info(`Seeding ${SEED_AFFIRMATIONS.length} Affirmations...`);
  for (const aff of SEED_AFFIRMATIONS) {
    await AffirmationModel.findOneAndUpdate(
      { slug: aff.slug },
      { $set: aff },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  // 3. Seed Achievements
  logger.info(`Seeding ${SEED_ACHIEVEMENTS.length} Achievements...`);
  for (const ach of SEED_ACHIEVEMENTS) {
    await AchievementModel.findOneAndUpdate(
      { criteria: ach.criteria },
      { $set: ach },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  // 4. Seed Resources
  logger.info(`Seeding ${SEED_RESOURCES.length} Wellness Resources...`);
  for (const res of SEED_RESOURCES) {
    await ResourceModel.findOneAndUpdate(
      { slug: res.slug },
      { $set: res },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  logger.info('✅ Solace AI seed completed successfully with zero duplicates!');
};

export const runSeedCli = async (): Promise<void> => {
  try {
    await Database.connect();
    await seedDatabase();
    await Database.disconnect();
    process.exit(0);
  } catch (error) {
    logger.error('❌ Error during database seed:', error);
    await Database.disconnect();
    process.exit(1);
  }
};
