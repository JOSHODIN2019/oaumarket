import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy.js';
import { UpdateAvatarDto } from './dto/update-avatar.dto.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { UsersService } from './users.service.js';

// Public profile reads only - name/username/avatar, never matric number or
// passwordHash. Used for viewing a seller's profile and resolving
// names/avatars across messaging, listings, and offers.
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('me/avatar')
  @UseGuards(JwtAuthGuard)
  async setMyAvatar(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateAvatarDto) {
    await this.usersService.setAvatarUrl(user.id, dto.avatarUrl);
    return this.usersService.findPublicById(user.id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateMyProfile(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateProfileDto) {
    await this.usersService.updateProfile(user.id, dto);
    return this.usersService.findPublicById(user.id);
  }

  @Get()
  findAllPublic() {
    return this.usersService.findAllPublic();
  }

  @Get(':id')
  findPublicById(@Param('id') id: string) {
    return this.usersService.findPublicById(id);
  }
}
