import { z } from 'zod';

/**
 * Synchronous AI actions: `POST /ai/{action}` in screenwriter_api, which authenticates the caller and turns around
 * to one ShapeShyft endpoint of the same name. Unlike the document jobs in `./index.ts` (coverage, polish) these take
 * their whole input in the request body, read no document, and answer in the same HTTP response.
 *
 * The output schemas follow the same convention as `AI_ENDPOINT_OUTPUT_SCHEMAS`: written for structured output, so
 * every field is required (nullable, never optional) and objects are closed — `z.toJSONSchema` gives the exact schema
 * to store on the ShapeShyft endpoint (`bun run ai:schemas` in screenwriter_api prints them). What the API returns to
 * the client is the normalised `*Result` shape (nulls dropped), not the raw model shape.
 */

export const AI_ACTIONS = [
  'generate-character-skeleton',
  'generate-script',
  'polish-character-dialogue',
  'polish-scene',
  'smart-paste-characters',
  'smart-paste-plots',
  'smart-paste-script',
  'suggest-note-fix',
  'logline-synopsis',
  'tension-curve',
  'script-breakdown',
  'revision-diff',
  'assistant',
  'tone-pass',
  'line-alternates',
  'voice-profile',
  'character-interview',
  'agent-act',
] as const;
export type AiAction = (typeof AI_ACTIONS)[number];
export const aiActionSchema = z.enum(AI_ACTIONS);

/** Counted limits for the action requests, declared once: request schemas, output schemas and prompts read these. */
export const AI_ACTION_LIMITS = {
  /** Free-form text a writer pastes in: a character description, or the story to turn into a script. */
  descriptionMax: 8_000,
  storyMax: 30_000,
  skeletonFieldMax: 1_000,
  characterNameMax: 80,
  languageMax: 35,
  /** Dialogue polish: one character's lines. */
  dialoguesMax: 100,
  dialogueTextMax: 2_000,
  /** Scene polish. */
  sceneElementsMax: 300,
  sceneElementTextMax: 2_000,
  sceneCharactersMax: 20,
  /** Script generation output. */
  scenesMax: 40,
  elementsPerSceneMax: 200,
  elementTextMax: 2_000,
  titleMax: 120,
  locationMax: 120,
  timeMax: 40,
  idMax: 64,
  /**
   * Smart Paste: text taken from the clipboard. Counted in words (what the writer sees and what is priced) and in
   * characters (a hard ceiling for the request body). The script limit is lower because its output is as long as
   * its input.
   */
  pasteWordsMax: 20_000,
  pasteCharsMax: 160_000,
  pasteScriptWordsMax: 8_000,
  pasteScriptCharsMax: 64_000,
  pasteCharactersMax: 40,
  pasteStagesMax: 8,
  pasteAliasesMax: 10,
  pasteKnownNamesMax: 200,
  pasteSubplotsMax: 20,
  plotNameMax: 120,
  plotTextMax: 4_000,
  pasteScenesMax: 120,
  headingTextMax: 200,
  /** Fixes for a review note. */
  noteTitleMax: 200,
  noteBodyMax: 2_000,
  fixSuggestionsMax: 3,
  fixEditsMax: 12,
  fixSummaryMax: 300,
  /** Logline / synopsis / treatment: the serialized script in, and the marketing-copy outputs. */
  synopsisScriptMax: 120_000,
  loglineOutMax: 320,
  genreOutMax: 3,
  synopsisOutMax: 3_000,
  treatmentOutMax: 12_000,
  /** Tension curve: per-scene dramatic-intensity scoring. */
  tensionScenesMax: 160,
  tensionSceneTextMax: 1_200,
  tensionNoteMax: 160,
  /** Script breakdown: production elements per scene. */
  breakdownScenesMax: 160,
  breakdownSceneTextMax: 2_000,
  breakdownItemsMax: 40,
  breakdownItemMax: 120,
  /** Revision diff: two serialized script versions in, a story-level change summary out. */
  revisionScriptMax: 120_000,
  revisionSummaryMax: 2_000,
  revisionChangesMax: 40,
  revisionArcsMax: 20,
  revisionTitleMax: 120,
  revisionDetailMax: 600,
  /** Document Q&A assistant: a question over the script, with conversation history. */
  assistantQuestionMax: 1_000,
  assistantScenesMax: 160,
  assistantSceneTextMax: 1_500,
  assistantHistoryMax: 12,
  assistantHistoryTextMax: 2_000,
  assistantAnswerMax: 4_000,
  assistantRefsMax: 12,
  assistantWhyMax: 200,
  /** Tonal pass: shift a scene's tone. */
  toneMax: 40,
  /** Line alternates: how many rewrites of one line to offer. */
  alternatesCountMax: 6,
  /** Voice profile: how many of a character's lines to send, and the length of each profile field. */
  voiceLinesMax: 120,
  voiceNameMax: 120,
  voiceFieldMax: 800,
  /** Character interview: a chat role-played as a character, grounded in their lines and (optionally) their voice profile. */
  interviewProfileMax: 2_000,
  interviewAnswerMax: 2_000,
  /** Agent "act": the AI proposes typed operations the writer confirms one by one. */
  agentMessageMax: 1_000,
  agentOpsMax: 20,
  agentCommentBodyMax: 600,
  agentCategoryMax: 40,
} as const;

