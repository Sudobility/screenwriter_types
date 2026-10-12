import { z } from 'zod';

export const productionImageKindSchema = z.enum([
  'storyboard',
  'wardrobe',
  'makeupHair',
  'vehicle',
  'setDressing',
]);
export type ProductionImageKind = z.infer<typeof productionImageKindSchema>;
export const productionImageRequestSchema = z.object({
  description: z.string().trim().min(3).max(2000),
});
export type ProductionImageRequest = z.infer<
  typeof productionImageRequestSchema
>;
export interface ProductionImageResult {
  id: string;
  kind: ProductionImageKind;
  styleId: string;
  mimeType: 'image/png';
}
export interface ProductionImageRecord {
  id: string;
  description: string;
  styleId: string;
  characterId?: string;
}
export interface GeneratedImageCount {
  count: number;
}
