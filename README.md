# UBG Angular Client

## Ein Library für Angular-basierte Web-API-Klient

**Diese Library kann verwendet werden uner Angular 10 or 11, und auch in Ionic 5**

Das modul soll importiert werden. Es reicht nicht, das Modul zu importieren, Providers sind ebenso wichtig,
siehe das Beispiel unten. Es ist zusätzlich nötig, ein Token-Service einzurichten, praktisch ist Cookie-Service
in Angular und Ionic-Service in Ionic.

Noch dazu ist sehr wichtig, unter Environments die Verbindungsdaten einzurichten.

### Angular

```
npm i @attus/cookie-service
```
```ts
import { AngularClientModule } from '@attus/angular-client';
import { CookieTokenServiceService } from '@attus/cookie-service';

import { environment } from '../environments/environment';

@NgModule({
  imports: [
    AngularClientModule,
  ],
  providers: [
    {
      provide: 'ANGULAR_CLIENT_TOKEN_SERVICE',
      useClass: CookieTokenServiceService,
    },
    {
      provide: 'ANGULAR_CLIENT_CONFIG',
      useValue: environment.apiClient,
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

### Ionic Example
```
npm i @attus/ionic-storage
```
```ts
import { AngularClientModule } from '@attus/angular-client';
import { IonicDataStorageModule, IonicTokenService } from '@attus/ionic-storage';

import { environment } from '../environments/environment';

@NgModule({
  imports: [
    IonicModule.forRoot(),
    AngularClientModule,
    IonicDataStorageModule,
  ],
  providers: [
    IonicTokenService,
    {
      provide: 'ANGULAR_CLIENT_TOKEN_SERVICE',
      useClass: IonicTokenService,
    },
    {
      provide: 'ANGULAR_CLIENT_CONFIG',
      useValue: environment.apiClient,
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

Environment must have API connection parameters:
```ts
export const environment = {
  production: false,
  apiClient: {
    url: 'https://example.com',
    token_path: 'oauth/token',
    client_id: 'abcdefgh-1234',
    client_secret: '98754',
    scope: 'scope1 scope2',
  }
};
```

## Usage

```ts

import { AngularClient, AngularClientHttpOptions } from '@attus/angular-client';

@Component({
  template: '',
})
export class MyComponent implements OnInit {

  data: MyData
  userSubscription: Subscription

  constructor(private apiClient: AngularClient) { }

  ngOnInit() {
    // Status: 1 - Authenticated, 0 - In process, -1 - Not Authenticated
    this.userSubscription = this.apiClient.getUserLoginStatus().subscribe(status => {
      if (status === 1) {
        this.getMyData().subscribe(data => {
          this.data = data;
        });
      }
    });
  }

  getMyData(id: string): Observable<MyData> {
    const options = this.apiClient.getHttpOptions();
    options.setAuthorization();
    const path: string = 'my/data/' + id;
    return this.drupal.get(path, options);
  }

  /**
   * GET Request with query parameter
   */
  getMyDataWithQuery(id: string, myParam: number): Observable<MyData> {
    const options = this.apiClient.getHttpOptions();
    options.setAuthorization();
    options.setParam('myParam', myParam);
    const path: string = 'my/data/' + id;
    return this.drupal.get(path, options);
  }

  loginUser(username: string, password: string): void {
    // There is no direct answer, but you can subscribe the result, see getUserLoginStatus()
    this.apiClient.login(username, password);
  }

}
```
