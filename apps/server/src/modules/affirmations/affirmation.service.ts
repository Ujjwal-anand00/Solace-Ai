import { AffirmationModel, IAffirmationDocument } from './affirmation.model';
import { Affirmation } from '@solace/shared';

export class AffirmationService {
  /**
   * List active affirmations with optional filters
   */
  public static async listAffirmations(
    category?: string,
    tag?: string,
    language = 'en',
  ): Promise<Affirmation[]> {
    const filter: Record<string, unknown> = { isActive: true, language };
    if (category) filter.category = category.toLowerCase();
    if (tag) filter.tags = tag.toLowerCase();

    const docs = await AffirmationModel.find(filter).sort({ category: 1 });
    return docs.map((d: IAffirmationDocument) => d.toDto());
  }

  /**
   * Deterministically get today's affirmation
   * Based on hash of current YYYY-MM-DD
   */
  public static async getDailyAffirmation(category?: string, language = 'en'): Promise<Affirmation | null> {
    const filter: Record<string, unknown> = { isActive: true, language };
    if (category) filter.category = category.toLowerCase();

    const count = await AffirmationModel.countDocuments(filter);
    if (count === 0) {
      const fallback = await AffirmationModel.findOne({ isActive: true });
      return fallback ? fallback.toDto() : null;
    }

    // Deterministic daily index based on date string
    const todayStr = new Date().toISOString().split('T')[0];
    let hash = 0;
    for (let i = 0; i < todayStr.length; i++) {
      hash = (hash << 5) - hash + todayStr.charCodeAt(i);
      hash |= 0;
    }
    const index = Math.abs(hash) % count;

    const doc = await AffirmationModel.findOne(filter).skip(index);
    return doc ? doc.toDto() : null;
  }
}
