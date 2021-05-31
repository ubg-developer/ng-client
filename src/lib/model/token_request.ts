export interface AngularClientTokenRequest {
  
  grant_type: string
  client_id: string
  client_secret: string

  username?: string
  password?: string
  refresh_token?: string
  scope?: string

}

export interface AngularClientTokenResponse {

  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string

}