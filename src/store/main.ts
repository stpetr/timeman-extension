import { create, StateCreator } from 'zustand'
import dayjs from 'dayjs'

import {
  STORAGE_ACTIVITIES,
  STORAGE_ACTIVITIES_LOG,
  STORAGE_ACTIVITY_START_TIME,
  STORAGE_CURRENT_ACTIVITY_ID,
} from 'config/constants'
import { getStorageItem, setStorageItem } from 'helpers/storage'

import { Activity, ActivityLog, ActivityLogRecord } from 'types/index'

type MainStore = {
  activities: Activity[]
  todayLog: ActivityLogRecord[]
  currentActivityId: string
  currentActivityStartedAt: number
  setCurrentActivityId: (id: string | null) => void
  setCurrentActivityStartedAt: (time: number) => void
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
      } else if (key === STORAGE_ACTIVITY_START_TIME) {
        set({ currentActivityStartedAt: newValue || 0 })
      } else if (key === STORAGE_CURRENT_ACTIVITY_ID) {
        set({ currentActivityId: newValue || '' })
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

  getStorageItem<Activity[]>(STORAGE_ACTIVITIES).then((activities = []) => {
    set({ activities })
  })

  getStorageItem<number>(STORAGE_ACTIVITY_START_TIME).then((currentActivityStartedAt) => {
    if (currentActivityStartedAt) {
      set({ currentActivityStartedAt })
    }
  })

  getStorageItem<string>(STORAGE_CURRENT_ACTIVITY_ID).then((currentActivityId) => {
    if (currentActivityId) {
      set({ currentActivityId })
    }
  })

  getStorageItem<ActivityLog>(STORAGE_ACTIVITIES_LOG).then((activitiesLog) => {
    const todayDate = dayjs().format('YYYY-MM-DD')
    if (Array.isArray(activitiesLog?.[todayDate])) {
      set({ todayLog: activitiesLog[todayDate] })
    }
  })

  return {
    activities: [],
    todayLog: [],
    currentActivityStartedAt: 0,
    currentActivityId: '',
    setCurrentActivityId: async (id) => {
      setStorageItem(STORAGE_CURRENT_ACTIVITY_ID, id)
    },
    setCurrentActivityStartedAt: (time) => {
      setStorageItem(STORAGE_ACTIVITY_START_TIME, time)
    },
    createActivity: (newActivity) => {
      setStorageItem(STORAGE_ACTIVITIES, [newActivity, ...get().activities])
    },
    moveActivityToTop: (activityId) => {
      const activities = [...get().activities]
      const activityIndex = activities.findIndex(({ id }) => id === activityId)
      // Move activity only if it's not on top
      if (activityIndex > 0) {
        setStorageItem(STORAGE_ACTIVITIES, [
          activities[activityIndex],
          ...activities.slice(0, activityIndex),
          ...activities.slice(activityIndex + 1),
        ])
      }
    },
    logActivity: async (activityLogRecord) => {
      const todayDate = dayjs().format('YYYY-MM-DD')
      let activitiesLog = await getStorageItem<ActivityLog>(STORAGE_ACTIVITIES_LOG)
      if (!activitiesLog) {
        activitiesLog = {}
      }
      if (!Array.isArray(activitiesLog?.[todayDate])) {
        activitiesLog[todayDate] = []
      }
      activitiesLog[todayDate] = [...activitiesLog[todayDate], activityLogRecord]
      setStorageItem(STORAGE_ACTIVITIES_LOG, activitiesLog)
    },
  }
}

export const useMainStore = create<MainStore>(createMainStore)
