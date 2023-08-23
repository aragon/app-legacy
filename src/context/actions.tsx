import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import {useFieldArray, useFormContext} from 'react-hook-form';

import {ActionItem} from 'utils/types';

const ActionsContext = createContext<ActionsContextType | null>(null);

type ActionsContextType = {
  daoAddress: string;
  actions: ActionItem[];
  selectedActionIndex: number;
  setSelectedActionIndex: React.Dispatch<React.SetStateAction<number>>;
  addAction: (value: ActionItem) => void;
  duplicateAction: (index: number) => void;
  removeAction: (index: number) => void;
};

type ActionsProviderProps = {
  daoId: string;
};

const updatesMultisigVoting = (action: ActionItem) =>
  ['remove_address', 'add_address'].includes(action.name);

const hasEditMultisigAction = (actions: ActionItem[]) =>
  actions.some(action => action.name === 'modify_multisig_voting_settings');

const ActionsProvider: React.FC<ActionsProviderProps> = ({daoId, children}) => {
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [selectedActionIndex, setSelectedActionIndex] =
    useState<ActionsContextType['selectedActionIndex']>(0);

  const {control} = useFormContext();
  const {remove} = useFieldArray({control, name: 'actions'});

  const addAction = useCallback(newAction => {
    setActions(current => {
      const shouldAddEditMultisigAction =
        updatesMultisigVoting(newAction) && !hasEditMultisigAction(current);

      const newList = [...current, newAction];

      return shouldAddEditMultisigAction
        ? newList.concat({name: 'modify_multisig_voting_settings'})
        : newList;
    });
  }, []);

  const removeAction = useCallback(
    (index: number) => {
      setActions(current => {
        let newActions = current.filter((_, oldIndex) => oldIndex !== index);

        if (
          hasEditMultisigAction(newActions) &&
          !newActions.some(updatesMultisigVoting)
        ) {
          const indexOfMinApproval = newActions.findIndex(
            a => a.name === 'modify_multisig_voting_settings'
          );

          // remove from local context
          newActions = newActions.filter(
            (_, oldIndex) => oldIndex !== indexOfMinApproval
          );

          // remove from form
          remove(indexOfMinApproval);
        }

        return newActions;
      });

      remove(index);
    },
    [remove]
  );

  const duplicateAction = useCallback((index: number) => {
    setActions((oldActions: ActionsContextType['actions']) => [
      ...oldActions,
      oldActions[index],
    ]);
  }, []);

  const value = useMemo(
    (): ActionsContextType => ({
      daoAddress: daoId,
      actions,
      addAction,
      removeAction,
      duplicateAction,
      selectedActionIndex,
      setSelectedActionIndex,
    }),
    [
      daoId,
      actions,
      addAction,
      removeAction,
      duplicateAction,
      selectedActionIndex,
    ]
  );

  return (
    <ActionsContext.Provider value={value}>{children}</ActionsContext.Provider>
  );
};

function useActionsContext(): ActionsContextType {
  return useContext(ActionsContext) as ActionsContextType;
}

export {useActionsContext, ActionsProvider};
