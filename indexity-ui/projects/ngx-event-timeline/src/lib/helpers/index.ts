import {TimelineEvent, TimelineEventType} from '../../index';

export const uniq = <T>(a: Array<T>): Array<T> => [...new Set(a)];

export const groupEvents = (events: TimelineEvent[]) => {
  const groups = uniq(events.map(e => e.eventType));

  return groups
    .reduce<{[k: string]: Array<TimelineEvent>}>(
      (acc, curr) => ({
        ...acc,
        [curr]: events.filter(e => e.eventType === curr)
      }),
      {}
    );
};

export const stringToColour = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let colour = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    colour += ('00' + value.toString(16)).substr(-2);
  }
  return colour;
};

export const toHumanReadable = (str: string, capitalize = true) => {
  str = str.replace('INDEXITY.', '');
  return `${capitalize ? str.charAt(0).toUpperCase() : ''}${
    str
      .split('_').join(' ')
      .split('.').join(' ')
      .split('-').join(' ')
      .toLocaleLowerCase()
      .slice(capitalize ? 1 : 0)
  }`;
};

export const eventItemWidth = (eventDuration: number, totalTime: number, timelineWidth: number) => {
  return eventDuration * timelineWidth / totalTime;
};

export const eventItemPosition = (eventTimestamp: number, totalTime: number, timelineWidth: number) => {
  return eventTimestamp * timelineWidth / totalTime;
};

export const timestampToPosition = (timestamp: number, totalTime: number, timelineWidth: number) => {
  return timestamp * timelineWidth / totalTime;
};

export const timestampIncludesEvent = (timestamp: number) => (event: TimelineEvent) => {
  return (timestamp >= event.timestamp && timestamp <= event.timestamp + event.duration);
};

export const eventTypeIsEnabled = (disabledEventTypes: TimelineEventType[]) => (event: TimelineEvent) => {
  return !disabledEventTypes.map(et => et.type).includes(event.eventType);
};


export const eventIsEnabled = (disabledEventIds: Array<number | string>) => (event: TimelineEvent) => {
  return !disabledEventIds.includes(event.id);
};

export const msToTime = (ms: number) => {
  return new Date(ms).toISOString().slice(11, -1);
};

export const msToSeconds = (ms: number) => {
  return ms * 0.001;
};

export const filterEvents = (events: TimelineEvent[], predicate) => {
  return events.filter(predicate);
};


export const arraysEqual = (arr1, arr2) => {
  if (arr1.length !== arr2.length) {
    return false;
  }
  for (let i = arr1.length; i--;) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }
  return true;
};

export const normalizeEvent = (event: TimelineEvent): TimelineEvent => {
  // TODO: 35 magic number will need to be dynamically calculated
  if (!event.duration || event.duration < 35) {
    event = {
      ...event,
      oneShot: true
    };
  }

  return event;

};

export const formatTimeStamp = (ms: number, format: 'standard' | 'seconds' ): string => {
  return format === 'standard' ?
    msToTime(ms) :
    msToSeconds(ms).toFixed(0).toString();
};


export const normalizeOneShotEventDuration = (event: TimelineEvent, totalTime: number, timelineWidth: number) => {

  if (event.oneShot) {
    return {
      ...event,
      duration: 6 * totalTime / timelineWidth
    };
  } else {
    return event;
  }
};


export const nextEvent = (events: TimelineEvent[], timestamp: number) => {
  const eventsAfterTs = events.filter(e => (e.timestamp > timestamp) && (e.timestamp + e.duration > timestamp));
  return eventsAfterTs.reduce((prev, curr) => curr.timestamp < prev.timestamp ? curr : prev, eventsAfterTs[0]);
};

export const buildEventTypes = (events: TimelineEvent[]): TimelineEventType[] => {
  const groupedEvents = groupEvents(events);
  return Object.keys(groupedEvents).map( et => ({
    type: et,
    title: toHumanReadable(et),
    color: stringToColour(et)
  }));
};
