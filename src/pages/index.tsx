/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { GetStaticProps } from 'next';
import Link from 'next/link';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import br from 'date-fns/locale/pt-BR';
import { useState } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Head from 'next/head';

import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Header from '../components/Header';

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

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState(() => postsPagination.results || []);
  const [urlNextPage, setUrlNextPage] = useState(
    () => postsPagination.next_page || null
  );

  async function getNextPage() {
    try {
      const response = await fetch(urlNextPage);
      const resJson = await response.json();

      const newPosts = resJson.results.map(post => {
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

      const payload = {
        next_page: resJson.next_page,
        results: newPosts,
      };

      setPosts([...posts, ...payload.results]);
      setUrlNextPage(payload.next_page);
    } catch (err) {
      console.log(err.message);
    }
  }

  return (
    <>
      <Head>
        <title>space traveling</title>
      </Head>
      <Header />
      <section className={`${commonStyles.paddingPage}`}>
        {posts?.map(post => (
          <div key={post.uid} className={styles.containerPost}>
            <Link href={`/post/${post.uid}`}>
              <h1>{post.data.title}</h1>
            </Link>
            <span>{post.data.subtitle}</span>
            <div className={styles.containerInfo}>
              <div className={styles.info}>
                <FiCalendar />
                <span>
                  {format(
                    new Date(post.first_publication_date),
                    'dd MMM yyyy',
                    { locale: br }
                  )}
                </span>
              </div>

              <div className={styles.info}>
                <FiUser />
                <span>{post.data.author}</span>
              </div>
            </div>
          </div>
        ))}
      </section>
      {urlNextPage && (
        <section
          className={`${commonStyles.paddingPage} ${styles.containerButtonNextPage}`}
        >
          <button onClick={() => getNextPage()} type="button">
            Carregar mais posts
          </button>
        </section>
      )}
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    { fetch: ['post.title', 'post.subtitle', 'post.author'], pageSize: 2 }
  );

  const posts = postsResponse.results.map(post => {
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

  const payload = {
    next_page: postsResponse.next_page,
    results: posts,
  };

  return { props: { postsPagination: payload } };
};
