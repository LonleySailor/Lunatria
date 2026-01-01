import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type userDocument = HydratedDocument<user>;
@Schema()
export class user {
  @Prop({ type: Types.ObjectId, default: () => new Types.ObjectId() })
  _id: Types.ObjectId;

  @Prop({ required: [true, 'name is required'], unique: false })
  username: string;

  @Prop({ type: String, required: [true, 'password is required'] })
  password: string;

  @Prop({ type: Date, default: () => new Date() })
  createdAt?: Date;

  @Prop({ type: String, enum: ['admin', 'user'], default: 'user' })
  userType: string;

  @Prop({ type: String })
  email: string;

  @Prop({ type: [String], default: [] })
  allowedServices: string[];
}

export const userModel = SchemaFactory.createForClass(user);

userModel.index({ username: 1 }, { unique: true });
