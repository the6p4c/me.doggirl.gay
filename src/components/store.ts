import { Octokit } from "@octokit/rest";

const CONFIG_PATH = ".posting.json";

export default class Store {
  private octokit: Octokit;
  private owner: string;
  private repo: string;

  private config: { path: string } | null;

  constructor(auth: string, owner: string, repo: string) {
    this.octokit = new Octokit({ auth });
    this.owner = owner;
    this.repo = repo;

    this.config = null;
  }

  async getConfig(): Promise<{ path: string }> {
    if (!this.config) {
      let response;
      try {
        response = await this.octokit.rest.repos.getContent({
          owner: this.owner,
          repo: this.repo,
          path: CONFIG_PATH,
        });
      } catch (e) {
        throw new Error("couldn't find config", { cause: e });
      }

      if (Array.isArray(response.data)) {
        throw new Error("config was a directory");
      }
      if (response.data.type != "file") {
        throw new Error(`config wasn't a file; had type ${response.data.type}`);
      }
      if (response.data.encoding != "base64") {
        throw new Error(
          `config wasn't base64-encoded; had encoding ${response.data.encoding}`
        );
      }

      let config;
      try {
        config = JSON.parse(atob(response.data.content));
      } catch (e) {
        throw new Error("couldn't parse config", { cause: e });
      }

      this.config = config;
    }

    return this.config!;
  }

  async createPost(slug: string, content: string) {
    const config = await this.getConfig();

    try {
      await this.octokit.rest.repos.createOrUpdateFileContents({
        repo: this.repo,
        owner: this.owner,
        message: "post~",
        path: `${config.path}/${slug}.md`,
        content: btoa(content),
      });
    } catch (e) {
      throw new Error("failed to create post", { cause: e });
    }
  }
}
