export type ParticleAuth = {
  socialLogin: (isFresh?: boolean) => Promise<any>; // Replace any with the actual type
  fundYourSmartAccount: (userInfo: any, smartAccount: any) => Promise<any>; // Replace any with the actual types
  logout: () => Promise<void>;
};

export type CreateUser = {
  createUser: (
    username: string,
    passw: string,
    userProfile: any,
  ) => Promise<any>; // Replace any with the actual types
  signOut: () => Promise<void>;
  isUserExists: (userId: string) => Promise<boolean>;
  login: (username: string, passw: string) => Promise<any>; // Replace any with the actual types
};

export type AccountAbstractionPayment = {
  handleAAPayment: (args: any) => Promise<any>; // Replace any with the actual types
  handleAAPaymentSponsor: (args: any) => Promise<any>; // Replace any with the actual types
  createTransaction: (args: any) => Promise<any>; // Replace any with the actual types
  processTransactionBundle: (args: any) => Promise<any>; // Replace any with the actual types
};