/** What a story-level change between two versions did. */
export const REVISION_CHANGE_KINDS = [
  'added',
  'cut',
  'rewritten',
  'moved',
  'other',
] as const;
export type RevisionChangeKind = (typeof REVISION_CHANGE_KINDS)[number];

/** AD breakdown categories (the "strips" of a breakdown sheet). */
export const BREAKDOWN_CATEGORIES = [
  'cast',
  'extras',
  'stunts',
  'props',
  'wardrobe',
  'makeupHair',
  'setDressing',
  'vehicles',
  'animals',
  'sfx',
  'vfx',
  'sound',
  'special',
] as const;
export type BreakdownCategory = (typeof BREAKDOWN_CATEGORIES)[number];

// ---- Character skeleton (the shape `screenwriter_app`'s CharacterSkeletonEditor edits) ----

/** Physical, Social, Psychological — the bone structure. Only `age` is required; every other field is optional. */
export const CHARACTER_SKELETON_FIELDS = {
  physical: [
    'age',
    'race',
    'height',
    'weight',
    'appearance',
    'sexOrientationExperience',
    'posture',
    'unusualCharacteristics',
    'health',
  ],
  social: [
    'occupationAndAttitude',
    'education',
    'money',
    'class',
    'relationships',
    'homeLife',
    'religion',
    'placeInCommunity',
    'politics',
    'interests',
  ],
  psychological: [
    'attitudeTowardLife',
    'moralStandard',
    'intelligence',
    'ambitions',
    'frustrations',
    'fearsAndObsessions',
    'extrovertOrIntrovert',
    'specialQualities',
    'proudestAchievement',
    'greatestSorrow',
    'greatestShame',
    'noticedFirst',
    'secret',
    'noticedLast',
    'coreContradictions',
    'deepestDesire',
  ],
} as const;

export const CHARACTER_SKELETON_KEYS = [
  ...CHARACTER_SKELETON_FIELDS.physical,
  ...CHARACTER_SKELETON_FIELDS.social,
  ...CHARACTER_SKELETON_FIELDS.psychological,
] as const;
export type CharacterSkeletonKey = (typeof CHARACTER_SKELETON_KEYS)[number];

const skeletonText = z.string().max(AI_ACTION_LIMITS.skeletonFieldMax);

/** A skeleton as it is stored and sent between client and API: `age` plus whichever other fields have a value. */
export const characterSkeletonSchema = z.object({
  age: skeletonText.min(1),
  ...Object.fromEntries(
    CHARACTER_SKELETON_KEYS.filter((k) => k !== 'age').map((k) => [
      k,
      skeletonText.optional(),
    ])
  ),
} as { age: z.ZodString } & Record<
  Exclude<CharacterSkeletonKey, 'age'>,
  z.ZodOptional<z.ZodString>
>);
export type CharacterSkeleton = z.infer<typeof characterSkeletonSchema>;

/** The model-facing shape: every field required, `null` = the text does not say. */
const characterSkeletonModelSchema = z.strictObject({
  age: skeletonText.min(1),
  ...Object.fromEntries(
    CHARACTER_SKELETON_KEYS.filter((k) => k !== 'age').map((k) => [
      k,
      skeletonText.nullable(),
    ])
  ),
} as { age: z.ZodString } & Record<
  Exclude<CharacterSkeletonKey, 'age'>,
  z.ZodNullable<z.ZodString>
>);

// ---- Script elements (the editor's element styles, minus the scene heading which is structured) ----

export const SCRIPT_ELEMENT_TYPES = [
  'action',
  'character',
  'parenthetical',
  'dialogue',
  'transition',
] as const;
export type ScriptElementType = (typeof SCRIPT_ELEMENT_TYPES)[number];

export const scriptElementSchema = z.strictObject({
  type: z.enum(SCRIPT_ELEMENT_TYPES),
  text: z.string().min(1).max(AI_ACTION_LIMITS.elementTextMax),
});
export type ScriptElement = z.infer<typeof scriptElementSchema>;

export const SCENE_SETTINGS = ['int', 'ext', 'intExt'] as const;
export const sceneHeadingSchema = z.strictObject({
  setting: z.enum(SCENE_SETTINGS),
  location: z.string().min(1).max(AI_ACTION_LIMITS.locationMax),
  /** "DAY", "NIGHT", "LATER" … as it would follow the dash in a heading. */
  time: z.string().min(1).max(AI_ACTION_LIMITS.timeMax),
});
export type SceneHeading = z.infer<typeof sceneHeadingSchema>;

export const generatedSceneSchema = z.strictObject({
  heading: sceneHeadingSchema,
  elements: z
    .array(scriptElementSchema)
    .min(1)
    .max(AI_ACTION_LIMITS.elementsPerSceneMax),
});
export type GeneratedScene = z.infer<typeof generatedSceneSchema>;

// ---- 1. generate-character-skeleton ----

export const generateCharacterSkeletonRequestSchema = z.strictObject({
  /** A free-form paragraph describing the character. */
  text: z.string().trim().min(1).max(AI_ACTION_LIMITS.descriptionMax),
  /** BCP 47 tag the skeleton values are written in. Default: the language of `text`. */
  language: z.string().max(AI_ACTION_LIMITS.languageMax).optional(),
});
export type GenerateCharacterSkeletonRequest = z.infer<
  typeof generateCharacterSkeletonRequestSchema
>;

