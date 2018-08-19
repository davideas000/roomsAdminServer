import { Routes } from './routes';

describe("Routes", () => {
  it("#routes() should configure app routes", () => {
    
    const AppMock: any = jest.fn().mockImplementation(() => {
      return {
        get: jest.fn(),
        post: jest.fn(),
        route: jest.fn(),
        use: jest.fn()
      };
    });

    const appMock = new AppMock();
    const routes = new Routes();
    appMock.route.mockReturnValue(appMock);
    routes.routes(appMock);
    
    expect(appMock.get).toHaveBeenCalledTimes(2);
    expect(appMock.get).toHaveBeenCalledWith('/', expect.any(Function));
    
    expect(appMock.post).toHaveBeenCalledTimes(1);
    expect(appMock.post).toHaveBeenCalledWith('/login', expect.any(Function));

    expect(appMock.route).toHaveBeenCalledTimes(1);
    expect(appMock.route).toHaveBeenCalledWith('/reservation');

    expect(appMock.use).toHaveBeenCalledTimes(2);
  });
})
