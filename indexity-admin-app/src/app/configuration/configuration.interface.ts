export interface Configuration {
  apiConfig: {
    baseUrl: string;
  };
  socketConfig: {
    baseUrl: string;
    opts: {
      transports: string;
    };
  };
  separator: string;
}
