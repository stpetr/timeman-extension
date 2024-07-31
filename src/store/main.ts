import { create, StateCreator } from 'zustand'
import dayjs from 'dayjs'

import {
  STORAGE_CATEGORIES,
  STORAGE_ACTIVITIES,
  STORAGE_ACTIVITIES_LOG,
  STORAGE_ACTIVITY_START_TIME,
  STORAGE_CURRENT_ACTIVITY_ID,
} from 'config/constants'
import { getStorageItem, setStorageItem } from 'helpers/storage'

import { Activity, ActivityLog, ActivityLogRecord, Category } from 'types/index'

type MainStore = {
  activities: Activity[]
  categories: Category[]
  todayLog: ActivityLogRecord[]
  currentActivityId: string | null
  currentActivityStartedAt: number
  setCurrentActivityId: (id: string | null) => void
  setCurrentActivityStartedAt: (time: number) => void
  createCategory: (category: Category) => void
  createActivity: (activity: Activity) => void
  moveActivityToTop: (activityId: string) => void
  logActivity: (activity: ActivityLogRecord) => void
}

const createMainStore: StateCreator<MainStore> = (set, get) => {
  chrome.storage.onChanged.addListener((changes, namespace) => {
    const todayDate = dayjs().format('YYYY-MM-DD')
    for (const [key, { oldValue, newValue }] of Object.entries(changes)) {
      if (key === STORAGE_ACTIVITIES) {
        set({ activities: newValue })
      } else if (key === STORAGE_CATEGORIES) {
        set({ categories: newValue })
      } else if (key === STORAGE_ACTIVITY_START_TIME) {
        set({ currentActivityStartedAt: newValue || 0 })
      } else if (key === STORAGE_CURRENT_ACTIVITY_ID) {
        set({ currentActivityId: newValue || null })
      } else if (key === STORAGE_ACTIVITIES_LOG) {
        const todayLog = Array.isArray(newValue[todayDate]) ? newValue[todayDate] : []
        set({ todayLog })
      }

      // @todo remove the log
      console.log(
        `Storage key "${key}" in namespace "${namespace}" changed.`,
        `Old value was "${oldValue}", new value is "${newValue}".`
      )
    }
  })

  getStorageItem<Category[]>(STORAGE_CATEGORIES, []).then((categories) => {
    set({ categories })
  })

  getStorageItem<Activity[]>(STORAGE_ACTIVITIES, []).then((activities = []) => {
    set({ activities })
  })

  getStorageItem<number>(STORAGE_ACTIVITY_START_TIME, 0).then((currentActivityStartedAt) => {
    if (currentActivityStartedAt) {
      set({ currentActivityStartedAt })
    }
  })

  getStorageItem<string | null>(STORAGE_CURRENT_ACTIVITY_ID, null).then((currentActivityId) => {
    set({ currentActivityId })
  })

  getStorageItem<ActivityLog>(STORAGE_ACTIVITIES_LOG, {}).then((activitiesLog) => {
    const todayDate = dayjs().format('YYYY-MM-DD')
    if (Array.isArray(activitiesLog?.[todayDate])) {
      set({ todayLog: activitiesLog[todayDate] })
    }
  })

  return {
    categories: [],
    activities: [],
    todayLog: [],
    currentActivityStartedAt: 0,
    currentActivityId: null,
    setCurrentActivityId: async (id) => {
      await setStorageItem(STORAGE_CURRENT_ACTIVITY_ID, id)
    },
    setCurrentActivityStartedAt: async (time) => {
      await setStorageItem(STORAGE_ACTIVITY_START_TIME, time)
    },
    createCategory: async (newCategory) => {
      await setStorageItem(STORAGE_CATEGORIES, [...get().categories, newCategory])
    },
    createActivity: async (newActivity) => {
      await setStorageItem(STORAGE_ACTIVITIES, [newActivity, ...get().activities])
    },
    moveActivityToTop: async (activityId) => {
      const activities = [...get().activities]
      const activityIndex = activities.findIndex(({ id }) => id === activityId)
      // Move activity only if it's not on top
      if (activityIndex > 0) {
        await setStorageItem(STORAGE_ACTIVITIES, [
          activities[activityIndex],
          ...activities.slice(0, activityIndex),
          ...activities.slice(activityIndex + 1),
        ])
      }
    },
    logActivity: async (activityLogRecord) => {
      const todayDate = dayjs().format('YYYY-MM-DD')
      const activitiesLog = await getStorageItem<ActivityLog>(STORAGE_ACTIVITIES_LOG, {})
      if (!Array.isArray(activitiesLog?.[todayDate])) {
        activitiesLog[todayDate] = []
      }
      activitiesLog[todayDate] = [...activitiesLog[todayDate], activityLogRecord]
      await setStorageItem(STORAGE_ACTIVITIES_LOG, activitiesLog)
    },
  }
}

export const useMainStore = create<MainStore>(createMainStore)
