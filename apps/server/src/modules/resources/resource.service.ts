import { Types } from 'mongoose';
import {
  ResourceFilterParams,
  ResourceDetail,
  ResourceProgressItem,
  ResourceCategoryMeta,
  CreateResourceAdminDto,
  UpdateResourceAdminDto,
} from '@solace/shared';
import { ResourceModel, IResourceDocument } from './resource.model';
import { ResourceBookmarkModel } from './resourceBookmark.model';
import { ResourceProgressModel } from './resourceProgress.model';
import { ResourceSeedService } from './resourceSeed.service';
import { User } from '../../models/user.model';
import { ProgressService } from '../progress/progress.service';
import { GeminiProvider } from '../../integrations/gemini/gemini.config';
import { AppError } from '../../utils/apiError';
import { logger } from '../../utils/logger';

export const EDUCATIONAL_CATEGORIES: ResourceCategoryMeta[] = [
  {
    id: 'emotions',
    title: 'Understanding Emotions',
    description: 'Learn to identify, understand, and navigate emotional experiences with gentle awareness.',
    icon: 'heart-outline',
  },
  {
    id: 'stress',
    title: 'Stress Management',
    description: 'Evidence-informed techniques for managing everyday stress, tension, and overwhelm.',
    icon: 'leaf-outline',
  },
  {
    id: 'mindfulness',
    title: 'Mindfulness',
    description: 'Present-moment grounding and breath-anchored practices for clarity and focus.',
    icon: 'flower-outline',
  },
  {
    id: 'sleep',
    title: 'Better Sleep',
    description: 'Restorative evening wind-downs and calming sleep hygiene routines.',
    icon: 'moon-outline',
  },
  {
    id: 'self_care',
    title: 'Self-Care',
    description: 'Nurturing habits and self-kindness rituals designed for sustainable energy.',
    icon: 'sparkles-outline',
  },
  {
    id: 'confidence',
    title: 'Building Confidence',
    description: 'Cultivate self-trust, positive self-talk, and resilient personal boundaries.',
    icon: 'shield-checkmark-outline',
  },
  {
    id: 'habits',
    title: 'Healthy Habits',
    description: 'Practical guidance for building gentle, long-lasting wellness routines.',
    icon: 'calendar-outline',
  },
  {
    id: 'growth',
    title: 'Personal Growth',
    description: 'Strengthen inner resilience, emotional agility, and purposeful daily living.',
    icon: 'trending-up-outline',
  },
];

export class ResourceService {
  /**
   * Ensure the 24 initial educational resources are seeded into the database
   */
  public static async ensureSeeded(): Promise<void> {
    await ResourceSeedService.ensureSeedResources();
  }

  /**
   * Helper to populate bookmark status, reading progress, and completion for a list of resources
   */
  private static async populateUserState(
    docs: IResourceDocument[],
    userId?: string,
  ): Promise<ResourceDetail[]> {
    if (!docs.length) return [];
    if (!userId) {
      return docs.map((doc) => doc.toDto());
    }

    const userObjectId = new Types.ObjectId(userId);
    const docIds = docs.map((d) => d._id);

    const [bookmarks, progressDocs] = await Promise.all([
      ResourceBookmarkModel.find({
        userId: userObjectId,
        resourceId: { $in: docIds },
      }).lean(),
      ResourceProgressModel.find({
        userId: userObjectId,
        resourceId: { $in: docIds },
      }).lean(),
    ]);

    const bookmarkSet = new Set(bookmarks.map((b) => b.resourceId.toString()));
    const progressMap = new Map(
      progressDocs.map((p) => [
        p.resourceId.toString(),
        {
          progressPercent: p.progressPercent || 0,
          isCompleted: Boolean(p.isCompleted),
        },
      ]),
    );

    return docs.map((doc) => {
      const docIdStr = doc._id.toString();
      const userProgress = progressMap.get(docIdStr);
      return doc.toDto({
        isBookmarked: bookmarkSet.has(docIdStr),
        progressPercent: userProgress?.progressPercent ?? 0,
        isCompleted: userProgress?.isCompleted ?? false,
      });
    });
  }

