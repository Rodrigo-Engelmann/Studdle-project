import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Module {
  id?: number;
  module: number;
  release_status?: 'beta' | 'released';
}

@Injectable({
  providedIn: 'root',
})
export class ModuleService {
  private api = 'http://localhost:3000/modules';

  constructor(private http: HttpClient) {}

  // CREATE
  create(data: Partial<Module>): Observable<Module> {
    return this.http.post<Module>(this.api, data);
  }

  // GET ALL
  findAll(): Observable<Module[]> {
    return this.http.get<Module[]>(this.api);
  }

  // GET BY ID
  findById(id: number): Observable<Module> {
    return this.http.get<Module>(`${this.api}/${id}`);
  }

  // UPDATE
  update(id: number, data: Partial<Module>): Observable<Module> {
    return this.http.patch<Module>(`${this.api}/${id}`, data);
  }

  // DELETE
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.api}/${id}`);
  }

  // GET TASKS DO MÓDULO
  findTasks(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/${id}/tasks`);
  }

  // GET QUIZZES DO MÓDULO
  findQuizzes(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/${id}/quizzes`);
  }

  // GET USUÁRIOS DO MÓDULO
  findUsers(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/${id}/users`);
  }
}