export type TagColorScheme =
  | 'neutral'
  | 'info'
  | 'warning'
  | 'critical'
  | 'success'
  | 'primary';

export interface TagProps {
  /**
   * Defines the color scheme of the tag.
   * @default neutral
   */
  colorScheme?: TagColorScheme;
  /**
   * Label of the tag.
   */
  label: string;
  /**
   * Classes for the component.
   */
  className?: string;
}
