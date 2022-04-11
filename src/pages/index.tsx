import Head from 'next/head';
import Link from 'next/link';
import { AiOutlineCalendar, AiOutlineUser } from 'react-icons/ai';
import { GetStaticProps } from 'next';
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

export default function Home(): JSX.Element {
  return (
    <>
      <main className={commonStyles.container}>
        <Header />
        <div className={styles.posts}>
          <Link href="/">
            <a className={styles.post}>
              <strong>O Titulo</strong>
              <p>Texto do post aleatorio para teste de texto</p>
              <ul>
                <li>
                  <AiOutlineCalendar />
                  <time>10-05-2020</time>
                </li>
                <li>
                  <AiOutlineUser />
                  <span>José</span>
                </li>
              </ul>
            </a>
          </Link>

          <Link href="/">
            <a className={styles.post}>
              <strong>O Titulo</strong>
              <p>Texto do post aleatorio para teste de texto</p>
              <ul>
                <li>
                  <AiOutlineCalendar />
                  <time>10-05-2020</time>
                </li>
                <li>
                  <AiOutlineUser />
                  <span>José</span>
                </li>
              </ul>
            </a>
          </Link>
          <button type="button">Carregar mais posts</button>
        </div>
      </main>
    </>
  );
}

export const getStaticProps = async () => {
  const prismic = getPrismicClient();
  /* const postsResponse = await prismic.get(
    {
      predicates: prismic.predicate.at('document.type', 'Publication'),
    },
    {
      fetch: ['Publication.title', 'Publication.content'],
    }
  ); */

  const postsResponse = await prismic.getAllByType('Publication', {
    pageSize: 100,
  });

  console.log(postsResponse);
  return {
    props: {},
  };
};
