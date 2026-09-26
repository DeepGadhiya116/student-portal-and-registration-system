import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      required: [true, 'Course code is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    credits: {
      type: Number,
      required: [true, 'Credits are required'],
      min: [1, 'Course must have at least 1 credit'],
      max: [6, 'Course cannot exceed 6 credits'],
      default: 3,
    },
    instructor: {
      type: String,
      required: [true, 'Instructor name is required'],
      trim: true,
    },
    capacity: {
      type: Number,
      required: [true, 'Class capacity is required'],
      default: 40,
      min: [1, 'Capacity must be at least 1'],
    },
    schedule: {
      type: String,
      default: 'Mon, Wed 10:00 AM - 11:30 AM',
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    semester: {
      type: Number,
      default: 1,
      min: 1,
      max: 8,
    },
    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Course = mongoose.model('Course', courseSchema);
