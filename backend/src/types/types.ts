export interface RefreshToken {
  userId: number
  token: string
  revoked: boolean
  expiresAt: Date
}
