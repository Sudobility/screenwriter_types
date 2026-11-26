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
  /**
   * Optional surrounding context for the image (not stored on the record): e.g. a storyboard frame passes the whole
   * numbered scene so the model draws one consistent moment of it. Kept generous; it is prompt context, not a caption.
   */
  context: z.string().trim().max(8000).optional(),
  /**
   * Optional `data:image/png;base64,…` of an earlier image with the same framing, used as a visual reference so this
   * one stays consistent with it (e.g. a storyboard frame that reuses a previous frame's setup). Validated as a PNG.
   */
  referenceImage: z.string().max(25_000_000).optional(),
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

/** The fixed, project-independent style id stamped on line-art storyboard frames. */
export const STORYBOARD_STYLE_ID = 'line-art';

/**
 * One scene's AI-generated storyboard, stored on the hidden Story entity's `fields.sceneStoryboards`
 * keyed by scene id. The PNG bytes live in object storage; `images` holds only the metadata records.
 */
export interface SceneStoryboard {
  /** Short title describing the scene (shown in the Storyboards list). */
  shortTitle: string;
  /** Fuller prose description of what happens in the scene. */
  detailedDescription: string;
  /** The optional writer instructions this storyboard was generated with. */
  instructions?: string;
  /** One line-art frame per shot. */
  images: ProductionImageRecord[];
}
