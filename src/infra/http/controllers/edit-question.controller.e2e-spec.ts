import { Test } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { INestApplication } from "@nestjs/common";

import request from "supertest";

import { AppModule } from "@/infra/app.module";
import { DatabaseModule } from "@/infra/database/database.module";
import { PrismaService } from "@/infra/database/prisma/prisma.service";

import { StudentFactory } from "test/factories/make-student";
import { QuestionFactory } from "test/factories/make-question";

describe('Edit Question (E2E)', () => {
  let jwt: JwtService;
  let app: INestApplication;
  let prisma: PrismaService;
  let studentFactory: StudentFactory;
  let questionFactory: QuestionFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [StudentFactory, QuestionFactory],
    }).compile();

    app = moduleRef.createNestApplication();

    jwt = moduleRef.get(JwtService)
    prisma = moduleRef.get(PrismaService)
    studentFactory = moduleRef.get(StudentFactory)
    questionFactory = moduleRef.get(QuestionFactory)

    await app.init();
  });

  test('[PUT] /questions/:id', async () => {
    const user = await studentFactory.makePrismaStudent()

    const accessToken = jwt.sign({ sub: user.id.toString() })

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id
    })

    const response = await request(app.getHttpServer())
      .put(`/questions/${question.id.toString()}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'New title',
        content: 'New content',
      })

    expect(response.statusCode).toBe(204)

    const questionOnDatabase = await prisma.question.findFirst({
      where: {
        title: 'New title',
        content: 'New content',
      }
    })

    expect(questionOnDatabase).toBeTruthy()
  })
})