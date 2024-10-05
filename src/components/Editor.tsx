import { type FormEvent } from "preact/compat";
import { useState } from "preact/hooks";
import { Octokit } from "@octokit/rest";

import styles from "./Editor.module.css";

const CONFIG_PATH = ".posting.json";

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

    const octokit = new Octokit({ auth });

    const config = JSON.parse(
      atob(
        (
          await octokit.rest.repos.getContent({
            owner,
            repo,
            path: CONFIG_PATH,
          })
        ).data.content
      )
    );

    console.log(config);

    const lines = [];
    lines.push("---");
    lines.push(`published: ${new Date().toISOString()}`);
    lines.push("---");
    lines.push("");
    lines.push(body);

    await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      message: "post!",
      path: `${config.path}${slug}.md`,
      content: btoa(lines.join("\n")),
    });
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
    | { type: "success"; message: string }
    | {
        type: "error";
        message: string;
        e?: any;
      };
  const [status, setState] = useState<State | null>(null);
  const setError = (message: string, e?: any) => {
    console.error(message, e);
    setState({ type: "error", message, e });
  };
  const setSuccess = (message: string) =>
    setState({ type: "success", message });

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
      await octokit.rest.repos.get({ owner, repo });
    } catch (e) {
      setError("repo doesn't exist", e);
      return;
    }

    let response;
    try {
      response = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: CONFIG_PATH,
      });
    } catch (e) {
      setError("couldn't find config", e);
      return;
    }

    if (Array.isArray(response.data)) {
      setError("config was a directory");
      return;
    }

    if (response.data.type != "file") {
      setError(`config wasn't a file; had type ${response.data.type}`);
      return;
    }

    let config;
    try {
      config = JSON.parse(atob(response.data.content));
    } catch (e) {
      setError("couldn't parse config", e);
      return;
    }

    try {
      localStorage.setItem("auth", auth);
      localStorage.setItem("owner", owner);
      localStorage.setItem("repo", repo);
    } catch (e) {
      setError("couldn't write to local storage", e);
      return;
    }

    setSuccess("settings saved!");
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
            <p>{status.message}</p>
          ) : (
            <>
              <strong>something went wrong</strong>
              <p>{status.message}</p>
              <pre>{"" + status.e}</pre>
            </>
          )}
        </div>
      )}
    </form>
  );
}
