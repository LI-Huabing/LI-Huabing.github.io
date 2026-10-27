import type { CollectionEntry } from "astro:content";

type Paper = CollectionEntry<"papers">;

const figures = import.meta.glob<string>("../content/papers/*/figure.svg", { query: "?raw", import: "default", eager: true });

export const pageOf = (paper: Paper) => `/papers/${paper.id}/`;

export const figureOf = (paper: Paper): string | undefined => figures[`../content/papers/${paper.id}/figure.svg`];
