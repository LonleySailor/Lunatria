import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { user, userDocument } from './users.schema';
import { DATABASE_CONSTANTS } from 'src/config/constants';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(DATABASE_CONSTANTS.SCHEMAS.USER) private readonly userModel: Model<userDocument>,
  ) { }

  async deleteUser(user: user) {
    const userName = user.username;
    await this.userModel.findOneAndDelete({ userName });
  }
  async insertUser(
    username: string,
    password: string,
    email: string,
    userType: string,
    allowedServices?: string[],
  ) {
    const newUser = new this.userModel({
      username,
      password,
      email,
      userType,
      allowedServices,
    });
    await newUser.save();
    return newUser;
  }

  async getUser(username: string) {
    const user = await this.userModel.findOne({ username });
    return user;
  }
  async getUserId(username: string): Promise<string | null> {
    const user = await this.userModel.findOne({ username });
    if (!user) {
      return null;
    }

    return user._id.toString();
  }

  async checkUniqueness(key: string, value: string): Promise<boolean> {
    const user = await this.userModel.findOne({ [key]: value });
    return !!user;
  }

  async getUserById(id: string) {
    const user = await this.userModel.findById(new Types.ObjectId(id));

    return user;
  }
}
