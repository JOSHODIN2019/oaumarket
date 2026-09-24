import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema.js';

export interface PublicUser {
  id: string;
  fullName: string;
  username: string;
  avatarUrl?: string;
}

function toPublicUser(user: Pick<UserDocument, '_id' | 'fullName' | 'username' | 'avatarUrl'>): PublicUser {
  return {
    id: user._id.toString(),
    fullName: user.fullName,
    username: user.username,
    ...(user.avatarUrl ? { avatarUrl: user.avatarUrl } : {}),
  };
}

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  findByMatricNumber(matricNumber: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ matricNumber: matricNumber.toUpperCase().trim() }).exec();
  }

  findByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username: username.toLowerCase().trim() }).exec();
  }

  findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findPublicById(id: string): Promise<PublicUser | null> {
    const user = await this.userModel.findById(id).select({ fullName: 1, username: 1, avatarUrl: 1 }).exec();
    return user ? toPublicUser(user) : null;
  }

  async findAllPublic(): Promise<PublicUser[]> {
    const users = await this.userModel.find().select({ fullName: 1, username: 1, avatarUrl: 1 }).exec();
    return users.map(toPublicUser);
  }

  async setAvatarUrl(id: string, avatarUrl: string): Promise<void> {
    await this.userModel.updateOne({ _id: id }, { $set: { avatarUrl } }).exec();
  }

  async updateProfile(id: string, data: { fullName?: string; avatarUrl?: string }): Promise<void> {
    const update: { fullName?: string; avatarUrl?: string } = {};
    if (data.fullName !== undefined) update.fullName = data.fullName;
    if (data.avatarUrl !== undefined) update.avatarUrl = data.avatarUrl;
    if (Object.keys(update).length === 0) return;
    await this.userModel.updateOne({ _id: id }, { $set: update }).exec();
  }

  create(data: { fullName: string; username: string; matricNumber: string; passwordHash: string }): Promise<UserDocument> {
    return this.userModel.create(data);
  }
}
