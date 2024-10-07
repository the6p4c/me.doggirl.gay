import { defineCollection, z } from "astro:content";

const postsCollection = defineCollection({
  schema: z.object({
    published: z.date(),
    edited: z.date().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = {
  posts: postsCollection,
};
