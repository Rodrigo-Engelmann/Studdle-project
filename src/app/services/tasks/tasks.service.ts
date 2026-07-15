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

  // UPDATE
  update(id: number, data: Partial<Task>): Observable<Task> {
    return this.http.patch<Task>(`${this.api}/${id}`, data);
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

  // GET CONTAGEM DE CONCLUSÕES DA TASK
  findCompletions(id: number): Observable<TaskCompletions> {
    return this.http.get<TaskCompletions>(`${this.api}/${id}/completions`);
  }
}