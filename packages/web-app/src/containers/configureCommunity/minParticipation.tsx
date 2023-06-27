import React, {FC, useState, useMemo} from 'react';
import {Controller, useFormContext, useWatch} from 'react-hook-form';
import {
  AlertInline,
  Label,
  LinearProgress,
  NumberInput,
} from '@aragon/ui-components';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {htmlIn} from 'utils/htmlIn';
import {gTokenSymbol} from 'utils/tokens';
import numeral from 'numeral';

export const MinParticipation: FC = () => {
  const {t} = useTranslation();

  const {control} = useFormContext();

  const [
    tokenTotalSupply,
    tokenSymbol,
    tokenType,
    isCustomToken,
    minimumParticipationPercentage,
  ] = useWatch({
    name: [
      'tokenTotalSupply',
      'tokenSymbol',
      'tokenType',
      'isCustomToken',
      'minimumParticipation',
    ],
  });

  const isGovTokenRequiresWrapping = !isCustomToken && tokenType === 'ERC-20';

  const [
    simulatedWrappedTokensPercentage,
    setSimulatedWrappedTokensPercentage,
  ] = useState('10');

  const govTokenSymbol = isGovTokenRequiresWrapping
    ? gTokenSymbol(tokenSymbol)
    : tokenSymbol;

  const govTokenTotalSupply = useMemo(() => {
    const simulatedWrappedTokenTotalSupply =
      tokenTotalSupply * (Number(simulatedWrappedTokensPercentage) / 100);

    return isGovTokenRequiresWrapping
      ? simulatedWrappedTokenTotalSupply
      : tokenTotalSupply;
  }, [
    isGovTokenRequiresWrapping,
    simulatedWrappedTokensPercentage,
    tokenTotalSupply,
  ]);

  const minParticipationTokensAmount = Math.ceil(
    govTokenTotalSupply * (Number(minimumParticipationPercentage) / 100)
  );

  const percentageInputValidator = (value: string | number) => {
    return Number(value) <= 100 && Number(value) >= 0
      ? true
      : t('errors.percentage');
  };

  return (
    <>
      <Label
        label={t('labels.minimumParticipation')}
        helpText={t('createDAO.step4.minimumParticipationSubtitle', {
          gTokenSymbol: govTokenSymbol,
        })}
      />
      <Controller
        name="minimumParticipation"
        control={control}
        defaultValue="15"
        rules={{
          validate: value => percentageInputValidator(value),
        }}
        render={({
          field: {onBlur, onChange, value, name},
          fieldState: {error},
        }) => (
          <>
            <div>
              <Container>
                <ApprovalWrapper>
                  <div className="tablet:w-1/3">
                    <NumberInput
                      name={name}
                      value={value}
                      onBlur={onBlur}
                      onChange={onChange}
                      placeholder={t('placeHolders.daoName')}
                      view="percentage"
                    />
                  </div>

                  <LinearProgressContainer>
                    <LinearProgress
                      max={govTokenTotalSupply}
                      value={Math.ceil(govTokenTotalSupply * (value / 100))}
                    />

                    <ProgressInfo2>
                      <p
                        className="font-bold text-right text-primary-500"
                        style={{
                          flexBasis: `${
                            (minParticipationTokensAmount /
                              govTokenTotalSupply) *
                            100
                          }%`,
                        }}
                      >
                        {minParticipationTokensAmount < govTokenTotalSupply
                          ? '≥'
                          : ''}
                        {numeral(minParticipationTokensAmount).format('0.[0]a')}
                      </p>

                      <p className="flex-shrink-0 text-ui-600">
                        {t('createDAO.step4.alerts.minimumApprovalAlert', {
                          amount: numeral(govTokenTotalSupply).format('0.[0]a'),
                          tokenSymbol: govTokenSymbol,
                        })}
                      </p>
                    </ProgressInfo2>
                  </LinearProgressContainer>
                </ApprovalWrapper>
              </Container>

              {/* Simulation for existing tokens which require wrapping */}
              {isGovTokenRequiresWrapping && (
                <SubContainerWrapper>
                  <SubContainer>
                    {/* Header */}
                    <SimulationSection>
                      <div className="space-y-0.5">
                        <Label
                          label={t('createDAO.step4.wrappedReferenceTitle')}
                        />
                        <div
                          className="text-ui-600 ft-text-sm"
                          dangerouslySetInnerHTML={{
                            __html: htmlIn(t)(
                              'createDAO.step4.wrappedReferenceDesc',
                              {
                                tokenSymbol,
                                gTokenSymbol: gTokenSymbol(tokenSymbol),
                              }
                            ),
                          }}
                        />
                      </div>
                      <AlertInline
                        label={
                          t(
                            'createDAO.step4.wrappedReferenceAlertInfo'
                          ) as string
                        }
                        mode="neutral"
                      />
                    </SimulationSection>

                    {/* Simulation percentage field */}
                    <SimulationSection>
                      <Label
                        label={t('createDAO.step4.wrappedReferenceLabel', {
                          tokenSymbol,
                        })}
                      />
                      <div className="tablet:w-1/3">
                        <NumberInput
                          value={simulatedWrappedTokensPercentage}
                          onChange={e =>
                            setSimulatedWrappedTokensPercentage(e.target.value)
                          }
                          view="percentage"
                        />
                      </div>
                    </SimulationSection>

                    {/* Simulation stats */}
                    <SimulationSection>
                      <StatItem>
                        <Label
                          label={t('createDAO.step4.wrappedReferenceSupply', {
                            tokenSymbol,
                          })}
                        />

                        <StatItemValue>
                          {numeral(tokenTotalSupply).format('0,0')}{' '}
                          {t('createDAO.step4.wrappedReferenceValueLabel', {
                            tokenSymbol,
                          })}
                        </StatItemValue>
                      </StatItem>

                      <Divider />

                      <StatItem>
                        <Label
                          label={t(
                            'createDAO.step4.wrappedReferenceFullParticipation'
                          )}
                          helpText={t(
                            'createDAO.step4.wrappedReferenceParticipationDesc',
                            {
                              gTokenSymbol: gTokenSymbol(tokenSymbol),
                            }
                          )}
                        />

                        <StatItemValue>
                          {numeral(govTokenTotalSupply).format('0,0')}{' '}
                          {t(
                            'createDAO.step4.wrappedReferenceParticipationValueLabel',
                            {
                              gTokenSymbol: gTokenSymbol(tokenSymbol),
                            }
                          )}
                        </StatItemValue>
                      </StatItem>

                      <Divider />

                      <StatItem>
                        <Label
                          label={t(
                            'createDAO.step4.wrappedReferenceMinParticipation'
                          )}
                          helpText={t(
                            'createDAO.step4.wrappedReferenceMinParticipationDesc',
                            {
                              minParticipationValue: `${minimumParticipationPercentage}%`,
                              gTokenSymbol: gTokenSymbol(tokenSymbol),
                            }
                          )}
                        />

                        <StatItemValue>
                          {numeral(minParticipationTokensAmount).format('0,0')}{' '}
                          {t(
                            'createDAO.step4.wrappedReferenceParticipationValueLabel',
                            {
                              gTokenSymbol: gTokenSymbol(tokenSymbol),
                            }
                          )}
                        </StatItemValue>
                      </StatItem>
                    </SimulationSection>
                  </SubContainer>
                </SubContainerWrapper>
              )}
            </div>

            {error?.message && (
              <AlertInline label={error.message} mode="critical" />
            )}
          </>
        )}
      />
    </>
  );
};

const Container = styled.div.attrs({
  className: 'p-3 space-x-3 rounded-xl bg-ui-0',
})``;

const SubContainerWrapper = styled.div.attrs({
  className: 'px-1',
})``;

const SubContainer = styled.div.attrs({
  className: 'p-3 space-y-3 rounded-b-xl bg-ui-0',
})``;

const SimulationSection = styled.div.attrs({
  className: 'space-y-1.5',
})``;

const Divider = styled.div.attrs({
  className: 'w-full h-px bg-ui-100',
})``;

const StatItem = styled.div.attrs({
  className:
    'space-y-1 tablet:space-y-0 tablet:space-x-1 tablet:flex tablet:justify-between',
})``;

const StatItemValue = styled.div.attrs({
  className: 'text-ui-600',
})``;

const ApprovalWrapper = styled.div.attrs({
  className:
    'flex flex-col tablet:flex-row space-y-1.5 tablet:space-y-0 tablet:space-x-3',
})``;

const LinearProgressContainer = styled.div.attrs({
  className: 'flex relative flex-1 items-center',
})``;

const ProgressInfo2 = styled.div.attrs({
  className: 'flex absolute -top-1 justify-between space-x-0.5 w-full text-sm',
})``;
