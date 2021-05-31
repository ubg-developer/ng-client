import { APP_INITIALIZER, NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AngularClient } from './angular-client.service';

// @dynamic
@NgModule({
  imports: [
    HttpClientModule,
  ],
  providers: [
    AngularClient,
    {
      provide: APP_INITIALIZER,
      useFactory: function(client: AngularClient) {
        return function() {
          client.initialize();
        }
      },
      deps: [AngularClient],
      multi: true
    }
  ]
})
export class AngularClientModule { }
