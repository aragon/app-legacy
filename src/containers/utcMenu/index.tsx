import React, {useState} from 'react';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import {ListItemAction, SearchInput} from '@aragon/ods-old';
import {Icon, IconType} from '@aragon/ods';

import {useGlobalModalContext} from 'context/globalModals';
import {timezones} from './utcData';
import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';

type UtcMenuProps = {
  onTimezoneSelect: (timezone: string) => void;
};

const UtcMenu: React.FC<UtcMenuProps> = ({onTimezoneSelect}) => {
  const {isOpen, close} = useGlobalModalContext('utc');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const {t} = useTranslation();

  const handleUtcClick = (tz: string) => {
    onTimezoneSelect(tz);
    close();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredTimezones = timezones.filter(tz => {
    const lowerCaseTz = tz.toLocaleLowerCase();
    const lowercaseTerm = searchTerm.toLocaleLowerCase();
    return lowerCaseTz.includes(lowercaseTerm);
  });

  return (
    <ModalBottomSheetSwitcher
      isOpen={isOpen}
      onClose={close}
      title={t('newWithdraw.configureWithdraw.utcMenu.title')}
    >
      <ModalBody>
        <SearchInput
          placeholder="Type to filter"
          value={searchTerm}
          onChange={handleChange}
        />
        <Container>
          <ScrollableDiv>
            {filteredTimezones.map((tz: string) => {
              return (
                <ListItemAction
                  mode="default"
                  key={tz}
                  title={tz}
                  iconRight={<Icon icon={IconType.CHEVRON_RIGHT} />}
                  onClick={() => handleUtcClick(tz)}
                />
              );
            })}
          </ScrollableDiv>
        </Container>
      </ModalBody>
    </ModalBottomSheetSwitcher>
  );
};

export default UtcMenu;

const ModalBody = styled.div.attrs({className: 'space-y-2 p-6'})``;

const Container = styled.div.attrs({
  className: 'space-y-2 overflow-y-auto',
})``;
const ScrollableDiv = styled.div.attrs({
  className: 'h-[200px] space-y-2 p-2',
})``;
