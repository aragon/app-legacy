import {AlertInline} from '@aragon/ods-old';
import React, {useEffect, useState} from 'react';
import {Controller, useFormContext, useWatch} from 'react-hook-form';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import {useEditor} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {Markdown} from 'tiptap-markdown';

import {UpdateListItem} from 'containers/updateListItem/updateListItem';
import {VersionSelectionMenu} from 'containers/versionSelectionMenu/versionSelectionMenu';
import {useUpdateContext} from 'context/update';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {useProtocolVersion} from 'services/aragon-sdk/queries/use-protocol-version';
import {useReleaseNotes} from 'services/aragon-sdk/queries/use-release-notes';
import {ProposalFormData} from 'utils/types';
import {osxUpdates} from 'utils/osxUpdates';

export const DefineUpdateProposal: React.FC = () => {
  const [showModal, setShowModal] = useState<{
    type: 'os' | 'plugin' | 'none';
    isOpen: boolean;
  }>({
    type: 'none',
    isOpen: false,
  });

  // data fetching
  const {data: dao} = useDaoDetailsQuery();
  const {data: releases} = useReleaseNotes();
  const {data: versions} = useProtocolVersion(dao?.address as string);

  // hooks
  const {t} = useTranslation();

  const {handlePreparePlugin, availableOSxVersions, availablePluginVersions} =
    useUpdateContext();

  // form values
  const editor = useEditor({extensions: [StarterKit, Markdown]});
  const {control, setValue, formState} = useFormContext();
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
  const multipleOSxUpdates = (availableOSxVersions?.size || 0) > 1;
  const multiplePluginUpdates = (availablePluginVersions?.size || 0) > 1;

  const updateItems = [
    {
      id: 'os',
      label: osxUpdates.getProtocolUpdateLabel(osSelectedVersion?.version),
      releaseNote: osxUpdates.getReleaseNotes({
        releases,
        version: osSelectedVersion?.version,
      }),
      linkLabel: t('update.item.releaseNotesLabel'),
      ...(availableOSxVersions?.get(osSelectedVersion?.version ?? '')
        ?.isLatest && {
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
        disabled: !availableOSxVersions?.size,
      }),
    },
    {
      id: 'plugin',
      releaseNote: osxUpdates.getReleaseNotes({
        releases,
        version: pluginSelectedVersion?.version,
        isPlugin: true,
      }),
      label: osxUpdates.getPluginUpdateLabel(pluginSelectedVersion?.version),
      linkLabel: t('update.item.releaseNotesLabel'),
      ...(availablePluginVersions?.get(
        osxUpdates.getPluginVersion(pluginSelectedVersion?.version) ?? ''
      )?.isLatest && {
        tagLabelNatural: t('update.item.tagLatest'),
      }),
      ...(availablePluginVersions?.get(
        osxUpdates.getPluginVersion(pluginSelectedVersion?.version) ?? ''
      )?.isPrepared
        ? {
            tagLabelInfo: t('update.item.tagPrepared'),
          }
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
        disabled: !availablePluginVersions?.size,
      }),
    },
  ];

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
        currentVersion: osxUpdates.getProtocolUpdateLabel(versions),
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
    versions,
  ]);

  // set and remove plugin actions from form
  useEffect(() => {
    let index = 0;
    setValue('actions', []);
    if (updateFramework?.os && pluginSelectedVersion?.version) {
      setValue(`actions.${index}.name`, 'os_update');
      setValue(`actions.${index}.inputs.version`, osSelectedVersion?.version);
      index++;
    }
    if (updateFramework?.plugin && pluginSelectedVersion?.version) {
      setValue(`actions.${index}.name`, 'plugin_update');
      setValue(`actions.${index}.inputs`, {
        versionTag: pluginSelectedVersion?.version,
      });
    }
  }, [
    osSelectedVersion?.version,
    pluginSelectedVersion?.version,
    setValue,
    updateFramework?.os,
    updateFramework?.plugin,
  ]);

  // auto select the available updates by default if only one
  // update is present in a "framework"
  useEffect(() => {
    if (
      availableOSxVersions &&
      availablePluginVersions &&
      !formState.dirtyFields.actions
    ) {
      if (availableOSxVersions.size === 1) {
        setValue(`actions.0.name`, 'os_update');
        setValue(
          `actions.0.inputs.version`,
          availableOSxVersions.values().next().value.version
        );
        setValue('updateFramework.os', true);
      }

      if (availablePluginVersions.size === 1) {
        setValue(`actions.1.name`, 'plugin_update');
        setValue(`actions.1.inputs`, {
          versionTag: availablePluginVersions.values().next().value.version,
        });
        setValue('updateFramework.plugin', true);
      }
    }
  }, [
    availableOSxVersions,
    availablePluginVersions,
    formState.dirtyFields.actions,
    setValue,
  ]);

  /*************************************************
   *                     Render                    *
   *************************************************/
  return (
    <UpdateContainer>
      <UpdateGroupWrapper>
        <Controller
          name="updateFramework"
          rules={{required: 'Validate'}}
          control={control}
          render={({field: {onChange, value}}) => (
            <>
              {updateItems.map((data, index) => {
                if (!data.disabled)
                  return (
                    <UpdateListItem
                      key={index}
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
                  );
              })}
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
  className: 'flex md:flex-row flex-col gap-y-3 gap-x-6',
})``;

const UpdateContainer = styled.div.attrs({
  className: 'space-y-4',
})``;
