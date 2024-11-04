import { Test } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { INestApplication } from "@nestjs/common";

import request from "supertest";

import { AppModule } from "@/infra/app.module";
import { DatabaseModule } from "@/infra/database/database.module";

import { AnswerFactory } from "test/factories/make-answer";
import { StudentFactory } from "test/factories/make-student";
import { QuestionFactory } from "test/factories/make-question";
import { AnswerCommentFactory } from "test/factories/make-answer-comment";

describe('Fetch questions comments (E2E)', () => {
  let jwt: JwtService;
  let app: INestApplication;
  let answerFactory: AnswerFactory;
  let studentFactory: StudentFactory;
  let questionFactory: QuestionFactory;
  let answerCommentFactory: AnswerCommentFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        StudentFactory, 
        QuestionFactory, 
        AnswerFactory, 
        AnswerCommentFactory
      ],
    }).compile();

    jwt = moduleRef.get(JwtService)
    app = moduleRef.createNestApplication();

    answerFactory = moduleRef.get(AnswerFactory)
    studentFactory = moduleRef.get(StudentFactory)
    questionFactory = moduleRef.get(QuestionFactory)
    answerCommentFactory = moduleRef.get(AnswerCommentFactory)

    await app.init();
  });

  test('[GET] /answers/:answerId/comments', async () => {
    const user = await studentFactory.makePrismaStudent({
      name: 'John Doe',
    })

    const accessToken = jwt.sign({ sub: user.id.toString() })

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    })

    const answer = await answerFactory.makePrismaAnswer({
      authorId: user.id,
      questionId: question.id,
    })

    const answerId = answer.id.toString()

    await Promise.all([
      answerCommentFactory.makePrismaAnswerComment({ 
        authorId: user.id,
        answerId: answer.id,
        content: 'Comment 01'
      }),
      answerCommentFactory.makePrismaAnswerComment({ 
        authorId: user.id,
        answerId: answer.id,
        content: 'Comment 02'
      }),
    ])

    const response = await request(app.getHttpServer())
      .get(`/answers/${answerId}/comments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send()

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      comments: expect.arrayContaining([
        expect.objectContaining({ content: 'Comment 01', authorName: 'John Doe' }),
        expect.objectContaining({ content: 'Comment 02', authorName: 'John Doe' }),
      ])
    })
  })
})