import React, { createContext, Dispatch, useReducer, useContext } from "react";

interface IState {
  count: number;
  currentId: number;    // 当前选中test data
  allData: any;
}

const store: IState = {
  count: 0,
  currentId: 0,
  allData: {},
};

const reducer = (
  preState: IState,
  action: {
    type: string;
    payload?: any;
  }
) => {
  const { type, payload } = action;
  switch (type) {
    default:
      return preState;
    case "setCurrentId":
      return {
        ...preState,
        currentId: payload,
      };
    case "setAllData":
      return {
        ...preState,
        allData: payload,
        // ...payload,
      };
  }
};

interface IContext {
  state: IState;
  dispatch: Dispatch<{
    type: string;
    payload?: any;
  }>;
}

const Context = createContext<IContext>({
  state: store,
  dispatch: () => {},
});

export const ReducerContextProvider: React.FC<any> = (props) => {
  const [state, dispatch] = useReducer(reducer, store);

  return (
    <Context.Provider value={{ state, dispatch }}>
      {props.children}
    </Context.Provider>
  );
};

export const useReducerContext = () => {
  return useContext(Context);
};