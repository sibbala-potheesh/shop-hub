import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto, saltRounds: number): Promise<any> {
    const existing = await this.userModel
      .findOne({ email: createUserDto.email })
      .exec();
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const hashed = await bcrypt.hash(createUserDto.password, saltRounds);

    const user = await this.userModel.create({
      ...createUserDto,
      password: hashed,
    });

    const obj: any = user.toObject();

    delete obj.password;
    delete obj.__v;

    Object.keys(obj).forEach((key) => {
      if (key.startsWith('$')) delete obj[key];
    });

    obj.id = obj._id.toString();
    delete obj._id;

    return obj;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).lean();
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async ensureAdminUser(email: string, password: string, saltRounds: number) {
    const existing = await this.userModel.findOne({}).exec();
    if (!existing) {
      const hashed = await bcrypt.hash(password, saltRounds);
      const admin = new this.userModel({
        email,
        password: hashed,
        roles: ['admin', 'user'],
        firstName: 'Admin',
      });
      return admin.save();
    }
    return null;
  }

  async listAll(): Promise<User[]> {
    return this.userModel.find().select('-password').exec();
  }
}
