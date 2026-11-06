import { Schema, model, Document, Types } from 'mongoose';
import { UserDevice, DevicePlatform } from '@solace/shared';

export interface IDeviceDocument extends Document {
  userId: Types.ObjectId;
  token: string;
  platform: DevicePlatform;
  deviceId?: string;
  deviceName?: string;
  appVersion?: string;
  isActive: boolean;
  lastRegisteredAt: Date;
  createdAt: Date;
  updatedAt: Date;
  toDto(): UserDevice;
}

const DeviceSchema = new Schema<IDeviceDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    token: {
      type: String,
      required: [true, 'Push token is required'],
      trim: true,
      index: true,
    },
    platform: {
      type: String,
      enum: ['ios', 'android', 'web'],
      required: true,
    },
    deviceId: {
      type: String,
      trim: true,
    },
    deviceName: {
      type: String,
      trim: true,
    },
    appVersion: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastRegisteredAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

DeviceSchema.index({ userId: 1, token: 1 }, { unique: true });

DeviceSchema.methods.toDto = function (): UserDevice {
  const obj = this.toObject();
  return {
    id: obj._id.toString(),
    userId: obj.userId.toString(),
    token: obj.token,
    platform: obj.platform,
    deviceId: obj.deviceId,
    deviceName: obj.deviceName,
    appVersion: obj.appVersion,
    isActive: obj.isActive,
    lastRegisteredAt: obj.lastRegisteredAt.toISOString(),
    createdAt: obj.createdAt.toISOString(),
  };
};

export const DeviceModel = model<IDeviceDocument>('Device', DeviceSchema);
