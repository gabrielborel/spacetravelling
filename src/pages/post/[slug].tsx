/* eslint-disable react/no-danger */
/* eslint-disable dot-notation */
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { RichText } from 'prismic-reactjs';
import { RichText as Rich } from 'prismic-dom';
import { format } from 'date-fns';
import { GoCalendar } from 'react-icons/go';
import { RiUser3Line } from 'react-icons/ri';
import { FiClock } from 'react-icons/fi';
import { motion } from 'framer-motion';

import { useRouter } from 'next/router';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

const variants = {
  hidden: {
    y: 20,
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
  },
};

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();
  const bodyContentWords = RichText.asText(post.data.content['body']).split(
    ' '
  ).length;

  if (router.isFallback) {
    return <div>Carregando ...</div>;
  }

  return (
    <>
      <Head>
        <title>Post | spacetravelling</title>
      </Head>

      <header>
        <img
          src={post.data.banner.url}
          alt="Banner"
          className={styles.banner}
        />
      </header>

      <motion.main
        variants={variants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.4 }}
        className={`${commonStyles.container} ${styles.post}`}
      >
        <strong>{post.data.title}</strong>

        <div className={styles.info}>
          <time className={styles.date}>
            <GoCalendar />
            {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
              locale: ptBR,
            })}
          </time>
          <div className={styles.user}>
            <RiUser3Line />
            {post.data.author}
          </div>
          <div className={styles.readTime}>
            <FiClock />
            {Math.ceil(bodyContentWords / 200)} min
          </div>
        </div>

        <strong className={styles.contentHeading}>
          {post.data.content['heading']}
        </strong>

        <div
          className={styles.postContent}
          dangerouslySetInnerHTML={{
            __html: Rich.asHtml(post.data.content['body']),
          }}
        />
      </motion.main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.getByType('post', {
    fetch: ['publication.title', 'publication.content'],
  });

  const paths = posts.results.map(post => ({
    params: {
      slug: post.uid,
    },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();

  const response = await prismic.getByUID('post', String(slug), {});

  const post = {
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: {
        heading: response.data.content[0].heading,
        body: response.data.content[0].body,
      },
    },
  };

  return {
    props: { post },
    revalidate: 60 * 60, // ! 60 MINUTES
  };
};
