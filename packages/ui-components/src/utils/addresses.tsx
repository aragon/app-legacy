// NOTE Eventually have these types expressed as string patterns [VR 22-11-2021].
export type Address = string;
export type EnsName = string;

// get truncated address
export function shortenAddress(address: Address | null) {
  if (address === null) return '';
  if (IsAddress(address))
    return (
      address.substring(0, 5) +
      '…' +
      address.substring(address.length - 4, address.length)
    );
  else return address;
}

// check label type
export function IsAddress(address: Address | null) {
  const re = /0x[a-fA-F0-9]{40}/g;
  return Boolean(address?.match(re));
}

export function isEnsDomain(input: string | null): boolean {
  if (!input) return false;
  // The pattern for a valid ENS domain:
  // - starts with an alphanumeric character (case-insensitive)
  // - followed by zero or more alphanumeric characters, hyphens, or underscores (case-insensitive)
  // - ends with '.eth'
  const ensPattern = new RegExp(
    '^([a-z0-9]+(-[a-z0-9]+)*.)*[a-z0-9]+(-[a-z0-9]+)*.eth$'
  );
  return ensPattern.test(input);
}

export function shortenENS(input: string | null): string {
  if (!input || !isEnsDomain(input)) return input as string;

  const [name] = input.split('.eth');
  const shortenedName = name.slice(0, 7);
  return `${shortenedName}…eth`;
}
