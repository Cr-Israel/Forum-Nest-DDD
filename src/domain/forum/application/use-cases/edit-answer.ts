import { Either, left, right } from "@/core/either"
import { UniqueEntityID } from "@/core/entities/unique-entity-id"

import { Answer } from "../../enterprise/entities/answer"
import { AnswerAttachment } from "../../enterprise/entities/answer-attachment"
import { AnswerAttachmentList } from "../../enterprise/entities/answer-attachment-list"

import { AnswersRepository } from "../repositories/answers-repository"
import { AnswerAttachmentsRepository } from "../repositories/answer-attachments-repository"

import { NotAllowedError } from "@/core/errors/not-allowed-error"
import { ResourceNotFoundError } from "@/core/errors/resource-not-found-error"
import { Injectable } from "@nestjs/common"

interface EditAnswerUseCaseRequest {
  authorId: string
  answerId: string
  attachmentsIds: string[]
  content: string
}

type EditAnswerUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  {
    answer: Answer
  }
>

@Injectable()
export class EditAnswerUseCase {
  constructor(
    private answersRepository: AnswersRepository,
    private answerAttachmentsRepository: AnswerAttachmentsRepository
  ) { }

  async execute({
    authorId,
    answerId,
    attachmentsIds,
    content
  }: EditAnswerUseCaseRequest): Promise<EditAnswerUseCaseResponse> {
    const answer = await this.answersRepository.findById(answerId)

    if (!answer) {
      return left(new ResourceNotFoundError())
    }

    if (authorId !== answer.authorId.toString()) {
      return left(new NotAllowedError())
    }

    const currentAnswerAttachments =
      await this.answerAttachmentsRepository.findManyByAnswerId(answerId)

    const answerAttachmentList = new AnswerAttachmentList(
      currentAnswerAttachments
    )

    const answerAttachments = attachmentsIds.map((attachmentId) => {
      return AnswerAttachment.create({
        attachmentId: new UniqueEntityID(attachmentId),
        answerId: answer.id
      })
    })

    answerAttachmentList.update(answerAttachments)

    answer.content = content
    answer.attachments = answerAttachmentList

    await this.answersRepository.save(answer)

    return right({
      answer
    })
  }
}