import sanitize from 'sanitize-filename';

export const sanitizeFileName = (fileName: string): string => {
  return sanitize(fileName)
    .split('%')
    .join('');
};
