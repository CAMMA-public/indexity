import {
  escapeRegExp,
  getFormattedTimestamp,
} from '@app/annotations/common/helpers/base.helpers';

describe('BaseHelper', () => {
  it('should return 00:02:06', () => {
    const ms = 126000;
    const expected = '00:02:06';
    expect(getFormattedTimestamp(ms, 'standard')).toBe(expected);
  });

  it('should return 00:02:06', () => {
    const ms = 126000;
    const expected = '126';
    expect(getFormattedTimestamp(ms, 'seconds')).toBe(expected);
  });

  it('should escape string for regexp', () => {
    const str = 'video)-".$';
    const res = escapeRegExp(str);
    expect(res).toEqual('video\\)-"\\.\\$');
  });
});
