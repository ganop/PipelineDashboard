import {Injectable} from '@angular/core';
import 'rxjs/add/operator/toPromise';
import {Monitor} from "./monitor";
import { environment } from '../../../environments/environment';
import {List} from "./../list";
import { AuthHttp } from "angular2-jwt";
import 'rxjs/add/operator/map';

import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import { MatSnackBar } from "@angular/material";
import { PingedService } from "./pinged-list/pinged.service";
import { Environment } from "../environment";

@Injectable()
export class MonitorService {

  private url: string = environment.api;

  private subject: Subject<List<Monitor>> = new Subject<List<Monitor>>();

  constructor(private authHttp: AuthHttp, private pingedService: PingedService, private snackBar: MatSnackBar) {
  }

  getMonitors(environmentId: string): void {
    this.authHttp.get(`${this.url}/environments/${environmentId}/monitors`)
      .map(response => response.json() as List<Monitor>)
      .subscribe(
        data => this.subject.next(data),
        error => console.log(error)
      );
  }

  addMonitor(monitor: Monitor): void {
    this.authHttp.post(`${this.url}/environments/${monitor.environmentId}/monitors`, monitor)
      .map(response => response.json() as Monitor)
      .subscribe(
        data => {
          this.getMonitors(monitor.environmentId);
          this.snackBar.open(`Monitor ${monitor.path} added`, '', { duration: 2000 });
        },
        error => console.log(error)
      );
  }

  deleteMonitor(monitor: Monitor): void {
    this.authHttp.delete(`${this.url}/environments/${monitor.environmentId}/monitors/${monitor.id}`)
      .subscribe(
        data => {
          this.getMonitors(monitor.environmentId);
          this.snackBar.open(`Monitor ${monitor.path} removed`, '', { duration: 2000 });
        },
        error => console.log(error)
      );
  }

  pingMonitor(environment: Environment, monitor: Monitor): void {
    this.pingedService
      .pingMonitor(environment, monitor);
  }

  subscribeMonitors(): Observable<any> {
    return this.subject.asObservable();
  }

}
