import TransactionHistory from './transactionHistory'

export default interface Investment {
  transactionType: 'units' | 'amount'
  transactionHistory: TransactionHistory[] | []
  updateSource: 'others' | 'bsebhav' | 'nsebhav' | 'mfapi' | 'amfi'
  tag?: string
  lookupId: string | number
  name: string
}
