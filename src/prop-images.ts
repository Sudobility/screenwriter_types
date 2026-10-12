import {
  characterLooksRequestSchema,
  characterSheetRequestSchema,
} from './character-images.js';
import type { z } from 'zod';
import type {
  CharacterImageResult,
  CharacterVisualState,
} from './character-images.js';

export const propLooksRequestSchema = characterLooksRequestSchema;
export const propSheetRequestSchema = characterSheetRequestSchema;
export type PropLooksRequest = z.infer<typeof propLooksRequestSchema>;
export type PropSheetRequest = z.infer<typeof propSheetRequestSchema>;
export type PropImageResult = CharacterImageResult;
export type PropVisualState = CharacterVisualState;