export const generateCharacterSkeletonModelSchema = z.strictObject({
  skeleton: characterSkeletonModelSchema,
});
export const generateCharacterSkeletonResultSchema = z.strictObject({
  skeleton: characterSkeletonSchema,
});
export type GenerateCharacterSkeletonResult = z.infer<
  typeof generateCharacterSkeletonResultSchema
>;

// ---- 2. generate-script ----

export const generateScriptRequestSchema = z.strictObject({
  /** The story in common language: a premise, a synopsis or a full retelling. */
  story: z.string().trim().min(1).max(AI_ACTION_LIMITS.storyMax),
  title: z.string().trim().max(AI_ACTION_LIMITS.titleMax).optional(),
  /** BCP 47 tag the script is written in. Default: the language of `story`. */
  language: z.string().max(AI_ACTION_LIMITS.languageMax).optional(),
});
export type GenerateScriptRequest = z.infer<typeof generateScriptRequestSchema>;

export const generateScriptModelSchema = z.strictObject({
  title: z.string().max(AI_ACTION_LIMITS.titleMax).nullable(),
  scenes: z.array(generatedSceneSchema).min(1).max(AI_ACTION_LIMITS.scenesMax),
});
export const generateScriptResultSchema = generateScriptModelSchema;
export type GenerateScriptResult = z.infer<typeof generateScriptResultSchema>;

// ---- 3. polish-character-dialogue ----

export const dialogueLineSchema = z.strictObject({
  /** The caller's own id for the line, echoed back so the result maps onto it. */
  id: z.string().min(1).max(AI_ACTION_LIMITS.idMax),
  text: z.string().min(1).max(AI_ACTION_LIMITS.dialogueTextMax),
});
export type DialogueLine = z.infer<typeof dialogueLineSchema>;

export const polishCharacterDialogueRequestSchema = z.strictObject({
  character: z.string().trim().min(1).max(AI_ACTION_LIMITS.characterNameMax),
  skeleton: characterSkeletonSchema,
  /** One character's lines, in script order. */
  dialogues: z
    .array(dialogueLineSchema)
    .min(1)
    .max(AI_ACTION_LIMITS.dialoguesMax),
  /** How much to change; default `medium`. */
  intensity: z.enum(['light', 'medium', 'bold']).optional(),
  language: z.string().max(AI_ACTION_LIMITS.languageMax).optional(),
});
export type PolishCharacterDialogueRequest = z.infer<
  typeof polishCharacterDialogueRequestSchema
>;

export const polishCharacterDialogueModelSchema = z.strictObject({
  /** The same ids in the same order, each with the polished line. */
  dialogues: z
    .array(dialogueLineSchema)
    .min(1)
    .max(AI_ACTION_LIMITS.dialoguesMax),
});
export const polishCharacterDialogueResultSchema =
  polishCharacterDialogueModelSchema;
export type PolishCharacterDialogueResult = z.infer<
  typeof polishCharacterDialogueResultSchema
>;

// ---- 4. polish-scene ----

export const sceneCharacterSchema = z.strictObject({
  /** The name as it appears in the script's character cues. */
  name: z.string().trim().min(1).max(AI_ACTION_LIMITS.characterNameMax),
  skeleton: characterSkeletonSchema,
});
export type SceneCharacter = z.infer<typeof sceneCharacterSchema>;

export const polishSceneRequestSchema = z.strictObject({
  scene: z.strictObject({
    /** The scene heading as text, e.g. "INT. LAB - DAY". Context only: it is not rewritten. */
    heading: z
      .string()
      .max(AI_ACTION_LIMITS.locationMax + AI_ACTION_LIMITS.timeMax + 16)
      .optional(),
    elements: z
      .array(scriptElementSchema)
      .min(1)
      .max(AI_ACTION_LIMITS.sceneElementsMax),
  }),
  /** A skeleton for every character involved in the scene. */
  characters: z
    .array(sceneCharacterSchema)
    .min(1)
    .max(AI_ACTION_LIMITS.sceneCharactersMax),
  intensity: z.enum(['light', 'medium', 'bold']).optional(),
  language: z.string().max(AI_ACTION_LIMITS.languageMax).optional(),
});
export type PolishSceneRequest = z.infer<typeof polishSceneRequestSchema>;

/** The scene may be freely rewritten, so the result is a fresh element list rather than a per-id mapping. */
export const polishSceneModelSchema = z.strictObject({
  elements: z
    .array(scriptElementSchema)
    .min(1)
    .max(AI_ACTION_LIMITS.sceneElementsMax),
});
export const polishSceneResultSchema = polishSceneModelSchema;
export type PolishSceneResult = z.infer<typeof polishSceneResultSchema>;

// ---- Smart Paste: text from the clipboard -> characters, plots, or a formatted script ----

/** Words as the limits and the prices count them: runs of non-whitespace. */
export const countWords = (text: string): number => {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
};

const pastedText = (wordsMax: number, charsMax: number) =>
  z
    .string()
    .trim()
    .min(1)
    .max(charsMax)
    .refine((t) => countWords(t) <= wordsMax, {
      message: `Too long: at most ${wordsMax} words`,
    });

// ---- 5. smart-paste-characters ----

