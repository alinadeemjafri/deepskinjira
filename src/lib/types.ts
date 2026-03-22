export type Status = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE'
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface Attachment {
  id: string
  filename: string
  url: string
  size: number
  mimeType: string
  epicId: string | null
  storyId: string | null
  createdAt: string
}

export interface Story {
  id: string
  title: string
  description: string | null
  status: Status
  priority: Priority
  assignee: string | null
  storyPoints: number | null
  startDate: string | null
  endDate: string | null
  epicId: string
  epic?: Epic
  createdBy: string
  createdAt: string
  updatedAt: string
  attachments?: Attachment[]
}

export interface Epic {
  id: string
  title: string
  description: string | null
  status: Status
  priority: Priority
  assignee: string | null
  startDate: string | null
  endDate: string | null
  color: string
  createdBy: string
  createdAt: string
  updatedAt: string
  stories: Story[]
  attachments?: Attachment[]
}

export const STATUS_LABELS: Record<Status, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW: 'In Review',
  DONE: 'Done',
}

export const STATUS_COLORS: Record<Status, string> = {
  TODO: 'bg-gray-200 text-gray-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  IN_REVIEW: 'bg-yellow-100 text-yellow-700',
  DONE: 'bg-green-100 text-green-700',
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
}

export const PRIORITY_COLORS: Record<Priority, string> = {
  LOW: 'bg-gray-100 text-gray-600',
  MEDIUM: 'bg-blue-50 text-blue-600',
  HIGH: 'bg-orange-100 text-orange-600',
  CRITICAL: 'bg-red-100 text-red-600',
}

export const EPIC_COLORS = [
  '#3C2415', '#4A7C59', '#2563eb', '#7c3aed',
  '#db2777', '#ea580c', '#0891b2', '#4f46e5',
]
