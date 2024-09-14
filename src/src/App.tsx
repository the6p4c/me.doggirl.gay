import { Octokit } from "@octokit/rest";

export default function App() {
  const octokit = new Octokit({
    auth: import.meta.env.VITE_GITHUB_TOKEN,
  });
  const where = {
    owner: import.meta.env.VITE_GITHUB_OWNER!,
    repo: import.meta.env.VITE_GITHUB_REPO!,
  };

  const commit = async () => {
    const when = new Date().toISOString();
    await octokit.rest.repos.createOrUpdateFileContents({
      ...where,
      message: `test at ${when}`,
      path: `${when}.md`,
      content: btoa("meow!!"),
    });
  };

  return <button onClick={commit}>aowha woahhh</button>;
}