export const smartPasteCharactersRequestSchema = z.strictObject({
  /** The pasted text: character notes, a bible, a treatment, or a script the characters appear in. */
  text: pastedText(
    AI_ACTION_LIMITS.pasteWordsMax,
    AI_ACTION_LIMITS.pasteCharsMax
  ),
  /** Names of the characters the document already has, so the same person comes back under the same name. */
  knownNames: z
    .array(z.string().trim().min(1).max(AI_ACTION_LIMITS.characterNameMax))
    .max(AI_ACTION_LIMITS.pasteKnownNamesMax)
    .optional(),
  language: z.string().max(AI_ACTION_LIMITS.languageMax).optional(),
});
export type SmartPasteCharactersRequest = z.infer<
  typeof smartPasteCharactersRequestSchema
>;

const pastedCharacterName = z
  .string()
  .min(1)
  .max(AI_ACTION_LIMITS.characterNameMax);

export const smartPasteCharactersModelSchema = z.strictObject({
  characters: z
    .array(
      z.strictObject({
        name: pastedCharacterName,
        /** Other names the text uses for the same person (nicknames, a title, a maiden name). */
        aliases: z
          .array(pastedCharacterName)
          .max(AI_ACTION_LIMITS.pasteAliasesMax),
        /** One skeleton per age the text describes the character at; usually exactly one. Youngest first. */
        stages: z
          .array(characterSkeletonModelSchema)
          .min(1)
          .max(AI_ACTION_LIMITS.pasteStagesMax),
      })
    )
    .max(AI_ACTION_LIMITS.pasteCharactersMax),
});

export const pastedCharacterSchema = z.strictObject({
  name: pastedCharacterName,
  aliases: z.array(pastedCharacterName).max(AI_ACTION_LIMITS.pasteAliasesMax),
  stages: z
    .array(characterSkeletonSchema)
    .min(1)
    .max(AI_ACTION_LIMITS.pasteStagesMax),
});
export type PastedCharacter = z.infer<typeof pastedCharacterSchema>;
export const smartPasteCharactersResultSchema = z.strictObject({
  /** Empty when the text describes nobody. */
  characters: z
    .array(pastedCharacterSchema)
    .max(AI_ACTION_LIMITS.pasteCharactersMax),
});
export type SmartPasteCharactersResult = z.infer<
  typeof smartPasteCharactersResultSchema
>;

// ---- 6. smart-paste-plots ----

export const smartPastePlotsRequestSchema = z.strictObject({
  text: pastedText(
    AI_ACTION_LIMITS.pasteWordsMax,
    AI_ACTION_LIMITS.pasteCharsMax
  ),
  language: z.string().max(AI_ACTION_LIMITS.languageMax).optional(),
});
export type SmartPastePlotsRequest = z.infer<
  typeof smartPastePlotsRequestSchema
>;

export const pastedSubplotSchema = z.strictObject({
  name: z.string().min(1).max(AI_ACTION_LIMITS.plotNameMax),
  text: z.string().min(1).max(AI_ACTION_LIMITS.plotTextMax),
});
export type PastedSubplot = z.infer<typeof pastedSubplotSchema>;

export const smartPastePlotsModelSchema = z.strictObject({
  /** The main plot; null when the text has none. */
  mainPlot: z.string().max(AI_ACTION_LIMITS.plotTextMax).nullable(),
  subplots: z.array(pastedSubplotSchema).max(AI_ACTION_LIMITS.pasteSubplotsMax),
});
export const smartPastePlotsResultSchema = z.strictObject({
  mainPlot: z.string().min(1).max(AI_ACTION_LIMITS.plotTextMax).optional(),
  subplots: z.array(pastedSubplotSchema).max(AI_ACTION_LIMITS.pasteSubplotsMax),
});
export type SmartPastePlotsResult = z.infer<typeof smartPastePlotsResultSchema>;

// ---- 7. smart-paste-script ----

/** Formats the pasted text as a script, keeping the writer's words. The text stays in its own language. */
export const smartPasteScriptRequestSchema = z.strictObject({
  text: pastedText(
    AI_ACTION_LIMITS.pasteScriptWordsMax,
    AI_ACTION_LIMITS.pasteScriptCharsMax
  ),
});
export type SmartPasteScriptRequest = z.infer<
  typeof smartPasteScriptRequestSchema
>;

export const pastedSceneSchema = z.strictObject({
  /**
   * The scene heading as the writer wrote it ("INT. LAB - DAY"). Null only for text that comes before the first
   * heading (a paste that starts in the middle of a scene).
   */
  heading: z.string().min(1).max(AI_ACTION_LIMITS.headingTextMax).nullable(),
  elements: z
    .array(scriptElementSchema)
    .max(AI_ACTION_LIMITS.elementsPerSceneMax),
});
export type PastedScene = z.infer<typeof pastedSceneSchema>;

export const smartPasteScriptModelSchema = z.strictObject({
  scenes: z
    .array(pastedSceneSchema)
    .min(1)
    .max(AI_ACTION_LIMITS.pasteScenesMax),
});
export const smartPasteScriptResultSchema = smartPasteScriptModelSchema;
export type SmartPasteScriptResult = z.infer<
  typeof smartPasteScriptResultSchema
>;

// ---- 8. suggest-note-fix ----

/** One element of the scene a note is about, with the caller's id so an edit can name it. */
export const fixSceneElementSchema = z.strictObject({
  id: z.string().min(1).max(AI_ACTION_LIMITS.idMax),
  type: z.enum(SCRIPT_ELEMENT_TYPES),
  text: z.string().min(1).max(AI_ACTION_LIMITS.sceneElementTextMax),
});
export type FixSceneElement = z.infer<typeof fixSceneElementSchema>;

