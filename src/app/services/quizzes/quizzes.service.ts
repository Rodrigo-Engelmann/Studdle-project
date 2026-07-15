import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Quiz {
  id?: number;
  module_id: number;
  task_id: number;
  right_answer_count?: number;
  answer_count?: number;
}

export interface QuizFull extends Quiz {
  images: QuizImage[];
  options: Omit<QuizOption, 'right_answer'>[];
}

export interface QuizStats {
  quiz_id: number;
  answer_count: number;
  right_answer_count: number;
  success_rate: string;
}

export interface QuizImage {
  quiz_id: number;
  image?: string;
}

export interface QuizOption {
  quiz_id: number;
  text?: string;
  right_answer?: boolean;
}

export interface AnswerResult {
  correct: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  private api = 'http://localhost:3000/quizzes';

  constructor(private http: HttpClient) {}

  // CREATE
  create(data: Partial<Quiz>): Observable<Quiz> {
    return this.http.post<Quiz>(this.api, data);
  }

  // GET ALL
  findAll(): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(this.api);
  }

  // GET BY ID
  findById(id: number): Observable<Quiz> {
    return this.http.get<Quiz>(`${this.api}/${id}`);
  }

  // UPDATE
  update(id: number, data: Partial<Quiz>): Observable<Quiz> {
    return this.http.patch<Quiz>(`${this.api}/${id}`, data);
  }

  // DELETE
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.api}/${id}`);
  }

  // GET QUIZZES POR MÓDULO
  findByModule(moduleId: number): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(`${this.api}/module/${moduleId}`);
  }

  // GET IMAGENS DO QUIZ
  findImages(id: number): Observable<QuizImage[]> {
    return this.http.get<QuizImage[]>(`${this.api}/${id}/images`);
  }

  // GET OPÇÕES DO QUIZ (sem right_answer)
  findOptions(id: number): Observable<Omit<QuizOption, 'right_answer'>[]> {
    return this.http.get<Omit<QuizOption, 'right_answer'>[]>(`${this.api}/${id}/options`);
  }

  // GET QUIZ COMPLETO (imagens + opções)
  findFull(id: number): Observable<QuizFull> {
    return this.http.get<QuizFull>(`${this.api}/${id}/full`);
  }

  // ENVIAR RESPOSTA
  submitAnswer(id: number, option_index: number): Observable<AnswerResult> {
    return this.http.post<AnswerResult>(`${this.api}/${id}/answer`, { option_index });
  }

  // GET ESTATÍSTICAS DO QUIZ
  getStats(id: number): Observable<QuizStats> {
    return this.http.get<QuizStats>(`${this.api}/${id}/stats`);
  }
}