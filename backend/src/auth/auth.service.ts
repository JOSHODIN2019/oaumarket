import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';

const SALT_ROUNDS = 12;

export interface AuthResult {
  accessToken: string;
  user: { id: string; fullName: string; username: string; matricNumber: string };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // Used by the Welcome screen to route a visitor to Login or Register
  // without exposing anything else about the account.
  async matricExists(matricNumber: string): Promise<boolean> {
    const user = await this.usersService.findByMatricNumber(matricNumber);
    return user !== null;
  }

  async register(dto: RegisterDto): Promise<AuthResult> {
    const [existingByMatric, existingByUsername] = await Promise.all([
      this.usersService.findByMatricNumber(dto.matricNumber),
      this.usersService.findByUsername(dto.username),
    ]);
    if (existingByMatric) {
      throw new ConflictException('An account with this matric number already exists.');
    }
    if (existingByUsername) {
      throw new ConflictException('That username is already taken.');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.usersService.create({
      fullName: dto.fullName,
      username: dto.username,
      matricNumber: dto.matricNumber.toUpperCase().trim(),
      passwordHash,
    });

    return this.issueToken(user.id, user.fullName, user.username, user.matricNumber);
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.usersService.findByMatricNumber(dto.matricNumber);
    if (!user) {
      throw new UnauthorizedException('Incorrect matric number or password.');
    }
    if (user.suspended) {
      throw new UnauthorizedException('This account has been suspended.');
    }
    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    // Checked after the password, not before, so a wrong-password guess
    // never reveals whether an account is suspended.
    if (!passwordMatches) {
      throw new UnauthorizedException('Incorrect matric number or password.');
    }

    return this.issueToken(user.id, user.fullName, user.username, user.matricNumber);
  }

  private issueToken(id: string, fullName: string, username: string, matricNumber: string): AuthResult {
    const accessToken = this.jwtService.sign({ sub: id, matricNumber });
    return { accessToken, user: { id, fullName, username, matricNumber } };
  }
}
