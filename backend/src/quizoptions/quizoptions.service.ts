import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizOption } from './quizoptions.entity';

@Injectable()
export class QuizOptionService {
  constructor(
    @InjectRepository(QuizOption)
    private readonly quizOptionRepo: Repository<QuizOption>,
  ) {}

  create(data: Partial<QuizOption>) {
    const quizOption = this.quizOptionRepo.create(data);
    return this.quizOptionRepo.save(quizOption);
  }

  findAll() {
    return this.quizOptionRepo.find({ relations: ['quiz'] });
  }

  async findById(id: number) {
    const options = await this.quizOptionRepo.find({ where: { quiz_id: id } });
    if (!options.length) throw new NotFoundException(`Opções do quiz #${id} não encontradas`);
    return options;
  }

  async update(id: number, data: Partial<QuizOption>) {
    await this.findById(id);
    await this.quizOptionRepo.update({ quiz_id: id }, data);
    return this.findByQuiz(id);
  }

  async remove(id: number) {
    await this.findById(id);
    await this.quizOptionRepo.delete({ quiz_id: id });
    return { deleted: true };
  }

  findByQuiz(quizId: number) {
    return this.quizOptionRepo.find({ where: { quiz_id: quizId } });
  }

  async findCorrect(quizId: number) {
    const option = await this.quizOptionRepo.findOne({
      where: { quiz_id: quizId, right_answer: true },
    });
    if (!option)
      throw new NotFoundException(`Opção correta do quiz #${quizId} não encontrada`);
    return option;
  }

  async removeByQuiz(quizId: number) {
    await this.quizOptionRepo.delete({ quiz_id: quizId });
    return { deleted: true };
  }
}