import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id?: number;
  user_name: string;
  email: string;
  password?: string;
  profile_picture?: string;
  account_bio?: string;
  createdDate?: string;
  last_update?: string;
  xp?: number;
  current_module_id?: number;
  privileges?: number;
  comments_notification_ceiling?: boolean;
  comments_notification_ceiling_number?: number;
}

export interface UserProgress {
  xp: number;
  current_module: any;
  tasks_completed: number;
  tasks_total: number;
  materials_completed: number;
  videos_completed: number;
}

export interface NotificationSettings {
  comments_notification_ceiling: boolean;
  comments_notification_ceiling_number: number;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private api = 'http://localhost:3000/users';
  private authUrl = 'http://localhost:3000/auth';

  constructor(private http: HttpClient) {}

  //#region: standard routes
  // CREATE
  create(data: Partial<User>): Observable<User> {
    return this.http.post<User>(this.api, data);
  }

  // GET ALL
  findAll(): Observable<User[]> {
    return this.http.get<User[]>(this.api);
  }

  // GET BY ID
  findById(id: number): Observable<User> {
    return this.http.get<User>(`${this.api}/${id}`);
  }

  // UPDATE
  update(id: number, data: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.api}/${id}`, data);
  }

  // // DELETE
  // delete(id: number): Observable<any> {
  //   return this.http.delete(`${this.api}/${id}`);
  // }

  // GET PERFIL PÚBLICO
  getPublicProfile(id: number): Observable<Partial<User>> {
    return this.http.get<Partial<User>>(`${this.api}/${id}/profile`);
  }

  // GET PROGRESSO
  getProgress(id: number): Observable<UserProgress> {
    return this.http.get<UserProgress>(`${this.api}/${id}/progress`);
  }

  // ATUALIZAR MÓDULO ATUAL
  updateModule(id: number, module_id: number): Observable<User> {
    return this.http.patch<User>(`${this.api}/${id}/module`, { module_id });
  }

  // GET MATERIAIS DO USUÁRIO
  getMaterials(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/${id}/materials`);
  }

  // GET VÍDEOS DO USUÁRIO
  getVideos(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/${id}/videos`);
  }

  // GET TASKS DO USUÁRIO
  getTasks(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/${id}/tasks`);
  }

  // GET NOTIFICAÇÕES DO USUÁRIO
  getNotifications(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/${id}/notifications`);
  }

  // ATUALIZAR CONFIGURAÇÕES DE NOTIFICAÇÃO
  updateNotificationSettings(id: number, data: NotificationSettings): Observable<User> {
    return this.http.patch<User>(`${this.api}/${id}/notifications/settings`, data);
  }

  deleteAccount() {
    return this.http.delete(`${this.api}/delete`, {
      withCredentials: true
    });
  }

  getUserByEmail(email: string): Observable<User> {
    return this.http.get<User>(`${this.api}/find-email/${email}`);
  }

  changePassword(data: {currentPassword: string; newPassword: string;}) {
    return this.http.patch(
      `${this.api}/change-password`, 
      data, { withCredentials: true }
    );
  }

  //#endregion

  //#region: auth
  getMe(): Observable<any> {
    return this.http.get(
      `${this.authUrl}/me`,
      { withCredentials: true }
    );
  }


  register(userData: Partial<User>): Observable<User> {
    return this.http.post<User>(
      `${this.authUrl}/register`,
      userData,
      { withCredentials: true }
    );
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(
      `${this.authUrl}/login`,
      credentials,
      { withCredentials: true }
    );
  }

  logout(): Observable<any> {
    return this.http.post(
      `${this.authUrl}/logout`,
      {},
      { withCredentials: true }
    );
  }

  getProfile(): Observable<any> {
    return this.http.get(
      `${this.authUrl}/profile`,
      { withCredentials: true }
    );
  }

  refresh(): Observable<any> {
    return this.http.post(
      `${this.authUrl}/refresh`,
      {},
      { withCredentials: true }
    );
  }

  updateUser(formData: FormData): Observable<any> {
    // Ajuste a URL conforme a rota do backend que atualiza o usuário
    return this.http.put(`${this.authUrl}/update-profile`, formData, { withCredentials: true });
  }
  //#endregion


  //#region: colorblind function
  updateColorBlindFilter(index: number): void {
    const filters = [
      '',
      'protanopia',
      'deuteranopia',
      'tritanopia',
      'acromatopsia'
    ];

    document.body.classList.remove(
      'protanopia',
      'deuteranopia',
      'tritanopia',
      'acromatopsia'
    );

    if (index > 0 && index < filters.length) {
      document.body.classList.add(filters[index]);
    }
  }
  //#endregion

}