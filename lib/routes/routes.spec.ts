import { Routes } from './routes';

describe("Routes", () => {
  
  it("#routes() should configure app routes", () => {
    
    const AppMock: any = jest.fn().mockImplementation(() => {
      return {
        get: jest.fn(),
        post: jest.fn(),
        route: jest.fn(),
        use: jest.fn(),
        delete: jest.fn(),
        put: jest.fn()
      };
    });

    const appMock = new AppMock();
    const routes = new Routes();
    appMock.route.mockReturnValue(appMock);
    appMock.get.mockReturnValue(appMock);
    appMock.put.mockReturnValue(appMock);
    routes.routes(appMock);
    
    expect(appMock.get).toHaveBeenCalledTimes(7);
    expect(appMock.get).toHaveBeenCalledWith('/', expect.any(Function));
    expect(appMock.get).toHaveBeenCalledWith(
      "/notifications",
      expect.any(Function), expect.any(Function));
    expect(appMock.get).toHaveBeenCalledWith(
      "/profile",
      expect.any(Function), expect.any(Function));

    expect(appMock.get).toHaveBeenCalledWith(
      "/rtypes",
      expect.any(Function), expect.any(Function));

    expect(appMock.get).toHaveBeenCalledWith(
      "/dacronyms",
      expect.any(Function), expect.any(Function));

    expect(appMock.get).toHaveBeenCalledWith(
      "/rsearch", expect.any(Function),
      expect.any(Function), expect.any(Function));
    
    expect(appMock.post).toHaveBeenCalledTimes(2);
    expect(appMock.post).toHaveBeenCalledWith('/login', expect.any(Function));
    
    expect(appMock.post).toHaveBeenCalledWith(
      '/reservation', expect.any(Function), expect.any(Array), expect.any(Function)
    );

    expect(appMock.route).toHaveBeenCalledTimes(2);
    expect(appMock.route).toHaveBeenCalledWith('/reservations');
    expect(appMock.route).toHaveBeenCalledWith('/reservation/:id');
    
    expect(appMock.use).toHaveBeenCalledTimes(2);
    expect(appMock.use).toHaveBeenCalledWith(expect.any(Function));
    
    expect(appMock.put).toHaveBeenCalledTimes(2);
    expect(appMock.put).toHaveBeenCalledWith(
      expect.any(Function), expect.any(Function), expect.any(Function),
      expect.any(Function));
    
    expect(appMock.put).toHaveBeenCalledWith(
      "/notifim", expect.any(Function),
      expect.any(Function));
    
    expect(appMock.delete).toHaveBeenCalledTimes(1);
    expect(appMock.delete).toHaveBeenCalledWith(expect.any(Function), expect.any(Function));
  });
})
