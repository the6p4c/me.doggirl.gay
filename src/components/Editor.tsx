import { type FormEvent } from "preact/compat";
import { useState } from "preact/hooks";
import { Octokit } from "@octokit/rest";

import styles from "./Editor.module.css";

export default function Editor() {
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // TODO: post
  };

  return (
    <>
      <h1>new post</h1>
      <form onSubmit={submit} className={styles.form}>
        <div className={styles.field}>
          <label>slug</label>
          <input type="text" />
        </div>
        <div className={styles.field}>
          <label>body</label>
          <textarea></textarea>
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
  const [error, setError] = useState<string | null>(null);

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

    const octokit = new Octokit({ auth });
    try {
      const response = await octokit.rest.repos.get({
        owner,
        repo,
      });

      console.log(response);
      setError(null);
    } catch (e) {
      setError(e + "");
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
      {error && (
        <div className={styles.status}>
          <strong>something went wrong</strong>
          <pre>{error}</pre>
        </div>
      )}
    </form>
  );
}
