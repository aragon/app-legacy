import {ButtonText} from '@aragon/ods';
import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {UpdateListItem} from 'containers/updateListItem/updateListItem';
import React from 'react';
import {Controller, useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

export type CheckboxListItemProps = {
  isOpen: boolean;
  handleCloseMenu: () => void;
};

// TODO: This might be a component that
export const VersionSelectionMenu: React.FC<CheckboxListItemProps> = ({
  isOpen,
  handleCloseMenu,
}) => {
  const {t} = useTranslation();
  const {control} = useFormContext();

  const versionList = [
    {
      version: {
        release: '1',
        build: '2',
      },
      address: '0xadb2e0cc261fdfbf29ffd74102c91052a425e666',
      helptext: 'TBD inline release notes',
      LinkLabel: t('update.item.releaseNotesLabel'),
      tagLabelNatural: t('update.item.tagLatest'),
      tagLabelInfo: t('update.item.tagPrepared'),
      isLatest: true,
      isPrepared: true,
    },
    {
      version: {
        release: '1',
        build: '1',
      },
      address: '0xadb2e0cc261fdfbf29ffd74102c91052a425e666',
      helptext: 'TBD inline release notes',
      LinkLabel: t('update.item.releaseNotesLabel'),
    },
  ];

  return (
    <ModalBottomSheetSwitcher
      onClose={handleCloseMenu}
      isOpen={isOpen}
      title={t('update.modalVersion.title')}
      subtitle={t('update.modalVersion.desc')}
    >
      <div className="grid gap-y-3 px-2 py-3">
        <Controller
          name="pluginSelectedVersion"
          rules={{required: 'Validate'}}
          control={control}
          defaultValue={{
            address: '0xadb2e0cc261fdfbf29ffd74102c91052a425e666',
            version: {
              release: '1',
              build: '2',
            },
          }}
          render={({field: {onChange, value}}) => (
            <>
              <VersionListContainer>
                {versionList.map((data, index) => (
                  <UpdateListItem
                    key={index}
                    label={`Token voting v${data.version.release}.${data.version.build}`}
                    {...data}
                    type={
                      value?.version === data.version ? 'active' : 'default'
                    }
                    onClick={() =>
                      onChange({
                        address: data.address,
                        version: data.version,
                        isLatest: data.isLatest,
                        isPrepared: data.isPrepared,
                      })
                    }
                  />
                ))}
              </VersionListContainer>
            </>
          )}
        />
        <ActionContainer>
          <ButtonText
            label={t('update.modalVersion.ctaLabel')}
            mode="primary"
            size="large"
            onClick={handleCloseMenu}
          />
        </ActionContainer>
      </div>
    </ModalBottomSheetSwitcher>
  );
};

const VersionListContainer = styled.div.attrs({
  className: 'grid gap-y-1.5',
})``;

const ActionContainer = styled.div.attrs({
  className: 'grid gap-y-1.5',
})``;
