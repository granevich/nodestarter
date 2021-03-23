import path from 'path';
import fs, { watch, WriteStream } from 'fs';

const watchedDir = path.join(__dirname, 'docs');

enum FileEvents {
  RENAME = 'rename',
  CHANGE = 'change',
}

enum FileStatus {
  DELETED,
  RENAMED,
  CREATED,
}
class LogData {
  status: FileStatus;

  file: string;

  date: Date;

  constructor(status:FileStatus, file: string, date: Date) {
    this.status = status;
    this.file = file;
    this.date = date;
  }
}

class Logger {
  writer: WriteStream = fs.createWriteStream('log.json');

  public log(status: FileStatus, file: string, date: Date):void {
    const logString = JSON.stringify(new LogData(status, file, date));
    this.writer.write(logString);
    this.writer.write(',');
    this.writer.write('\n');
  }

  public init(): Logger {
    this.writer.write('[');
    return this;
  }
}

const logger = new Logger().init();

watch(watchedDir, (eventType, filename) => {
  const filePath = path.join(watchedDir, filename);
  if (eventType === FileEvents.RENAME) {
    if (fs.existsSync(filePath)) {
      console.debug('file created');
      logger.log(FileStatus.CREATED, filename, new Date());
    } else {
      console.debug('file deleted');
      logger.log(FileStatus.DELETED, filename, new Date());
    }
  }
});
