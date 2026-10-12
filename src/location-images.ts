import { z } from 'zod';

export const LOCATION_IMAGE_TIMES = [
  'morning',
  'noon',
  'afternoon',
  'night',
] as const;
export type LocationImageTime = (typeof LOCATION_IMAGE_TIMES)[number];
export const locationLooksRequestSchema = z.object({
  description: z.string().trim().min(3).max(2000),
});
export const locationTimesRequestSchema = locationLooksRequestSchema.extend({
  selectedLook: z.number().int().min(0).max(15),
  referenceImage: z
    .string()
    .startsWith('data:image/png;base64,')
    .max(15_000_000),
});
export type LocationLooksRequest = z.infer<typeof locationLooksRequestSchema>;
export type LocationTimesRequest = z.infer<typeof locationTimesRequestSchema>;
export interface LocationLooksResult {
  id: string;
  kind: 'looks';
  mimeType: 'image/png';
}
export interface LocationTimesResult {
  selectedLook: number;
  images: Record<LocationImageTime, string>;
}
export interface LocationVisualState {
  description: string;
  looksImageId: string | null;
  selectedLook: number | null;
  timeImageIds: Partial<Record<LocationImageTime, string>>;
}
