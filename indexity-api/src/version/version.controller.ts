import { Controller, Get, Logger } from '@nestjs/common';
import fs from 'fs';

@Controller('version')
export class VersionController {
  private readonly logger: Logger = new Logger('VersionController', true);

  async getVersion(): Promise<string> {
    const versionFile = 'version';
    return await fs.promises
      .readFile(versionFile)
      .then(content => {
        return content.toString().trim();
      })
      .catch(reason => {
        this.logger.error(
          `Failed to read version file: "${versionFile}"`,
          reason.stack,
        );
        return '0.0.0';
      });
  }

  @Get()
  async version(): Promise<{ version: string }> {
    return {
      version: await this.getVersion(),
    };
  }
}
