import Head from 'next/head';
import Link from 'next/link';
import { AiOutlineCalendar, AiOutlineUser } from 'react-icons/ai';
import { GetStaticProps } from 'next';
import { format } from 'date-fns';

import { useState } from 'react';
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

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);
  const [currentPage, setCurrentPage] = useState(1);

  async function handleNextPage(): Promise<void> {
    if (currentPage !== 1 && nextPage === null) {
      return;
    }
    const postsResponse = await fetch(`${nextPage}`).then(response => {
      return response.json();
    });

    console.log('posts', postsResponse);

    setNextPage(postsResponse.next_page);
    setCurrentPage(postsResponse.page);

    const newPosts = postsResponse?.results.map((post: any) => {
      return {
        uid: post.uid,
        slug: post.uid,
        first_publication_date: format(
          new Date(post.first_publication_date),
          'dd MMM yyyy'
        ),
        data: {
          author: post.data.author,
          title: post.data.title,
          subtitle: post.data.subtitle,
        },
      };
    });

    setPosts([...posts, ...newPosts]);
  }

  return (
    <>
      <main className={commonStyles.container}>
        <Header />
        <div className={styles.posts}>
          {posts.map(post => (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <a className={styles.post} key={post.uid}>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <ul>
                  <li>
                    <AiOutlineCalendar />
                    <time>{post.first_publication_date}</time>
                  </li>
                  <li>
                    <AiOutlineUser />
                    <span>{post.data.author}</span>
                  </li>
                </ul>
              </a>
            </Link>
          ))}

          {nextPage && (
            <button type="button" onClick={handleNextPage}>
              Carregar mais posts
            </button>
          )}
        </div>
      </main>
    </>
  );
}

export const getStaticProps = async (): Promise<any> => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.getByType('Publication', {
    pageSize: 1,
  });

  const posts = postsResponse?.results.map((post: any) => {
    return {
      uid: post.uid,
      slug: post.uid,
      first_publication_date: format(
        new Date(post.first_publication_date),
        'dd MMM yyyy'
      ),
      data: {
        author: post.data.author,
        title: post.data.title,
        subtitle: post.data.subtitle,
      },
    };
  });

  const postsPagination = {
    next_page: postsResponse?.next_page ?? null,
    results: posts,
  };
  return {
    props: { postsPagination },
  };
};
