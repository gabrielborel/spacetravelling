import { useState } from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { GoCalendar } from 'react-icons/go';
import { RiUser3Line } from 'react-icons/ri';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { getPrismicClient } from '../services/prismic';
import styles from './home.module.scss';
import commonStyles from '../styles/common.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

const mainVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: {
    y: 20,
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
  },
};

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [posts, setPosts] = useState(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  const loadMorePosts = async (): Promise<void> => {
    const responseFetch = await fetch(nextPage).then(response =>
      response.json()
    );
    const { results, next_page: fetchedNextPage } = responseFetch;

    const fetchedPosts = results.map((post: Post) => {
      return {
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
      };
    });

    const updatedPosts = [...posts, ...fetchedPosts];

    setPosts(updatedPosts);
    setNextPage(fetchedNextPage);
  };

  return (
    <>
      <Head>
        <title>Início | spacetravelling</title>
      </Head>

      <motion.main
        variants={mainVariants}
        initial="hidden"
        animate="visible"
        className={commonStyles.container}
      >
        {posts.map(
          ({
            uid,
            first_publication_date,
            data: { author, subtitle, title },
          }) => {
            return (
              <Link href={`/post/${uid}`} key={uid}>
                <motion.a variants={itemVariants} className={styles.post}>
                  <strong>{title}</strong>
                  <p>{subtitle}</p>
                  <div className={styles.time}>
                    <time>
                      <GoCalendar />
                      {format(new Date(first_publication_date), 'dd MMM yyyy', {
                        locale: ptBR,
                      })}
                    </time>
                  </div>
                  <div className={styles.user}>
                    <span>
                      <RiUser3Line />
                      {author}
                    </span>
                  </div>
                </motion.a>
              </Link>
            );
          }
        )}

        {nextPage && (
          <motion.button
            variants={itemVariants}
            className={styles.loadPosts}
            onClick={loadMorePosts}
          >
            Carregar mais posts
          </motion.button>
        )}
      </motion.main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const response = await prismic.getByType('post', {
    fetch: ['publication.title', 'publication.content'],
    pageSize: 1,
  });

  const { next_page, results: posts } = response;

  const results = posts.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  return {
    props: { postsPagination: { next_page, results } },
    revalidate: 60 * 30, // 30 MINUTES
  };
};
