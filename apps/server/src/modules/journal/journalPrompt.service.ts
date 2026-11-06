import { JournalPromptModel } from './journalPrompt.model';
import { PromptCategory } from '@solace/shared';

export const SEED_PROMPTS: Array<{
  promptId: string;
  category: PromptCategory;
  text: string;
  subtext?: string;
  tags: string[];
  order: number;
}> = [
  // Gratitude Prompts
  {
    promptId: 'grat_01',
    category: 'gratitude',
    text: 'What is a small, ordinary thing from today that brought you quiet peace?',
    subtext: 'It could be a warm drink, a gentle breeze, or a kind exchange.',
    tags: ['everyday', 'peace', 'simplicity'],
    order: 1,
  },
  {
    promptId: 'grat_02',
    category: 'gratitude',
    text: 'Who in your life showed you kindness recently, directly or indirectly?',
    subtext: 'Reflect on how their presence or words made you feel supported.',
    tags: ['connection', 'kindness', 'people'],
    order: 2,
  },
  {
    promptId: 'grat_03',
    category: 'gratitude',
    text: 'What quality about yourself helped you navigate a challenging moment?',
    subtext: 'Give yourself credit for your resilience, patience, or willingness to try.',
    tags: ['self-compassion', 'resilience', 'strength'],
    order: 3,
  },
  {
    promptId: 'grat_04',
    category: 'gratitude',
    text: 'Write about a comfort in your living space that you are grateful for today.',
    subtext: 'A soft blanket, natural light, a favorite plant, or a safe shelter.',
    tags: ['sanctuary', 'comfort', 'home'],
    order: 4,
  },
  {
    promptId: 'grat_05',
    category: 'gratitude',
    text: 'What is a lesson or perspective you gained recently that you appreciate?',
    subtext: 'Growth often comes from unexpected moments of clarity.',
    tags: ['growth', 'learning', 'mindset'],
    order: 5,
  },

  // Reflection Prompts
  {
    promptId: 'refl_01',
    category: 'reflection',
    text: 'If today had a color, texture, or weather pattern, what would it be?',
    subtext: 'Describe the sensory feeling of your day without judging it as good or bad.',
    tags: ['metaphor', 'awareness', 'mindfulness'],
    order: 6,
  },
  {
    promptId: 'refl_02',
    category: 'reflection',
    text: 'What drained your energy today, and what gently nourished it?',
    subtext: 'Notice the contrast between depleting forces and restorative moments.',
    tags: ['energy', 'balance', 'boundaries'],
    order: 7,
  },
  {
    promptId: 'refl_03',
    category: 'reflection',
    text: 'What expectation did you place on yourself today that you can gently release?',
    subtext: 'Give yourself permission to let go of perfectionism.',
    tags: ['release', 'expectations', 'gentleness'],
    order: 8,
  },
  {
    promptId: 'refl_04',
    category: 'reflection',
    text: 'How did your body feel throughout different parts of your day?',
    subtext: 'Check in with tension, posture, breathing, and physical ease.',
    tags: ['somatic', 'body', 'presence'],
    order: 9,
  },
  {
    promptId: 'refl_05',
    category: 'reflection',
    text: 'What is one thing that went better than you initially worried it might?',
    subtext: 'Acknowledging positive outcomes helps counter anxiety.',
    tags: ['anxiety', 'perspective', 'hope'],
    order: 10,
  },

  // Emotions Prompts
  {
    promptId: 'emot_01',
    category: 'emotions',
    text: 'What emotion is asking for your attention right now, and what does it need to say?',
    subtext: 'Allow every feeling a seat at the table without trying to change it.',
    tags: ['acceptance', 'feelings', 'validation'],
    order: 11,
  },
  {
    promptId: 'emot_02',
    category: 'emotions',
    text: 'If your current feeling was a guest visiting your home, how would you treat it?',
    subtext: 'Welcome the feeling with warmth, curiosity, and patience.',
    tags: ['compassion', 'curiosity', 'hospitality'],
    order: 12,
  },
  {
    promptId: 'emot_03',
    category: 'emotions',
    text: 'Write about a feeling you tried to hide or push away today.',
    subtext: 'Why did it feel uncomfortable, and what can you offer yourself now?',
    tags: ['honesty', 'vulnerability', 'healing'],
    order: 13,
  },
  {
    promptId: 'emot_04',
    category: 'emotions',
    text: 'When did you feel most like yourself today, even for just a minute?',
    subtext: 'Describe the freedom, laughter, or ease in that moment.',
    tags: ['authenticity', 'joy', 'self'],
    order: 14,
  },
  {
    promptId: 'emot_05',
    category: 'emotions',
    text: 'What emotional boundary felt honored or tested today?',
    subtext: 'Reflect on how protecting your peace influenced your mood.',
    tags: ['boundaries', 'protection', 'peace'],
    order: 15,
  },

  // Growth Prompts
  {
    promptId: 'grow_01',
    category: 'growth',
    text: 'What is a belief about yourself that you are outgrowing?',
    subtext: 'Notice the shifts in your self-talk and personal narrative.',
    tags: ['evolution', 'transformation', 'self-talk'],
    order: 16,
  },
  {
    promptId: 'grow_02',
    category: 'growth',
    text: 'What is one courage step you took recently, no matter how tiny it seemed?',
    subtext: 'Courage is often quiet: saying no, resting, speaking up, or asking for help.',
    tags: ['courage', 'bravery', 'milestones'],
    order: 17,
  },
  {
    promptId: 'grow_03',
    category: 'growth',
    text: 'How have your priorities shifted over the last few months?',
    subtext: 'Celebrate what you now make space for in your daily life.',
    tags: ['priorities', 'life-direction', 'values'],
    order: 18,
  },
  {
    promptId: 'grow_04',
    category: 'growth',
    text: 'What kind of person are you becoming through the challenges you face?',
    subtext: 'Focus on wisdom, empathy, and internal strength rather than external trophies.',
    tags: ['character', 'depth', 'wisdom'],
    order: 19,
  },
  {
    promptId: 'grow_05',
    category: 'growth',
    text: 'What does living in alignment with your values look like tomorrow?',
    subtext: 'Name one practical choice you can make in the morning.',
    tags: ['values', 'intention', 'tomorrow'],
    order: 20,
  },

  // Calm Prompts
  {
    promptId: 'calm_01',
    category: 'calm',
    text: 'Describe a place where your mind and shoulders naturally settle and soften.',
    subtext: 'Immerse your senses in the sights, smells, and sounds of that calm space.',
    tags: ['sanctuary', 'relaxation', 'visualization'],
    order: 21,
  },
  {
    promptId: 'calm_02',
    category: 'calm',
    text: 'What mantra, reminder, or truth brings you grounded assurance?',
    subtext: 'Write it down slowly. Repeat it as you take three unhurried breaths.',
    tags: ['affirmation', 'grounding', 'breath'],
    order: 22,
  },
  {
    promptId: 'calm_03',
    category: 'calm',
    text: 'What can you cross off your mental list that does not actually need to be done tonight?',
    subtext: 'Create a "not doing" list to protect your evening rest.',
    tags: ['rest', 'simplicity', 'permission'],
    order: 23,
  },
  {
    promptId: 'calm_04',
    category: 'calm',
    text: 'How can you be particularly gentle with your thoughts in this moment?',
    subtext: 'Notice any inner critic and replace it with the voice of a devoted friend.',
    tags: ['kindness', 'inner-voice', 'comfort'],
    order: 24,
  },
  {
    promptId: 'calm_05',
    category: 'calm',
    text: 'Look around you. Name five quiet things that require nothing from you.',
    subtext: 'Let the neutrality of your surroundings bring stillness to your racing mind.',
    tags: ['mindfulness', 'presence', 'grounding'],
    order: 25,
  },

  // Relationships Prompts
  {
    promptId: 'rel_01',
    category: 'relationships',
    text: 'Who makes you feel safe enough to be completely honest?',
    subtext: 'What is it about their energy or listening that builds trust?',
    tags: ['trust', 'friendship', 'safety'],
    order: 26,
  },
  {
    promptId: 'rel_02',
    category: 'relationships',
    text: 'What gratitude or appreciation have you left unsaid to someone you care about?',
    subtext: 'Draft the words here first, whether or not you decide to share them.',
    tags: ['appreciation', 'words', 'love'],
    order: 27,
  },
  {
    promptId: 'rel_03',
    category: 'relationships',
    text: 'How can you show up for yourself the way you tend to show up for others?',
    subtext: 'Notice if your generosity to loved ones exceeds what you grant yourself.',
    tags: ['self-care', 'balance', 'reciprocity'],
    order: 28,
  },
  {
    promptId: 'rel_04',
    category: 'relationships',
    text: 'What boundary can you hold with love rather than resentment?',
    subtext: 'Boundaries keep relationships clean, clear, and sustainable.',
    tags: ['healthy-boundaries', 'love', 'clarity'],
    order: 29,
  },
  {
    promptId: 'rel_05',
    category: 'relationships',
    text: 'What shared memory recently brought a smile to your heart?',
    subtext: 'Relive the laughter, shared understanding, or mutual warmth.',
    tags: ['memory', 'connection', 'joy'],
    order: 30,
  },
];

export class JournalPromptService {
  /**
   * Seed prompts into the database if not present
   */
  public static async ensureSeedPrompts(): Promise<void> {
    const count = await JournalPromptModel.countDocuments();
    if (count < SEED_PROMPTS.length) {
      for (const p of SEED_PROMPTS) {
        await JournalPromptModel.findOneAndUpdate(
          { promptId: p.promptId },
          { $set: p },
          { upsert: true, new: true },
        );
      }
    }
  }

  /**
   * Get all active prompts, optionally filtered by category
   */
  public static async getPrompts(category?: PromptCategory): Promise<any[]> {
    await this.ensureSeedPrompts();
    const query: Record<string, unknown> = { isActive: true };
    if (category) {
      query.category = category;
    }
    const prompts = await JournalPromptModel.find(query).sort({ order: 1 });
    return prompts.map((p) => p.toDto());
  }

  /**
   * Get a random prompt for daily inspiration
   */
  public static async getRandomPrompt(category?: PromptCategory): Promise<any> {
    const prompts = await this.getPrompts(category);
    if (!prompts.length) return null;
    const randomIndex = Math.floor(Math.random() * prompts.length);
    return prompts[randomIndex];
  }
}

