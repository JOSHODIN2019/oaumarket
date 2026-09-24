import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin, AdminDocument } from './schemas/admin.schema.js';

@Injectable()
export class AdminsService {
  constructor(@InjectModel(Admin.name) private readonly adminModel: Model<AdminDocument>) {}

  findByEmail(email: string): Promise<AdminDocument | null> {
    return this.adminModel.findOne({ email: email.toLowerCase().trim() }).exec();
  }

  countAll(): Promise<number> {
    return this.adminModel.countDocuments().exec();
  }

  create(data: { name: string; email: string; passwordHash: string }): Promise<AdminDocument> {
    return this.adminModel.create(data);
  }
}
