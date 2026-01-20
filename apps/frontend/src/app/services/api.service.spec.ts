import { ApiService } from './api.service';

describe('ApiService', () => {
  let service: ApiService;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    service = new ApiService();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch as any;
  });

  it('should perform GET and parse JSON', async () => {
    const mockResponse = { ok: true, headers: { get: () => 'application/json' }, json: async () => ({ a: 1 }) } as any;
    globalThis.fetch = jasmine.createSpy('fetch').and.returnValue(Promise.resolve(mockResponse));

    const res = await service.get('/test');
    expect(res).toEqual({ a: 1 });
    expect(globalThis.fetch).toHaveBeenCalled();
  });

  it('should throw on non-ok response', async () => {
    const mockResponse = { ok: false, status: 500, headers: { get: () => 'application/json' }, json: async () => ({}) } as any;
    globalThis.fetch = jasmine.createSpy('fetch').and.returnValue(Promise.resolve(mockResponse));

    await expectAsync(service.get('/test')).toBeRejected();
  });
});
