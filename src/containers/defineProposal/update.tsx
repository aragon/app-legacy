import {AlertInline} from '@aragon/ods-old';
import {VersionTag} from '@aragon/sdk-client-common';
import {useEditor} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import React, {useEffect, useState} from 'react';
import {
  Controller,
  useFormContext,
  useFormState,
  useWatch,
} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {Markdown} from 'tiptap-markdown';

import {Loading} from 'components/temporary';
import {UpdateListItem} from 'containers/updateListItem/updateListItem';
import {VersionSelectionMenu} from 'containers/versionSelectionMenu/versionSelectionMenu';
import {PreparedPluginData, useUpdateContext} from 'context/update';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {useProtocolVersion} from 'services/aragon-sdk/queries/use-protocol-version';
import {useReleaseNotes} from 'services/aragon-sdk/queries/use-release-notes';
import {osxUpdates} from 'utils/osxUpdates';
import {ProposalFormData} from 'utils/types';
import {useNavigate} from 'react-router-dom';
import {NotFound} from 'utils/paths';

type ModalState = {
  type: 'os' | 'plugin' | 'none';
  isOpen: boolean;
};

export const DefineUpdateProposal: React.FC = () => {
  const [showModal, setShowModal] = useState<ModalState>({
    type: 'none',
    isOpen: false,
  });

  // hooks
  const {t} = useTranslation();
  const navigate = useNavigate();

  const {
    handlePreparePlugin,
    availableOSxVersions: availableProtocolUpdates,
    availablePluginVersions: availablePluginUpdates,
  } = useUpdateContext();

  // data fetching
  const {data: dao, isLoading: detailsLoading} = useDaoDetailsQuery();
  const daoAddress = dao?.address as string;

  const {data: releases, isLoading: releaseNotesLoading} = useReleaseNotes();
  const {data: protocolVersion, isLoading: protocolVersionLoading} =
    useProtocolVersion(daoAddress);

  // form values
  const editor = useEditor({extensions: [StarterKit, Markdown]});

  const {control, setValue} = useFormContext();
  const {touchedFields} = useFormState({control});

  const pluginSelectedVersion = useWatch<
    ProposalFormData,
    'pluginSelectedVersion'
  >({
    name: 'pluginSelectedVersion',
  });
  const osSelectedVersion = useWatch<ProposalFormData, 'osSelectedVersion'>({
    name: 'osSelectedVersion',
  });
  const updateFramework = useWatch<ProposalFormData, 'updateFramework'>({
    name: 'updateFramework',
  });

  // intermediate values
  const multipleOSxUpdates = (availableProtocolUpdates?.size || 0) > 1;
  const multiplePluginUpdates = (availablePluginUpdates?.size || 0) > 1;

  const OSxReleaseNotes = osxUpdates.getReleaseNotes({
    releases,
    version: osSelectedVersion?.version,
  });

  const pluginReleaseNotes = osxUpdates.getReleaseNotes({
    releases,
    version: pluginSelectedVersion?.version,
    isPlugin: true,
  });

  const isLatestOSxVersion = !!availableProtocolUpdates?.get(
    osSelectedVersion?.version ?? ''
  )?.isLatest;

  const isLatestPlugin = !!availablePluginUpdates?.get(
    osxUpdates.getPluginVersion(pluginSelectedVersion?.version) ?? ''
  )?.isLatest;

  const isPluginPrepared = availablePluginUpdates?.get(
    osxUpdates.getPluginVersion(pluginSelectedVersion?.version) ?? ''
  )?.isPrepared;

  const updateListItems = [
    {
      id: 'os',
      label: osxUpdates.getProtocolUpdateLabel(osSelectedVersion?.version),
      releaseNote: OSxReleaseNotes,
      linkLabel: t('update.item.releaseNotesLabel'),
      ...(isLatestOSxVersion && {
        tagLabelNatural: t('update.item.tagLatest'),
      }),
      ...(multipleOSxUpdates && {
        buttonSecondaryLabel: t('update.item.versionCtaLabel'),
        onClickActionSecondary: (e: React.MouseEvent) => {
          setShowModal({
            isOpen: true,
            type: 'os',
          });
          e?.stopPropagation();
        },
      }),
      disabled: availableProtocolUpdates?.size === 0,
    },
    {
      id: 'plugin',
      releaseNote: pluginReleaseNotes,
      label: osxUpdates.getPluginUpdateLabel(pluginSelectedVersion?.version),
      linkLabel: t('update.item.releaseNotesLabel'),
      ...(isLatestPlugin && {tagLabelNatural: t('update.item.tagLatest')}),
      ...(isPluginPrepared
        ? {tagLabelInfo: t('update.item.tagPrepared')}
        : {
            buttonPrimaryLabel: t('update.item.prepareCtaLabel'),
            onClickActionPrimary: (e: React.MouseEvent) => e?.stopPropagation(),
          }),

      ...(multiplePluginUpdates && {
        buttonSecondaryLabel: t('update.item.versionCtaLabel'),
        onClickActionSecondary: (e: React.MouseEvent) => {
          setShowModal({
            isOpen: true,
            type: 'plugin',
          });
          e?.stopPropagation();
        },
      }),
      disabled: availablePluginUpdates?.size === 0,
    },
  ].filter(update => !update.disabled);

  // queries loading && data parsing
  const isLoading =
    detailsLoading ||
    protocolVersionLoading ||
    releaseNotesLoading ||
    (((availablePluginUpdates?.size || 0) > 0 ||
      (availableProtocolUpdates?.size || 0) > 0) &&
      (!OSxReleaseNotes || !pluginReleaseNotes));

  /*************************************************
   *                    Effects                    *
   *************************************************/
  // Add proposal title and summary
  useEffect(() => {
    const proposalTitle = t('update.proposal.title');
    const proposalSummary = t('update.proposal.summary', {
      daoName: dao?.metadata.name,
    });

    setValue('proposalTitle', proposalTitle);
    setValue('proposalSummary', proposalSummary);
  }, [dao?.metadata.name, setValue, t]);

  // Add proposal body
  useEffect(() => {
    let proposalBody = t('update.proposal.descriptionHeader');

    if (updateFramework?.os) {
      const updatedVersion = osxUpdates.getProtocolUpdateLabel(
        osSelectedVersion?.version
      );
      const releaseNotes = osxUpdates.getReleaseNotes({
        releases,
        version: osSelectedVersion?.version,
      });
      editor?.commands.setContent(releaseNotes?.summary ?? '');
      proposalBody += t('update.proposal.descriptionProtocolUpgrade', {
        updatedVersion,
        description: editor?.getHTML().replace(/<(\/){0,1}p>/g, ''),
        releaseNotesLink: releaseNotes?.html_url,
        currentVersion: osxUpdates.getProtocolUpdateLabel(protocolVersion),
      });
    }
    if (updateFramework?.plugin) {
      // Add space between the two updates
      if (updateFramework.os) {
        proposalBody += '<p />';
      }

      const updatedVersion = osxUpdates.getPluginUpdateLabel(
        pluginSelectedVersion?.version
      );
      const releaseNotes = osxUpdates.getReleaseNotes({
        releases,
        version: pluginSelectedVersion?.version,
        isPlugin: true,
      });
      editor?.commands.setContent(releaseNotes?.summary ?? '');
      proposalBody += t('update.proposal.descriptionPluginUpgrade', {
        updatedVersion,
        description: editor?.getHTML().replace(/<(\/){0,1}p>/g, ''),
        releaseNotesLink: releaseNotes?.html_url,
        currentVersion: osxUpdates.getPluginUpdateLabel(dao?.plugins[0]),
      });
    }

    proposalBody += t('update.proposal.descriptionFooter');

    setValue('proposal', proposalBody);
  }, [
    dao?.plugins,
    editor,
    osSelectedVersion?.version,
    pluginSelectedVersion?.version,
    releases,
    setValue,
    t,
    updateFramework?.os,
    updateFramework?.plugin,
    protocolVersion,
  ]);

  // add values to form
  useEffect(() => {
    setValue('actions', []);

    if (updateFramework?.os && osSelectedVersion?.version) {
      setValue(`actions.0.name`, 'os_update');
      setValue(`actions.0.inputs.version`, osSelectedVersion?.version);
    }

    if (updateFramework?.plugin && pluginSelectedVersion?.version) {
      const versionKey = `${pluginSelectedVersion.version.release}.${pluginSelectedVersion.version.build}`;

      const preparedData: PreparedPluginData | undefined =
        availablePluginUpdates?.get(versionKey)?.preparedData;

      const inputs: VersionTag | PreparedPluginData = preparedData
        ? {
            ...preparedData,
            // TODO: This return type is incorrect!
            pluginRepo: (
              preparedData.pluginRepo as unknown as {
                id: string;
                subdomain: string;
              }
            ).id,
          }
        : pluginSelectedVersion.version;

      setValue(`actions.1.name`, 'plugin_update');
      setValue(`actions.1.inputs`, inputs);
    }
  }, [
    availablePluginUpdates,
    osSelectedVersion?.version,
    pluginSelectedVersion?.version,
    setValue,
    updateFramework?.os,
    updateFramework?.plugin,
  ]);

  // auto select the available updates by default if only one
  // update is present in a "framework"
  useEffect(() => {
    if (!touchedFields.updateFramework?.plugin) {
      if (availablePluginUpdates?.size === 1) {
        setValue('updateFramework.plugin', true, {shouldTouch: true});
      }
    }
  }, [
    availablePluginUpdates?.size,
    setValue,
    touchedFields.updateFramework?.plugin,
  ]);

  useEffect(() => {
    if (!touchedFields.updateFramework?.os) {
      if (availableProtocolUpdates?.size === 1) {
        setValue('updateFramework.os', true, {shouldTouch: true});
      }
    }
  }, [
    availableProtocolUpdates?.size,
    setValue,
    touchedFields.updateFramework?.os,
  ]);

  /*************************************************
   *                     Render                    *
   *************************************************/
  if (isLoading) {
    return <Loading />;
  }

  // no protocol or plugin update
  if (
    availablePluginUpdates?.size === 0 &&
    availableProtocolUpdates?.size === 0
  ) {
    navigate(NotFound, {
      replace: true,
    });
  }

  return (
    <UpdateContainer>
      <UpdateGroupWrapper>
        <Controller
          name="updateFramework"
          rules={{required: 'Validate'}}
          control={control}
          render={({field: {onChange, value}}) => (
            <>
              {updateListItems.map(data => (
                <UpdateListItem
                  key={data.label}
                  {...data}
                  type={value?.[data.id] ? 'active' : 'default'}
                  multiSelect
                  onClick={() => {
                    onChange({
                      ...value,
                      [data.id]: !value?.[data.id],
                    });
                  }}
                  onClickActionPrimary={(e: React.MouseEvent) => {
                    e?.stopPropagation();
                    handlePreparePlugin(data.id);
                  }}
                />
              ))}
            </>
          )}
        />
      </UpdateGroupWrapper>
      <VersionSelectionMenu
        showModal={showModal}
        handleCloseMenu={() => {
          setShowModal({
            isOpen: false,
            type: 'none',
          });
        }}
      />
      <AlertInline label={t('update.itemList.alertInfo')} mode="neutral" />
    </UpdateContainer>
  );
};

const UpdateGroupWrapper = styled.div.attrs({
  className:
    'flex flex-col items-center md:flex-row md:justify-center md:items-stretch gap-y-3 gap-x-6',
})``;

const UpdateContainer = styled.div.attrs({
  className: 'space-y-4',
})``;
