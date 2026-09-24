import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AdminsService } from '../admins/admins.service.js';
import { AdminLoginDto } from './dto/admin-login.dto.js';
import { SeedAdminDto } from './dto/seed-admin.dto.js';

const SALT_ROUNDS = 12;

export interface AdminAuthResult {
  accessToken: string;
  admin: { id: string; name: string; email: string };
}

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly adminsService: AdminsService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: AdminLoginDto): Promise<AdminAuthResult> {
    const admin = await this.adminsService.findByEmail(dto.email);
    if (!admin) {
      throw new UnauthorizedException('Incorrect email or password.');
    }
    const passwordMatches = await bcrypt.compare(dto.password, admin.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Incorrect email or password.');
    }
    return this.issueToken(admin.id, admin.name, admin.email);
  }

  // Dev-only bootstrap for the very first admin account - only works
  // while the admins collection is genuinely empty, so it can't be
  // used to mint extra admin accounts once a real one exists.
  async seedDevAdmin(dto: SeedAdminDto): Promise<AdminAuthResult> {
    const existingCount = await this.adminsService.countAll();
    if (existingCount > 0) {
      throw new ForbiddenException('An admin account already exists - use /admin-auth/login instead.');
    }
    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const admin = await this.adminsService.create({ name: dto.name, email: dto.email.toLowerCase().trim(), passwordHash });
    return this.issueToken(admin.id, admin.name, admin.email);
  }

  private issueToken(id: string, name: string, email: string): AdminAuthResult {
    const accessToken = this.jwtService.sign({ sub: id, name, email });
    return { accessToken, admin: { id, name, email } };
  }
}
