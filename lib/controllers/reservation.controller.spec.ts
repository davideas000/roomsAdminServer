import { ReservationController } from './reservation.controller';
import { ReservationModel } from './../models/reservation.model';

jest.mock('./../models/reservation.model', () => {
  return {
    ReservationModel: {
      find: jest.fn((query, callback) => { callback(null, ["dumb value"])})
    }
  };
});

describe("ReservationController", () => {

  let reservController;
  
  beforeEach(() => {
    reservController = new ReservationController();
  });
  
  it("#getCurrentUserApprovedReservations should run", () => {
    let Req = jest.fn().mockImplementation(() => {
      return {
        user: { sub: "userid" }
      };
    });
    
    let Res = jest.fn().mockImplementation(() => {
      return {
        send: jest.fn()
      };
    });

    let req = new Req();
    let res = new Res();
    
    reservController.getCurrentUserApprovedReservations(req, res);
    expect(ReservationModel.find).toBeCalled();
    expect(ReservationModel.find).toBeCalledWith({userId: "userid", status: "aproved"}, expect.any(Function));
    expect((res as any).send).toHaveBeenCalledTimes(1);
    expect((res as any).send).toHaveBeenCalledWith(["dumb value"]);
  });
  
});
