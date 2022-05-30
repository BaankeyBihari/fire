function getFirstDayOfNextMonth(date: Date) {
  const d = new Date(date.getFullYear(), date.getMonth() + 1, 1)
  return new Date(d.toDateString())
}

export default getFirstDayOfNextMonth
