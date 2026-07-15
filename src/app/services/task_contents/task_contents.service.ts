import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TaskContent {
  id?: number;
  task_id: number;
  video_id?: number;
  material_id?: number;
}

@Injectable({
  providedIn: 'root',
})
export class TaskContentService {
  private api = 'http://localhost:3000/task-contents';

  constructor(private http: HttpClient) {}

  // CREATE
  create(data: Partial<TaskContent>): Observable<TaskContent> {
    return this.http.post<TaskContent>(this.api, data);
  }

  // GET ALL
  findAll(): Observable<TaskContent[]> {
    return this.http.get<TaskContent[]>(this.api);
  }

  // GET BY ID
  findById(id: number): Observable<TaskContent> {
    return this.http.get<TaskContent>(`${this.api}/${id}`);
  }

  // UPDATE
  update(id: number, data: Partial<TaskContent>): Observable<TaskContent> {
    return this.http.patch<TaskContent>(`${this.api}/${id}`, data);
  }

  // DELETE
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.api}/${id}`);
  }

  // GET CONTEÚDOS POR TASK
  findByTask(taskId: number): Observable<TaskContent[]> {
    return this.http.get<TaskContent[]>(`${this.api}/task/${taskId}`);
  }

  // GET CONTEÚDOS POR VÍDEO
  findByVideo(videoId: number): Observable<TaskContent[]> {
    return this.http.get<TaskContent[]>(`${this.api}/video/${videoId}`);
  }

  // GET CONTEÚDOS POR MATERIAL
  findByMaterial(materialId: number): Observable<TaskContent[]> {
    return this.http.get<TaskContent[]>(`${this.api}/material/${materialId}`);
  }
}