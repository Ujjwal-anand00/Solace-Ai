import { ResourceModel } from './resource.model';

export const INITIAL_24_RESOURCES = [
  // 1. Understanding Emotions
  {
    title: 'Understanding Your Emotions',
    slug: 'understanding-your-emotions',
    category: 'emotions',
    description:
      'Emotions are natural messengers that carry valuable guidance about your needs, boundaries, and values.',
    author: 'Solace Wellness Team',
    readingMinutes: 4,
    tags: ['emotions', 'awareness', 'self-compassion'],
    isFeatured: true,
    isPublished: true,
    blocks: [
      {
        type: 'heading',
        text: 'The Purpose of Emotions',
      },
      {
        type: 'paragraph',
        text: 'Every emotion serves a fundamental purpose. Rather than dividing emotions into good or bad, viewing them as signals creates room for curiosity instead of judgment.',
      },
      {
        type: 'callout',
        calloutType: 'note',
        text: 'Emotions are transient visitors. Acknowledging a feeling does not mean you must act on it impulsively.',
      },
      {
        type: 'heading',
        text: 'Three Steps to Emotional Awareness',
      },
      {
        type: 'step',
        items: [
          'Pause and notice where the emotion lives in your physical body.',
          'Gently name the feeling without criticism (e.g., "I notice anxiety is present").',
          'Ask what small comfort or reassurance would feel supportive right now.',
        ],
      },
    ],
  },
  {
    title: 'Naming What You Feel',
    slug: 'naming-what-you-feel',
    category: 'emotions',
    description:
      'Developing emotional granularity helps regulate the nervous system and fosters self-understanding.',
    author: 'Solace Wellness Team',
    readingMinutes: 3,
    tags: ['emotions', 'vocabulary', 'mindfulness'],
    isPublished: true,
    blocks: [
      {
        type: 'heading',
        text: 'Why Precision Matters',
      },
      {
        type: 'paragraph',
        text: 'When we replace vague labels like "bad" or "off" with nuanced words like "overstimulated", "disappointed", or "yearning", our brain immediately begins calming the amygdala.',
      },
      {
        type: 'bullet_list',
        items: [
          'Beneath anger often lies hurt, exhaustion, or violated boundaries.',
          'Beneath anxiety often lies uncertainty or deep caring.',
          'Beneath numbness often lies emotional overload needing rest.',
        ],
      },
    ],
  },
  {
    title: 'Emotional Awareness in Daily Life',
    slug: 'emotional-awareness-in-daily-life',
    category: 'emotions',
    description: 'Practical ways to check in with your emotional pulse throughout a busy day.',
    author: 'Solace Wellness Team',
    readingMinutes: 4,
    tags: ['daily', 'check-in', 'emotions'],
    isPublished: true,
    blocks: [
      {
        type: 'heading',
        text: 'Micro-Moments of Self-Contact',
      },
      {
        type: 'paragraph',
        text: 'You do not need an hour of meditation to connect with yourself. A 20-second pause between meetings or before bed is enough to ask: "How am I doing in this moment?"',
      },
    ],
  },

  // 2. Stress Management
  {
    title: 'Understanding Everyday Stress',
    slug: 'understanding-everyday-stress',
    category: 'stress',
    description:
      'Stress is your body mobilizing energy to meet a perceived demand. Learn how to complete the stress response cycle.',
    author: 'Solace Wellness Team',
    readingMinutes: 5,
    tags: ['stress', 'somatic', 'nervous-system'],
    isFeatured: true,
    isPublished: true,
    blocks: [
      {
        type: 'heading',
        text: 'The Stress Cycle',
      },
      {
        type: 'paragraph',
        text: 'Removing the stressor is only half the battle. Your body needs physical cues to recognize that safety has returned.',
      },
      {
        type: 'bullet_list',
        items: [
          'Physical movement: unhurried walking or gentle stretching.',
          'Extended exhales: signaling the parasympathetic nervous system.',
          'Warm connection: exchanging words of genuine care.',
        ],
      },
    ],
  },
  {
    title: 'Simple Ways to Manage Stress',
    slug: 'simple-ways-to-manage-stress',
    category: 'stress',
    description: 'Practical, accessible techniques you can use anywhere when tension rises.',
    author: 'Solace Wellness Team',
    readingMinutes: 3,
    tags: ['stress', 'techniques', 'calm'],
    isPublished: true,
    blocks: [
      {
        type: 'heading',
        text: 'The Physiological Sigh',
      },
      {
        type: 'paragraph',
        text: 'Two quick inhales through the nose followed by a long, slow sigh out through the mouth rapidly reduces heart rate and autonomic arousal.',
      },
    ],
  },
  {
    title: 'Creating Small Moments of Calm',
    slug: 'creating-small-moments-of-calm',
    category: 'stress',
    description: 'Transforming daily transition rituals into restorative micro-sanctuaries.',
    author: 'Solace Wellness Team',
    readingMinutes: 4,
    tags: ['calm', 'rituals', 'peace'],
    isPublished: true,
    blocks: [
      {
        type: 'heading',
        text: 'Threshold Mindfulness',
      },
      {
        type: 'paragraph',
        text: 'Before opening your front door or entering a meeting room, rest both feet flat on the floor and take one full breath. Let that threshold be a sanctuary.',
      },
    ],
  },

  // 3. Mindfulness
  {
    title: 'Introduction to Mindfulness',
    slug: 'introduction-to-mindfulness',
    category: 'mindfulness',
    description:
      'Mindfulness is simply awareness of the present moment with openness and gentle curiosity.',
    author: 'Solace Wellness Team',
    readingMinutes: 4,
    tags: ['mindfulness', 'beginner', 'presence'],
    isFeatured: true,
    isPublished: true,
    blocks: [
      {
        type: 'heading',
        text: 'Debunking the Quiet Mind Myth',
      },
      {
        type: 'paragraph',
        text: 'Mindfulness is not about stopping your thoughts. It is about changing your relationship with them—watching them drift like clouds across an open sky.',
      },
    ],
  },
  {
    title: 'Practicing Mindful Breathing',
    slug: 'practicing-mindful-breathing',
    category: 'mindfulness',
    description:
      'How to use the breath as a constant anchor of calm without trying to force or control it.',
    author: 'Solace Wellness Team',
    readingMinutes: 3,
    tags: ['breathing', 'mindfulness', 'anchor'],
    isPublished: true,
    blocks: [
      {
        type: 'heading',
        text: 'Your Breath as an Anchor',
      },
      {
        type: 'paragraph',
        text: 'Your breath is always taking place right now in the present. Whenever your thoughts race toward tomorrow, notice the coolness of the air entering your nostrils.',
      },
    ],
  },
  {
    title: 'Being Present in Everyday Activities',
    slug: 'being-present-in-everyday-activities',
    category: 'mindfulness',
    description:
      'Bringing full presence to daily chores like washing dishes, walking, and drinking tea.',
    author: 'Solace Wellness Team',
    readingMinutes: 4,
    tags: ['presence', 'everyday', 'habits'],
    isPublished: true,
    blocks: [
      {
        type: 'heading',
        text: 'Everyday Meditation',
      },
      {
        type: 'paragraph',
        text: 'Feel the warm water on your hands when washing dishes. Notice the aroma of coffee before the first sip. Every ordinary moment is an invitation into peace.',
      },
    ],
  },

  // 4. Better Sleep
  {
    title: 'Building a Consistent Sleep Routine',
    slug: 'building-a-consistent-sleep-routine',
    category: 'sleep',
    description:
      'How consistent wake-up times and predictable evening signals gently synchronize your circadian rhythm.',
    author: 'Solace Wellness Team',
    readingMinutes: 5,
    tags: ['sleep', 'routine', 'circadian'],
    isFeatured: true,
    isPublished: true,
    blocks: [
      {
        type: 'heading',
        text: 'The Power of Predictability',
      },
      {
        type: 'paragraph',
        text: 'Your circadian rhythm thrives on regular timing. Waking up at roughly the same hour every day reinforces natural melatonin release at night.',
      },
    ],
  },
  {
    title: 'Creating a Relaxing Evening Environment',
    slug: 'creating-a-relaxing-evening-environment',
    category: 'sleep',
    description: 'Dimming overhead lighting, reducing digital stimulation, and inviting physical ease.',
    author: 'Solace Wellness Team',
    readingMinutes: 4,
    tags: ['evening', 'sleep', 'sanctuary'],
    isPublished: true,
    blocks: [
      {
        type: 'heading',
        text: 'Preparing Your Sanctuary',
      },
      {
        type: 'paragraph',
        text: 'Switch from bright overhead lights to warm lamps one hour before bed. Lower room temperature slightly to facilitate the natural drop in core body temperature.',
      },
    ],
  },
  {
    title: 'Understanding Healthy Sleep Habits',
    slug: 'understanding-healthy-sleep-habits',
    category: 'sleep',
    description: 'Evidence-based behavioral cues that foster restorative, uninterrupted sleep.',
    author: 'Solace Wellness Team',
    readingMinutes: 4,
    tags: ['sleep', 'habits', 'health'],
    isPublished: true,
    blocks: [
      {
        type: 'heading',
        text: 'Releasing Sleep Anxiety',
      },
      {
        type: 'paragraph',
        text: 'If you cannot fall asleep after 20 minutes, avoid tossing and turning with worry. Get up, sit in dim lighting with a gentle book, and return to bed only when drowsy.',
      },
    ],
  },

  // 5. Self-Care
  {
    title: 'What Self-Care Really Means',
    slug: 'what-self-care-really-means',
    category: 'self_care',
    description:
      'Moving beyond commercial pampering toward building a life you do not regularly need to escape from.',
    author: 'Solace Wellness Team',
    readingMinutes: 5,
    tags: ['self-care', 'boundaries', 'wellness'],
    isFeatured: true,
    isPublished: true,
    blocks: [
      {
        type: 'heading',
        text: 'True Self-Care is Often Unseen',
      },
      {
        type: 'paragraph',
        text: 'Real self-care includes holding boundaries with kindness, saying no to extra commitments when exhausted, and honoring your basic need for nourishment and rest.',
      },
    ],
  },
  {
    title: 'Building a Personal Self-Care Routine',
    slug: 'building-a-personal-self-care-routine',
    category: 'self_care',
    description: 'Crafting non-negotiable moments of renewal that fit seamlessly into your schedule.',
    author: 'Solace Wellness Team',
    readingMinutes: 4,
    tags: ['routine', 'self-care', 'habits'],
    isPublished: true,
    blocks: [
      {
        type: 'heading',
        text: 'Start with 5 Minutes',
      },
      {
        type: 'paragraph',
        text: 'Sustainable self-care requires micro-commitments: a 5-minute tea break without your phone, or three conscious breaths before picking up your child.',
      },
    ],
  },
  {
    title: 'Learning to Take Breaks',
    slug: 'learning-to-take-breaks',
    category: 'self_care',
    description:
      'Overcoming the guilt of resting and understanding rest as an essential biological requirement.',
    author: 'Solace Wellness Team',
    readingMinutes: 4,
    tags: ['rest', 'guilt-free', 'balance'],
    isPublished: true,
    blocks: [
      {
        type: 'heading',
        text: 'Rest is Not an Award',
      },
      {
        type: 'paragraph',
        text: 'You do not have to earn the right to rest through exhaustion. Rest is biological maintenance, vital for creativity and emotional regulation.',
      },
    ],
  },

  // 6. Building Confidence
  {
    title: 'Practicing Self-Compassion',
    slug: 'practicing-self-compassion',
    category: 'confidence',
    description:
      'Replacing the harsh inner critic with the encouraging, realistic voice of a loyal friend.',
    author: 'Solace Wellness Team',
    readingMinutes: 5,
    tags: ['self-compassion', 'confidence', 'kindness'],
    isFeatured: true,
    isPublished: true,
    blocks: [
      {
        type: 'heading',
        text: 'The Three Components of Self-Compassion',
      },
      {
        type: 'bullet_list',
        items: [
          'Self-Kindness: Treating yourself with patience rather than harsh judgment.',
          'Common Humanity: Recognizing that struggling and making mistakes is part of being human.',
          'Mindfulness: Holding your feelings in balanced awareness without exaggeration.',
        ],
      },
    ],
  },
  {
    title: 'Recognizing Personal Strengths',
    slug: 'recognizing-personal-strengths',
    category: 'confidence',
    description: 'Noticing the subtle resilience and quiet capabilities that carry you through trials.',
    author: 'Solace Wellness Team',
    readingMinutes: 4,
    tags: ['strengths', 'resilience', 'growth'],
    isPublished: true,
    blocks: [
      {
        type: 'heading',
        text: 'Quiet Strengths',
      },
      {
        type: 'paragraph',
        text: 'Strength is not only about being loud or unshakeable. Your empathy, patience, curiosity, and willingness to try again are profound inner strengths.',
      },
    ],
  },
  {
    title: 'Building Confidence Through Small Steps',
    slug: 'building-confidence-through-small-steps',
    category: 'confidence',
    description:
      'Confidence is built through repeated, small promises kept to yourself over unhurried time.',
    author: 'Solace Wellness Team',
    readingMinutes: 4,
    tags: ['confidence', 'integrity', 'steps'],
    isPublished: true,
    blocks: [
      {
        type: 'heading',
        text: 'Self-Trust as Foundation',
      },
      {
        type: 'paragraph',
        text: 'When you say you will walk for 10 minutes and you do it, you teach your nervous system that your word can be trusted. Confidence naturally follows integrity.',
      },
    ],
  },

  // 7. Healthy Habits
  {
    title: 'Starting Small with Daily Habits',
    slug: 'starting-small-with-daily-habits',
    category: 'habits',
    description:
      'Why tiny 2-minute behaviors beat overwhelming overhauls every time when building lasting change.',
    author: 'Solace Wellness Team',
    readingMinutes: 4,
    tags: ['habits', 'micro-steps', 'consistency'],
    isFeatured: true,
    isPublished: true,
    blocks: [
      {
        type: 'heading',
        text: 'The Two-Minute Rule',
      },
      {
        type: 'paragraph',
        text: 'When you start a new wellness habit, it should take less than two minutes to do. Read one page. Take three deep breaths. Drink one glass of water.',
      },
    ],
  },
  {
    title: 'Creating Sustainable Routines',
    slug: 'creating-sustainable-routines',
    category: 'habits',
    description:
      'Designing flexible morning and evening flows that adapt to your varying energy levels.',
    author: 'Solace Wellness Team',
    readingMinutes: 4,
    tags: ['routines', 'sustainability', 'flow'],
    isPublished: true,
    blocks: [
      {
        type: 'heading',
        text: 'Designing for Low-Energy Days',
      },
      {
        type: 'paragraph',
        text: 'A routine that only works on your best, most energetic days is not sustainable. Create a gentle fallback version for days when you feel depleted.',
      },
    ],
  },
  {
    title: 'Staying Consistent Without Pressure',
    slug: 'staying-consistent-without-pressure',
    category: 'habits',
    description:
      'How to release all-or-nothing perfectionism and embrace the gentle rhythm of returning.',
    author: 'Solace Wellness Team',
    readingMinutes: 4,
    tags: ['consistency', 'release-perfectionism'],
    isPublished: true,
    blocks: [
      {
        type: 'heading',
        text: 'Never Miss Twice',
      },
      {
        type: 'paragraph',
        text: 'Missing one day is an accident; missing two is the start of a new habit. Return gently without self-criticism whenever you drift.',
      },
    ],
  },

  // 8. Personal Growth
  {
    title: 'Understanding Personal Values',
    slug: 'understanding-personal-values',
    category: 'growth',
    description:
      'Clarifying your core internal compass to make intentional choices with peace and certainty.',
    author: 'Solace Wellness Team',
    readingMinutes: 5,
    tags: ['values', 'direction', 'growth'],
    isFeatured: true,
    isPublished: true,
    blocks: [
      {
        type: 'heading',
        text: 'Living from the Inside Out',
      },
      {
        type: 'paragraph',
        text: 'Values are not goals to check off; they are directions you head toward. When daily actions align with values like kindness and balance, inner peace settles in.',
      },
    ],
  },
  {
    title: 'Reflecting on Your Progress',
    slug: 'reflecting-on-your-progress',
    category: 'growth',
    description: 'Looking back with gratitude and acknowledging the subtle ways you have matured.',
    author: 'Solace Wellness Team',
    readingMinutes: 4,
    tags: ['reflection', 'progress', 'gratitude'],
    isPublished: true,
    blocks: [
      {
        type: 'heading',
        text: 'The Horizon Effect',
      },
      {
        type: 'paragraph',
        text: 'We often look ahead to how far we still have to go, forgetting to look back and marvel at how far we have already walked.',
      },
    ],
  },
  {
    title: 'Learning from Difficult Days',
    slug: 'learning-from-difficult-days',
    category: 'growth',
    description:
      'Finding compassion and gentle lessons when things do not unfold the way you hoped.',
    author: 'Solace Wellness Team',
    readingMinutes: 5,
    tags: ['resilience', 'difficult-days', 'compassion'],
    isPublished: true,
    blocks: [
      {
        type: 'heading',
        text: 'Difficult Days are Messengers',
      },
      {
        type: 'paragraph',
        text: 'A hard day is not a failed day. It is simply a day that tested your capacity and showed you where you need extra gentleness and protection.',
      },
    ],
  },
];

export class ResourceSeedService {
  public static async ensureSeedResources(): Promise<void> {
    for (const r of INITIAL_24_RESOURCES) {
      await ResourceModel.findOneAndUpdate(
        { slug: r.slug },
        {
          $set: {
            ...r,
            isActive: true,
            isPublished: true,
            publishedAt: new Date(),
          },
        },
        { upsert: true, new: true },
      );
    }
  }
}

