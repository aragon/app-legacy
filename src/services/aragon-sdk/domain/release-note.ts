export interface IGithubReleaseNote {
  url: string;
  id: number;
  tag_name: string;
  html_url: string;
  name: string;
  draft: boolean;
  prerelease: boolean;
  created_at: string;
  published_at: string;
  body: string;
}

export interface IReleaseNote extends IGithubReleaseNote {
  summary: string;
}
