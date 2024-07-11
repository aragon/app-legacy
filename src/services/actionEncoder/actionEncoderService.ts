import {DaoAction, TokenType, hexToBytes} from '@aragon/sdk-client-common';
import {IEncodeActionParams} from './actionEncoderService.api';
import {ethers} from 'ethers';
import {isNativeToken} from 'utils/tokens';
import {
  MultisigClient,
  MultisigVotingSettings,
  TokenVotingClient,
  WithdrawParams,
} from '@aragon/sdk-client';
import {GaslessVotingClient} from '@vocdoni/gasless-voting';
import {
  getDefaultPayableAmountInputName,
  translateToNetworkishName,
} from 'utils/library';
import {getEtherscanVerifiedContract} from 'services/etherscanAPI';
import {getModifyMetadataAction, getNonEmptyActions} from 'utils/proposals';
import {
  isGaslessVotingClient,
  isTokenVotingClient,
} from 'hooks/usePluginClient';
import {
  isGaslessVotingSettings,
  isMultisigVotingSettings,
} from 'services/aragon-sdk/queries/use-voting-settings';
import {
  SupportedNetworks,
  getNetworkDeployments,
  SupportedVersions,
} from '@aragon/osx-commons-configs';

class ActionEncoderService {
  encodeActions = async (params: IEncodeActionParams): Promise<DaoAction[]> => {
    const {
      actions,
      network,
      pluginClient,
      votingSettings,
      pluginAddress,
      client,
      daoAddress,
      versions,
      t,
    } = params;

    const validActions = getNonEmptyActions(
      actions,
      isMultisigVotingSettings(votingSettings) ? votingSettings : undefined,
      isGaslessVotingSettings(votingSettings) ? votingSettings : undefined
    );

    const translatedNetwork = translateToNetworkishName(network);

    const actionPromises: Array<Promise<DaoAction>> = [];

    for await (const action of validActions) {
      switch (action.name) {
        case 'withdraw_assets': {
          actionPromises.push(
            client.encoding.withdrawAction({
              amount: BigInt(
                ethers.utils
                  .parseUnits(action.amount.toString(), action.tokenDecimals)
                  .toString()
              ),

              recipientAddressOrEns: action.to.address,
              ...(isNativeToken(action.tokenAddress)
                ? {type: TokenType.NATIVE}
                : {type: TokenType.ERC20, tokenAddress: action.tokenAddress}),
            } as WithdrawParams)
          );
          break;
        }
        case 'mint_tokens': {
          action.inputs.mintTokensToWallets.forEach(mint => {
            actionPromises.push(
              Promise.resolve(
                (pluginClient as TokenVotingClient).encoding.mintTokenAction(
                  action.summary.daoTokenAddress,
                  {
                    address: mint.web3Address.address,
                    amount: BigInt(
                      ethers.utils
                        .parseUnits(mint.amount.toString(), 18)
                        .toString()
                    ),
                  }
                )
              )
            );
          });
          break;
        }
        case 'add_address': {
          const wallets = action.inputs.memberWallets.map(
            wallet => wallet.address
          );
          actionPromises.push(
            Promise.resolve(
              (
                pluginClient as MultisigClient | GaslessVotingClient
              ).encoding.addAddressesAction({
                pluginAddress: pluginAddress,
                members: wallets,
              })
            )
          );
          break;
        }
        case 'remove_address': {
          const wallets = action.inputs.memberWallets.map(
            wallet => wallet.address
          );
          if (wallets.length > 0)
            actionPromises.push(
              Promise.resolve(
                (
                  pluginClient as MultisigClient | GaslessVotingClient
                ).encoding.removeAddressesAction({
                  pluginAddress: pluginAddress,
                  members: wallets,
                })
              )
            );
          break;
        }
        case 'modify_multisig_voting_settings': {
          actionPromises.push(
            Promise.resolve(
              (
                pluginClient as MultisigClient
              ).encoding.updateMultisigVotingSettings({
                pluginAddress: pluginAddress,
                votingSettings: {
                  minApprovals: action.inputs.minApprovals,
                  onlyListed: (votingSettings as MultisigVotingSettings)
                    .onlyListed,
                },
              })
            )
          );
          break;
        }
        case 'external_contract_action': {
          const etherscanData = await getEtherscanVerifiedContract(
            action.contractAddress,
            network
          );

          if (
            etherscanData.status === '1' &&
            etherscanData.result[0].ABI !== 'Contract source code not verified'
          ) {
            const functionParams = action.inputs
              ?.filter(
                // ignore payable value
                input => input.name !== getDefaultPayableAmountInputName(t)
              )
              .map(input => {
                const param = input.value;

                if (typeof param === 'string' && param.indexOf('[') === 0) {
                  return JSON.parse(param);
                }
                return param;
              });

            const iface = new ethers.utils.Interface(
              etherscanData.result[0].ABI
            );
            const hexData = iface.encodeFunctionData(
              action.functionName,
              functionParams
            );

            actionPromises.push(
              Promise.resolve({
                to: action.contractAddress,
                value: ethers.utils.parseEther(action.value || '0').toBigInt(),
                data: hexToBytes(hexData),
              })
            );
          }
          break;
        }
        case 'wallet_connect_action': {
          actionPromises.push(
            Promise.resolve({value: BigInt(0), ...action.raw})
          );
          break;
        }
        case 'os_update': {
          if (
            translatedNetwork !== 'unsupported' &&
            Object.values(SupportedNetworks).includes(translatedNetwork) &&
            daoAddress &&
            versions
          ) {
            const daoFactoryAddress =
              getNetworkDeployments(translatedNetwork)[
                action.inputs.version as SupportedVersions
              ]?.DAOFactory.address;
            actionPromises.push(
              Promise.resolve(
                client.encoding.daoUpdateAction(daoAddress, {
                  previousVersion: versions as [number, number, number],
                  daoFactoryAddress,
                })
              )
            );
          }
          break;
        }

        case 'plugin_update': {
          const pluginUpdateActions =
            client.encoding.applyUpdateAndPermissionsActionBlock(daoAddress, {
              ...action.inputs,
            });
          pluginUpdateActions.map(daoAction => {
            actionPromises.push(Promise.resolve(daoAction));
          });
          break;
        }

        case 'modify_metadata': {
          const preparedAction = {...action};
          actionPromises.push(
            getModifyMetadataAction(preparedAction, daoAddress, client)
          );
          break;
        }
        case 'modify_gasless_voting_settings': {
          if (isGaslessVotingClient(pluginClient)) {
            actionPromises.push(
              Promise.resolve(
                pluginClient.encoding.updatePluginSettingsAction(
                  pluginAddress,
                  action.inputs
                )
              )
            );
          }
          break;
        }
        case 'modify_token_voting_settings': {
          if (isTokenVotingClient(pluginClient)) {
            actionPromises.push(
              Promise.resolve(
                pluginClient.encoding.updatePluginSettingsAction(
                  pluginAddress,
                  action.inputs
                )
              )
            );
          }
          break;
        }
      }
    }

    return Promise.all(actionPromises);
  };
}

export const actionEncoderService = new ActionEncoderService();
