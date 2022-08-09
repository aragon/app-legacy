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

import {Loading} from 'components/temporary';
import {useNetwork} from 'context/network';
import {useDaoMembers} from 'hooks/useDaoMembers';
import useScreen from 'hooks/useScreen';
import {Community, MintTokensProposal} from 'utils/paths';
import {MembersList} from 'components/membersList';

type Props = {dao: string; walletBased: boolean; horizontal?: boolean};

export const MembershipSnapshot: React.FC<Props> = ({
  dao,
  walletBased,
  horizontal,
}) => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {network} = useNetwork();
  const {isDesktop} = useScreen();

  const {
    data: {members, totalMembers, token},
    isLoading,
  } = useDaoMembers(dao);

  const headerButtonHandler = () => {
    walletBased
      ? alert('This will soon take you to a page that lets you add members')
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
              walletBased ? t('labels.addMember') : t('labels.mintTokens')
            }
            orientation="vertical"
            onClick={headerButtonHandler}
          />
        </div>
        <div className="space-y-2 w-2/3">
          <ListItemGrid>
            <MembersList token={token} members={members} />
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
          walletBased ? t('labels.addMember') : t('labels.mintTokens')
        }
        orientation="vertical"
        onClick={headerButtonHandler}
      />
      <MembersList token={token} members={members.slice(0, 3)} />
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
