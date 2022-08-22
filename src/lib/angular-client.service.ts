/**
 * Client Service for Web API Communication
 *
 * @author Attila Németh
 * @date 1.2.2021
 */

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, retry, timeout } from 'rxjs/operators';
import { AngularClientApiConfig } from './model/api_config';
import { AngularClientHttpOptions, AngularClientRequestOptions } from './model/http_options';
import { AngularClientTokenRequest, AngularClientTokenResponse } from './model/token_request';
import { AngularClientTokenService } from './model/token_service';

@Injectable({
  providedIn: 'root'
})
export class AngularClient {

  private userLoginStatus: BehaviorSubject<number> = new BehaviorSubject(0)
  private loginRequestStatus: BehaviorSubject<number> = new BehaviorSubject(0);
  private authorization: string|null = null
  private refreshTimeout: any = null
  private lastRefresh: number = 0

  constructor(private http: HttpClient,
              @Inject('ANGULAR_CLIENT_TOKEN_SERVICE') private tokenService: AngularClientTokenService,
              @Inject('ANGULAR_CLIENT_CONFIG') private clientConfig: AngularClientApiConfig) { }

  initialize() {
    this.refreshToken();
    return() => console.info('API Client Initialized');
  }

  /**
   * User Login
   *
   * Actually an OAuth2 Access Token is requested from the API Server
   *
   * @param username
   * @param password
   */
  login(username: string, password: string): void {
    const request: AngularClientTokenRequest = {
      grant_type: 'password',
      client_id: this.clientConfig.client_id,
      client_secret: this.clientConfig.client_secret,
      scope: this.clientConfig.scope,
      username: username,
      password: password,
    };
    this.getToken(request);
  }

  /**
   * Anmeldung durch CDUplus
   * @param code 
   * @param clientId 
   * @param clientSecret 
   * @param scope 
   */
  loginCduplus(code: string, clientId: string, clientSecret: string, scope: string): void {
    const request: AngularClientTokenRequest = {
      grant_type: 'cduplus',
      client_id: this.clientConfig.client_id,
      client_secret: this.clientConfig.client_secret,
      scope: this.clientConfig.scope,
      code: code,
      cduplus_client: clientId,
      cduplus_secret: clientSecret,
      cduplus_scope: scope,
    };
    this.getToken(request);
  }

  /**
   * User Logout
   *
   * Access and Refresh Tokens are removed
   */
  logout(): void {
    this.userLoginStatus.next(-1);
    this.authorization = null;
    this.tokenService.deleteRefreshToken().then(() => {
      console.info('Invalid Refresh Token removed');
    });
  }

  /**
   * User Login Status as Observable (i.e. it may be subscribed)
   * Values:      0     Status unknown (server has not answered yet or login is in process)
   *              -1    User is not logged in
   *              1     User is logged in
   */
  getUserLoginStatus(): Observable<number> {
    return this.userLoginStatus.asObservable();
  }

  /**
   * Anmeldungsstatus. Das Ergebnis des Anmeldungsprozesses
   * @returns number
   */
  getLoginRequestStatus(): Observable<number> {
    return this.loginRequestStatus.asObservable();
  }

  /**
   * A new HTTP Options instance. These options may be applied in HTTP Requests
   */
  getHttpOptions(): AngularClientHttpOptions {
    let options;
    if (this.authorization !== null && this.authorization !== undefined) {
      options = new AngularClientHttpOptions(this.authorization);
    }
    else {
      options = new AngularClientHttpOptions('');
    }
    return options;
  }

