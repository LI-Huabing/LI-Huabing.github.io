import { defineCollection } from "astro:content";
import { file, glob } from "astro/loaders";
import { z } from "astro/zod";

const papers = defineCollection({
  loader: glob({ base: "src/content/papers", pattern: "*/index.md", generateId: ({ entry }) => entry.split("/")[0] }),
  schema: z.object({
    title: z.string(),
    group: z.string(),
    order: z.number(),
    year: z.union([z.number(), z.string()]).optional(),
    journal: z
      .object({ name: z.string(), volume: z.coerce.string().optional(), issue: z.coerce.string().optional() })
      .optional(),
    abstract: z.string().optional(),
    coauthors: z.array(z.object({ name: z.string(), url: z.url().optional() })).default([]),
    awards: z.array(z.string()).default([]),
    funding: z.array(z.string()).default([]),
    cite: z.string().optional(),
    bibtex: z.string().optional(),
    links: z.record(z.string(), z.string()).default({}),
  }),
});

const awards = defineCollection({
  loader: file("src/content/awards.yaml"),
  schema: z.object({
    id: z.string(),
    date: z.coerce.string(),
    name: z.string(),
    by: z.string(),
  }),
});

const talks = defineCollection({
  loader: file("src/content/talks.yaml"),
  schema: z.object({
    id: z.string(),
    date: z.string().transform((m) => new Date(`${m}-01T00:00:00Z`)),
    event: z.string(),
    host: z.string(),
    city: z.string(),
    lat: z.number(),
    lon: z.number(),
  }),
});

export const collections = { papers, awards, talks };
