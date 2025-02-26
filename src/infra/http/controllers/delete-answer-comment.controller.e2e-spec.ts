import { Test } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { INestApplication } from "@nestjs/common";

import request from "supertest";

import { AppModule } from "@/infra/app.module";
import { DatabaseModule } from "@/infra/database/database.module";
import { PrismaService } from "@/infra/database/prisma/prisma.service";

import { StudentFactory } from "test/factories/make-student";
import { QuestionFactory } from "test/factories/make-question";
import { QuestionCommentFactory } from "test/factories/make-question-comment";
import { AnswerFactory } from "test/factories/make-answer";
import { AnswerCommentFactory } from "test/factories/make-answer-comment";

describe('Delete question comment (E2E)', () => {
  let jwt: JwtService;
  let app: INestApplication;
  let prisma: PrismaService;
  let answerFactory: AnswerFactory;
  let studentFactory: StudentFactory;
  let questionFactory: QuestionFactory;
  let answerCommentFactory: AnswerCommentFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        StudentFactory,
        AnswerFactory,
        QuestionFactory,
        AnswerCommentFactory,
      ],
    }).compile();

    app = moduleRef.createNestApplication();

    jwt = moduleRef.get(JwtService)
    prisma = moduleRef.get(PrismaService)

    answerFactory = moduleRef.get(AnswerFactory)
    studentFactory = moduleRef.get(StudentFactory)
    questionFactory = moduleRef.get(QuestionFactory)
    answerCommentFactory = moduleRef.get(AnswerCommentFactory)

    await app.init();
  });

  test('[DELETE] /answers/comments/:id', async () => {
    const user = await studentFactory.makePrismaStudent()

    const accessToken = jwt.sign({ sub: user.id.toString() })

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    })

    const answer = await answerFactory.makePrismaAnswer({
      authorId: user.id,
      questionId: question.id
    })

    const answerComment = await answerCommentFactory.makePrismaAnswerComment({
      authorId: user.id,
      answerId: answer.id,
    })

    const answerCommentId = answerComment.id.toString()

    const response = await request(app.getHttpServer())
      .delete(`/answers/comments/${answerCommentId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send()

    expect(response.statusCode).toBe(204)

    const commentOnDatabase = await prisma.comment.findUnique({
      where: {
        id: answerCommentId,
      },
    })

    expect(commentOnDatabase).toBeNull()
  })
})