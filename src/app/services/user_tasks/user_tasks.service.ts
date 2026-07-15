import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserTask {
  user_id: number;
  task_id: number;
  completed?: boolean;
  engine_task?: boolean;
  engine_task_count?: number;
}

@Injectable({
  providedIn: 'root',
})
export class UserTaskService {
  private api = 'http://localhost:3000/user-tasks';

  constructor(private http: HttpClient) {}

  // CRIAR OU ATUALIZAR VÍNCULO
  upsert(data: UserTask): Observable<UserTask> {
    return this.http.post<UserTask>(this.api, data);
  }

  // GET TODAS AS TASKS DE UM USUÁRIO
  findByUser(userId: number): Observable<UserTask[]> {
    return this.http.get<UserTask[]>(`${this.api}/user/${userId}`);
  }

  // GET TASKS CONCLUÍDAS DE UM USUÁRIO
  findCompletedByUser(userId: number): Observable<UserTask[]> {
    return this.http.get<UserTask[]>(`${this.api}/user/${userId}/completed`);
  }

  // GET TASKS DE ENGINE DE UM USUÁRIO
  findEngineTasks(userId: number): Observable<UserTask[]> {
    return this.http.get<UserTask[]>(`${this.api}/user/${userId}/engine`);
  }

  // MARCAR TASK COMO CONCLUÍDA
  markComplete(userId: number, taskId: number): Observable<UserTask> {
    return this.http.patch<UserTask>(`${this.api}/user/${userId}/task/${taskId}/complete`, {});
  }

  // INCREMENTAR CONTADOR DE ENGINE
  incrementEngineCount(userId: number, taskId: number): Observable<UserTask> {
    return this.http.patch<UserTask>(`${this.api}/user/${userId}/task/${taskId}/engine-count`, {});
  }
}