export const getStorageItem = async <T>(key: string, defaultValue?: T): Promise<T> => {
  const result = await chrome.storage.local.get(key)
  if (typeof result[key] === 'undefined' && typeof defaultValue !== 'undefined') {
    return defaultValue
  }

  return result[key]
}

export const setStorageItem = async <T>(key: string, value: T) => {
  await chrome.storage.local.set({
    [key]: value
  })
}
