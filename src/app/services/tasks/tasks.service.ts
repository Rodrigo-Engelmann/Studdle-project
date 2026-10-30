import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Task {
  id?: number;
  name: string;
  module_id: number;
}

export interface TaskCompletions {
  task_id: number;
  total: number;
  completed: number;
}

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private api = 'http://localhost:3000/tasks';

  constructor(private http: HttpClient) {}

  // CREATE
  create(data: Partial<Task>): Observable<Task> {
    return this.http.post<Task>(this.api, data);
  }

  // GET ALL
  findAll(): Observable<Task[]> {
    return this.http.get<Task[]>(this.api);
  }

  // GET BY ID
  findById(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.api}/${id}`);
  }

  // GET BY ID
  findByModule(moduleId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.api}/module/${moduleId}`);
  }

  // UPDATE
  update(id: number, data: Partial<Task>): Observable<Task> {
    return this.http.patch<Task>(`${this.api}/${id}`, data);
  }

  // UPDATE TASK CONTENT
  updateContent(taskId: number, data: { video_ids: number[]; material_ids: number[] }): Observable<any> {
    return this.http.patch(`${this.api}/${taskId}/content`, data);
  }

  // DELETE
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.api}/${id}`);
  }

  // GET CONTEÚDOS DA TASK
  findContents(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/${id}/contents`);
  }

  // GET QUIZ DA TASK
  findQuiz(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/${id}/quiz`);
  }
}