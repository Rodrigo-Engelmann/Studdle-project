import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MaterialStatus {
  user_id: number;
  material_id: number;
  completed: boolean;
}

export interface MaterialCompletions {
  material_id: number;
  total: number;
  completed: number;
}

@Injectable({
  providedIn: 'root',
})
export class MaterialStatusService {
  private api = 'http://localhost:3000/material-status';

  constructor(private http: HttpClient) {}

  // CRIAR OU ATUALIZAR STATUS
  upsert(data: MaterialStatus): Observable<MaterialStatus> {
    return this.http.post<MaterialStatus>(this.api, data);
  }

  // GET STATUS DE TODOS OS MATERIAIS DE UM USUÁRIO
  findByUser(userId: number): Observable<MaterialStatus[]> {
    return this.http.get<MaterialStatus[]>(`${this.api}/user/${userId}`);
  }

  // GET CONTAGEM DE CONCLUSÕES DE UM MATERIAL
  findCompletionsByMaterial(materialId: number): Observable<MaterialCompletions> {
    return this.http.get<MaterialCompletions>(`${this.api}/material/${materialId}/completions`);
  }

  // GET STATUS DE UM MATERIAL ESPECÍFICO PARA UM USUÁRIO
  findOne(userId: number, materialId: number): Observable<MaterialStatus> {
    return this.http.get<MaterialStatus>(`${this.api}/user/${userId}/material/${materialId}`);
  }
}