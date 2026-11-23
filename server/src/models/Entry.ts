import mongoose, { Schema, type InferSchemaType } from 'mongoose';

export const SOLUTION_LANGUAGES = ['TypeScript', 'Go', 'Rust', 'C++'] as const;

const solutionSchema = new Schema(
  {
    language: {
      type: String,
      enum: SOLUTION_LANGUAGES,
      required: true,
    },
    code: { type: String, default: '' },
  },
  { _id: false }
);

const entrySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    slug: { type: String, trim: true, default: '' },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      required: true,
    },
    topics: { type: [String], default: [] },
    status: {
      type: String,
      enum: ['Solved', 'Review', 'Attempted'],
      required: true,
      default: 'Solved',
    },
    solvedAt: { type: Date, required: true, default: Date.now },
    timeSpentMinutes: { type: Number, min: 0, default: null },
    notes: { type: String, default: '' },
    solutions: { type: [solutionSchema], default: [] },
  },
  { timestamps: true }
);

entrySchema.index({ userId: 1, solvedAt: -1 });
entrySchema.index({ userId: 1, difficulty: 1 });
entrySchema.index({ userId: 1, status: 1 });
entrySchema.index({ userId: 1, topics: 1 });

export type EntryDocument = InferSchemaType<typeof entrySchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Entry = mongoose.model('Entry', entrySchema);
