import * as prismic from '@prismicio/client';

export const repositoryName = 'spacetravelling-14';

export const getPrismicClient = (): prismic.Client => {
  const client = prismic.createClient(repositoryName, {
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
  });

  return client;
};
