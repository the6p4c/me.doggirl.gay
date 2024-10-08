import type { ReactNode } from "preact/compat";
import styles from "./Post.module.css";

interface PostViewProps {
  permalink: string;
  author: Author;
  posted: Date;
  edited?: Date;
  tags: Tag[];

  children: ReactNode;
}

interface PostEditProps {
  author: Author;
}

interface Author {
  imageUrl: string;
  name: string;
}

interface Tag {
  name: string;
  link: string;
}

export function PostView(props: PostViewProps) {
  const { permalink, author, posted, edited, tags, children } = props;

  return (
    <article className={styles.post}>
      <header>
        <Author author={author} />
        <div className={styles.meta}>
          <a
            href={permalink}
            title={edited && `edited ${edited.toISOString().slice(0, 10)}`}
            className={styles.timestamp}
          >
            <time>{posted.toISOString().slice(0, 10)}</time>
          </a>
          <Tags tags={tags} />
        </div>
      </header>
      <main>{children}</main>
    </article>
  );
}

export function PostEdit({ author }: PostEditProps) {
  return (
    <article className={styles.post}>
      <header>
        <Author author={author} />
        <div className={styles.meta}></div>
      </header>
      <main>
        <textarea
          placeholder="type here! (you won't post you're way scared)"
          className={styles.editor}
        />
      </main>
      <footer>
        <button className={styles.button}>post!</button>
      </footer>
    </article>
  );
}

function Author({ author }: { author: Author }) {
  return (
    <div className={styles.author}>
      <img src={author.imageUrl} className={styles.authorImage} />
      <strong>@{author.name}</strong>
    </div>
  );
}

function Tags({ tags }: { tags: Tag[] }) {
  return (
    <ul class={styles.tags}>
      {tags.map((tag) => (
        <li>
          <a href={tag.link}>#{tag.name}</a>
        </li>
      ))}
    </ul>
  );
}
