export type Category = {
  id: string
  name: string
}

export type Activity = {
  id: string
  categoryId?: string
  name: string
}

export type ActivityLogRecord = {
  id: string
  activityId: string
  startedAt: number
  endedAt: number
}

export type ActivityLog = Record<string, ActivityLogRecord[]>
