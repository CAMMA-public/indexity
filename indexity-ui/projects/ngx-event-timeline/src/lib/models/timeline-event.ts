export interface TimelineEvent {
  id: string | number; // unique identifier
  title: string; // displayed title
  alt?: string; // alternative text
  data?: any; // arbitrary payload data
  eventType: string; // type category TimelineEventType::type
  timestamp: number; // start time in ms
  duration?: number; // duration in ms
  oneShot?: boolean; // event doesn't have a duration
}
