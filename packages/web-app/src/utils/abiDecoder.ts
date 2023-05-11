/* eslint-disable @typescript-eslint/no-explicit-any */
import {keccak256, toUtf8Bytes} from 'ethers/lib/utils';
import {utils} from 'ethers';
import {BigNumber} from 'ethers/lib/ethers';
import BN from 'bn.js';

// Note: this code is dangerous if multiple ABIs are decoded at once in different
// async call chains

// Note: large numbers are not returned as strings but as BigNumber objects

// Code derived from Consensys's abi-decoder

const abiCoder = new utils.AbiCoder();

const state = {
  savedABIs: [] as any[],
  methodIDs: {} as Record<string, any>,
};

export function getABIs() {
  return state.savedABIs;
}

export function typeToString(input: any) {
  if (input.type === 'tuple') {
    return '(' + input.components.map(typeToString).join(',') + ')';
  }
  return input.type;
}

export function addABI(abiArray: any[]) {
  if (Array.isArray(abiArray)) {
    // Iterate new abi to generate method id"s
    abiArray.map((abi: any) => {
      if (abi.name) {
        const signature = keccak256(
          toUtf8Bytes(
            abi.name + '(' + abi.inputs.map(typeToString).join(',') + ')'
          )
        );
        if (abi.type === 'event') {
          state.methodIDs[signature.slice(2)] = abi;
        } else {
          state.methodIDs[signature.slice(2, 10)] = abi;
        }
      }
    });

    state.savedABIs = state.savedABIs.concat(abiArray);
  } else {
    throw new Error('Expected ABI array, got ' + typeof abiArray);
  }
}

export function removeABI(abiArray: any[]) {
  if (Array.isArray(abiArray)) {
    // Iterate new abi to generate method id"s
    abiArray.map((abi: any) => {
      if (abi.name) {
        const signature = keccak256(
          toUtf8Bytes(
            abi.name +
              '(' +
              abi.inputs
                .map((input: any) => {
                  return input.type;
                })
                .join(',') +
              ')'
          )
        );
        if (abi.type === 'event') {
          if (state.methodIDs[signature.slice(2)]) {
            delete state.methodIDs[signature.slice(2)];
          }
        } else {
          if (state.methodIDs[signature.slice(2, 10)]) {
            delete state.methodIDs[signature.slice(2, 10)];
          }
        }
      }
    });
  } else {
    throw new Error('Expected ABI array, got ' + typeof abiArray);
  }
}

export function getMethodIDs() {
  return state.methodIDs;
}

export function decodeMethod(data: any) {
  const methodID = data.slice(2, 10);
  const abiItem = state.methodIDs[methodID];
  if (abiItem) {
    const decoded = abiCoder.decode(abiItem.inputs, '0x' + data.slice(10));

    const retData = {
      name: abiItem.name,
      params: [] as any[],
    };

    for (let i = 0; i < decoded.length; i++) {
      const param = decoded[i];
      let parsedParam = param;
      const isUint = abiItem.inputs[i].type.indexOf('uint') === 0;
      const isInt = abiItem.inputs[i].type.indexOf('int') === 0;
      const isAddress = abiItem.inputs[i].type.indexOf('address') === 0;

      if (isUint || isInt) {
        const isArray = Array.isArray(param);

        if (isArray) {
          parsedParam = param.map(val => val.toString());
        } else {
          parsedParam = param.toString();
        }
      }

      // Addresses returned by web3 are randomly cased so we need to standardize and lowercase all
      if (isAddress) {
        const isArray = Array.isArray(param);

        if (isArray) {
          parsedParam = param.map(_ => _.toLowerCase());
        } else {
          parsedParam = param.toLowerCase();
        }
      }

      retData.params.push({
        name: abiItem.inputs[i].name,
        value: parsedParam,
        type: abiItem.inputs[i].type,
      });
    }

    return retData;
  }
}

export function decodeLogs(logs: any[]) {
  return logs
    .filter(log => log.topics.length > 0)
    .map(logItem => {
      const methodID = logItem.topics[0].slice(2);
      const method = state.methodIDs[methodID];
      if (method) {
        const logData = logItem.data;
        const decodedParams = [] as any[];
        let dataIndex = 0;
        let topicsIndex = 1;

        const dataTypes = [] as any[];
        method.inputs.map((input: any) => {
          if (!input.indexed) {
            dataTypes.push(input.type);
          }
        });

        const decodedData = abiCoder.decode(dataTypes, '0x' + logData.slice(2));

        // Loop topic and data to get the params
        method.inputs.map((param: any) => {
          const decodedP = {
            name: param.name,
            type: param.type,
            value: '',
          };

          if (param.indexed) {
            decodedP.value = logItem.topics[topicsIndex];
            topicsIndex++;
          } else {
            decodedP.value = decodedData[dataIndex];
            dataIndex++;
          }

          if (param.type === 'address') {
            decodedP.value = decodedP.value.toLowerCase();
            // 42 because len(0x) + 40
            if (decodedP.value.length > 42) {
              const toRemove = decodedP.value.length - 42;
              const temp = decodedP.value.split('');
              temp.splice(2, toRemove);
              decodedP.value = temp.join('');
            }
          }

          if (
            param.type === 'uint256' ||
            param.type === 'uint8' ||
            param.type === 'int'
          ) {
            // ensure to remove leading 0x for hex numbers
            if (
              typeof decodedP.value === 'string' &&
              decodedP.value.startsWith('0x')
            ) {
              decodedP.value = new BN(decodedP.value.slice(2), 16).toString(10);
            } else if ((decodedP.value as any) instanceof BigNumber) {
              decodedP.value = decodedP.value.toString();
            } else {
              decodedP.value = new BN(decodedP.value).toString(10);
            }
          }

          decodedParams.push(decodedP);
        });

        return {
          name: method.name,
          events: decodedParams,
          address: logItem.address,
        };
      }
    });
}
