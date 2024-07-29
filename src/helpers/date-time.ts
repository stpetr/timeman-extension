export const getTimeString = (secondsPassed: number) => {
  if (secondsPassed < 0) {
    secondsPassed = 0
  }
  const seconds = (secondsPassed % 60)
  const minutes = Math.floor(secondsPassed / 60 % 60)
  const hours = Math.floor(secondsPassed / 3600 % 24)

  const timeItems = [minutes, seconds]

  if (hours) {
    timeItems.unshift(hours)
  }

  return timeItems
    .map((el) => el.toString().padStart(2, '0'))
    .join(':')
}
