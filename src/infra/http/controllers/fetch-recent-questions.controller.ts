import { Controller, Get, Query, UseGuards } from "@nestjs/common";

import { ZodValidationPipe } from "@/infra/http/pipes/zod-validation-pipe";

import { FetchRecentQuestionsUseCase } from "@/domain/forum/application/use-cases/fetch-recent-questions";

import { z } from "zod";

const pageQueryParamSchema = z
  .string()
  .optional()
  .default('1')
  .transform(Number)
  .pipe(z.number().min(1))
  
const queryValidationPipe = new ZodValidationPipe(pageQueryParamSchema)
  
type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>

@Controller('/questions')
export class FetchRecentQuestionsController {
  constructor(
    private fetchRecentQuestions: FetchRecentQuestionsUseCase,
  ) { }

  @Get()
  async handle(@Query('page', queryValidationPipe) page: PageQueryParamSchema) {

    const questions = await this.fetchRecentQuestions.execute({
      page,
    })

    return {
      questions
    }
  }
}