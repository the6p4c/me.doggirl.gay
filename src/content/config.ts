import { defineCollection, z } from "astro:content";

const postsCollection = defineCollection({
  schema: z.object({
    published: z.date(),
    edited: z.optional(z.date()),
    tags: z.optional(z.array(z.string())),
  }),
});

export const collections = {
  posts: postsCollection,
};
