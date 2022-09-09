import {
  ButtonText,
  IconChevronRight,
  IconCommunity,
  ListItemHeader,
} from '@aragon/ui-components';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';
import styled from 'styled-components';

import {MembersList} from 'components/membersList';
import {Loading} from 'components/temporary';
import {useNetwork} from 'context/network';
import {useDaoMembers} from 'hooks/useDaoMembers';
import useScreen from 'hooks/useScreen';
import {
  Community,
  ManageMembersProposal,
  MintTokensProposal,
} from 'utils/paths';
import {PluginTypes} from 'hooks/usePluginClient';

type Props = {dao: string; pluginType: PluginTypes; horizontal?: boolean};

export const MembershipSnapshot: React.FC<Props> = ({
  dao,
  pluginType,
  horizontal,
}) => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {network} = useNetwork();
  const {isDesktop} = useScreen();

  const {
    data: {members, totalMembers},
    isLoading,
  } = useDaoMembers(dao, pluginType);

  const walletBased = pluginType === 'addresslistvoting.dao.eth';

  const headerButtonHandler = () => {
    walletBased
      ? navigate(generatePath(ManageMembersProposal, {network, dao}))
      : navigate(generatePath(MintTokensProposal, {network, dao}));
  };

  if (isLoading) return <Loading />;

  if (horizontal && isDesktop) {
    return (
      <div className="flex space-x-3">
        <div className="w-1/3">
          <ListItemHeader
            icon={<IconCommunity />}
            value={`${totalMembers} ${t('labels.members')}`}
            label={
              walletBased
                ? t('explore.explorer.walletBased')
                : t('explore.explorer.tokenBased')
            }
            buttonText={
              walletBased ? t('labels.manageMember') : t('labels.addMember')
            }
            orientation="vertical"
            onClick={headerButtonHandler}
          />
        </div>
        <div className="space-y-2 w-2/3">
          <ListItemGrid>
            <MembersList
              token={{
                id: '0x35f7A3379B8D0613c3F753863edc85997D8D0968',
                symbol: 'DTT',
              }}
              members={members}
            />
          </ListItemGrid>
          <ButtonText
            mode="secondary"
            size="large"
            iconRight={<IconChevronRight />}
            label={t('labels.seeAll')}
            onClick={() => navigate(generatePath(Community, {network, dao}))}
          />
        </div>
      </div>
    );
  }

  return (
    <VerticalContainer>
      <ListItemHeader
        icon={<IconCommunity />}
        value={`${totalMembers} ${t('labels.members')}`}
        label={
          walletBased
            ? t('explore.explorer.walletBased')
            : t('explore.explorer.tokenBased')
        }
        buttonText={
          walletBased ? t('labels.manageMember') : t('labels.addMember')
        }
        orientation="vertical"
        onClick={headerButtonHandler}
      />
      <MembersList
        token={{
          id: '0x35f7A3379B8D0613c3F753863edc85997D8D0968',
          symbol: 'DTT',
        }}
        members={members.slice(0, 3)}
      />
      <ButtonText
        mode="secondary"
        size="large"
        iconRight={<IconChevronRight />}
        label={t('labels.seeAll')}
        onClick={() => navigate(generatePath(Community, {network, dao}))}
      />
    </VerticalContainer>
  );
};

const VerticalContainer = styled.div.attrs({
  className: 'space-y-1.5 desktop:space-y-2',
})``;

const ListItemGrid = styled.div.attrs({
  className:
    'desktop:grid desktop:grid-cols-2 desktop:grid-flow-row desktop:gap-2',
})``;
