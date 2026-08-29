import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SignalRService {
  private hubConnection: signalR.HubConnection | null = null;
  private readonly hubUrl = 'https://dwpts.onrender.com/hubs/work-notifications';

  private workEntryChangedSubject = new Subject<any>();
  public workEntryChanged$: Observable<any> = this.workEntryChangedSubject.asObservable();

  constructor() {
    this.startConnection();
  }

  public startConnection(): void {
    const token = localStorage.getItem('dwpts_token') || '';

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl, {
        accessTokenFactory: () => token,
        skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.None)
      .build();

    this.hubConnection
      .start()
      .then(() => {
        // Connected to SignalR Hub
      })
      .catch(() => {
        // Graceful fallback if backend hub is offline
      });

    this.hubConnection.on('WorkEntryChanged', (data: any) => {
      this.workEntryChangedSubject.next(data);
    });
  }

  public stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop();
    }
  }
}
