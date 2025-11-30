import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Query,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('addresses')
@Controller('addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create address (authenticated)' })
  async create(@Body() dto: CreateAddressDto, @Request() req: any) {
    return this.addressService.create(dto, req.user.userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List addresses (admins see all)' })
  @ApiQuery({ name: 'city', required: false })
  @ApiQuery({ name: 'country', required: false })
  async list(
    @Request() req: any,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('city') city?: string,
    @Query('country') country?: string,
  ) {
    const isAdmin = req.user?.roles?.includes('admin');
    return this.addressService.list(
      { city, country },
      req.user,
      isAdmin,
      Number(page),
      Number(limit),
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async get(@Param('id') id: string, @Request() req: any) {
    const isAdmin = req.user?.roles?.includes('admin');
    return this.addressService.findOne(id, req.user, isAdmin);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
    @Request() req: any,
  ) {
    const isAdmin = req.user?.roles?.includes('admin');
    return this.addressService.update(id, dto, req.user, isAdmin);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async remove(@Param('id') id: string, @Request() req: any) {
    const isAdmin = req.user?.roles?.includes('admin');
    return this.addressService.remove(id, req.user, isAdmin);
  }
}
