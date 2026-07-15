import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Comment {
  id?: number;
  content: string;
  user_id: number;
  video_id?: number;
  material_id?: number;
  publish_date?: string;
  mentions_comment?: number;
}

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private api = 'http://localhost:3000/comments';

  constructor(private http: HttpClient) {}

  // CREATE
  create(data: Partial<Comment>): Observable<Comment> {
    return this.http.post<Comment>(this.api, data);
  }

  // GET ALL
  findAll(): Observable<Comment[]> {
    return this.http.get<Comment[]>(this.api);
  }

  // GET BY ID
  findById(id: number): Observable<Comment> {
    return this.http.get<Comment>(`${this.api}/${id}`);
  }

  // UPDATE
  update(id: number, data: Partial<Comment>): Observable<Comment> {
    return this.http.patch<Comment>(`${this.api}/${id}`, data);
  }

  // DELETE
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.api}/${id}`);
  }

  // GET REPLIES DE UM COMENTÁRIO
  findReplies(id: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.api}/${id}/replies`);
  }

  // GET COMENTÁRIOS DE UM USUÁRIO
  findByUser(userId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.api}/user/${userId}`);
  }

  // DELETAR TODOS OS COMENTÁRIOS DE UM USUÁRIO (moderação)
  removeByUser(userId: number): Observable<any> {
    return this.http.delete(`${this.api}/user/${userId}`);
  }
}