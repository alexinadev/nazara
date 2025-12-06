import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { UserService } from '../user.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { UpdateUserDto } from '../dto/update-user.dto';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  async profile(@CurrentUser() user: any) {
    return this.userService.getProfile(user.id, user.role);
  }

  @Patch()
  update(@CurrentUser() user: any, @Body() dto: UpdateUserDto) {
    if (user.role === 'STAFF' || user.role === 'staff')
      return this.userService.updateStaff(user.id, dto);
    return this.userService.updateCustomer(user.id, dto);
  }
}
