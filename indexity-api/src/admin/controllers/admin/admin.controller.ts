import { Controller, UseGuards } from '@nestjs/common';
import { UserRolesGuard } from '../../../auth/guards/user-roles.guard';
import { USER_ROLE } from '../../../users/models/user-roles';
import { UserRoles } from '../../../auth/decorators/roles.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(UserRolesGuard)
@UserRoles(USER_ROLE.ADMIN)
@ApiTags('admin')
@Controller('admin')
export class AdminController {}
