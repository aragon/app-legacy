import {Address} from '@aragon/ui-components/dist/utils/addresses';
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
  daoAddress: Address;
  actions: ActionItem[];
  selectedActionIndex: number;
  setSelectedActionIndex: React.Dispatch<React.SetStateAction<number>>;
  addAction: (value: ActionItem) => void;
  duplicateAction: (index: number) => void;
  removeAction: (index: number) => void;
};

type ActionsProviderProps = {
  daoId: Address;
};

const ActionsProvider: React.FC<ActionsProviderProps> = ({daoId, children}) => {
  const [actions, setActions] = useState<ActionsContextType['actions']>([]);
  const [selectedActionIndex, setSelectedActionIndex] =
    useState<ActionsContextType['selectedActionIndex']>(0);

  const {control} = useFormContext();
  const {remove} = useFieldArray({control, name: 'actions'});

  const addAction = useCallback(newAction => {
    setActions(oldActions => [...oldActions, newAction]);
  }, []);

  const removeAction = useCallback(
    (index: number) => {
      const newActions = actions.filter((_, oldIndex) => oldIndex !== index);
      setActions(newActions);

      remove(index);
    },
    [actions, remove]
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