export const suggestNoteFixRequestSchema = z.strictObject({
  /** The comment to act on, as the review/writer gave it. */
  note: z.strictObject({
    title: z.string().trim().min(1).max(AI_ACTION_LIMITS.noteTitleMax),
    body: z.string().trim().min(1).max(AI_ACTION_LIMITS.noteBodyMax),
    category: z.string().max(40).optional(),
    /** The comment's concrete suggested action, when it has one; the AI should honor it. */
    suggestion: z.string().trim().max(AI_ACTION_LIMITS.noteBodyMax).optional(),
  }),
  scene: z.strictObject({
    heading: z.string().max(AI_ACTION_LIMITS.headingTextMax).optional(),
    elements: z
      .array(fixSceneElementSchema)
      .min(1)
      .max(AI_ACTION_LIMITS.sceneElementsMax),
  }),
  /** Ids of the elements the note points at, when it points at particular ones. */
  focusIds: z
    .array(z.string().min(1).max(AI_ACTION_LIMITS.idMax))
    .max(AI_ACTION_LIMITS.sceneElementsMax)
    .optional(),
  language: z.string().max(AI_ACTION_LIMITS.languageMax).optional(),
});
export type SuggestNoteFixRequest = z.infer<typeof suggestNoteFixRequestSchema>;

export const noteFixEditSchema = z.strictObject({
  /** The id of an element that was sent. */
  id: z.string().min(1).max(AI_ACTION_LIMITS.idMax),
  /** The element's new text; null removes the element. */
  text: z.string().max(AI_ACTION_LIMITS.sceneElementTextMax).nullable(),
});
export type NoteFixEdit = z.infer<typeof noteFixEditSchema>;

export const noteFixSuggestionSchema = z.strictObject({
  /** What this fix does, in one or two sentences, for the writer choosing between fixes. */
  summary: z.string().min(1).max(AI_ACTION_LIMITS.fixSummaryMax),
  edits: z.array(noteFixEditSchema).min(1).max(AI_ACTION_LIMITS.fixEditsMax),
});
export type NoteFixSuggestion = z.infer<typeof noteFixSuggestionSchema>;

export const suggestNoteFixModelSchema = z.strictObject({
  /** Different ways to fix the note, best first. Empty when the note cannot be fixed by editing this scene's text. */
  suggestions: z
    .array(noteFixSuggestionSchema)
    .max(AI_ACTION_LIMITS.fixSuggestionsMax),
});
export const suggestNoteFixResultSchema = suggestNoteFixModelSchema;
export type SuggestNoteFixResult = z.infer<typeof suggestNoteFixResultSchema>;

// ---- 9. logline-synopsis (pitch material from the whole script) ----

export const loglineSynopsisRequestSchema = z.strictObject({
  /** The whole script, serialized to text by the caller (scene headings + lines). */
  script: z.string().trim().min(1).max(AI_ACTION_LIMITS.synopsisScriptMax),
  language: z.string().max(AI_ACTION_LIMITS.languageMax).optional(),
});
export type LoglineSynopsisRequest = z.infer<
  typeof loglineSynopsisRequestSchema
>;

export const loglineSynopsisModelSchema = z.strictObject({
  /** One or two sentences: the hook. */
  logline: z.string().max(AI_ACTION_LIMITS.loglineOutMax),
  genre: z.array(z.string().max(40)).max(AI_ACTION_LIMITS.genreOutMax),
  /** A tight paragraph or two (back-of-the-box). */
  synopsis: z.string().max(AI_ACTION_LIMITS.synopsisOutMax),
  /** A one-to-two-page present-tense treatment of the whole story, beginning to end (reveals the ending). */
  treatment: z.string().max(AI_ACTION_LIMITS.treatmentOutMax),
});
export const loglineSynopsisResultSchema = loglineSynopsisModelSchema;
export type LoglineSynopsisResult = z.infer<typeof loglineSynopsisResultSchema>;

// ---- 10. tension-curve (per-scene dramatic intensity, for the tension graph) ----

export const tensionCurveRequestSchema = z.strictObject({
  scenes: z
    .array(
      z.strictObject({
        id: z.string().min(1).max(AI_ACTION_LIMITS.idMax),
        heading: z.string().max(AI_ACTION_LIMITS.headingTextMax),
        text: z.string().max(AI_ACTION_LIMITS.tensionSceneTextMax),
      })
    )
    .min(1)
    .max(AI_ACTION_LIMITS.tensionScenesMax),
  language: z.string().max(AI_ACTION_LIMITS.languageMax).optional(),
});
export type TensionCurveRequest = z.infer<typeof tensionCurveRequestSchema>;

export const tensionCurveModelSchema = z.strictObject({
  scenes: z
    .array(
      z.strictObject({
        sceneId: z.string(),
        /** 1 = calm, 5 = peak dramatic intensity. */
        intensity: z.number().int().min(1).max(5),
        note: z.string().max(AI_ACTION_LIMITS.tensionNoteMax),
      })
    )
    .max(AI_ACTION_LIMITS.tensionScenesMax),
});
export const tensionCurveResultSchema = tensionCurveModelSchema;
export type TensionCurveResult = z.infer<typeof tensionCurveResultSchema>;

// ---- 11. script-breakdown (AD production breakdown per scene) ----

