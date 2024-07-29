import { useEffect, useMemo, useState } from 'react'

import { SingleValue } from 'react-select'
import CreatableSelect from 'react-select/creatable'

import { nanoid } from 'nanoid'
import dayjs from 'dayjs'

import { useMainStore } from 'store/main'

import { t } from 'helpers/translations'
import { getTimeString } from 'helpers/date-time'

import styles from './main-view.module.scss'
import { Activity } from 'types/index'

type ActivityOption = {
  label: string
  value: string
}

export const MainView = () => {
  const {
    activities,
    todayLog,
    currentActivityId,
    currentActivityStartedAt,
    setCurrentActivityId,
    setCurrentActivityStartedAt,
    createActivity,
    logActivity,
    moveActivityToTop,
  } = useMainStore()
  const [currentTime, setCurrentTime] = useState(Date.now())
  const currentActivity = useMemo(
    () => {
      const activity = activities.find(({ id }) => id === currentActivityId)
      return activity ? activity : null
    },
    [activities, currentActivityId]
  )
  const currentActivityDuration = useMemo(
    () => getTimeString(Math.floor((currentTime - currentActivityStartedAt) / 1000)),
    [currentActivityStartedAt, currentTime]
  )

  const activitiesOptions = useMemo<ActivityOption[]>(
    () => activities.map(({id, name}) => ({label: name, value: id})),
    [activities]
  )

  const currentActivityOption = useMemo(
    () => currentActivity ? { label: currentActivity.name, value: currentActivity.id } : null,
    [currentActivity])

  const todayLogMapped = useMemo(
    () => {
      const activitiesMap: Record<string, Activity> = activities.reduce((acc, activity) => {
        return {
          ...acc,
          [activity.id]: activity,
        }
      }, {})
      return todayLog.map((el) => ({
        ...el,
        activity: activitiesMap[el.activityId] ?? {},
        duration: Math.floor((el.endedAt - el.startedAt) / 1000),
      }))
    },
    [activities, todayLog],
    )

  const todayDate = dayjs().format('YYYY-MM-DD')

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [currentActivityStartedAt])

  const handleStartActivity = () => {
    setCurrentActivityStartedAt(Date.now())
  }

  const handleEndActivity = async () => {
    const now = Date.now()
    logActivity({
      id: nanoid(),
      activityId: currentActivity?.id ?? '',
      startedAt: currentActivityStartedAt,
      endedAt: now
    })
    await moveActivityToTop(currentActivity?.id ?? '')
    await setCurrentActivityId(null)
    await setCurrentActivityStartedAt(now)
  }

  const handleActivityChange = (option: SingleValue<ActivityOption>) => {
    const activity = activities.find(({id}) => id === option?.value)
    if (activity) {
      setCurrentActivityId(activity.id)
    } else {
      console.error('Wrong activity received from select')
    }
  }

  const handleActivityCreate = async (name: string) => {
    const newActivity = { name, id: nanoid() }
    await createActivity(newActivity)
    await setCurrentActivityId(newActivity.id)
  }

  return (
    <div className={styles.mainView}>
      <span>{t('nowI')}</span>
      <CreatableSelect
        options={activitiesOptions}
        value={currentActivityOption}
        onChange={handleActivityChange}
        onCreateOption={handleActivityCreate}
      />
      <div>
        <span>{currentActivityDuration}</span>
      </div>
      <div>Today is: {todayDate}</div>
      {!currentActivityStartedAt ? (
        <button onClick={handleStartActivity}>Начать</button>
      ) : (
        <button onClick={handleEndActivity} disabled={!currentActivity}>Кончить</button>
      )}
      <div>
        Today's log:
        {todayLogMapped.map(({activity, duration}) => (
          <div>{activity.name ?? 'Deleted'}: {getTimeString(duration)}</div>
        ))}
      </div>
    </div>
  )
}
