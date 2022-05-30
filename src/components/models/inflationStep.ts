export default interface InflationStep {
  inflation: number
  recordDate: Date
}

export class DummyInflationStep implements InflationStep {
  inflation = 0
  recordDate = new Date()
}
