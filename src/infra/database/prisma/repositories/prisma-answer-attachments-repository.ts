import { Injectable } from "@nestjs/common";

import { PrismaService } from "../prisma.service";
import { AnswerAttachment } from "@/domain/forum/enterprise/entities/answer-attachment";
import { PrismaAnswerAttachmentMapper } from "../mappers/prisma-answer-attachment-mapper";
import { AnswerAttachmentsRepository } from "@/domain/forum/application/repositories/answer-attachments-repository";

@Injectable()
export class PrismaAnswerAttachmentsRepository implements AnswerAttachmentsRepository{
  constructor(private prisma: PrismaService) { }

  async findManyByAnswerId(answerId: string): Promise<AnswerAttachment[]> {
    const answerAttachments = await this.prisma.attachment.findMany({
      where: {
        answerId,
      },
    })

    // return questionAttachments.map(question => {
    //   return PrismaQuestionAttachmentMapper.toDomain(question)
    // })

    return answerAttachments.map(PrismaAnswerAttachmentMapper.toDomain)
  }
  
  async deleteManyByAnswerId(answerId: string): Promise<void> {
    await this.prisma.attachment.deleteMany({
      where: {
        id: answerId,
      }
    })
  }
}