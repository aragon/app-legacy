import {ButtonText} from '@aragon/ods-old';
import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {UpdateListItem} from 'containers/updateListItem/updateListItem';
import {useUpdateContext} from 'context/update';
import React, {useMemo} from 'react';
import {VersionTag} from '@aragon/sdk-client-common';
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

type versionList = {
  label: string;
  version: string | VersionTag;
  helptext: string;
  isLatest?: boolean;
  isPrepared?: boolean;
  tagLabelNatural?: string;
};

// TODO: This might be a component that
export const VersionSelectionMenu: React.FC<CheckboxListItemProps> = ({
  showModal,
  handleCloseMenu,
}) => {
  const {t} = useTranslation();
  const {control} = useFormContext();
  const {osxAvailableVersions, pluginAvailableVersions} = useUpdateContext();

  const osVersionList = useMemo(() => {
    const List: versionList[] = [];
    osxAvailableVersions?.forEach(value => {
      console.log('value', value.version, osxAvailableVersions);
      List.push({
        label: `OSX v${value.version}`,
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

  const pluginVersionList = useMemo(() => {
    const List: versionList[] = [];
    pluginAvailableVersions?.forEach(value => {
      List.push({
        label: `Token voting v${value.version.release}.${value.version.build}`,
        version: value.version,
        helptext: 'TBD inline release notes',
        ...(value.isLatest && {
          isLatest: true,
          tagLabelNatural: t('update.item.tagLatest'),
        }),
        ...(value.isPrepared && {
          isPrepared: true,
          tagLabelInfo: t('update.item.tagPrepared'),
        }),
      });
    });
    return List;
  }, [pluginAvailableVersions, t]);

  return (
    <ModalBottomSheetSwitcher
      onClose={handleCloseMenu}
      isOpen={showModal.isOpen}
      title={t('update.modalVersion.title')}
      subtitle={t('update.modalVersion.desc')}
    >
      <div className="grid gap-y-3 px-2 py-3">
        {showModal.type === 'os' && (
          <Controller
            name="osSelectedVersion"
            control={control}
            render={({field: {onChange, value: value23}}) => (
              <>
                <VersionListContainer>
                  {osVersionList.map((data, index) => {
                    return (
                      <UpdateListItem
                        {...data}
                        key={index}
                        type={
                          value23?.version === data.version
                            ? 'active'
                            : 'default'
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
        )}

        {showModal.type === 'plugin' && (
          <Controller
            name="pluginSelectedVersion"
            rules={{required: 'Validate'}}
            control={control}
            render={({field: {onChange, value}}) => (
              <>
                <VersionListContainer>
                  {pluginVersionList.map((data, index) => {
                    return (
                      <UpdateListItem
                        {...data}
                        key={index}
                        type={
                          value?.version.build ===
                          (data.version as VersionTag).build
                            ? 'active'
                            : 'default'
                        }
                        LinkLabel={t('update.item.releaseNotesLabel')}
                        onClick={() =>
                          onChange({
                            version: data.version,
                            isLatest: data.isLatest,
                            isPrepared: data.isPrepared,
                          })
                        }
                      />
                    );
                  })}
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
