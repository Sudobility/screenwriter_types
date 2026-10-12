import { z } from 'zod';

export const characterLooksRequestSchema = z.object({
  description: z.string().trim().min(3).max(2000),
});
export const characterSheetRequestSchema = characterLooksRequestSchema.extend({
  selectedLook: z.number().int().min(0).max(15),
  referenceImage: z
    .string()
    .startsWith('data:image/png;base64,')
    .max(15_000_000),
});
export type CharacterLooksRequest = z.infer<typeof characterLooksRequestSchema>;
export type CharacterSheetRequest = z.infer<typeof characterSheetRequestSchema>;
export interface CharacterImageResult {
  id: string;
  kind: 'looks' | 'sheet';
  mimeType: 'image/png';
  selectedLook: number | null;
}
export interface CharacterVisualState {
  description: string;
  looksImageId: string | null;
  selectedLook: number | null;
  sheetImageId: string | null;
}
