import * as yup from 'yup';
import { CATEGORIES } from './constants/categories.js';
import { REACTION_TYPES } from './models/reaction.js';

export const userSchema = yup.object({
  username: yup.string().required('Username is required').min(3, 'Username must be at least 3 characters'),
});

export const googleAuthSchema = yup.object({
  idToken: yup.string().required('Google ID token is required'),
});

export const voiceUploadSchema = yup.object({
  duration: yup.number().required('Duration is required').positive('Duration must be positive'),
  tags: yup.array()
    .of(yup.string().max(30, 'Tag must be at most 30 characters'))
    .max(10, 'Maximum 10 tags allowed')
    .optional(),
  category: yup.string()
    .oneOf(CATEGORIES, 'Invalid category')
    .required('Category is required'),
  description: yup.string()
    .max(500, 'Description must be at most 500 characters')
    .optional()
});

export const reactionSchema = yup.object({
  type: yup.string()
    .oneOf(REACTION_TYPES, 'Invalid reaction type')
    .required('Reaction type is required'),
});