  /**
   * HTTP GET Request
   * @param path
   *  Request Path, related to API Root
   * @param httpOptions
   *  HTTP Options
   * @param requestOptions
   *  Request Options
   */
  get(path: string, httpOptions?: AngularClientHttpOptions, requestOptions?: AngularClientRequestOptions): Observable<any> {
    if (requestOptions === null || requestOptions === undefined) {
      requestOptions = new AngularClientRequestOptions;
      requestOptions.retry = 5;
    }
    if (httpOptions === null || httpOptions === undefined) {
      httpOptions = this.getHttpOptions();
    }
    return this.http.get(this.getUrl(path), httpOptions).pipe(
      retry(requestOptions.retry),
      timeout(requestOptions.timeout),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 || error.status === 403) {
         this.refreshToken();
        }
        return this.formatErrors(error);
      }),
    );
  }

  /**
   * HTTP POST Request
   * @param path
   *  Request Path, related to API Root
   * @param data
   *  Request Data to be posted
   * @param httpOptions
   * @param requestOptions
   */
  post(path: string, data: any, httpOptions?: AngularClientHttpOptions, requestOptions?: AngularClientRequestOptions): Observable<any> {
    if (requestOptions === null || requestOptions === undefined) {
      requestOptions = new AngularClientRequestOptions;
      requestOptions.timeout = 30000;
    }
    return this.http.post(this.getUrl(path), data, httpOptions).pipe(
      retry(requestOptions.retry),
      timeout(requestOptions.timeout),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 || error.status === 403) {
          /*
          this.tokenService.getAccessToken().then(token => {
            this.authorization = token;
          });
          */
         this.refreshToken();
        }
        return this.formatErrors(error);
      }),
    );
  }

  /**
   * HTTP PATCH Request
   * @param path
   *  Request Path, related to API Root
   * @param data
   *  Request Data to be posted
   * @param httpOptions
   * @param requestOptions
   */
  patch(path: string, data: any, httpOptions?: AngularClientHttpOptions, requestOptions?: AngularClientRequestOptions): Observable<any> {
    if (requestOptions === null || requestOptions === undefined) {
      requestOptions = new AngularClientRequestOptions;
      requestOptions.timeout = 30000;
    }
    return this.http.patch(this.getUrl(path), data, httpOptions).pipe(
      retry(requestOptions.retry),
      timeout(requestOptions.timeout),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 || error.status === 403) {
          /*
          this.tokenService.getAccessToken().then(token => {
            this.authorization = token;
          });
          */
         this.refreshToken();
        }
        return this.formatErrors(error);
      }),
    );
  }

  /**
   * HTTP DELETE Request
   * @param path
   *  Request Path, related to API Root
   * @param httpOptions
   * @param requestOptions
   */
  delete(path: string, httpOptions?: AngularClientHttpOptions, requestOptions?: AngularClientRequestOptions): Observable<any> {
    if (requestOptions === null || requestOptions === undefined) {
      requestOptions = new AngularClientRequestOptions;
      requestOptions.retry = 1;
    }
    return this.http.delete(this.getUrl(path), httpOptions).pipe(
      retry(requestOptions.retry),
      timeout(requestOptions.timeout),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 || error.status === 403) {
          /*
          this.tokenService.getAccessToken().then(token => {
            this.authorization = token;
          });
          */
         this.refreshToken();
        }
        return this.formatErrors(error);
      }),
    );
  }

  private getUrl(path: string): string {
    return this.clientConfig.url + '/' + path.replace(/^\//g, '');
  }

  private refreshToken(): void {
    this.tokenService.getRefreshToken().then(token => {
      if (token === null) {
        this.userLoginStatus.next(-1);
      }
      else {
        const request: AngularClientTokenRequest = {
          grant_type: 'refresh_token',
          client_id: this.clientConfig.client_id,
          client_secret: this.clientConfig.client_secret,
          refresh_token: token,
        };
        this.getToken(request);
      }
    }).catch(() => {
      this.userLoginStatus.next(-1);
    });
  }

  private getToken(request: AngularClientTokenRequest): void {
    this.loginRequestStatus.next(0);
    console.info('Zugriffstoken wird angefragt...');
    const formData = new FormData();
    Object.entries(request).forEach(([key, value]) => formData.append(key, value));
    this.http.post<AngularClientTokenResponse>(this.clientConfig.url + '/' + this.clientConfig.token_path, formData).pipe(
      retry(1),
      timeout(60000),
      catchError(error => {
        if (error instanceof TimeoutError) {
          // Timeout
          console.warn('Timeout bei der Token-Anfrage');
          return throwError({
            status: -1,
            message: 'Timeout'
          });
        }
        else if (error.status <= 0) {
          // Netzwerkfehler
          // Tokens werden nicht entfernt
          console.warn('Netzwerkfehler bei der Token-Anfrage');
          console.info('Es wird wieder versucht');
          if (this.refreshTimeout !== null && this.refreshTimeout !== undefined) {
            clearTimeout(this.refreshTimeout);
          }
          let tt: number = 1500;
          const now: Date = new Date();
          if (now.getTime() < this.lastRefresh + 10000) {
            tt = 20000;
          }
          this.refreshTimeout = setTimeout(() => {
            this.refreshToken();
          }, tt);
          this.lastRefresh = now.getTime();
          return throwError({
            status: 0,
            message: 'Netzwerkfehler'
          });
        }
        else {
          // Anmeldungsfehler
          if (request.grant_type === 'password') {
            this.loginRequestStatus.next(-1);
          }
          this.userLoginStatus.next(-1);
          this.authorization = null;
          this.tokenService.deleteAccessToken();
          this.tokenService.deleteRefreshToken().then(() => {
            console.info('Veraltetes Refresh Token wurde entfernt');
          });
          return this.formatErrors(error);
        }
      }),
    ).subscribe((response: AngularClientTokenResponse) => {
      this.authorization = response.token_type + ' ' + response.access_token;
      this.tokenService.setAccessToken(response.token_type + ' ' + response.access_token);
      this.tokenService.setRefreshToken(response.refresh_token);
      if (this.refreshTimeout !== null && this.refreshTimeout !== undefined) {
        clearTimeout(this.refreshTimeout);
      }
      this.refreshTimeout = setTimeout(() => {
        this.refreshToken();
      }, (response.expires_in - 30) * 1000);
      console.info('Das Token wurde aktualisiert.');
      if (this.userLoginStatus.value !== 1) {
        // Anmelden, aber nur wenn er bisher nicht angemeldet war.
        this.userLoginStatus.next(1);
      }
      if (request.grant_type === 'password') {
        this.loginRequestStatus.next(1);
      }
    });
  }

  private formatErrors(error: HttpErrorResponse) {
    console.error('HTTP', error.status);
    if (error instanceof TimeoutError) {
      return throwError({
        status: -1,
        message: 'Timeout'
      });
    }
    switch (error.status) {
      case 0:
        console.warn('Keine Verbindung');
        return throwError({
          status: 0,
          message: 'Keine Verbindung'
        });
      case 422:
      case 500:
        console.warn(error.statusText);
        console.warn(error.message);
        let errorDetails: string|null = null
        for (let i in error.error['errors']) {
          console.warn('--', error.error['errors'][i]['status'],
                                error.error['errors'][i]['detail']);
          errorDetails = error.statusText + ': ' + error.error['errors'][i]['detail'];
        }
        if (errorDetails !== null) {
          return throwError({
            status: error.status,
            message: errorDetails,
          });
        }
        return throwError({
          status: error.status,
          message: error.statusText
        });
        break;
      case 401:
        console.warn('401 Nicht Angemeldet');
        return throwError({
          status: 401,
          message: 'Nicht angemeldet'
        });
      case 403:
        return throwError({
          status: 403,
          message: 'Zugriff verweigert'
        });
      case 404:
        return throwError({
          status: 404,
          message: 'Nicht gefunden'
        });
      case 412:
        return throwError({
          status: 412,
          message: 'Voraussetzung fehlt'
        });
      default:
        console.warn(error.statusText);
        console.warn('--', error.message);
        return throwError({
          status: error.status,
          message: error.message
        });
    }
    return throwError(error);
  }

}