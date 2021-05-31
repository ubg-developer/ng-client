import { HttpHeaders, HttpParams } from "@angular/common/http";

export class AngularClientHttpOptions {

  headers: HttpHeaders = new HttpHeaders()
  params: HttpParams = null
  responseType = null
  authorization: string

  constructor(authorization: string) {
    this.authorization = authorization;
  }

  /**
   * The Request will be authorized, using Angular Client Authorization.
   * Since the authorization has already been set, and it will only be added to the headers by this function, 
   * this function has no parameters.
   */
  setAuthorization(): void {
    this.headers = this.headers.set('Authorization', this.authorization);
  }

  /**
   * Add any header option
   * @param name 
   * @param value 
   */
  setHeaders(name: any, value: any): void {
    this.headers = this.headers.set(name, value);
  }

  /**
   * Set JSON:API Content Type in Headers
   */
  setJsonApiHeaders(): void {
    this.headers = this.headers.set('Content-Type', 'application/vnd.api+json');
  }

  /**
   * Add any HTTP Parameter
   * @param name 
   * @param value 
   */
  setParam(name: string, value: any): void {
    if (this.params === null) {
      this.params = new HttpParams();
    }
    this.params = this.params.append(name, value);
  }

  /**
   * Set Response Type
   * @param type 
   */
  setResponseType(type: any): void {
    this.responseType = type;
  }

}

export class AngularClientRequestOptions {

  timeout: number = 8000;
  retry: number = 5;

}