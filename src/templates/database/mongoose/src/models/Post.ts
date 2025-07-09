import mongoose, { Document, Schema, Types } from "mongoose";

export interface IPost extends Document {
  title: string;
  content?: string;
  published: boolean;
  author: Types.ObjectId;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>({
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
    maxlength: [100, "Title cannot exceed 100 characters"]
  },
  content: {
    type: String,
    trim: true
  },
  published: {
    type: Boolean,
    default: false
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Author is required"]
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }]
}, {
  timestamps: true,
  collection: "posts"
});

// Indexes for better query performance
postSchema.index({ author: 1 });
postSchema.index({ published: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ title: "text", content: "text" }); // Text search index

// Virtual for populated author
postSchema.virtual("authorDetails", {
  ref: "User",
  localField: "author",
  foreignField: "_id",
  justOne: true
});

// Ensure virtual fields are serialized
postSchema.set("toJSON", { virtuals: true });
postSchema.set("toObject", { virtuals: true });

const Post = mongoose.model<IPost>("Post", postSchema);

export default Post; 