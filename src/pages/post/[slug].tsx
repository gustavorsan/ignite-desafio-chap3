/* eslint-disable react/no-danger */

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import {
  AiOutlineCalendar,
  AiOutlineClockCircle,
  AiOutlineUser,
} from 'react-icons/ai';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

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
  const totalWords = post.data.content.reduce((total, contentItem) => {
    // eslint-disable-next-line no-param-reassign
    total += contentItem?.heading.split(/[,.\s]/).length;

    const words = contentItem?.body.map(
      item => item.text.split(/[,.\s]/).length
    );

    words.forEach(item => {
      // eslint-disable-next-line no-param-reassign
      total += item;
    });

    return total;
  }, 0);

  const readtime = Math.ceil(totalWords / 200);

  const router = useRouter();

  if (router.isFallback) {
    return <h1>Carregando...</h1>;
  }

  const formatedDate = format(
    new Date(post.first_publication_date),
    'dd MMM yyyy',
    { locale: ptBR }
  );

  return (
    <>
      <Head>
        <title>{`${post?.data.title} | spacetaveling`}</title>
      </Head>
      <Header />
      <img src={post?.data.banner.url} alt="imagem" className={styles.banner} />
      <main className={commonStyles.container}>
        <div className={styles.post}>
          <div className={styles.postTop}>
            <h1>{post?.data.title}</h1>
            <ul>
              <li>
                <AiOutlineCalendar />
                {formatedDate}
              </li>
              <li>
                <AiOutlineUser />
                <span>{post?.data.author}</span>
              </li>
              <li>
                <AiOutlineClockCircle />
                <span>{`${readtime} min`}</span>
              </li>
            </ul>
          </div>

          {post?.data.content.map(content => (
            <article key={content.heading}>
              <section>
                <h2>{content.heading}</h2>
                <div
                  className={styles.postContent}
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(content.body),
                  }}
                />
              </section>
            </article>
          ))}
        </div>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.getAllByType('posts', {
    pageSize: 100,
  });

  const paths = posts.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const prismic = getPrismicClient();
  const { slug } = context.params;
  const response = await prismic.getByUID('posts', String(slug), {});
  /* const response = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts'),
  ]); */
  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,

    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: {
        url: response.data.banner.url,
      },
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: [...content.body],
        };
      }),
    },
  };

  return {
    props: {
      post,
    },
  };
};
