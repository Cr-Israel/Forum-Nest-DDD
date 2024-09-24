import { AuthenticateStudentUseCase } from "./authenticate-student"
import { FakeHasher } from "test/cryptography/fake-hasher"
import { FakeEncrypter } from "test/cryptography/fake-ecrypter"
import { InMemoryStudentsRepository } from "test/repositories/in-memory-students-repository"
import { makeStudent } from "test/factories/make-student"

let fakeHasher: FakeHasher
let fakeEcrypter: FakeEncrypter
let inMemoryStudentsRepository: InMemoryStudentsRepository

let sut: AuthenticateStudentUseCase

describe('Authenticate Student', async () => {
  beforeEach(() => {
    inMemoryStudentsRepository = new InMemoryStudentsRepository()
    fakeEcrypter = new FakeEncrypter()
    fakeHasher = new FakeHasher()

    sut = new AuthenticateStudentUseCase(
      inMemoryStudentsRepository,
      fakeHasher,
      fakeEcrypter
    )
  })

  it('should be able to authenticate a student', async () => {
    const student = makeStudent({
      email: 'johndoe@example.com',
      password: await fakeHasher.hash('123456')
    })

    inMemoryStudentsRepository.items.push(student)

    const result = await sut.execute({
      email: 'johndoe@example.com',
      password: '123456'
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({
      accessToken: expect.any(String),
    })
  })
})