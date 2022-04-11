import * as Prismic from '@prismicio/client';

export function getPrismicClient(req?: unknown): any {
  const endpoint = Prismic.getEndpoint('spacetravelling-gustavorsan');
  const prismic = Prismic.createClient(endpoint, {
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
  });

  return prismic;
}
