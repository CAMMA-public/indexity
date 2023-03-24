export const indexityTestConfig = {
  configuration: {
    apiConfig: {
      baseUrl: 'http://localhost:8082',
    },
    socketConfig: {
      baseUrl: 'http://localhost:8082',
      opts: {
        transports: 'websocket',
      },
    },
    jwtSettings: {
      whitelistedDomains: 'localhost:8082|127.0.0.1:8082',
      blacklistedRoutes: '',
    },
    separator: '|',
    enableGroupPermissions: 'true',
  },
};
