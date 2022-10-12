import {ButtonText, IconAdd} from '@aragon/ui-components';
import React from 'react';
import {useFieldArray, useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import Header from './header';
import Row from './row';

export type AddLinks = {
  /** Name of the fieldArray that is the target of the link inputs. Defaults to
   * 'links' */
  arrayName?: string;
  buttonPlusIcon?: boolean;
  buttonLabel?: string;
};

const AddLinks: React.FC<AddLinks> = ({
  buttonPlusIcon,
  buttonLabel,
  arrayName = 'links',
}) => {
  const {t} = useTranslation();
  const {control} = useFormContext();
  const links = useWatch({name: arrayName, control});
  const {fields, append, remove} = useFieldArray({name: arrayName, control});

  const controlledLinks = fields.map((field, index) => {
    return {
      ...field,
      ...(links && {...links[index]}),
    };
  });

  // TODO: research focus after input refactor
  const handleAddLink = () => {
    append({name: '', url: ''});
  };

  return (
    <Container data-testid="add-links">
      {fields.length > 0 && (
        <ListGroup>
          <Header />
          {controlledLinks.map((field, index) => (
            <Row
              key={field.id}
              index={index}
              onDelete={() => remove(index)}
              arrayName={arrayName}
            />
          ))}
        </ListGroup>
      )}

      <ButtonText
        label={buttonLabel || t('labels.addLink')}
        mode="secondary"
        size="large"
        onClick={handleAddLink}
        {...(buttonPlusIcon ? {iconLeft: <IconAdd />} : {})}
      />
    </Container>
  );
};

export default AddLinks;

const Container = styled.div.attrs({className: 'space-y-1.5'})``;
const ListGroup = styled.div.attrs({
  className: 'flex flex-col overflow-hidden space-y-0.25 rounded-xl',
})``;
