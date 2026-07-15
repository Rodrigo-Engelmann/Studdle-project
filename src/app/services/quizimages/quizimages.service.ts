import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface QuizImage {
  quiz_id: number;
  image?: string;
}

@Injectable({
  providedIn: 'root',
})
export class QuizImageService {
  private api = 'http://localhost:3000/quiz-images';

  constructor(private http: HttpClient) {}

  // CREATE
  create(data: Partial<QuizImage>): Observable<QuizImage> {
    return this.http.post<QuizImage>(this.api, data);
  }

  // GET ALL
  findAll(): Observable<QuizImage[]> {
    return this.http.get<QuizImage[]>(this.api);
  }

  // GET BY QUIZ ID
  findById(quizId: number): Observable<QuizImage[]> {
    return this.http.get<QuizImage[]>(`${this.api}/${quizId}`);
  }

  // UPDATE
  update(quizId: number, data: Partial<QuizImage>): Observable<QuizImage[]> {
    return this.http.patch<QuizImage[]>(`${this.api}/${quizId}`, data);
  }

  // DELETE BY ID
  delete(quizId: number): Observable<any> {
    return this.http.delete(`${this.api}/${quizId}`);
  }

  // GET IMAGENS POR QUIZ
  findByQuiz(quizId: number): Observable<QuizImage[]> {
    return this.http.get<QuizImage[]>(`${this.api}/quiz/${quizId}`);
  }

  // DELETAR TODAS AS IMAGENS DE UM QUIZ
  removeByQuiz(quizId: number): Observable<any> {
    return this.http.delete(`${this.api}/quiz/${quizId}`);
  }
}