# UBG Angular Client

## Ein Library für Angular-basierte Web-API-Klient

[![GitHub release](https://img.shields.io/github/release/ubg-developer/ng-client.svg)](https://GitHub.com/ubg-developer/ng-client/releases/)
[![GitHub issues](https://img.shields.io/github/issues/ubg-developer/ng-client.svg)](https://GitHub.com/ubg-developer/ng-client/issues/)

**Diese Library Version ist kompatibel mit Angular 13**

Das Modul soll importiert werden. Es reicht nicht, das Modul zu importieren, Providers sind ebenso wichtig,
siehe das Beispiel unten. Es ist zusätzlich nötig, ein Token-Service einzurichten, praktisch ist Cookie-Service
in Angular und Ionic-Service in Ionic.

Noch dazu ist sehr wichtig, unter Environments die Verbindungsdaten einzurichten.

### Angular

```
npm i @ubg/ng-cookie-service
```
```ts
import { AngularClientModule } from '@ubg/ng-client';
import { CookieServiceModule, CookieTokenService } from '@ubg/ng-cookie-service';

import { environment } from '../environments/environment';

@NgModule({
  imports: [
    AngularClientModule,
    CookieServiceModule,
  ],
  providers: [
    {
      provide: 'ANGULAR_CLIENT_TOKEN_SERVICE',
      useClass: CookieTokenService,
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

### Ionic-Beispiel
```
npm i @ubg/io-token
```
```ts
import { AngularClientModule } from '@ubg/ng-client';
import { IoTokenModule, IoTokenService } from '@ubg/io-token';

import { environment } from '../environments/environment';

@NgModule({
  imports: [
    IonicModule.forRoot(),
    AngularClientModule,
    IoTokenModule,
  ],
  providers: [
    IonicTokenService,
    {
      provide: 'ANGULAR_CLIENT_TOKEN_SERVICE',
      useClass: IoTokenService,
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

Environment muss die API-Parametern beinhalten:
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

## Anwendung

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