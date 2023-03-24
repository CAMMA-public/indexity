import { access } from 'fs';
import { isError } from 'lodash';
import { remove } from 'fs-extra';

export const removeFileIfExists = async (
  filePath: string,
  shouldReject = false,
): Promise<void> => {
  return new Promise((resolve, reject) =>
    access(filePath, async (error: Error) => {
      if (isError(error)) {
        if (shouldReject) {
          reject(error);
        } else {
          resolve();
        }
      } else {
        await remove(filePath);
        resolve();
      }
    }),
  );
};
