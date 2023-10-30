export * from './interface';
export * from './markdown';
export * from './module';

export type IconType = ({
  height,
  width,
  ...props
}: {
  // eslint-disable-next-line
    [x: string]: any;
  height?: number | undefined;
  width?: number | undefined;
}) => JSX.Element;
