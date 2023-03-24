export const tokenGetter = (): string => localStorage.getItem('accessToken');

export const jwtOptionsFactory: any = (options) => {
  const whitelist: string[] = options.whitelistedDomains || [];
  const blacklist: string[] = options.blacklistedRoutes || [];

  const addToWhitelistedDomains: (domains: string[]) => void = (
    domains: string[],
  ) => {
    whitelist.push(...domains);
  };

  const addToBlacklistedRoutes: (domains: string[]) => void = (
    domains: string[],
  ) => {
    blacklist.push(...domains);
  };

  return {
    addToWhitelistedDomains,
    addToBlacklistedRoutes,
    options: () => ({
      ...options,
      whitelistedDomains: whitelist,
      blacklistedRoutes: blacklist,
    }),
  };
};

export const jwtOptions = jwtOptionsFactory({
  tokenGetter,
  whitelistedDomains: [],
  blacklistedRoutes: [],
});
