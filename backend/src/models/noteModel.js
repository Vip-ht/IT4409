const mongoose = require('mongoose');

const NOTE_STATUSES = ['not_done', 'done', 'cancelled'];

const NoteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 120,
      default: '',
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    status: {
      type: String,
      enum: NOTE_STATUSES,
      default: 'not_done',
      index: true,
    },
  },
  { timestamps: true }
);

NoteSchema.index({ user: 1, createdAt: -1 });
const Note = mongoose.model('Note', NoteSchema);
module.exports = Note;
module.exports.NOTE_STATUSES = NOTE_STATUSES;