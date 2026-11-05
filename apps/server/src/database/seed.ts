import { Database } from './index';
import { logger } from '../utils/logger';
import {
  Activity,
  AffirmationModel,
  AchievementModel,
  ResourceModel,
} from '../models';

export const SEED_ACTIVITIES = [
  // 1. BREATHING
  {
    slug: 'box-breathing',
    title: 'Box Breathing (4-4-4-4)',
    description: 'A powerful technique used by athletes and yogis to instantly calm the nervous system and regain focus.',
    category: 'breathing',
    duration: 240, // 4 minutes
    difficulty: 'beginner',
    instructions: [
      'Inhale slowly and smoothly through your nose for 4 seconds.',
      'Gently hold your breath with full lungs for 4 seconds.',
      'Exhale smoothly through your mouth for 4 seconds.',
      'Hold your breath with empty lungs for 4 seconds.',
      'Repeat this cycle until you feel grounded.',
    ],
    isActive: true,
  },
  {
    slug: 'relaxing-breathing',
    title: 'Relaxing Breathing (4-6)',
    description: 'A soothing rhythm with an elongated exhale to activate the parasympathetic calm response.',
    category: 'breathing',
    duration: 180, // 3 minutes
    difficulty: 'beginner',
    instructions: [
      'Inhale softly through your nose for 4 seconds.',
      'Exhale slowly and steadily through your mouth for 6 seconds.',
      'Allow your shoulders to drop with each breath out.',
      'Repeat gently without strain.',
    ],
    isActive: true,
  },
  {
    slug: 'equal-breathing',
    title: 'Equal Breathing (4-4)',
    description: 'Sama Vritti brings balance, symmetry, and steady equilibrium to your mind and autonomic nervous system.',
    category: 'breathing',
    duration: 180, // 3 minutes
    difficulty: 'beginner',
    instructions: [
      'Inhale smoothly for a count of 4.',
      'Exhale smoothly for a count of 4.',
      'Maintain an unbroken, rhythmic cycle.',
      'Rest in the feeling of balanced ease.',
    ],
    isActive: true,
  },
  {
    slug: 'extended-exhale',
    title: 'Extended Exhale Breathing (4-8)',
    description: 'Doubling your exhalation time to slow your heart rate and release accumulated tension.',
    category: 'breathing',
    duration: 240, // 4 minutes
    difficulty: 'intermediate',
    instructions: [
      'Inhale gently through your nose for 4 seconds.',
      'Exhale slowly, quietly, and completely for 8 seconds.',
      'Notice the immediate wave of heaviness and relief.',
    ],
    isActive: true,
  },
  {
    slug: '4-7-8-breathing',
    title: '4-7-8 Relaxing Breath',
    description: 'Dr. Andrew Weil’s natural tranquilizer for the nervous system, ideal before sleep or during acute stress.',
    category: 'breathing',
    duration: 300, // 5 minutes
    difficulty: 'beginner',
    instructions: [
      'Inhale quietly through your nose for 4 counts.',
      'Hold your breath comfortably for 7 counts.',
      'Exhale completely with a whoosh sound for 8 counts.',
      'Repeat for 4 to 8 cycles.',
    ],
    isActive: true,
  },

  // 2. MINDFULNESS
  {
    slug: 'sensory-grounding-54321',
    title: '5-4-3-2-1 Sensory Grounding',
    description: 'An evidence-based cognitive grounding technique that pulls you out of runaway thoughts into the present moment.',
    category: 'mindfulness',
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
    category: 'mindfulness',
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

  // 3. RELAXATION
  {
    slug: 'progressive-muscle-relaxation',
    title: 'Progressive Muscle Relaxation',
    description: 'Tense and then deliberately release individual muscle groups to dissolve physical stress holding patterns.',
    category: 'relaxation',
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
  {
    slug: 'body-scan-sleep',
    title: 'Gentle Body Scan for Deep Rest',
    description: 'Systematically release muscular tension from toes to crown to prepare mind and body for deep restorative calm.',
    category: 'relaxation',
    duration: 600, // 10 minutes
    difficulty: 'beginner',
    instructions: [
      'Lie comfortably on your back with arms loosely at your sides.',
      'Bring gentle awareness to the soles of your feet and toes, releasing any tightness.',
      'Slowly migrate your focus up your calves, knees, and thighs, inviting softness.',
      'Release tension in your stomach, chest, hands, neck, and jaw.',
      'Let your whole body sink weightlessly into a state of rest.',
    ],
    isActive: true,
  },

  // 4. SELF-CARE
  {
    slug: 'digital-detox-moment',
    title: '5-Minute Screen & Digital Reset',
    description: 'Rest your eyes, unclench your posture, and disconnect from digital stimuli for gentle mental restoration.',
    category: 'self-care',
    duration: 300, // 5 minutes
    difficulty: 'beginner',
    instructions: [
      'Turn away from all screens and gently close your eyes.',
      'Place warm palms over your closed eyelids and take three slow, conscious breaths.',
      'Roll your shoulders backward and release any clenching in your jaw.',
      'Enjoy several unhurried minutes of stillness and non-doing.',
    ],
    isActive: true,
  },
  {
    slug: 'restorative-tea-ritual',
    title: 'Mindful Hydration & Nourishment',
    description: 'Transform a simple cup of water or tea into a grounding sensory moment of self-kindness.',
    category: 'self-care',
    duration: 180, // 3 minutes
    difficulty: 'beginner',
    instructions: [
      'Hold your cup with both hands, noticing the temperature and texture.',
      'Inhale the gentle aroma with a slow, full breath.',
      'Take a slow sip, mindfully experiencing the sensation of nourishing your body.',
      'Silently thank yourself for taking time to pause.',
    ],
    isActive: true,
  },

  // 5. POSITIVE AFFIRMATIONS
  {
    slug: 'affirmations-immersion',
    title: 'Daily Positive Affirmations Immersion',
    description: 'Reprogram self-doubt into grounded resilience with soothing, empowering mental affirmations.',
    category: 'affirmation',
    duration: 240, // 4 minutes
    difficulty: 'beginner',
    instructions: [
      'Settle into a comfortable posture with an open chest.',
      'Repeat silently or aloud: I am allowed to take my time and move at my own pace.',
      'Repeat: Peace begins the moment I choose to take a conscious breath.',
      'Repeat: I do not have to carry everything all at once.',
      'Let these truths anchor deeply into your awareness.',
    ],
    isActive: true,
  },

  // 6. REFLECTION
  {
    slug: 'morning-gratitude-reflection',
    title: 'Morning Gratitude & Intention',
    description: 'Start your day by rewiring your brain toward positivity, resilience, and calm optimism.',
    category: 'reflection',
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
    slug: 'evening-reflection-compassion',
    title: 'Evening Reflection & Self-Compassion',
    description: 'Wind down your day by releasing self-judgment, honoring small wins, and setting a peaceful rest intention.',
    category: 'reflection',
    duration: 300, // 5 minutes
    difficulty: 'beginner',
    instructions: [
      'Acknowledge one thing you handled with courage or care today.',
      'Forgive yourself for anything that did not unfold as planned.',
      'Take a deep breath and let go of the day. You did enough.',
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
  // 1. CONSISTENCY
  {
    criteria: 'first_activity',
    title: 'First Step',
    description: 'Complete your very first wellness activity.',
    icon: 'sparkles',
    category: 'consistency',
    isActive: true,
  },
  {
    criteria: 'active_3_days',
    title: 'Three Days of Care',
    description: 'Be active for three distinct calendar days.',
    icon: 'calendar',
    category: 'consistency',
    isActive: true,
  },
  {
    criteria: 'streak_7_days',
    title: 'One Week Together',
    description: 'Reach an inspiring seven-day wellness streak.',
    icon: 'flame',
    category: 'consistency',
    isActive: true,
  },
  {
    criteria: 'streak_30_days',
    title: 'Growing Together',
    description: 'Reach a remarkable 30-day streak of mindful presence.',
    icon: 'sun',
    category: 'consistency',
    isActive: true,
  },

  // 2. EMOTIONAL AWARENESS
  {
    criteria: 'first_checkin',
    title: 'First Check-in',
    description: 'Complete your first emotional check-in with Solace.',
    icon: 'heart',
    category: 'emotional_awareness',
    isActive: true,
  },
  {
    criteria: 'checkin_10',
    title: 'Understanding Yourself',
    description: 'Complete ten reflective mood check-ins.',
    icon: 'smile',
    category: 'emotional_awareness',
    isActive: true,
  },
  {
    criteria: 'emotions_5',
    title: 'Emotional Explorer',
    description: 'Record five different emotions across your journey.',
    icon: 'compass',
    category: 'emotional_awareness',
    isActive: true,
  },

  // 3. MINDFULNESS
  {
    criteria: 'first_breathing',
    title: 'First Breath',
    description: 'Complete your first guided breathing session.',
    icon: 'wind',
    category: 'mindfulness',
    isActive: true,
  },
  {
    criteria: 'breathing_5',
    title: 'Calm Moments',
    description: 'Complete five soothing breathing sessions.',
    icon: 'activity',
    category: 'mindfulness',
    isActive: true,
  },
  {
    criteria: 'mindfulness_10',
    title: 'Mindful Journey',
    description: 'Complete ten mindfulness and relaxation practices.',
    icon: 'award',
    category: 'mindfulness',
    isActive: true,
  },

  // 4. PERSONAL GROWTH
  {
    criteria: 'first_assessment',
    title: 'Reflection Starter',
    description: 'Complete your first self-reflection assessment.',
    icon: 'book-open',
    category: 'personal_growth',
    isActive: true,
  },
  {
    criteria: 'first_plan_task',
    title: 'Plan in Action',
    description: 'Complete your first daily wellness plan task.',
    icon: 'check-circle',
    category: 'personal_growth',
    isActive: true,
  },
  {
    criteria: 'plan_tasks_20',
    title: 'Consistent Growth',
    description: 'Complete 20 wellness plan tasks on your path.',
    icon: 'shield',
    category: 'personal_growth',
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
  const validCriteria = SEED_ACHIEVEMENTS.map((a) => a.criteria);
  await AchievementModel.deleteMany({ criteria: { $nin: validCriteria } });
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
