import { validateVideoUpload } from './validate-video-upload';
import { SUPPORTED_VIDEO_MIMETYPES } from '../constants';

describe('Validate Video Upload Helper', () => {
  it('should validate the upload if MIME type is correct', async () => {
    const fakeReq = {};
    const fakeCorrectFile = {
      mimetype: SUPPORTED_VIDEO_MIMETYPES[0],
    };
    const fakeCb = jest.fn();
    await validateVideoUpload(fakeReq, fakeCorrectFile, fakeCb);
    expect(fakeCb).toHaveBeenCalledWith(null, true);
  });

  it('should transmit an error (false) if MIME type is incorrect', async () => {
    const fakeReq = {};
    const fakeIncorrectFile = {
      mimetype: 'fake mimetype',
    };
    const fakeCb = jest.fn();
    await validateVideoUpload(fakeReq, fakeIncorrectFile, fakeCb);
    expect(fakeCb).toHaveBeenCalledWith(null, false);
  });

  it('should transmit an error (error string) if MIME type is incorrect', async () => {
    const fakeReq = { fileValidationErrors: '' };
    const fakeIncorrectFile = {
      mimetype: 'fake mimetype',
      originalname: 'fake name',
    };
    const fakeCb = jest.fn();
    await validateVideoUpload(fakeReq, fakeIncorrectFile, fakeCb);
    expect(fakeReq.fileValidationErrors.length).toBeGreaterThan(0);
  });
});
