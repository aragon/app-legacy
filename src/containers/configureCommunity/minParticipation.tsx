import React, {FC, useState, useMemo} from 'react';
import {Controller, useFormContext, useWatch} from 'react-hook-form';
import {AlertInline, Label, LinearProgress, NumberInput} from '@aragon/ods-old';
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

  const minParticipationTokensAmount =
    govTokenTotalSupply * (Number(minimumParticipationPercentage) / 100);

  const percentageInputValidator = (value: string | number) => {
    return Number(value) <= 100 && Number(value) >= 0
      ? true
      : t('errors.percentage');
  };

  const formattedProgressMinParticipation = useMemo(() => {
    const prefix =
      minParticipationTokensAmount < govTokenTotalSupply ? '≥' : '';

    // More than 100 trillion (otherwise formatting fails on bigger numbers)
    if (minParticipationTokensAmount > 1e14) {
      return `${prefix}100t`;
    }

    return `${prefix}${numeral(minParticipationTokensAmount).format(
      govTokenTotalSupply < 100 ? '0.[000]' : '0.[0]a'
    )}`;
  }, [govTokenTotalSupply, minParticipationTokensAmount]);

  const formattedProgressTotalSupply = useMemo(() => {
    // More than 100 trillion (otherwise formatting fails on bigger numbers)
    if (govTokenTotalSupply > 1e14) {
      return '> 100t';
    }

    return numeral(govTokenTotalSupply).format(
      govTokenTotalSupply < 100 ? '0.[000]' : '0.[0]a'
    );
  }, [govTokenTotalSupply]);

  const formattedTotalSupply = useMemo(() => {
    // More than 100 trillion (otherwise formatting fails on bigger numbers)
    if (tokenTotalSupply > 1e14) {
      return '> 100t';
    }

    return numeral(tokenTotalSupply).format(
      tokenTotalSupply < 100 ? '0,0.[000]' : '0,0'
    );
  }, [tokenTotalSupply]);

  const formattedGovTokenTotalSupply = useMemo(() => {
    // More than 100 trillion (otherwise formatting fails on bigger numbers)
    if (govTokenTotalSupply > 1e14) {
      return '> 100t';
    }

    return numeral(govTokenTotalSupply).format(
      govTokenTotalSupply < 100 ? '0,0.[000]' : '0,0'
    );
  }, [govTokenTotalSupply]);

  const formattedMinParticipationTokensAmount = useMemo(() => {
    // More than 100 trillion (otherwise formatting fails on bigger numbers)
    if (minParticipationTokensAmount > 1e14) {
      return '> 100t';
    }

    return numeral(minParticipationTokensAmount).format(
      minParticipationTokensAmount < 100 ? '0,0.[000]' : '0,0'
    );
  }, [minParticipationTokensAmount]);

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
              <Container
                style={
                  isGovTokenRequiresWrapping
                    ? {
                        boxShadow:
                          '0px 0px 1px 0px hsla(210, 24%, 16%, 0.04), 0px 0px 2px 0px hsla(210, 24%, 16%, 0.06), 0px 4px 8px 0px hsla(210, 24%, 16%, 0.04)',
                      }
                    : {}
                }
              >
                <ApprovalWrapper>
                  <div className="md:w-1/3">
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
                      value={govTokenTotalSupply * (value / 100)}
                    />

                    <ProgressInfo2>
                      <p
                        className="text-right font-semibold text-primary-500"
                        style={{
                          flexBasis: `${
                            (minParticipationTokensAmount /
                              govTokenTotalSupply) *
                            100
                          }%`,
                        }}
                      >
                        {formattedProgressMinParticipation}
                      </p>

                      <p className="shrink-0 text-neutral-600">
                        {t('createDAO.step4.alerts.minimumApprovalAlert', {
                          amount: formattedProgressTotalSupply,
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
                          className="text-neutral-600 ft-text-sm"
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
                      <div className="md:w-1/3">
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
                          {formattedTotalSupply}{' '}
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
                          {formattedGovTokenTotalSupply}{' '}
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
                          {formattedMinParticipationTokensAmount}{' '}
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
  className: 'pt-8 xl:pt-6 p-6 space-x-6 rounded-xl bg-neutral-0 relative z-10',
})``;

const SubContainerWrapper = styled.div.attrs({
  className: 'px-2',
})``;

const SubContainer = styled.div.attrs({
  className: 'p-6 space-y-6 rounded-b-xl bg-neutral-0',
})``;

const SimulationSection = styled.div.attrs({
  className: 'space-y-3',
})``;

const Divider = styled.div.attrs({
  className: 'w-full h-px bg-neutral-100',
})``;

const StatItem = styled.div.attrs({
  className: 'space-y-2 md:space-y-0 md:space-x-2 md:flex md:justify-between',
})``;

const StatItemValue = styled.div.attrs({
  className: 'text-neutral-600',
})``;

const ApprovalWrapper = styled.div.attrs({
  className:
    'flex flex-col flex-col-reverse md:flex-row space-y-6 space-y-reverse md:space-y-0 md:space-x-6',
})``;

const LinearProgressContainer = styled.div.attrs({
  className: 'flex relative flex-1 items-center',
})``;

const ProgressInfo2 = styled.div.attrs({
  className:
    'flex absolute -top-5 xl:-top-2 justify-between space-x-0.5 w-full text-sm',
})``;