  /**
   * List resources with filtering, searching, and pagination
   */
  public static async listResources(
    filter: ResourceFilterParams = {},
    userId?: string,
  ): Promise<{
    resources: ResourceDetail[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    // If database is empty, seed initial resources
    const totalCount = await ResourceModel.countDocuments();
    if (totalCount === 0) {
      await ResourceSeedService.ensureSeedResources();
    }

    const query: Record<string, unknown> = {
      isActive: true,
      isPublished: true,
    };

    if (filter.category) {
      query.category = filter.category.toLowerCase().trim();
    }
    if (filter.language) {
      query.language = filter.language;
    }
    if (filter.contentType) {
      query.contentType = filter.contentType;
    }
    if (filter.tag) {
      query.tags = filter.tag.toLowerCase().trim();
    }

    if (filter.search && filter.search.trim()) {
      const term = filter.search.trim();
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      query.$or = [{ title: regex }, { description: regex }, { tags: regex }];
    }

    const page = Math.max(1, Number(filter.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(filter.limit) || 20));
    const skip = (page - 1) * limit;

    const [total, docs] = await Promise.all([
      ResourceModel.countDocuments(query),
      ResourceModel.find(query).sort({ publishedAt: -1 }).skip(skip).limit(limit),
    ]);

    const resources = await this.populateUserState(docs, userId);

    return {
      resources,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Get featured resources
   */
  public static async getFeatured(userId?: string): Promise<ResourceDetail[]> {
    let docs = await ResourceModel.find({
      isActive: true,
      isPublished: true,
      isFeatured: true,
    })
      .sort({ publishedAt: -1 })
      .limit(6);

    if (docs.length === 0) {
      docs = await ResourceModel.find({
        isActive: true,
        isPublished: true,
      })
        .sort({ publishedAt: -1 })
        .limit(6);
    }

    return this.populateUserState(docs, userId);
  }

  /**
   * Get personalized recommendations for a user based on their wellness goals and preferences
   */
  public static async getRecommended(userId: string): Promise<ResourceDetail[]> {
    const user = await User.findById(userId).lean();
    const goals = user?.wellnessGoals || [];

    // All candidate published resources
    const allPublished = await ResourceModel.find({
      isActive: true,
      isPublished: true,
    })
      .sort({ publishedAt: -1 })
      .lean();

    if (!allPublished.length) {
      return [];
    }

    let recommendedSlugs: string[] = [];

    // Attempt Gemini-powered recommendation if configured
    if (GeminiProvider.isConfigured() && goals.length > 0) {
      try {
        const client = GeminiProvider.getClient();
        const candidateSummaries = allPublished.map((r) => ({
          slug: r.slug,
          title: r.title,
          category: r.category,
          tags: r.tags,
        }));

        const prompt = `You are a wellness recommendation engine.
User wellness goals: ${JSON.stringify(goals)}
User language: ${user?.language || 'en'}

Candidate resources:
${JSON.stringify(candidateSummaries)}

Pick the 4 to 6 most relevant resource slugs for this user based on their goals.
Respond ONLY with a valid JSON array of string slugs, e.g. ["slug-1", "slug-2"]. Do not add Markdown code fences or extra text.`;

        const response = await client.models.generateContent({
          model: GeminiProvider.defaultModel,
          contents: prompt,
        });

        const rawText = (response.text || '').trim();
        const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
        const parsed = JSON.parse(cleaned);

        if (Array.isArray(parsed) && parsed.length > 0) {
          const availableSlugSet = new Set(allPublished.map((r) => r.slug));
          recommendedSlugs = parsed.filter((s) => typeof s === 'string' && availableSlugSet.has(s));
        }
      } catch (err) {
        logger.warn('Gemini recommendation failed, falling back to rule-based matcher:', err);
      }
    }

    // Rule-based fallback if Gemini is unconfigured or failed
    if (!recommendedSlugs.length) {
      const lowerGoals = goals.map((g) => g.toLowerCase());
      const matched = allPublished.filter((r) => {
        const cat = r.category.toLowerCase();
        const matchesCat = lowerGoals.some((g) => g.includes(cat) || cat.includes(g));
        const matchesTags = r.tags.some((t) =>
          lowerGoals.some((g) => g.includes(t.toLowerCase()) || t.toLowerCase().includes(g)),
        );
        return matchesCat || matchesTags;
      });

      if (matched.length > 0) {
        recommendedSlugs = matched.slice(0, 6).map((m) => m.slug);
      } else {
        // Fallback to featured or most recent
        recommendedSlugs = allPublished.slice(0, 6).map((r) => r.slug);
      }
    }

    const docs = await ResourceModel.find({
      slug: { $in: recommendedSlugs },
      isActive: true,
      isPublished: true,
    });

    // Preserve the recommendation ordering
    const docMap = new Map<string, IResourceDocument>();
    for (const d of docs) {
      docMap.set(d.slug, d);
    }
    const sortedDocs: IResourceDocument[] = [];
    for (const slug of recommendedSlugs) {
      const d = docMap.get(slug);
      if (d) sortedDocs.push(d);
    }

    return this.populateUserState(sortedDocs, userId);
  }

  /**
   * Get category metadata with accurate published resource counts
   */
  public static async getCategories(): Promise<ResourceCategoryMeta[]> {
    const counts = await ResourceModel.aggregate([
      { $match: { isActive: true, isPublished: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const countMap = new Map<string, number>();
    for (const item of counts) {
      countMap.set(String(item._id).toLowerCase(), item.count);
    }

    return EDUCATIONAL_CATEGORIES.map((cat) => ({
      ...cat,
      count: countMap.get(cat.id.toLowerCase()) || 0,
    }));
  }

  /**
   * Search resources across title, description, tags, and category
   */
  public static async searchResources(
    queryStr: string,
    filter: ResourceFilterParams = {},
    userId?: string,
  ): Promise<{
    resources: ResourceDetail[];
    total: number;
    query: string;
  }> {
    const trimmed = (queryStr || '').trim();
    if (!trimmed) {
      const result = await this.listResources(filter, userId);
      return {
        resources: result.resources,
        total: result.total,
        query: '',
      };
    }

    const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');

    const query: Record<string, unknown> = {
      isActive: true,
      isPublished: true,
      $or: [{ title: regex }, { description: regex }, { tags: regex }, { category: regex }],
    };

    if (filter.category) {
      query.category = filter.category.toLowerCase().trim();
    }
    if (filter.language) {
      query.language = filter.language;
    }

    const docs = await ResourceModel.find(query).sort({ publishedAt: -1 }).limit(30);
    const resources = await this.populateUserState(docs, userId);

    return {
      resources,
      total: resources.length,
      query: trimmed,
    };
  }

  /**
   * Retrieve resource by ID or slug
   */
  public static async getResourceById(idOrSlug: string, userId?: string): Promise<ResourceDetail> {
    let doc: IResourceDocument | null = null;
    if (Types.ObjectId.isValid(idOrSlug)) {
      doc = await ResourceModel.findOne({
        _id: new Types.ObjectId(idOrSlug),
        isActive: true,
      });
    }

    if (!doc) {
      doc = await ResourceModel.findOne({
        slug: idOrSlug.toLowerCase().trim(),
        isActive: true,
      });
    }

    if (!doc) {
      throw AppError.notFound('Educational resource not found');
    }

    const [populated] = await this.populateUserState([doc], userId);
    return populated;
  }

  /**
   * Toggle user favorite bookmark on a resource
   */
  public static async toggleFavorite(
    userId: string,
    resourceId: string,
  ): Promise<{ isBookmarked: boolean; resourceId: string }> {
    const resource = await ResourceModel.findOne({
      _id: new Types.ObjectId(resourceId),
      isActive: true,
    });

    if (!resource) {
      throw AppError.notFound('Resource not found');
    }

    const userObjectId = new Types.ObjectId(userId);
    const existing = await ResourceBookmarkModel.findOne({
      userId: userObjectId,
      resourceId: resource._id,
    });

    if (existing) {
      await existing.deleteOne();
      return { isBookmarked: false, resourceId: resource._id.toString() };
    }

    await ResourceBookmarkModel.create({
      userId: userObjectId,
      resourceId: resource._id,
    });

    return { isBookmarked: true, resourceId: resource._id.toString() };
  }

  /**
   * Retrieve all bookmarked resources for user
   */
  public static async getFavorites(userId: string): Promise<ResourceDetail[]> {
    const userObjectId = new Types.ObjectId(userId);
    const bookmarks = await ResourceBookmarkModel.find({ userId: userObjectId })
      .sort({ createdAt: -1 })
      .lean();

    if (!bookmarks.length) return [];

    const resourceIds = bookmarks.map((b) => b.resourceId);
    const docs = await ResourceModel.find({
      _id: { $in: resourceIds },
      isActive: true,
      isPublished: true,
    });

    const docMap = new Map<string, IResourceDocument>();
    for (const d of docs) {
      docMap.set(d._id.toString(), d);
    }
    const orderedDocs: IResourceDocument[] = [];
    for (const id of resourceIds) {
      const d = docMap.get(id.toString());
      if (d) orderedDocs.push(d);
    }

    return this.populateUserState(orderedDocs, userId);
  }

  /**
   * Update reading progress for a user on a resource
   */
  public static async updateProgress(
    userId: string,
    resourceId: string,
    progressPercent: number,
  ): Promise<ResourceProgressItem> {
    const resource = await ResourceModel.findOne({
      _id: new Types.ObjectId(resourceId),
      isActive: true,
    });

    if (!resource) {
      throw AppError.notFound('Resource not found');
    }

    const userObjectId = new Types.ObjectId(userId);
    const clamped = Math.max(0, Math.min(100, Math.round(progressPercent)));

    let progress = await ResourceProgressModel.findOne({
      userId: userObjectId,
      resourceId: resource._id,
    });

    const wasCompleted = Boolean(progress?.isCompleted);
    const now = new Date();

    if (!progress) {
      progress = new ResourceProgressModel({
        userId: userObjectId,
        resourceId: resource._id,
        progressPercent: clamped,
        isCompleted: clamped >= 100,
        completedAt: clamped >= 100 ? now : undefined,
        lastReadAt: now,
      });
    } else {
      progress.progressPercent = Math.max(progress.progressPercent, clamped);
      progress.lastReadAt = now;
      if (clamped >= 100 && !wasCompleted) {
        progress.isCompleted = true;
        progress.completedAt = now;
      }
    }

    await progress.save();

    // If newly completed, record activity for streaks and progress
    if (progress.isCompleted && !wasCompleted) {
      try {
        await ProgressService.recordActivity(userId, 'activity');
      } catch (err) {
        logger.warn('Failed to record progress streak on resource completion:', err);
      }
    }

    return progress.toDto();
  }

  /**
   * Mark a resource completely finished
   */
  public static async completeResource(
    userId: string,
    resourceId: string,
  ): Promise<ResourceProgressItem> {
    return this.updateProgress(userId, resourceId, 100);
  }

  /**
   * Retrieve all progress items for user
   */
  public static async getUserProgress(
    userId: string,
  ): Promise<{ resource: ResourceDetail; progress: ResourceProgressItem }[]> {
    const userObjectId = new Types.ObjectId(userId);
    const progressDocs = await ResourceProgressModel.find({ userId: userObjectId })
      .sort({ lastReadAt: -1 })
      .limit(50);

    if (!progressDocs.length) return [];

    const resourceIds = progressDocs.map((p) => p.resourceId);
    const docs = await ResourceModel.find({
      _id: { $in: resourceIds },
      isActive: true,
    });

    const populated = await this.populateUserState(docs, userId);
    const popMap = new Map(populated.map((r) => [r.id, r]));

    return progressDocs
      .map((p) => {
        const resource = popMap.get(p.resourceId.toString());
        if (!resource) return null;
        return {
          resource,
          progress: p.toDto(),
        };
      })
      .filter((item): item is { resource: ResourceDetail; progress: ResourceProgressItem } =>
        Boolean(item),
      );
  }

  // --- Admin Methods ---

  public static async createResource(dto: CreateResourceAdminDto): Promise<ResourceDetail> {
    const slug =
      dto.slug?.trim().toLowerCase() ||
      dto.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    const existing = await ResourceModel.findOne({ slug });
    if (existing) {
      throw AppError.conflict('Resource with this slug already exists');
    }

    const doc = await ResourceModel.create({
      ...dto,
      slug,
      isActive: true,
      publishedAt: dto.isPublished ? new Date() : undefined,
    });

    return doc.toDto();
  }

  public static async updateResource(
    id: string,
    dto: UpdateResourceAdminDto,
  ): Promise<ResourceDetail> {
    const doc = await ResourceModel.findById(id);
    if (!doc) {
      throw AppError.notFound('Resource not found');
    }

    if (dto.title !== undefined) doc.title = dto.title;
    if (dto.description !== undefined) doc.description = dto.description;
    if (dto.category !== undefined) doc.category = dto.category.toLowerCase();
    if (dto.contentType !== undefined) doc.contentType = dto.contentType;
    if (dto.contentUrl !== undefined) doc.contentUrl = dto.contentUrl;
    if (dto.language !== undefined) doc.language = dto.language;
    if (dto.author !== undefined) doc.author = dto.author;
    if (dto.readingMinutes !== undefined) doc.readingMinutes = dto.readingMinutes;
    if (dto.coverImage !== undefined) doc.coverImage = dto.coverImage;
    if (dto.tags !== undefined) doc.tags = dto.tags;
    if (dto.blocks !== undefined) doc.blocks = dto.blocks;
    if (dto.relatedActivityIds !== undefined) doc.relatedActivityIds = dto.relatedActivityIds;
    if (dto.isFeatured !== undefined) doc.isFeatured = dto.isFeatured;
    if (dto.isPublished !== undefined) {
      doc.isPublished = dto.isPublished;
      if (dto.isPublished && !doc.publishedAt) {
        doc.publishedAt = new Date();
      }
    }

    await doc.save();
    return doc.toDto();
  }

  public static async deleteResource(id: string): Promise<void> {
    const doc = await ResourceModel.findById(id);
    if (!doc) {
      throw AppError.notFound('Resource not found');
    }
    doc.isActive = false;
    await doc.save();
  }

  public static async setPublishStatus(id: string, isPublished: boolean): Promise<ResourceDetail> {
    return this.updateResource(id, { isPublished });
  }

  public static async setFeatureStatus(id: string, isFeatured: boolean): Promise<ResourceDetail> {
    return this.updateResource(id, { isFeatured });
  }
}
