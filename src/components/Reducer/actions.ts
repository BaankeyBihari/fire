export type ActionTypes = 'RESET' | 'LOAD' | 'UPDATE_INVESTMENTS' | 'UPDATE_INFLATION' | 'UPDATE_PLAN'

export interface Action {
    actionType: string
    payload: any
}

const ActionName = {
  RESET: 'RESET',
  LOAD: 'LOAD',
  UPDATE_INVESTMENTS: 'UPDATE_INVESTMENTS',
  UPDATE_INFLATION: 'UPDATE_INFLATION',
  UPDATE_PLAN: 'UPDATE_PLAN',
};

export default ActionName;
