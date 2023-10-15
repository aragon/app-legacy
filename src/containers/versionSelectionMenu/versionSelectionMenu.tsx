import {ButtonText} from '@aragon/ods';
import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {UpdateListItem} from 'containers/updateListItem/updateListItem';
import {useUpdateContext} from 'context/update';
import React, {useMemo} from 'react';
import {Controller, useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

export type CheckboxListItemProps = {
  showModal: {
    isOpen: boolean;
    type: 'os' | 'plugin' | 'none';
  };
  handleCloseMenu: () => void;
};

// TODO: This might be a component that
export const VersionSelectionMenu: React.FC<CheckboxListItemProps> = ({
  showModal,
  handleCloseMenu,
}) => {
  const {t} = useTranslation();
  const {control} = useFormContext();
  const {osxAvailableVersions} = useUpdateContext();

  const versionList = useMemo(() => {
    const List = [];
    osxAvailableVersions?.forEach(value => {
      List.push({
        version: value.version,
        helptext: 'TBD inline release notes',
        ...(Boolean(value.isLatest) && {
          isLatest: true,
          tagLabelNatural: t('update.item.tagLatest'),
        }),
      });
    });
    return List;
  }, [osxAvailableVersions, t]);

  return (
    <ModalBottomSheetSwitcher
      onClose={handleCloseMenu}
      isOpen={showModal.isOpen}
      title={t('update.modalVersion.title')}
      subtitle={t('update.modalVersion.desc')}
    >
      <div className="grid gap-y-3 py-3 px-2">
        {showModal.type === 'os' ? (
          <Controller
            name="osSelectedVersion"
            rules={{required: 'Validate'}}
            control={control}
            render={({field: {onChange, value}}) => (
              <>
                <VersionListContainer>
                  {versionList.map((data, index) => {
                    return (
                      <UpdateListItem
                        key={index}
                        label={`Token voting v${data.version}`}
                        {...data}
                        type={
                          value?.version === data.version ? 'active' : 'default'
                        }
                        LinkLabel={t('update.item.releaseNotesLabel')}
                        onClick={() =>
                          onChange({
                            version: data.version,
                            isLatest: data.isLatest,
                          })
                        }
                      />
                    );
                  })}
                </VersionListContainer>
              </>
            )}
          />
        ) : (
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
        )}
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
