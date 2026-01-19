import { TestBed } from '@angular/core/testing';
import { StatusService } from './status.service';
import { ApiService } from './api.service';

describe('StatusService', () => {
  let service: StatusService;
  let apiSpy: jasmine.SpyObj<ApiService>;

  beforeEach(() => {
    apiSpy = jasmine.createSpyObj<ApiService>('ApiService', ['get']);
    TestBed.configureTestingModule({
      providers: [
        StatusService,
        { provide: ApiService, useValue: apiSpy },
      ],
    });
    service = TestBed.inject(StatusService);
  });

  it('emits statuses from api', (done) => {
    const expected = { jellyfin: true, radarr: false, sonarr: true, hoarder: false, nextcloud: false, vaultwarden: false, komga: false } as any;
    apiSpy.get.and.resolveTo(expected);
    service.getAllServiceStatuses().subscribe((value) => {
      expect(value).toEqual(expected);
      done();
    });
  });
});
