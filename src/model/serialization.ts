import { z } from "zod";
import type { IsoflowIcon } from "../assets/isoflowIcons";
import type { Connection, DocumentState, Node, Surface, TextElement } from "./types";

export const documentVersion = 1;

export type DocumentFile = {
  version: typeof documentVersion;
  document: DocumentState;
};

export const emptyDocument: DocumentState = { nodes: [], connections: [], texts: [], surfaces: [] };

const iconSchema: z.ZodType<IsoflowIcon> = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
  width: z.number(),
  height: z.number(),
}).strict();

const nodeSchema: z.ZodType<Node> = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
  label: z.string(),
  icon: iconSchema,
}).strict();

const textSchema: z.ZodType<TextElement> = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
  content: z.string(),
  orientation: z.enum(["horizontal", "vertical"]),
  size: z.enum(["small", "medium", "large"]),
}).strict();

const surfaceSchema: z.ZodType<Surface> = z.object({
  id: z.string(),
  x1: z.number(),
  y1: z.number(),
  x2: z.number(),
  y2: z.number(),
  squared: z.boolean(),
  backgroundColor: z.enum(["gray", "blue", "green", "yellow", "red"]),
  label: z.string(),
}).strict();

const connectionSchema: z.ZodType<Connection> = z.object({
  id: z.string(),
  sourceId: z.string(),
  targetId: z.string(),
  color: z.enum(["gray", "blue", "green", "yellow", "red"]),
  style: z.enum(["solid", "dashed"]),
  label: z.string(),
}).strict();

const documentSchema: z.ZodType<DocumentState> = z.object({
  nodes: z.array(nodeSchema),
  connections: z.array(connectionSchema),
  texts: z.array(textSchema),
  surfaces: z.array(surfaceSchema),
}).strict();

const documentFileSchema: z.ZodType<DocumentFile> = z.object({
  version: z.literal(documentVersion),
  document: documentSchema,
}).strict();

export const serializeDocument = (document: DocumentState): string => JSON.stringify({
  version: documentVersion,
  document,
} satisfies DocumentFile, null, 2);

export const deserializeDocument = (serialized: string): DocumentState => {
  try {
    const parsed: unknown = JSON.parse(serialized);
    return documentFileSchema.parse(parsed).document;
  } catch {
    throw new Error("Invalid Gridiro diagram file: expected strict version 1 format");
  }
};
