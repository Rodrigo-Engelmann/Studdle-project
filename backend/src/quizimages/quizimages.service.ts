import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizImage } from './quizimages.entity';

@Injectable()
export class QuizImageService {
  constructor(
    @InjectRepository(QuizImage)
    private readonly quizImageRepo: Repository<QuizImage>,
  ) {}

  create(data: Partial<QuizImage>) {
    const quizImage = this.quizImageRepo.create(data);
    return this.quizImageRepo.save(quizImage);
  }

  findAll() {
    return this.quizImageRepo.find({ relations: ['quiz'] });
  }

  async findById(id: number) {
    // QuizImage não tem PK própria, busca por quiz_id
    const images = await this.quizImageRepo.find({ where: { quiz_id: id } });
    if (!images.length) throw new NotFoundException(`Imagens do quiz #${id} não encontradas`);
    return images;
  }

  async update(id: number, data: Partial<QuizImage>) {
    await this.findById(id);
    await this.quizImageRepo.update({ quiz_id: id }, data);
    return this.findByQuiz(id);
  }

  async remove(id: number) {
    await this.findById(id);
    await this.quizImageRepo.delete({ quiz_id: id });
    return { deleted: true };
  }

  findByQuiz(quizId: number) {
    return this.quizImageRepo.find({ where: { quiz_id: quizId } });
  }

  async removeByQuiz(quizId: number) {
    await this.quizImageRepo.delete({ quiz_id: quizId });
    return { deleted: true };
  }
}