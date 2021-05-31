import { TestBed } from '@angular/core/testing';

import { AngularClientService } from './angular-client.service';

describe('AngularClientService', () => {
  let service: AngularClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AngularClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
