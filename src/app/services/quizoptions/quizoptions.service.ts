import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface QuizOption {
  quiz_id: number;
  text?: string;
  right_answer?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class QuizOptionService {
  private api = 'http://localhost:3000/quiz-options';

  constructor(private http: HttpClient) {}

  // CREATE
  create(data: Partial<QuizOption>): Observable<QuizOption> {
    return this.http.post<QuizOption>(this.api, data);
  }

  // GET ALL
  findAll(): Observable<QuizOption[]> {
    return this.http.get<QuizOption[]>(this.api);
  }

  // GET BY QUIZ ID
  findById(quizId: number): Observable<QuizOption[]> {
    return this.http.get<QuizOption[]>(`${this.api}/${quizId}`);
  }

  // UPDATE
  update(quizId: number, data: Partial<QuizOption>): Observable<QuizOption[]> {
    return this.http.patch<QuizOption[]>(`${this.api}/${quizId}`, data);
  }

  // DELETE BY ID
  delete(quizId: number): Observable<any> {
    return this.http.delete(`${this.api}/${quizId}`);
  }

  // GET OPÇÕES POR QUIZ
  findByQuiz(quizId: number): Observable<QuizOption[]> {
    return this.http.get<QuizOption[]>(`${this.api}/quiz/${quizId}`);
  }

  // GET OPÇÃO CORRETA DO QUIZ
  findCorrect(quizId: number): Observable<QuizOption> {
    return this.http.get<QuizOption>(`${this.api}/quiz/${quizId}/correct`);
  }

  // DELETAR TODAS AS OPÇÕES DE UM QUIZ
  removeByQuiz(quizId: number): Observable<any> {
    return this.http.delete(`${this.api}/quiz/${quizId}`);
  }
}