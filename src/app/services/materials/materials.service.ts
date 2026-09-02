import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Material {
  id?: number;
  main_image: string;
  summary: string;
  main_content: string;
  createdDate?: string;
  last_update?: string;
  sequence: number;
}

export interface MaterialStatus {
  user_id: number;
  material_id: number;
  completed: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class MaterialService {
  private api = 'http://localhost:3000/materials';

  constructor(private http: HttpClient) {}

  // CREATE
  create(data: Partial<Material>): Observable<Material> {
    return this.http.post<Material>(this.api, data);
  }

  // GET ALL
  findAll(): Observable<Material[]> {
    return this.http.get<Material[]>(this.api);
  }

  // GET BY ID
  findById(id: number): Observable<Material> {
    return this.http.get<Material>(`${this.api}/${id}`);
  }

  // UPDATE
  update(id: number, data: Partial<Material>): Observable<Material> {
    return this.http.patch<Material>(`${this.api}/${id}`, data);
  }

  // DELETE
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.api}/${id}`);
  }

  // GET ORDENADO POR SEQUÊNCIA
  findOrdered(): Observable<Material[]> {
    return this.http.get<Material[]>(`${this.api}/ordered`);
  }

  // GET COMENTÁRIOS DO MATERIAL
  findComments(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/${id}/comments`);
  }

  // MARCAR COMO CONCLUÍDO
  markComplete(id: number, user_id: number): Observable<MaterialStatus> {
    return this.http.post<MaterialStatus>(`${this.api}/${id}/complete`, { user_id });
  }

  // GET STATUS DE CONCLUSÃO
  getStatus(id: number, userId: number): Observable<MaterialStatus> {
    return this.http.get<MaterialStatus>(`${this.api}/${id}/status/${userId}`);
  }

  // MULTER
  uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('main_image', file);
    return this.http.post(`${this.api}/upload`, formData);
  }
}