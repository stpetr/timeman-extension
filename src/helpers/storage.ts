export const getStorageItem = async <T>(key: string): Promise<T> => {
  const result = await chrome.storage.local.get(key)
  return result[key]
}

export const setStorageItem = (key: string, value: any) => {
  chrome.storage.local.set({
    [key]: value
  })
}

export const getSyncStorageItem = async (key: string) => {
  const result = await chrome.storage.sync.get(key)
  return result[key]
}

export const setSyncStorageItem = (key: string, value: any) => {
  chrome.storage.sync.set({
    [key]: value
  })
}