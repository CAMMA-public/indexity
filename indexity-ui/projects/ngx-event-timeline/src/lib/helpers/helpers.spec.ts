import {TimelineEvent} from 'ngx-event-timeline';
import {groupEvents, toHumanReadable} from './index';

describe('Helpers', () => {

  const events: TimelineEvent[] = [
    {
      id: '1212',
      eventType: 'ACTION_EVENT',
      alt: 'Action event has occurred',
      title: 'Remove item',
      timestamp: 2030,
      duration: 200
    },
    {
      id: '1213',
      eventType: 'ACTION_EVENT',
      alt: 'Action event has occurred',
      title: 'Remove item',
      timestamp: 3030,
      duration: 340
    },
    {
      id: '1214',
      eventType: 'ACTION_EVENT',
      alt: 'Action event has occurred',
      title: 'Remove item',
      timestamp: 4030,
      duration: 320
    },
    {
      id: '1215',
      eventType: 'NOTIFICATION_EVENT',
      alt: 'Notification event has occurred',
      title: 'Notification message',
      timestamp: 1030,
      duration: 180
    },
    {
      id: '1216',
      eventType: 'NOTIFICATION_EVENT',
      alt: 'Notification event has occurred',
      title: 'Notification message',
      timestamp: 8030,
      duration: 300
    }
  ];

  it('should group by timelineEvents', () => {
    const result = groupEvents(events);
    const groups = Object.keys(result);
    expect(groups.length).toEqual(2);
    expect(groups.includes('ACTION_EVENT')).toBeTruthy();
    expect(groups.includes('NOTIFICATION_EVENT')).toBeTruthy();
  });

  it('should transform to human readable string with capitalization', () => {
    const str = 'NEW.EVENT_TYPE-HERE';
    const res = toHumanReadable(str);
    expect(res).toEqual('New event type here');
  });

  it('should transform to human readable string without capitalization', () => {
    const str = 'NEW.EVENT_TYPE-HERE';
    const res = toHumanReadable(str, false);
    expect(res).toEqual('new event type here');
  });

});
