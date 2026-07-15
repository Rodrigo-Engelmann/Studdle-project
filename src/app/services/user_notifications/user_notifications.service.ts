import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserNotification {
  id?: number;
  user_id?: number;
  text?: string;
  readed?: boolean;
  page_link: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserNotificationService {
  private api = 'http://localhost:3000/notifications';

  constructor(private http: HttpClient) {}

  // CREATE
  create(data: Partial<UserNotification>): Observable<UserNotification> {
    return this.http.post<UserNotification>(this.api, data);
  }

  // GET ALL
  findAll(): Observable<UserNotification[]> {
    return this.http.get<UserNotification[]>(this.api);
  }

  // GET BY ID
  findById(id: number): Observable<UserNotification> {
    return this.http.get<UserNotification>(`${this.api}/${id}`);
  }

  // UPDATE
  update(id: number, data: Partial<UserNotification>): Observable<UserNotification> {
    return this.http.patch<UserNotification>(`${this.api}/${id}`, data);
  }

  // DELETE
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.api}/${id}`);
  }

  // GET TODAS AS NOTIFICAÇÕES DE UM USUÁRIO
  findByUser(userId: number): Observable<UserNotification[]> {
    return this.http.get<UserNotification[]>(`${this.api}/user/${userId}`);
  }

  // GET NOTIFICAÇÕES NÃO LIDAS DE UM USUÁRIO
  findUnread(userId: number): Observable<UserNotification[]> {
    return this.http.get<UserNotification[]>(`${this.api}/user/${userId}/unread`);
  }

  // MARCAR UMA NOTIFICAÇÃO COMO LIDA
  markAsRead(id: number): Observable<UserNotification> {
    return this.http.patch<UserNotification>(`${this.api}/${id}/read`, {});
  }

  // MARCAR TODAS AS NOTIFICAÇÕES DE UM USUÁRIO COMO LIDAS
  markAllAsRead(userId: number): Observable<any> {
    return this.http.patch(`${this.api}/user/${userId}/read-all`, {});
  }

  // LIMPAR NOTIFICAÇÕES LIDAS DE UM USUÁRIO
  clearRead(userId: number): Observable<any> {
    return this.http.delete(`${this.api}/user/${userId}/read`);
  }
}