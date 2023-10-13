/**
 * Type of any illustration component that makes up an illustration. Comes with
 * the various types (in the sense of "variations") that component can come in,
 * as well as its dimensions.
 */
export type IllustrationComponentProps<T> = {
  variant: T;
} & Dimensions;

/** Add the literal type 'none' to a Type */
export type Noneable<T> = T | 'none';

export type Dimensions = {
  width?: number;
  height?: number;
};

export class UnknownIllustrationVariantError extends Error {
  constructor(variant: string, illustrationComponent: string) {
    super(
      `Unknown variant "${variant}" of ${illustrationComponent} illustration.
       Make sure to only request variants of illustrations that exist.
       Also, check that the corresponding component and Type were properly extended in case new variants are introduced.`
    );
  }
}
