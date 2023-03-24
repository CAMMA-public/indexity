import { AnnotationEntity } from '../../../annotations/entities/annotation.entity';

export const getPhases = (phaseList): AnnotationEntity[] =>
  phaseList.map(phase => ({
    category: 'phase',
    timestamp: +phase.temporal_region[0].start_time[0],
    duration:
      +phase.temporal_region[0].stop_time[0] -
      +phase.temporal_region[0].start_time[0],
    label: {
      type: 'phase',
      color: '#007aff',
      name: phase.label[0].replace(/([A-Z])/g, ' $1').trim(),
    },
  }));

export const getActions = (actionList): AnnotationEntity[] =>
  actionList.map(action => {
    if (action.origin && action.origin[0].length) {
      return {
        category: 'event',
        timestamp: +action.temporal_region[0].start_time[0],
        duration:
          +action.temporal_region[0].stop_time[0] -
          +action.temporal_region[0].start_time[0],
        label: {
          type: 'event',
          color: '#CCCCCC',
          name: action.origin[0],
        },
      };
    } else {
      const actor = action.actuator[0];
      let description = '';
      if (!actor.includes('Anaesthesiologist')) {
        let verb = '',
          affected = '',
          instruments = '';
        if (action.verb && action.verb[0].length) {
          verb =
            action.verb[0] === 'visible'
              ? ` ${action.verb[0]}`
              : ` to ${action.verb[0]}`;
        }
        if (action.affected_list && action.affected_list[0].affected) {
          affected = ` ${action.affected_list[0].affected.join(', ')}`;
        }
        if (action.instrument_list && action.instrument_list[0].instrument) {
          instruments = ` ${action.instrument_list[0].instrument
            .join(', ')
            .replace(/([A-Z])/g, ' $1')
            .trim()}`;
        }
        description =
          verb === ' visible'
            ? `${actor.replace('_', ' ')}${verb}${instruments}${affected}`
            : `${actor.replace('_', ' ')}${instruments}${verb}${affected}`;
      } else {
        description = action.verb[0];
      }

      return {
        category: 'action',
        timestamp: +action.temporal_region[0].start_time[0],
        duration:
          +action.temporal_region[0].stop_time[0] -
          +action.temporal_region[0].start_time[0],
        label: {
          type: 'action',
          color: '#00FF00',
          name: description,
        },
      };
    }
  });
