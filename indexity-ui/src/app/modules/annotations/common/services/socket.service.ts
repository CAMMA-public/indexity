import { Injectable } from '@angular/core';
import * as ioImported from 'socket.io-client';
import { Observable, Subject } from 'rxjs';
import { ConfigurationService } from 'angular-configuration-module';

@Injectable()
export class SocketService {
  socket: SocketIOClient.Socket;
  connected$ = new Subject<boolean>();
  firstConnection = true;

  constructor(private readonly configurationService: ConfigurationService) {
    const io = ioImported;
    this.socket = io(
      `${this.configurationService.configuration.socketConfig.baseUrl}/videos`,
      {
        transports: this.configurationService.configuration.socketConfig.opts.transports.split(
          configurationService.configuration.separator,
        ),
      },
    );
    this.socket.on('connect', () => {
      if (!this.firstConnection) {
        this.connected$.next(true);
      } else {
        this.firstConnection = false;
      }
    });
    this.socket.on('disconnect', () => this.connected$.next(false));
  }

  /**
   * Listen to events on the socket
   */
  listen(event: string): Observable<any> {
    return new Observable((observer) => {
      this.socket.on(event, (data) => {
        observer.next(data);
      });

      // observable is disposed
      return () => this.socket.off(event);
    });
  }
}
