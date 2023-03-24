import { Controller, Get } from '@nestjs/common';
import { AdminController } from '../admin/admin.controller';
import { Configuration } from '../../../common/decorators';
import { AppConfiguration } from '../../../config';
import { promisify } from 'util';
import { exec } from 'child_process';
import { ApiTags } from '@nestjs/swagger';
const execAsync = promisify(exec);

@ApiTags('admin')
@Controller('admin/system')
export class SystemController extends AdminController {
  constructor(@Configuration() private readonly cfg: AppConfiguration) {
    super();
  }

  @Get('storage')
  async storage(): Promise<any> {
    const { stdout } = await execAsync(
      `df -Ph ${this.cfg.staticFiles.videos.dir}`,
    );
    const str = stdout
      .substring(stdout.indexOf('\n') + 1)
      .replace('\n', '')
      .replace(/\s\s+/g, ' ')
      .split(' ');
    // Fs Size  Used Avail Use%
    return {
      videoStorage: {
        available: str[3],
        used: str[2],
        total: str[1],
      },
    };
  }
}
