import { type FormEvent } from "preact/compat";
import { useState } from "preact/hooks";

import Store from "./store";

import styles from "./Editor.module.css";

export default function Editor() {
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const target = e.currentTarget as typeof e.currentTarget & {
      slug: HTMLInputElement;
      body: HTMLTextAreaElement;
    };
    const slug = target.slug.value;
    const body = target.body.value;

    const auth = localStorage.getItem("auth");
    const owner = localStorage.getItem("owner");
    const repo = localStorage.getItem("repo");
    if (!auth || !owner || !repo) throw "settings";

    const lines = [];
    lines.push("---");
    lines.push(`published: ${new Date().toISOString()}`);
    lines.push("---");
    lines.push("");
    lines.push(body);

    const store = new Store(auth, owner, repo);
    await store.createPost(slug, lines.join("\n"));
  };

  return (
    <>
      <h1>new post</h1>
      <form onSubmit={submit} className={styles.form}>
        <div className={styles.field}>
          <label>slug</label>
          <input name="slug" type="text" />
        </div>
        <div className={styles.field}>
          <label>body</label>
          <textarea name="body"></textarea>
        </div>
        <div className={styles.buttons}>
          <button type="submit">post</button>
        </div>
      </form>

      <Settings />
    </>
  );
}

export function Settings() {
  type State =
    | { type: "success"; message: string; data?: any }
    | { type: "error"; message: string; e?: any };
  const [status, setState] = useState<State | null>(null);
  const setError = (message: string, e?: any) => {
    console.error(message, e);
    setState({ type: "error", message, e });
  };
  const setSuccess = (message: string, data: any) =>
    setState({ type: "success", message, data });

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const target = e.currentTarget as typeof e.currentTarget & {
      auth: HTMLInputElement;
      owner: HTMLInputElement;
      repo: HTMLInputElement;
    };

    const auth = target.auth.value;
    const owner = target.owner.value;
    const repo = target.repo.value;

    try {
      const store = new Store(auth, owner, repo);
      const config = await store.getConfig();
      setSuccess("settings saved", JSON.stringify(config));
    } catch (e) {
      setError("couldn't get config", e);
    }
  };

  return (
    <form onSubmit={submit} className={styles.form}>
      <div className={styles.field}>
        <label>auth</label>
        <input name="auth" type="text" required />
        <span className={styles.help}>your github personal access token</span>
      </div>
      <div className={styles.field}>
        <label>owner</label>
        <input name="owner" type="text" required />
        <span className={styles.help}>your github username</span>
      </div>
      <div className={styles.field}>
        <label>repo</label>
        <input name="repo" type="text" required />
        <span className={styles.help}>your repository's name</span>
      </div>
      <div className={styles.buttons}>
        <button type="submit">save</button>
      </div>
      {status && (
        <div className={styles.status}>
          {status.type == "success" ? (
            <>
              <strong>success!</strong>
              <p>{status.message}</p>
            </>
          ) : (
            <>
              <strong>something went wrong</strong>
              <p>{status.message}</p>
              {status.e && <pre>{"" + status.e}</pre>}
              {status.e?.cause && <pre>{"" + status.e.cause}</pre>}
            </>
          )}
        </div>
      )}
    </form>
  );
}
