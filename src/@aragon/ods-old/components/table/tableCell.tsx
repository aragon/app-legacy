import React from 'react';
import {type LinkProps} from '../link';
import {type TagProps} from '../tag';

export type TableCellProps = {
  type: 'text' | 'foot' | 'head' | 'link' | 'tag';
  text?: string;
  subtext?: string;
  rightAligned?: boolean;
  bgWhite?: boolean;
  className?: string;
  children?:
    | React.FunctionComponentElement<TagProps>
    | React.FunctionComponentElement<LinkProps>;
};

export const TableCell: React.FC<TableCellProps> = ({
  type,
  text,
  subtext,
  bgWhite = false,
  rightAligned = false,
  children,
  className = '',
}) => {
  if (type === 'foot') {
    return (
      <td
        data-testid="tableCell"
        className={`bg-neutral-100 px-4 py-3 ${
          rightAligned ? 'text-right' : 'text-left'
        } ${className}`}
      >
        <p className="text-neutral-600 ft-text-base">{text}</p>
        {subtext && <p className="text-neutral-500 ft-text-sm">{subtext}</p>}
      </td>
    );
  } else if (type === 'head') {
    return (
      <th
        data-testid="tableCell"
        className={`bg-neutral-100 px-4 py-3.5 ${
          rightAligned ? 'text-right' : 'text-left'
        } ${className}`}
      >
        <p className="font-semibold text-neutral-800 ft-text-sm">{text}</p>
      </th>
    );
  } else if (type === 'link') {
    return (
      <td
        data-testid="tableCell"
        className={`px-4 py-3.5 ${!bgWhite && 'bg-neutral-0'} ${
          rightAligned ? 'text-right' : 'text-left'
        } ${className}`}
      >
        <p className="cursor-pointer font-semibold text-primary-500 ft-text-base">
          {children}
        </p>
      </td>
    );
  } else if (type === 'tag') {
    return (
      <td
        data-testid="tableCell"
        className={`px-4 py-3 ${!bgWhite && 'bg-neutral-0'} ${className}`}
      >
        {children}
      </td>
    );
  }

  return (
    <td
      data-testid="tableCell"
      className={`px-4 py-3 ${!bgWhite && 'bg-neutral-0'} ${
        rightAligned ? 'text-right' : 'text-left'
      } ${className}`}
    >
      <p className="text-neutral-600 ft-text-base">{text}</p>
      {subtext && <p className="text-neutral-500 ft-text-sm">{subtext}</p>}
    </td>
  );
};
