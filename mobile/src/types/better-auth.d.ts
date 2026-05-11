// Type declaration for better-auth/react which lacks proper types for Expo
declare module "better-auth/react" {
  export function createAuthClient(options: any): any
}

declare module "@better-auth/expo/client" {
  export function expoClient(options: any): any
}

declare module "better-auth/client/plugins" {
  export function oneTapClient(): any
  export function emailOTPClient(): any
}
