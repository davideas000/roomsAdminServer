import { ReservationModel } from './reservation.model';

describe("ReservationModel", () => {

  it("should be created with valid data", () => {
    const reserv = new ReservationModel({
      startDate: Date.now(),
      endDate: Date.now(),
      startTime: Date.now(),
      endTime: Date.now(),
      status: "pending",
      userId: "flçdsjaçf",
      roomId: "kjçjçjççj"
    });
    const e = reserv.validateSync();
    expect(e).toBeUndefined();
  });

  it("should not be possible to create a empty reservation", () => {
    const reserv = new ReservationModel();
    
    const e = reserv.validateSync();
    expect(e).toBeTruthy();
    expect(e.errors.roomId.message).toBe('Path `roomId` is required.');
    expect(e.errors.userId.message).toBe('Path `userId` is required.');
    expect(e.errors.status.message).toBe('Path `status` is required.');
    expect(e.errors.startDate.message).toBe('Path `startDate` is required.');
    expect(e.errors.endDate.message).toBe('Path `endDate` is required.');
    expect(e.errors.startTime.message).toBe('Path `startTime` is required.');
    expect(e.errors.endTime.message).toBe('Path `endTime` is required.');
  });

  it("should not be created with invalid status", () => {
    const reserv = new ReservationModel({
      startDate: Date.now(),
      endDate: Date.now(),
      startTime: Date.now(),
      endTime: Date.now(),
      status: "kpending",
      userId: "flçdsjaçf",
      roomId: "kjçjçjççj"
    });
    
    const e = reserv.validateSync();
    expect(e).toBeTruthy();
    expect(e.errors.status.message).toBe('`kpending` is not a valid enum value for path `status`.');
  });

  it("#findOverlappgigReservation() should search for conflicting reservations", done => {
    const reserv = new ReservationModel({
      startDate: Date.now(),
      endDate: Date.now(),
      startTime: Date.now(),
      endTime: Date.now(),
      status: "kpending",
      userId: "flçdsjaçf",
      roomId: "kjçjçjççj"
    });

    const mockFind = jest.fn((query, callback) => callback(null, {value: true}));
    reserv.model = jest.fn(() => {return {find: mockFind}});

    reserv.findOverlappingReservations((err, result) => {
      expect(reserv.model).toHaveBeenCalledTimes(1);
      expect(reserv.model).toHaveBeenCalledWith("Reservation");
      expect(result).toEqual({value: true});
      expect(err).toBeNull();
      expect(mockFind).toHaveBeenCalledTimes(1);
      expect(mockFind).toHaveBeenCalledWith(
        {
          roomId: reserv.roomId,
          startDate: {$lte: reserv.endDate},
          endDate: {$gte: reserv.startDate},
          startTime: {$lt: reserv.endTime},
          endTime: {$gt: reserv.startTime}
        }, expect.any(Function));
      done();
    });
  });
  
});
