import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TaskContentStatus {
  id?: number;
  task_content_id: number;
  user_id: number;
  completed?: boolean;
}

export interface TaskContentCompletions {
  task_content_id: number;
  total: number;
  completed: number;
}

@Injectable({
  providedIn: 'root',
})
export class TaskContentStatusService {
  private api = 'http://localhost:3000/taskcontent-status';

  constructor(private http: HttpClient) {}

  // CREATE
  create(data: Partial<TaskContentStatus>): Observable<TaskContentStatus> {
    return this.http.post<TaskContentStatus>(this.api, data);
  }

  // GET ALL
  findAll(): Observable<TaskContentStatus[]> {
    return this.http.get<TaskContentStatus[]>(this.api);
  }

  // GET BY ID
  findById(id: number): Observable<TaskContentStatus> {
    return this.http.get<TaskContentStatus>(`${this.api}/${id}`);
  }

  // UPDATE
  update(id: number, data: Partial<TaskContentStatus>): Observable<TaskContentStatus> {
    return this.http.patch<TaskContentStatus>(`${this.api}/${id}`, data);
  }

  // DELETE
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.api}/${id}`);
  }

  // GET TODOS OS STATUS DE UM USUÁRIO
  findByUser(userId: number): Observable<TaskContentStatus[]> {
    return this.http.get<TaskContentStatus[]>(`${this.api}/user/${userId}`);
  }

  // GET SOMENTE OS CONCLUÍDOS DE UM USUÁRIO
  findCompletedByUser(userId: number): Observable<TaskContentStatus[]> {
    return this.http.get<TaskContentStatus[]>(`${this.api}/user/${userId}/completed`);
  }

  // GET CONTAGEM DE CONCLUSÕES DE UM TASK_CONTENT
  findCompletionsByTaskContent(taskContentId: number): Observable<TaskContentCompletions> {
    return this.http.get<TaskContentCompletions>(
      `${this.api}/task-content/${taskContentId}/completions`,
    );
  }

  // GET STATUS DE UM TASK_CONTENT ESPECÍFICO PARA UM USUÁRIO
  findOne(userId: number, taskContentId: number): Observable<TaskContentStatus> {
    return this.http.get<TaskContentStatus>(
      `${this.api}/user/${userId}/task-content/${taskContentId}`,
    );
  }

  // MARCAR TASK_CONTENT COMO CONCLUÍDO
  markComplete(userId: number, taskContentId: number): Observable<TaskContentStatus> {
    return this.http.patch<TaskContentStatus>(
      `${this.api}/user/${userId}/task-content/${taskContentId}/complete`,
      {},
    );
  }
}