export const scriptBreakdownRequestSchema = z.strictObject({
  scenes: z
    .array(
      z.strictObject({
        id: z.string().min(1).max(AI_ACTION_LIMITS.idMax),
        heading: z.string().max(AI_ACTION_LIMITS.headingTextMax),
        text: z.string().max(AI_ACTION_LIMITS.breakdownSceneTextMax),
      })
    )
    .min(1)
    .max(AI_ACTION_LIMITS.breakdownScenesMax),
  language: z.string().max(AI_ACTION_LIMITS.languageMax).optional(),
});
export type ScriptBreakdownRequest = z.infer<
  typeof scriptBreakdownRequestSchema
>;

export const scriptBreakdownModelSchema = z.strictObject({
  scenes: z
    .array(
      z.strictObject({
        sceneId: z.string(),
        elements: z
          .array(
            z.strictObject({
              category: z.enum(BREAKDOWN_CATEGORIES),
              items: z
                .array(z.string().max(AI_ACTION_LIMITS.breakdownItemMax))
                .max(AI_ACTION_LIMITS.breakdownItemsMax),
            })
          )
          .max(BREAKDOWN_CATEGORIES.length),
      })
    )
    .max(AI_ACTION_LIMITS.breakdownScenesMax),
});
export const scriptBreakdownResultSchema = scriptBreakdownModelSchema;
export type ScriptBreakdownResult = z.infer<typeof scriptBreakdownResultSchema>;

// ---- 12. revision-diff (story-level change between two script versions) ----

export const revisionDiffRequestSchema = z.strictObject({
  /** The serialized earlier version (e.g. a snapshot). */
  before: z.string().trim().min(1).max(AI_ACTION_LIMITS.revisionScriptMax),
  /** The serialized later version (e.g. the current script). */
  after: z.string().trim().min(1).max(AI_ACTION_LIMITS.revisionScriptMax),
  beforeLabel: z.string().max(120).optional(),
  afterLabel: z.string().max(120).optional(),
  language: z.string().max(AI_ACTION_LIMITS.languageMax).optional(),
});
export type RevisionDiffRequest = z.infer<typeof revisionDiffRequestSchema>;

export const revisionDiffModelSchema = z.strictObject({
  /** One paragraph: how the story changed overall. */
  summary: z.string().max(AI_ACTION_LIMITS.revisionSummaryMax),
  changes: z
    .array(
      z.strictObject({
        kind: z.enum(REVISION_CHANGE_KINDS),
        title: z.string().max(AI_ACTION_LIMITS.revisionTitleMax),
        detail: z.string().max(AI_ACTION_LIMITS.revisionDetailMax),
      })
    )
    .max(AI_ACTION_LIMITS.revisionChangesMax),
  /** How a character's or thread's arc drifted between the versions. */
  arcs: z
    .array(
      z.strictObject({
        subject: z.string().max(AI_ACTION_LIMITS.revisionTitleMax),
        change: z.string().max(AI_ACTION_LIMITS.revisionDetailMax),
      })
    )
    .max(AI_ACTION_LIMITS.revisionArcsMax),
});
export const revisionDiffResultSchema = revisionDiffModelSchema;
export type RevisionDiffResult = z.infer<typeof revisionDiffResultSchema>;

// ---- 13. assistant (read-only document Q&A, grounded in the script) ----

export const ASSISTANT_ROLES = ['user', 'assistant'] as const;
export type AssistantRole = (typeof ASSISTANT_ROLES)[number];

export const assistantRequestSchema = z.strictObject({
  question: z.string().trim().min(1).max(AI_ACTION_LIMITS.assistantQuestionMax),
  scenes: z
    .array(
      z.strictObject({
        id: z.string().min(1).max(AI_ACTION_LIMITS.idMax),
        heading: z.string().max(AI_ACTION_LIMITS.headingTextMax),
        text: z.string().max(AI_ACTION_LIMITS.assistantSceneTextMax),
      })
    )
    .min(1)
    .max(AI_ACTION_LIMITS.assistantScenesMax),
  /** Earlier turns, oldest first, for follow-up questions. */
  history: z
    .array(
      z.strictObject({
        role: z.enum(ASSISTANT_ROLES),
        text: z.string().max(AI_ACTION_LIMITS.assistantHistoryTextMax),
      })
    )
    .max(AI_ACTION_LIMITS.assistantHistoryMax)
    .optional(),
  language: z.string().max(AI_ACTION_LIMITS.languageMax).optional(),
});
export type AssistantRequest = z.infer<typeof assistantRequestSchema>;

export const assistantModelSchema = z.strictObject({
  answer: z.string().max(AI_ACTION_LIMITS.assistantAnswerMax),
  /** Scenes the answer draws on, so the UI can offer jump links. */
  references: z
    .array(
      z.strictObject({
        sceneId: z.string(),
        why: z.string().max(AI_ACTION_LIMITS.assistantWhyMax),
      })
    )
    .max(AI_ACTION_LIMITS.assistantRefsMax),
});
export const assistantResultSchema = assistantModelSchema;
export type AssistantResult = z.infer<typeof assistantResultSchema>;

// ---- 14. tone-pass (rewrite a scene to shift its tone; reuses the note-fix scene/edit shapes) ----

