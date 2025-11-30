import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Address, AddressDocument } from './schemas/address.schema';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressService {
  constructor(
    @InjectModel(Address.name) private addrModel: Model<AddressDocument>,
  ) {}

  async create(dto: CreateAddressDto, ownerId: string) {
    const address = new this.addrModel({
      ...dto,
      owner: new Types.ObjectId(ownerId),
    });
    if (dto.isDefault) {
      await this.addrModel.updateMany(
        { owner: ownerId },
        { $set: { isDefault: false } },
      );
    }
    return address.save();
  }

  async list(query: any, user: any, isAdmin: boolean, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const filter: any = {};
    if (!isAdmin) filter.owner = user.userId;
    if (query.city) filter.city = query.city;
    if (query.country) filter.country = query.country;
    const [items, total] = await Promise.all([
      this.addrModel.find(filter).skip(skip).limit(limit).exec(),
      this.addrModel.countDocuments(filter).exec(),
    ]);
    return { items, total, page, limit };
  }

  async findOne(id: string, user: any, isAdmin: boolean) {
    const addr = await this.addrModel.findById(id).exec();
    if (!addr) throw new NotFoundException('Address not found');
    if (!isAdmin && addr.owner.toString() !== user.userId) {
      throw new ForbiddenException('Not owner of address');
    }
    return addr;
  }

  async update(id: string, dto: UpdateAddressDto, user: any, isAdmin: boolean) {
    const addr = await this.addrModel.findById(id).exec();
    if (!addr) throw new NotFoundException('Address not found');
    if (!isAdmin && addr.owner.toString() !== user.userId) {
      throw new ForbiddenException('Not owner of address');
    }
    if (dto.isDefault) {
      await this.addrModel.updateMany(
        { owner: addr.owner },
        { $set: { isDefault: false } },
      );
    }
    Object.assign(addr, dto);
    return addr.save();
  }

  async remove(id: string, user: any, isAdmin: boolean) {
    const addr = await this.addrModel.findById(id).exec();
    if (!addr) throw new NotFoundException('Address not found');
    if (!isAdmin && addr.owner.toString() !== user.userId) {
      throw new ForbiddenException('Not owner');
    }
    return addr.deleteOne();
  }
}
