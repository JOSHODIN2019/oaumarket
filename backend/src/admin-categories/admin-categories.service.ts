import { BadRequestException, Injectable } from '@nestjs/common';
import { AdminAuditLogsService } from '../admin-audit-logs/admin-audit-logs.service.js';
import { CategoriesService } from '../categories/categories.service.js';
import { CategoryDocument } from '../categories/schemas/category.schema.js';
import { CreateCategoryDto } from '../categories/dto/create-category.dto.js';
import { UpdateCategoryDto } from '../categories/dto/update-category.dto.js';
import { ProductsService } from '../products/products.service.js';

export interface AdminActor {
  id: string;
  name: string;
}

@Injectable()
export class AdminCategoriesService {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly productsService: ProductsService,
    private readonly adminAuditLogsService: AdminAuditLogsService,
  ) {}

  async create(dto: CreateCategoryDto, actor: AdminActor): Promise<CategoryDocument> {
    const category = await this.categoriesService.create(dto);
    await this.adminAuditLogsService.record({
      adminId: actor.id,
      adminName: actor.name,
      action: 'category.create',
      targetId: category._id.toString(),
      detail: category.slug,
    });
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto, actor: AdminActor): Promise<CategoryDocument> {
    const category = await this.categoriesService.update(id, dto);
    await this.adminAuditLogsService.record({
      adminId: actor.id,
      adminName: actor.name,
      action: 'category.update',
      targetId: id,
    });
    return category;
  }

  async remove(id: string, actor: AdminActor): Promise<void> {
    const category = await this.categoriesService.findById(id);
    const inUseCount = await this.productsService.countByCategory(category.slug);
    if (inUseCount > 0) {
      throw new BadRequestException(
        `Cannot delete "${category.name}" - ${inUseCount} listing${inUseCount === 1 ? ' uses' : 's use'} it. Move or remove those listings first.`,
      );
    }
    await this.categoriesService.remove(id);
    await this.adminAuditLogsService.record({
      adminId: actor.id,
      adminName: actor.name,
      action: 'category.delete',
      targetId: id,
      detail: category.slug,
    });
  }
}
