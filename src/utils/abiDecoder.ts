import {keccak256, toUtf8Bytes} from 'ethers/lib/utils';
import {utils} from 'ethers';
import {BigNumber} from 'ethers';

export interface Abi {
  name: string;
  type: string;
  inputs: utils.ParamType[];
  outputs: utils.ParamType[];
  constant: boolean;
  payable: boolean;
  stateMutability: string;
}

export interface DecodedParam {
  name: string;
  type: string;
  value: object | string | BigNumber;
}

// Note: this code is dangerous if multiple ABIs are decoded at once in different
// async call chains

// Note: large numbers are not returned as strings but as BigNumber objects

// Code derived from Consensys's abi-decoder

const abiCoder = new utils.AbiCoder();

const state = {
  savedABIs: [] as Abi[],
  methodIDs: {} as Record<string, Abi>,
};

export function getABIs() {
  return state.savedABIs;
}

function typeToString(input: utils.ParamType): string {
  if (input.type === 'tuple') {
    return '(' + input.components.map(typeToString).join(',') + ')';
  }
  return input.type;
}

export function addABI(abiArray: Abi[]) {
  if (Array.isArray(abiArray)) {
    // Iterate new abi to generate method id"s
    abiArray.map((abi: Abi) => {
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

export function removeABI(abiArray: Abi[]) {
  if (Array.isArray(abiArray)) {
    // Iterate new abi to generate method id"s
    abiArray.map((abi: Abi) => {
      if (abi.name) {
        const signature = keccak256(
          toUtf8Bytes(
            abi.name +
              '(' +
              abi.inputs
                .map((input: utils.ParamType) => {
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

export function decodeMethod(data: string) {
  const methodID = data.slice(2, 10);
  const abiItem = state.methodIDs[methodID];
  if (abiItem) {
    const decoded = abiCoder.decode(abiItem.inputs, '0x' + data.slice(10));

    const retData = {
      name: abiItem.name,
      params: [] as DecodedParam[],
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
