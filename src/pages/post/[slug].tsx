/* eslint-disable no-param-reassign */
/* eslint-disable react/no-danger */
/* eslint-disable dot-notation */
import { useEffect } from 'react';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
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
  exit: {
    y: 20,
    opacity: 0,
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
  nextPage: string;
}

export default function Post({ post, nextPage }: PostProps): JSX.Element {
  const router = useRouter();

  useEffect(() => {
    const nextPageData = async (): Promise<void> => {
      const data = await fetch(nextPage).then(response => response.json());

      console.log(data);
    };

    nextPageData();
  }, [nextPage]);

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  const readingTime = post.data.content.reduce((acc, content) => {
    const headingWords = content.heading.split(' ');
    const bodyWords = Rich.asText(content.body).split(' ');
    acc += headingWords.length;
    acc += bodyWords.length;

    return acc;
  }, 0);

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
        exit="exit"
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
            {Math.ceil(readingTime / 200)} min
          </div>
        </div>
        <strong className={styles.contentHeading}>
          {post.data.content['heading']}
        </strong>
        <div className={styles.postContent}>
          {post.data.content.map(content => (
            <section key={content.heading}>
              <h2>{content.heading}</h2>
              {content.body.map(body => (
                <p key={body.text}>{body.text}</p>
              ))}
            </section>
          ))}
        </div>
      </motion.main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.getByType('post', {
    fetch: ['publication.title', 'publication.content'],
  });

  const params = posts.results.map(post => ({
    params: {
      slug: post.uid,
    },
  }));

  return {
    paths: params,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();

  const response = await prismic.getByUID('post', String(slug), {});

  const contents = response.data.content.map(content => {
    const contentObj = {};
    let bodies = [];
    Object.assign(contentObj, { heading: content.heading });

    bodies = content.body.map(item => {
      return {
        ...item,
      };
    });

    Object.assign(contentObj, { body: bodies });
    return contentObj;
  });

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: contents,
    },
  };

  return {
    props: { post },
    revalidate: 60 * 60, // ! 60 MINUTES
  };
};
