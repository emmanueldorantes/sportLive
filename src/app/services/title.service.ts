import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TitleService {
  private titleSubject: BehaviorSubject<string> = new BehaviorSubject<string>('Default Title');

  setTitle(newTitle: string) {
    this.titleSubject.next(newTitle);
  }

  getTitle(): Observable<string> {
    return this.titleSubject.asObservable();
  }
}