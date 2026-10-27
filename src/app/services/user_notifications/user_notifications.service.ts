import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserNotification {
  id: number;
  user_id: number;
  text: string;
  readed: boolean;
  page_link: string;
  type: 'comment_reply' | 'generic';
  comment_id?: number;
  created_at: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserNotificationService {
  private api = 'http://localhost:3000/user-notifications';

  constructor(private http: HttpClient) {}

  findByUser(userId: number): Observable<UserNotification[]> {
    return this.http.get<UserNotification[]>(`${this.api}/user/${userId}`);
  }

  findUnread(userId: number): Observable<UserNotification[]> {
    return this.http.get<UserNotification[]>(`${this.api}/user/${userId}/unread`);
  }

  countUnread(userId: number): Observable<{ total: number }> {
    return this.http.get<{ total: number }>(`${this.api}/user/${userId}/unread/count`);
  }

  markAsRead(id: number): Observable<UserNotification> {
    return this.http.patch<UserNotification>(`${this.api}/${id}/read`, {});
  }

  markAllAsRead(userId: number): Observable<any> {
    return this.http.patch(`${this.api}/user/${userId}/read-all`, {});
  }

  clearRead(userId: number): Observable<any> {
    return this.http.delete(`${this.api}/user/${userId}/read`);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.api}/${id}`);
  }
}