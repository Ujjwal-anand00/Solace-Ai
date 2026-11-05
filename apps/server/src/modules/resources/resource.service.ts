import { ResourceModel, IResourceDocument } from './resource.model';
import { WellnessResource } from '@solace/shared';

export class ResourceService {
  public static async listResources(category?: string): Promise<WellnessResource[]> {
    const filter: Record<string, unknown> = { isActive: true };
    if (category) filter.category = category.toLowerCase();

    const docs = await ResourceModel.find(filter).sort({ title: 1 });
    return docs.map((d: IResourceDocument) => d.toDto());
  }
}

