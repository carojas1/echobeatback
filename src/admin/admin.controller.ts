import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpdateUserAdminDto, ChangeRoleDto, ChangeStatusDto } from './dto/update-user-admin.dto';
import { CreateSongAdminDto, UpdateSongAdminDto } from './dto/create-song-admin.dto';
import { CreateAlbumAdminDto, UpdateAlbumAdminDto } from './dto/create-album-admin.dto';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';
import { AdminEmailGuard } from '../common/guards/admin-email.guard';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(FirebaseAuthGuard, AdminEmailGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  // ==================== USERS ====================

  @Get('users')
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'Returns paginated list of all users' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getAllUsers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('search') search?: string,
  ) {
    return this.adminService.getAllUsers(parseInt(page), parseInt(limit), search);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user details by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Returns user details with playlists and activity' })
  async getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Put('users/:id')
  @ApiOperation({ summary: 'Update user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserAdminDto) {
    return this.adminService.updateUser(id, updateUserDto);
  }

  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Change user role (Admin only)' })
  @ApiResponse({ status: 200, description: 'User role changed successfully' })
  async changeUserRole(@Param('id') id: string, @Body() changeRoleDto: ChangeRoleDto) {
    return this.adminService.changeUserRole(id, changeRoleDto);
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: 'Change user status - Block/Unblock (Admin only)' })
  @ApiResponse({ status: 200, description: 'User status changed successfully' })
  async changeUserStatus(@Param('id') id: string, @Body() changeStatusDto: ChangeStatusDto) {
    return this.adminService.changeUserStatus(id, changeStatusDto);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  // ==================== SONGS ====================

  @Get('songs')
  @ApiOperation({ summary: 'Get all songs (Admin only)' })
  @ApiResponse({ status: 200, description: 'Returns paginated list of all songs' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getAllSongs(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('search') search?: string,
  ) {
    return this.adminService.getAllSongs(parseInt(page), parseInt(limit), search);
  }

  @Post('songs')
  @ApiOperation({ summary: 'Create new song (Admin only)' })
  @ApiResponse({ status: 201, description: 'Song created successfully' })
  async createSong(@Body() createSongDto: CreateSongAdminDto, @CurrentUser() admin: any) {
    return this.adminService.createSong(createSongDto, admin.id);
  }

  @Put('songs/:id')
  @ApiOperation({ summary: 'Update song (Admin only)' })
  @ApiResponse({ status: 200, description: 'Song updated successfully' })
  async updateSong(@Param('id') id: string, @Body() updateSongDto: UpdateSongAdminDto) {
    return this.adminService.updateSong(id, updateSongDto);
  }

  @Delete('songs/:id')
  @ApiOperation({ summary: 'Delete song (Admin only)' })
  @ApiResponse({ status: 200, description: 'Song deleted successfully' })
  async deleteSong(@Param('id') id: string) {
    return this.adminService.deleteSong(id);
  }

  // ==================== ALBUMS ====================

  @Get('albums')
  @ApiOperation({ summary: 'Get all albums (Admin only)' })
  @ApiResponse({ status: 200, description: 'Returns paginated list of all albums' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getAllAlbums(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('search') search?: string,
  ) {
    return this.adminService.getAllAlbums(parseInt(page), parseInt(limit), search);
  }

  @Post('albums')
  @ApiOperation({ summary: 'Create new album (Admin only)' })
  @ApiResponse({ status: 201, description: 'Album created successfully' })
  async createAlbum(@Body() createAlbumDto: CreateAlbumAdminDto) {
    return this.adminService.createAlbum(createAlbumDto);
  }

  @Put('albums/:id')
  @ApiOperation({ summary: 'Update album (Admin only)' })
  @ApiResponse({ status: 200, description: 'Album updated successfully' })
  async updateAlbum(@Param('id') id: string, @Body() updateAlbumDto: UpdateAlbumAdminDto) {
    return this.adminService.updateAlbum(id, updateAlbumDto);
  }

  @Delete('albums/:id')
  @ApiOperation({ summary: 'Delete album (Admin only)' })
  @ApiResponse({ status: 200, description: 'Album deleted successfully' })
  async deleteAlbum(@Param('id') id: string) {
    return this.adminService.deleteAlbum(id);
  }

  // ==================== STATISTICS ====================

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Returns comprehensive system statistics' })
  async getStats() {
    return this.adminService.getStats();
  }

  @Get('stats/users')
  @ApiOperation({ summary: 'Get user statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Returns user-specific statistics' })
  async getUserStats() {
    return this.adminService.getUserStats();
  }

  @Get('stats/songs')
  @ApiOperation({ summary: 'Get song statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Returns song-specific statistics' })
  async getSongStats() {
    return this.adminService.getSongStats();
  }

  // ==================== FIREBASE USERS ====================

  @Get('firebase-users')
  @ApiOperation({ summary: 'Get all Firebase users (Admin only)' })
  @ApiResponse({ status: 200, description: 'Returns list of Firebase Auth users' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getFirebaseUsers(@Query('limit') limit: string = '100') {
    const listUsersResult = await admin.auth().listUsers(Number(limit));

    const users = listUsersResult.users.map((user) => ({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email?.split('@')[0] || 'Usuario',
      photoURL: user.photoURL,
      disabled: user.disabled,
      createdAt: user.metadata.creationTime,
      lastSignIn: user.metadata.lastSignInTime,
    }));

    return { users, total: users.length };
  }

  @Delete('firebase-users/:uid')
  @ApiOperation({ summary: 'Delete Firebase user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User deleted from Firebase' })
  async deleteFirebaseUser(@Param('uid') uid: string) {
    const user = await admin.auth().getUser(uid);

    if (user.email === 'carojas@sudamericano.edu.ec') {
      throw new ForbiddenException('No puedes eliminar al administrador');
    }

    await admin.auth().deleteUser(uid);
    return { success: true, message: 'Usuario eliminado' };
  }

  @Patch('firebase-users/:uid/toggle')
  @ApiOperation({ summary: 'Enable/Disable Firebase user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User status toggled' })
  async toggleFirebaseUser(@Param('uid') uid: string) {
    const user = await admin.auth().getUser(uid);

    if (user.email === 'carojas@sudamericano.edu.ec') {
      throw new ForbiddenException('No puedes deshabilitar al administrador');
    }

    await admin.auth().updateUser(uid, { disabled: !user.disabled });

    return {
      success: true,
      disabled: !user.disabled,
      message: user.disabled ? 'Usuario habilitado' : 'Usuario deshabilitado',
    };
  }
}
