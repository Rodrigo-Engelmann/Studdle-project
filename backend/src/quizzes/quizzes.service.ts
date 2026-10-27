import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quiz } from './quizzes.entity';
// import { QuizImage } from '../quizimages/quizimages.entity';
import { QuizOption } from '../quizoptions/quizoptions.entity';

@Injectable()
export class QuizService {
  constructor(
    @InjectRepository(Quiz)
    private readonly quizRepo: Repository<Quiz>,
    // @InjectRepository(QuizImage)
    // private readonly quizImageRepo: Repository<QuizImage>,
    @InjectRepository(QuizOption)
    private readonly quizOptionRepo: Repository<QuizOption>,
  ) {}

  create(data: Partial<Quiz>) {
    const quiz = this.quizRepo.create(data);
    return this.quizRepo.save(quiz);
  }

  findAll() {
    return this.quizRepo.find({ relations: ['module', 'task'] });
  }

  async findById(id: number) {
    const quiz = await this.quizRepo.findOne({
      where: { id },
      relations: ['module', 'task', 'options'],
    });
    if (!quiz) throw new NotFoundException(`Quiz #${id} não encontrado`);
    return quiz;
  }

  async update(id: number, data: Partial<Quiz>) {
    const quiz = await this.quizRepo.findOne({
      where: { id },
      relations: ['options'],
    });
    if (!quiz) throw new NotFoundException(`Quiz #${id} não encontrado`);

    // apaga as alternativas antigas e grava as novas
    await this.quizOptionRepo.delete({ quiz_id: id });

    return this.quizRepo.save({
      ...quiz,
      ...data,
      options: (data.options ?? []).map((o) => ({
        text: o.text,
        right_answer: o.right_answer,
      })),
    });
  }

  async remove(id: number) {
    await this.findById(id);
    await this.quizRepo.delete(id);
    return { deleted: true };
  }

  findByModule(moduleId: number) {
    return this.quizRepo.find({
      where: { module_id: moduleId },
      relations: ['task'],
    });
  }

  // async findImages(id: number) {
  //   await this.findById(id);
  //   return this.quizImageRepo.find({ where: { quiz_id: id } });
  // }

  async findOptions(id: number) {
    await this.findById(id);

    return this.quizOptionRepo.find({
      where: { quiz_id: id },
      select: ['quiz_id', 'text'],
    });
  }

  async findFull(id: number) {
    const quiz = await this.quizRepo.findOne({
      where: { id },
      relations: ['images', 'options', 'module', 'task'],
    });
    if (!quiz) throw new NotFoundException(`Quiz #${id} não encontrado`);

    const options = quiz.options.map(({ right_answer: _, ...rest }) => rest);
    return { ...quiz, options };
  }

  async submitAnswer(id: number, optionIndex: number) {
    const quiz = await this.quizRepo.findOne({
      where: { id },
      relations: ['options'],
    });
    if (!quiz) throw new NotFoundException(`Quiz #${id} não encontrado`);
    if (optionIndex < 0 || optionIndex >= quiz.options.length)
      throw new BadRequestException('Índice de opção inválido');

    const isCorrect = quiz.options[optionIndex].right_answer;

    quiz.answer_count += 1;
    if (isCorrect) quiz.right_answer_count += 1;
    await this.quizRepo.save(quiz);

    return { correct: isCorrect };
  }

  async getStats(id: number) {
    const quiz = await this.findById(id);
    const rate =
      quiz.answer_count > 0
        ? ((quiz.right_answer_count / quiz.answer_count) * 100).toFixed(1)
        : '0.0';
    return {
      quiz_id: id,
      answer_count: quiz.answer_count,
      right_answer_count: quiz.right_answer_count,
      success_rate: `${rate}%`,
    };
  }

  async findRandomByModule(moduleId: number) {
    const quizzes = await this.quizRepo.find({
      where: { module_id: moduleId },
      relations: ['options'],
      order: { id: 'ASC', options: { id: 'ASC' } },
    });

    // agrupa os quizzes por task
    const byTask = new Map<number, Quiz[]>();
    for (const quiz of quizzes) {
      const list = byTask.get(quiz.task_id) ?? [];
      list.push(quiz);
      byTask.set(quiz.task_id, list);
    }

    // sorteia 1 quiz de cada task
    return [...byTask.values()].map((list) => {
      const quiz = list[Math.floor(Math.random() * list.length)];

      return {
        // id: quiz.id, // descomente se precisar para o submitAnswer
        image: quiz.image,
        options: quiz.options.map(({ id, right_answer, text }) => ({
          id,
          right_answer,
          text,
        })),
      };
    });
  }
}