export const tonePassRequestSchema = z.strictObject({
  scene: z.strictObject({
    heading: z.string().max(AI_ACTION_LIMITS.headingTextMax).optional(),
    elements: z
      .array(fixSceneElementSchema)
      .min(1)
      .max(AI_ACTION_LIMITS.sceneElementsMax),
  }),
  /** The target tone, e.g. "darker", "funnier", "more tense". */
  tone: z.string().trim().min(1).max(AI_ACTION_LIMITS.toneMax),
  language: z.string().max(AI_ACTION_LIMITS.languageMax).optional(),
});
export type TonePassRequest = z.infer<typeof tonePassRequestSchema>;

export const tonePassModelSchema = z.strictObject({
  summary: z.string().min(1).max(AI_ACTION_LIMITS.fixSummaryMax),
  edits: z.array(noteFixEditSchema).max(AI_ACTION_LIMITS.sceneElementsMax),
});
export const tonePassResultSchema = tonePassModelSchema;
export type TonePassResult = z.infer<typeof tonePassResultSchema>;

// ---- 15. line-alternates (several rewrites of one line; the writer picks one, the app replaces the line) ----

export const lineAlternatesRequestSchema = z.strictObject({
  scene: z.strictObject({
    heading: z.string().max(AI_ACTION_LIMITS.headingTextMax).optional(),
    elements: z
      .array(fixSceneElementSchema)
      .min(1)
      .max(AI_ACTION_LIMITS.sceneElementsMax),
  }),
  /** The element to offer alternates for; must be one of `scene.elements`. */
  targetId: z.string().min(1).max(64),
  count: z
    .number()
    .int()
    .min(1)
    .max(AI_ACTION_LIMITS.alternatesCountMax)
    .optional(),
  language: z.string().max(AI_ACTION_LIMITS.languageMax).optional(),
});
export type LineAlternatesRequest = z.infer<typeof lineAlternatesRequestSchema>;

export const lineAlternatesModelSchema = z.strictObject({
  alternates: z
    .array(z.string().min(1).max(AI_ACTION_LIMITS.sceneElementTextMax))
    .min(1)
    .max(AI_ACTION_LIMITS.alternatesCountMax),
});
export const lineAlternatesResultSchema = lineAlternatesModelSchema;
export type LineAlternatesResult = z.infer<typeof lineAlternatesResultSchema>;

// ---- 16. voice-profile (describe how a character speaks, from their own lines) ----

export const voiceProfileRequestSchema = z.strictObject({
  name: z.string().trim().min(1).max(AI_ACTION_LIMITS.voiceNameMax),
  /** The character's own dialogue lines, harvested from the script. */
  lines: z
    .array(z.string().min(1).max(AI_ACTION_LIMITS.sceneElementTextMax))
    .min(1)
    .max(AI_ACTION_LIMITS.voiceLinesMax),
  language: z.string().max(AI_ACTION_LIMITS.languageMax).optional(),
});
export type VoiceProfileRequest = z.infer<typeof voiceProfileRequestSchema>;

export const voiceProfileModelSchema = z.strictObject({
  summary: z.string().min(1).max(AI_ACTION_LIMITS.voiceFieldMax),
  vocabulary: z.string().max(AI_ACTION_LIMITS.voiceFieldMax),
  rhythm: z.string().max(AI_ACTION_LIMITS.voiceFieldMax),
  tics: z.string().max(AI_ACTION_LIMITS.voiceFieldMax),
  sample: z.string().max(AI_ACTION_LIMITS.voiceFieldMax),
});
export const voiceProfileResultSchema = voiceProfileModelSchema;
export type VoiceProfileResult = z.infer<typeof voiceProfileResultSchema>;
/** Stored on the character entity (attributes.voiceProfile) and shown in the sidebar. */
export type VoiceProfile = VoiceProfileResult;

// ---- 17. character-interview (chat role-played as a character, grounded in their lines) ----

export const characterInterviewRequestSchema = z.strictObject({
  name: z.string().trim().min(1).max(AI_ACTION_LIMITS.voiceNameMax),
  question: z.string().trim().min(1).max(AI_ACTION_LIMITS.assistantQuestionMax),
  /** The character's own dialogue, so the reply stays in their voice. */
  lines: z
    .array(z.string().min(1).max(AI_ACTION_LIMITS.sceneElementTextMax))
    .max(AI_ACTION_LIMITS.voiceLinesMax),
  /** Optional pre-computed voice profile (any flattened description), to steer the voice. */
  profile: z.string().max(AI_ACTION_LIMITS.interviewProfileMax).optional(),
  history: z
    .array(
      z.strictObject({
        role: z.enum(ASSISTANT_ROLES),
        text: z.string().max(AI_ACTION_LIMITS.assistantHistoryTextMax),
      })
    )
    .max(AI_ACTION_LIMITS.assistantHistoryMax)
    .optional(),
  language: z.string().max(AI_ACTION_LIMITS.languageMax).optional(),
});
export type CharacterInterviewRequest = z.infer<
  typeof characterInterviewRequestSchema
>;

export const characterInterviewModelSchema = z.strictObject({
  answer: z.string().min(1).max(AI_ACTION_LIMITS.interviewAnswerMax),
});
export const characterInterviewResultSchema = characterInterviewModelSchema;
export type CharacterInterviewResult = z.infer<
  typeof characterInterviewResultSchema
>;

// ---- 18. agent-act (the AI proposes typed, confirm-before-apply operations from a fixed vocabulary) ----

export const AGENT_OP_KINDS = ['comment', 'rename-character'] as const;

