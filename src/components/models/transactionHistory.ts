export default interface TransactionHistory {
  investedAmount: number
  currentHolding: number
  transactionDate: Date
}

export class DummyTransactionHistory implements TransactionHistory {
  investedAmount = 0
  currentHolding = 0
  transactionDate = new Date()
}
