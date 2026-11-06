import { Schema, model, Document, Types } from 'mongoose';

export interface IDataExportDocument extends Document {
  userId: Types.ObjectId;
  status: 'ready' | 'pending';
  payload: Record<string, unknown>;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DataExportSchema = new Schema<IDataExportDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['ready', 'pending'],
      default: 'ready',
    },
    payload: {
      type: Schema.Types.Mixed,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index
    },
  },
  {
    timestamps: true,
  },
);

export const DataExportModel = model<IDataExportDocument>('DataExport', DataExportSchema);

