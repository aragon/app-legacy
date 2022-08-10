import {ListItemAction} from '@aragon/ui-components';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import {useFormContext} from 'react-hook-form';
import React, {useState} from 'react';

import {FormItem} from '../addAddresses';
import {useActionsContext} from 'context/actions';
import {AccordionMethod} from 'components/accordionMethod';
import ConfigureWithdrawForm from 'containers/configureWithdraw';

type Props = {
  index: number;
};

const WithdrawAction: React.FC<Props> = ({index: actionIndex}) => {
  const {t} = useTranslation();
  const {setValue, clearErrors} = useFormContext();
  const {removeAction, duplicateAction, setActionsCounter} =
    useActionsContext();

  const resetWithdrawFields = () => {
    clearErrors(`actions.${actionIndex}`);
    setValue(`actions.${actionIndex}`, {
      to: '',
      amount: '',
      tokenAddress: '',
      tokenSymbol: '',
    });
  };

  const methodActions = [
    {
      component: <ListItemAction title={t('labels.duplicateAction')} bgWhite />,
      callback: () => duplicateAction(actionIndex),
    },
    {
      component: <ListItemAction title={t('labels.resetAction')} bgWhite />,
      callback: resetWithdrawFields,
    },
    {
      component: (
        <ListItemAction title={t('labels.removeEntireAction')} bgWhite />
      ),
      callback: () => removeAction(actionIndex),
    },
  ];

  return (
    <AccordionMethod
      verified
      type="action-builder"
      methodName={t('AddActionModal.withdrawAssets')}
      dropdownItems={methodActions}
      smartContractName={t('labels.aragonCore')}
      methodDescription={t('AddActionModal.withdrawAssetsActionSubtitle')}
    >
      <FormItem className="py-3 space-y-3 rounded-b-xl">
        <ConfigureWithdrawForm
          index={actionIndex}
          setActionsCounter={setActionsCounter}
        />
      </FormItem>
    </AccordionMethod>
    // <Container>
    //   <Header>
    //     <HCWrapper>
    //       <Title>{t('AddActionModal.withdrawAssets')}</Title>
    //       <Description>
    //         {t('AddActionModal.withdrawAssetsActionSubtitle')}
    //       </Description>
    //     </HCWrapper>
    //     <Popover
    //       open={openMenu}
    //       onOpenChange={setOpenMenu}
    //       side="bottom"
    //       align="end"
    //       width={264}
    //       content={
    //         <div className="p-1.5 space-y-0.5">
    //           <ListItemAction
    //             title={t('labels.duplicateAction')}
    //             onClick={() => {
    //               duplicateAction(index);
    //               setOpenMenu(false);
    //             }}
    //             bgWhite
    //           />
    //           <ListItemAction
    //             title={t('labels.resetAction')}
    //             onClick={() => {
    //               resetWithdrawFields();
    //               setOpenMenu(false);
    //             }}
    //             bgWhite
    //           />
    //           <ListItemAction
    //             title={t('labels.removeEntireAction')}
    //             onClick={() => {
    //               removeAction(index);
    //               setOpenMenu(false);
    //             }}
    //             bgWhite
    //           />
    //         </div>
    //       }
    //     >
    //       <ButtonIcon
    //         mode="ghost"
    //         size="large"
    //         icon={<IconMenuVertical />}
    //         data-testid="trigger"
    //       />
    //     </Popover>
    //   </Header>
    //   <Body>
    //     <ConfigureWithdrawForm
    //       index={index}
    //       setActionsCounter={setActionsCounter}
    //     />
    //   </Body>
    // </Container>
  );
};

export default WithdrawAction;

const Container = styled.div.attrs({
  className: 'bg-ui-0 rounded-xl p-3',
})``;

const Header = styled.div.attrs({
  className: 'flex justify-between items-center',
})``;

const Body = styled.div.attrs({
  className: 'bg-ui-50 p-3 rounded-xl space-y-3 mt-3',
})``;

const Title = styled.h2.attrs({
  className: 'text-base font-bold text-ui-800',
})``;

const Description = styled.p.attrs({
  className: 'text-sm text-ui-600',
})``;

const HCWrapper = styled.div.attrs({
  className: 'space-y-0.5',
})``;
