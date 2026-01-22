import { Controller, Get, Put, Post, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Get('me')
    @ApiOperation({ summary: 'Get current user profile' })
    @ApiResponse({ status: 200, description: 'Returns current user profile' })
    async getProfile(@CurrentUser() user: any) {
        return this.usersService.findById(user.id);
    }

    @Put('me')
    @ApiOperation({ summary: 'Update current user profile' })
    @ApiResponse({ status: 200, description: 'Profile updated successfully' })
    async updateProfile(@CurrentUser() user: any, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.updateProfile(user.id, updateUserDto);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get user by ID' })
    @ApiResponse({ status: 200, description: 'Returns user profile' })
    async getUserById(@Param('id') id: string) {
        return this.usersService.findById(id);
    }

    @Post(':id/follow')
    @ApiOperation({ summary: 'Follow a user' })
    @ApiResponse({ status: 200, description: 'User followed successfully' })
    async followUser(@CurrentUser() user: any, @Param('id') targetUserId: string) {
        return this.usersService.followUser(user.id, targetUserId);
    }

    @Delete(':id/follow')
    @ApiOperation({ summary: 'Unfollow a user' })
    @ApiResponse({ status: 200, description: 'User unfollowed successfully' })
    async unfollowUser(@CurrentUser() user: any, @Param('id') targetUserId: string) {
        return this.usersService.unfollowUser(user.id, targetUserId);
    }

    @Get(':id/followers')
    @ApiOperation({ summary: 'Get user followers' })
    @ApiResponse({ status: 200, description: 'Returns list of followers' })
    async getFollowers(@Param('id') id: string) {
        return this.usersService.getFollowers(id);
    }

    @Get(':id/following')
    @ApiOperation({ summary: 'Get users that this user follows' })
    @ApiResponse({ status: 200, description: 'Returns list of following' })
    async getFollowing(@Param('id') id: string) {
        return this.usersService.getFollowing(id);
    }
}
