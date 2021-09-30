export interface AngularClientTokenService {

  getRefreshToken(): Promise<string>
  setRefreshToken(token: string): Promise<any>
  deleteRefreshToken(): Promise<any>

  getAccessToken(): Promise<string>
  setAccessToken(token: string): Promise<void>
  deleteAccessToken(): Promise<void>  

}