import React, {useCallback, useState} from 'react';
import {useDropzone, type FileRejection} from 'react-dropzone';
import {styled} from 'styled-components';
import {Button, Icon, IconType} from '@aragon/ods';
import {Spinner} from '../spinner';

export type InputImageSingleProps = {
  /**
   * onChange Event will fires after uploading a valid image
   */
  onChange: (file: File | undefined) => void;
  /**
   * All error messages will pass as onError function inputs
   */
  onError: (error: {code: string; message: string}) => void;
  /**
   * limit maximum dimension of the image (in px)
   */
  maxDimension?: number;
  /**
   * limit minimum dimension of the image (in px)
   */
  minDimension?: number;
  /**
   * limit maximum file size of the image (in bytes)
   */
  maxFileSize?: number;
  /**
   * Allow Square image only
   */
  onlySquare?: boolean;
  /**
   * Passing image src for preview
   */
  preview?: string;
  /**
   * acceptable image formats
   */
  acceptableFileFormat?: string;
};

export const InputImageSingle: React.FC<InputImageSingleProps> = ({
  onChange,
  maxDimension,
  minDimension,
  maxFileSize,
  onlySquare = false,
  preview: previewSrc = '',
  acceptableFileFormat = 'image/jpg, image/jpeg, image/png, image/gif, image/svg+xml',
  onError,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [preview, setPreview] = useState<string>(previewSrc);
  const onDrop = useCallback(
    (acceptedFiles: File[], onDropRejected: FileRejection[]) => {
      if (onDropRejected.length !== 0) {
        onError(onDropRejected[0].errors[0]);
      } else {
        /**
         * Render image to calculate the dimensions
         */
        setLoading(true);
        const image: HTMLImageElement = new Image();
        image.addEventListener('load', () => {
          setLoading(false);
          if (
            maxDimension &&
            (image.width > maxDimension || image.height > maxDimension)
          ) {
            onError({
              code: 'wrong-dimension',
              message: `Please provide a squared image with size between ${minDimension}px and ${maxDimension}px on each side`,
            });
          } else if (
            minDimension &&
            (image.width < minDimension || image.height < minDimension)
          ) {
            onError({
              code: 'wrong-dimension',
              message: `Please provide a squared image with size between ${minDimension}px and ${maxDimension}px on each side`,
            });
            return;
          } else if (
            onlySquare &&
            image.height !== image.width // check if the image is square or not
          ) {
            onError({
              code: 'wrong-dimension',
              message: `Please provide a squared image with size between ${minDimension}px and ${maxDimension}px on each side`,
            });
          } else {
            onChange(acceptedFiles[0]);
            setPreview(image.src);
          }
        });
        image.src = URL.createObjectURL(acceptedFiles[0]);
      }
    },
    [maxDimension, minDimension, onChange, onError, onlySquare]
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive: isdragactive,
  } = useDropzone({
    onDrop,
    ...(maxFileSize && {maxSize: maxFileSize}),
    accept: acceptableFileFormat,
  });

  if (loading) {
    return (
      <LoadingContainer>
        <Spinner size="small" />
      </LoadingContainer>
    );
  }

  return preview !== '' ? (
    <ImageContainer>
      <Preview src={preview} />
      <StyledButton
        iconLeft={IconType.CLOSE}
        size="sm"
        variant="tertiary"
        onClick={() => {
          setPreview('');
          onChange(undefined);
        }}
      />
    </ImageContainer>
  ) : (
    <DefaultContainer
      {...{isdragactive}}
      data-testid="input-image"
      {...getRootProps()}
    >
      <Icon
        icon={IconType.PLUS}
        className={`${isdragactive ? 'text-primary-500' : 'text-neutral-600'}`}
      />
      <input {...getInputProps()} />
    </DefaultContainer>
  );
};

type DefaultContainerProps = {
  isdragactive: boolean;
};

const DefaultContainer = styled.div.attrs<DefaultContainerProps>(
  ({isdragactive}) => ({
    className: `flex items-center justify-center bg-neutral-0
    h-16 w-16 border-dashed ${
      isdragactive ? 'border-primary-500' : 'border-neutral-100'
    } border-2 rounded-xl cursor-pointer`,
  })
)<DefaultContainerProps>``;

const LoadingContainer = styled.div.attrs({
  className: `flex items-center justify-center bg-neutral-0
    h-16 w-16 border-dashed border-primary-500 border-2 rounded-xl`,
})``;

const ImageContainer = styled.div.attrs({
  className: 'relative h-16 w-16',
})``;

const Preview = styled.img.attrs({
  className: 'rounded-xl bg-neutral-0 h-16 w-16',
})``;

const StyledButton = styled(Button).attrs({
  className: 'absolute -top-4 -right-3.5',
})`
  box-shadow:
    0px 4px 8px rgba(31, 41, 51, 0.04),
    0px 0px 2px rgba(31, 41, 51, 0.06),
    0px 0px 1px rgba(31, 41, 51, 0.04);
`;
