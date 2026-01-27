import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SupportService } from './support.service';
import { CreateSupportMessageDto } from './dto/create-support-message.dto';
import { CreateAdminReplyDto } from './dto/create-admin-reply.dto';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';
import { AdminEmailGuard } from '../common/guards/admin-email.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('support')
@Controller()
export class SupportController {
  constructor(private supportService: SupportService) {}

  // ==================== USER ENDPOINTS ====================

  @Post('support/messages')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send a support message' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  async createMessage(@Body() createDto: CreateSupportMessageDto, @CurrentUser() user: any) {
    const data = await this.supportService.createMessage(createDto, user);
    return { success: true, data };
  }

  @Get('support/my-history')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my support chat history' })
  @ApiResponse({ status: 200, description: 'Returns chat history' })
  async getMyHistory(
    @CurrentUser() user: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
  ) {
    const data = await this.supportService.getMyHistory(
      user.uid || user.id,
      parseInt(page),
      parseInt(limit),
    );
    return { data };
  }

  // ==================== ADMIN ENDPOINTS ====================

  @Get('admin/support/messages')
  @UseGuards(FirebaseAuthGuard, AdminEmailGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all support messages (Admin only)' })
  @ApiResponse({ status: 200, description: 'Returns paginated list of support messages' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'unreadOnly', required: false, type: Boolean })
  async getAllMessages(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
    @Query('unreadOnly') unreadOnly: string = 'false',
  ) {
    const data = await this.supportService.getAllMessages(
      parseInt(page),
      parseInt(limit),
      unreadOnly === 'true',
    );
    return { data };
  }

  @Patch('admin/support/messages/:id/read')
  @UseGuards(FirebaseAuthGuard, AdminEmailGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark support message as read (Admin only)' })
  @ApiResponse({ status: 200, description: 'Message marked as read' })
  async markAsRead(@Param('id') id: string) {
    return this.supportService.markAsRead(id);
  }

  @Post('admin/support/reply')
  @UseGuards(FirebaseAuthGuard, AdminEmailGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reply to a user (Admin only)' })
  @ApiResponse({ status: 201, description: 'Reply sent successfully' })
  async createAdminReply(@Body() replyDto: CreateAdminReplyDto, @CurrentUser() admin: any) {
    const data = await this.supportService.createAdminReply(replyDto, admin);
    return { success: true, data };
  }
}
