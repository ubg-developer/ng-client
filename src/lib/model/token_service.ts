export interface AngularClientTokenService {

  getRefreshToken(): Promise<string>
  setRefreshToken(token: string): Promise<any>
  deleteRefreshToken(): Promise<any>

}