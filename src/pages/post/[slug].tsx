/* eslint-disable react/no-danger */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { GetStaticPaths, GetStaticProps } from 'next';

import Head from 'next/head';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import format from 'date-fns/format';
import br from 'date-fns/locale/pt-BR';
import Image from 'next/image';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import { useRouter } from 'next/router';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Header from '../../components/Header';
import { getPrismicClient } from '../../services/prismic';

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

export default function Post({ post }: PostProps) {
  const router = useRouter();

  const qtdTotalPalavras = post.data.content.reduce((acc, currentValue) => {
    const qtdPalavras = RichText.asText(currentValue.body).split(' ').length;
    return acc + qtdPalavras;
  }, 0);

  const tempLeitura = Math.ceil(qtdTotalPalavras / 200);

  if (router.isFallback) return <div>Carregando...</div>;

  return (
    <>
      <Head>
        <title>{post.data.title} | space traveling</title>
      </Head>
      <Header />
      {post.data.banner && (
        <section className={styles.containerBanner}>
          <Image
            src={post.data.banner.url}
            alt="banner"
            width="1440px"
            height="400px"
          />
        </section>
      )}
      <section
        className={`${commonStyles.paddingPage} ${styles.containerPost}`}
      >
        <h1>{post.data.title}</h1>
        <div className={styles.infoPost}>
          <div className={styles.info}>
            <FiCalendar />
            <span>
              {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                locale: br,
              })}
            </span>
          </div>
          <div className={styles.info}>
            <FiCalendar />
            <span>{post.data.author}</span>
          </div>
          <div className={styles.info}>
            <FiClock />
            <span>{tempLeitura} min</span>
          </div>
        </div>
        {post.data.content.map(content => (
          <div key={content.heading} className={styles.contentPost}>
            <h2>{content.heading}</h2>
            {content.body.map((body, index) => (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                dangerouslySetInnerHTML={{ __html: body.text }}
              />
            ))}
          </div>
        ))}
      </section>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    { pageSize: 2 }
  );

  return {
    paths: postsResponse.results.map(post => {
      return {
        params: {
          slug: post.uid,
        },
      };
    }),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient();
  const { slug } = params;
  const response = await prismic.getByUID('post', String(slug), {});

  const post = {
    first_publication_date: response.first_publication_date,
    uid: response.uid,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: response.data.banner,
      author: response.data.author,
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: content.body,
        };
      }),
    },
  };

  return {
    props: { post },
    revalidate: 60 * 30, // 30 minutos
  };
};
