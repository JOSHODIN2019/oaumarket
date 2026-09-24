import { ConflictException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { Category, CategoryDocument } from './schemas/category.schema.js';

// A brand-new install has no categories at all, which would leave the
// listing form's category picker empty - seeded once at startup, only
// if the collection is genuinely empty, matching the categories the
// original mock product data used.
const DEFAULT_CATEGORIES: { name: string; slug: string }[] = [
  { name: 'Electronics', slug: 'electronics' },
  { name: 'Fashion', slug: 'fashion' },
  { name: 'Services', slug: 'services' },
  { name: 'Books & Materials', slug: 'books' },
  { name: 'Furniture & Room', slug: 'furniture' },
];

@Injectable()
export class CategoriesService implements OnModuleInit {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async onModuleInit(): Promise<void> {
    const count = await this.categoryModel.countDocuments().exec();
    if (count > 0) return;
    try {
      // `ordered: false` so one duplicate-slug failure doesn't abort
      // the rest of the batch.
      await this.categoryModel.insertMany(DEFAULT_CATEGORIES, { ordered: false });
    } catch (error) {
      // A concurrent instance seeding at the same time (e.g. two dev
      // server processes racing on startup) hits the unique slug
      // index and throws here - that's the index doing its job, not a
      // real failure, so it's swallowed rather than crashing startup.
      const isDuplicateKeyError = (error as { code?: number }).code === 11000;
      if (!isDuplicateKeyError) throw error;
    }
  }

  findAll(): Promise<CategoryDocument[]> {
    return this.categoryModel.find().sort({ name: 1 }).exec();
  }

  async findById(id: string): Promise<CategoryDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Category not found.');
    }
    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException('Category not found.');
    }
    return category;
  }

  async create(dto: CreateCategoryDto): Promise<CategoryDocument> {
    const existing = await this.categoryModel.findOne({ slug: dto.slug }).exec();
    if (existing) {
      throw new ConflictException(`A category with slug "${dto.slug}" already exists.`);
    }
    return this.categoryModel.create(dto);
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<CategoryDocument> {
    const category = await this.findById(id);
    if (dto.name !== undefined) category.name = dto.name;
    if (dto.description !== undefined) category.description = dto.description;
    await category.save();
    return category;
  }

  async remove(id: string): Promise<void> {
    const category = await this.findById(id);
    await this.categoryModel.deleteOne({ _id: category._id }).exec();
  }
}
