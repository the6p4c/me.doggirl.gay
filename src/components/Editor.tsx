import { useState } from "preact/hooks";

import Store from "./store";
import { PostEdit } from "@components/Post";

export default function Editor() {
  const [status, setStatus] = useState<string | undefined>(undefined);

  const submit = async (body: string) => {
    const now = new Date();

    // TODO: not this
    const slug = `post-${now.toISOString()}`;

    const auth = localStorage.getItem("auth");
    const owner = localStorage.getItem("owner");
    const repo = localStorage.getItem("repo");
    if (!auth || !owner || !repo) throw "settings";

    const lines = [];
    lines.push("---");
    lines.push(`published: ${now.toISOString()}`);
    lines.push("---");
    lines.push("");
    lines.push(body);

    const store = new Store(auth, owner, repo);
    try {
      await store.createPost(slug, lines.join("\n"));
      setStatus(undefined);
    } catch (e) {
      setStatus("" + e);
    }
  };

  return (
    <PostEdit
      author={{ imageUrl: "/bark.png", name: "bark" }}
      status={status}
      onSubmit={submit}
    />
  );
}
