import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { ApiService } from './api.service';

describe('AuthService', () => {
  let service: AuthService;
  let apiSpy: jasmine.SpyObj<ApiService>;

  beforeEach(() => {
    apiSpy = jasmine.createSpyObj<ApiService>('ApiService', ['get', 'post', 'delete']);
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: ApiService, useValue: apiSpy },
      ],
    });
    service = TestBed.inject(AuthService);
  });

  it('isUserLoggedIn returns true when 704', async () => {
    apiSpy.get.and.resolveTo({ responseCode: 704 });
    await expectAsync(service.isUserLoggedIn()).toBeResolvedTo(true);
  });

  it('isUserAdmin returns true when isAdmin true', async () => {
    apiSpy.get.and.resolveTo({ isAdmin: true });
    await expectAsync(service.isUserAdmin()).toBeResolvedTo(true);
  });
});
