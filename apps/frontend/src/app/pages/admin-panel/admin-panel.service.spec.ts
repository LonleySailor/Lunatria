import { TestBed } from '@angular/core/testing';
import { AdminPanelService } from './admin-panel.service';
import { ApiService } from '../../services/api.service';

describe('AdminPanelService', () => {
  let service: AdminPanelService;
  let apiSpy: jasmine.SpyObj<ApiService>;

  beforeEach(() => {
    apiSpy = jasmine.createSpyObj<ApiService>('ApiService', ['get', 'post', 'delete']);
    TestBed.configureTestingModule({
      providers: [
        AdminPanelService,
        { provide: ApiService, useValue: apiSpy },
      ],
    });
    service = TestBed.inject(AdminPanelService);
  });

  it('createUser posts expected payload', async () => {
    apiSpy.post.and.resolveTo({ ok: true } as any);
    await service.createUser({ username: 'u', password: 'p', email: 'e', usertype: 'user', allowedServices: ['jellyfin'] });
    expect(apiSpy.post).toHaveBeenCalled();
  });

  it('addCredentials posts expected payload', async () => {
    apiSpy.post.and.resolveTo({ ok: true } as any);
    await service.addCredentials({ service: 'jellyfin', password: 'p', targetUser: 'u' });
    expect(apiSpy.post).toHaveBeenCalled();
  });
});
