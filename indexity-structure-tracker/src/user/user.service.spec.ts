import { HttpModule } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);
    service['_token'] = null;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getToken', () => {
    const token = 'token';

    it('should return saved token if it exists', async () => {
      service['_token'] = token;
      await expect(service.getToken()).resolves.toEqual(token);
    });

    it('should fetch token if it no token is saved', async () => {
      jest.spyOn(service as any, 'authUser').mockResolvedValueOnce(token);
      await expect(service.getToken()).resolves.toEqual(token);
    });

    it('should fail if the token cannot be retrieved', async () => {
      jest.spyOn(service as any, 'authUser').mockImplementationOnce(() => {
        throw new Error();
      });
      await expect(service.getToken()).rejects.toThrow(Error);
    });
  });
});
