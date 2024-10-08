import type { ComponentChildren } from "preact";
import styles from "./Post.module.css";
import { useRef } from "preact/hooks";

interface PostViewProps {
  permalink: string;
  author: Author;
  posted: Date;
  edited?: Date;
  tags: Tag[];

  children: ComponentChildren;
}

interface PostEditProps {
  author: Author;
  status?: string;

  onSubmit: (body: string) => void;
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

export function PostEdit({ author, status, onSubmit }: PostEditProps) {
  const body = useRef<HTMLTextAreaElement | null>(null);

  const submit = () => {
    if (!body.current) return;
    onSubmit(body.current.value);
  };

  return (
    <article className={styles.post}>
      <header>
        <Author author={author} />
        <div className={styles.meta}></div>
      </header>
      <main>
        <textarea
          ref={body}
          placeholder="type here! (you won't post you're way scared)"
          className={styles.editor}
        />
      </main>
      <footer>
        {status && <span className={styles.status}>{status}</span>}
        <button onClick={submit} className={styles.button}>
          post!
        </button>
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