/**
 * A proposed operation. The AI only PROPOSES these; the app applies each one as an undoable document command
 * after the writer confirms it — nothing is applied automatically.
 */
export const agentOperationSchema = z.discriminatedUnion('kind', [
  z.strictObject({
    kind: z.literal('comment'),
    sceneId: z.string().min(1).max(64),
    category: z.string().trim().min(1).max(AI_ACTION_LIMITS.agentCategoryMax),
    body: z.string().trim().min(1).max(AI_ACTION_LIMITS.agentCommentBodyMax),
    suggestion: z
      .string()
      .trim()
      .max(AI_ACTION_LIMITS.agentCommentBodyMax)
      .optional(),
  }),
  z.strictObject({
    kind: z.literal('rename-character'),
    from: z.string().trim().min(1).max(AI_ACTION_LIMITS.voiceNameMax),
    to: z.string().trim().min(1).max(AI_ACTION_LIMITS.voiceNameMax),
  }),
]);
export type AgentOperation = z.infer<typeof agentOperationSchema>;

export const agentActRequestSchema = z.strictObject({
  instruction: z
    .string()
    .trim()
    .min(1)
    .max(AI_ACTION_LIMITS.assistantQuestionMax),
  scenes: z
    .array(
      z.strictObject({
        id: z.string().min(1).max(64),
        heading: z.string().max(AI_ACTION_LIMITS.headingTextMax),
        text: z.string().max(AI_ACTION_LIMITS.assistantSceneTextMax),
      })
    )
    .min(1)
    .max(AI_ACTION_LIMITS.assistantScenesMax),
  /** Known character names, so a rename targets a real one. */
  characters: z
    .array(z.string().min(1).max(AI_ACTION_LIMITS.voiceNameMax))
    .max(500)
    .optional(),
  history: z
    .array(
      z.strictObject({
        role: z.enum(ASSISTANT_ROLES),
        text: z.string().max(AI_ACTION_LIMITS.assistantHistoryTextMax),
      })
    )
    .max(AI_ACTION_LIMITS.assistantHistoryMax)
    .optional(),
  language: z.string().max(AI_ACTION_LIMITS.languageMax).optional(),
});
export type AgentActRequest = z.infer<typeof agentActRequestSchema>;

export const agentActModelSchema = z.strictObject({
  message: z.string().max(AI_ACTION_LIMITS.agentMessageMax),
  operations: z.array(agentOperationSchema).max(AI_ACTION_LIMITS.agentOpsMax),
});
export const agentActResultSchema = agentActModelSchema;
export type AgentActResult = z.infer<typeof agentActResultSchema>;

// ---- Registry ----

/** Action -> schema of what the model returns (stored on the ShapeShyft endpoint). */
export const AI_ACTION_MODEL_SCHEMAS = {
  'generate-character-skeleton': generateCharacterSkeletonModelSchema,
  'generate-script': generateScriptModelSchema,
  'polish-character-dialogue': polishCharacterDialogueModelSchema,
  'polish-scene': polishSceneModelSchema,
  'smart-paste-characters': smartPasteCharactersModelSchema,
  'smart-paste-plots': smartPastePlotsModelSchema,
  'smart-paste-script': smartPasteScriptModelSchema,
  'suggest-note-fix': suggestNoteFixModelSchema,
  'logline-synopsis': loglineSynopsisModelSchema,
  'tension-curve': tensionCurveModelSchema,
  'script-breakdown': scriptBreakdownModelSchema,
  'revision-diff': revisionDiffModelSchema,
  assistant: assistantModelSchema,
  'tone-pass': tonePassModelSchema,
  'line-alternates': lineAlternatesModelSchema,
  'voice-profile': voiceProfileModelSchema,
  'character-interview': characterInterviewModelSchema,
  'agent-act': agentActModelSchema,
} as const satisfies Record<AiAction, z.ZodType>;

/** Action -> schema of the request body the client sends. */
export const AI_ACTION_REQUEST_SCHEMAS = {
  'generate-character-skeleton': generateCharacterSkeletonRequestSchema,
  'generate-script': generateScriptRequestSchema,
  'polish-character-dialogue': polishCharacterDialogueRequestSchema,
  'polish-scene': polishSceneRequestSchema,
  'smart-paste-characters': smartPasteCharactersRequestSchema,
  'smart-paste-plots': smartPastePlotsRequestSchema,
  'smart-paste-script': smartPasteScriptRequestSchema,
  'suggest-note-fix': suggestNoteFixRequestSchema,
  'logline-synopsis': loglineSynopsisRequestSchema,
  'tension-curve': tensionCurveRequestSchema,
  'script-breakdown': scriptBreakdownRequestSchema,
  'revision-diff': revisionDiffRequestSchema,
  assistant: assistantRequestSchema,
  'tone-pass': tonePassRequestSchema,
  'line-alternates': lineAlternatesRequestSchema,
  'voice-profile': voiceProfileRequestSchema,
  'character-interview': characterInterviewRequestSchema,
  'agent-act': agentActRequestSchema,
} as const satisfies Record<AiAction, z.ZodType>;

/** What `POST /ai/{action}` returns in `data`: the normalised result plus what the call cost. */
export interface AiActionUsage {
  /** Credits charged (0 for a site admin). */
  credits: number;
  promptTokens: number;
  completionTokens: number;
}
export interface AiActionResponse<R> {
  result: R;
  usage: AiActionUsage;
}
