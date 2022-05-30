export type ActionTypes =
  | 'RESET'
  | 'LOAD'
  | 'CREATE_INVESTMENT'
  | 'UPDATE_INVESTMENT'
  | 'CREATE_INFLATION'
  | 'UPDATE_INFLATION'
  | 'UPDATE_PLAN'
  | 'EVALUATE_PLAN'

export interface Action {
  actionType: string
  payload: any
}

const ActionName = {
  RESET: 'RESET',
  LOAD: 'LOAD',
  CREATE_INVESTMENT: 'CREATE_INVESTMENT',
  UPDATE_INVESTMENT: 'UPDATE_INVESTMENT',
  CREATE_INFLATION: 'CREATE_INFLATION',
  UPDATE_INFLATION: 'UPDATE_INFLATION',
  UPDATE_PLAN: 'UPDATE_PLAN',
  EVALUATE_PLAN: 'EVALUATE_PLAN',
}

export default ActionName
