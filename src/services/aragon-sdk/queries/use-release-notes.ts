import {UseQueryOptions, useQuery} from '@tanstack/react-query';
import {aragonSdkQueryKeys} from '../query-keys';
import {IGithubReleaseNote, IReleaseNote} from '../domain/release-note';

// The regex extracts everything between the "Summary" title and the next title (or the end of the string).
const summaryRegex = /(?<=## Summary)(.*?)(?=#{2,}|$)/;

const parseReleaseNote = (release: IGithubReleaseNote): IReleaseNote => {
  const parsedBody = release.body.replace(/\r\n/g, ' ');
  const summary = summaryRegex.exec(parsedBody)?.[0].trim() ?? '';

  return {...release, summary};
};

const fetchReleaseNotes = async (): Promise<IReleaseNote[]> => {
  const data = await fetch('https://api.github.com/repos/aragon/osx/releases');
  const releaseNotes = (await data.json()) as IGithubReleaseNote[];
  const parsedReleaseNotes = releaseNotes.map(parseReleaseNote);

  return parsedReleaseNotes;
};

export const useReleaseNotes = (
  options: UseQueryOptions<IReleaseNote[]> = {}
) => {
  return useQuery(
    aragonSdkQueryKeys.releaseNotes(),
    () => fetchReleaseNotes(),
    options
  );
};
