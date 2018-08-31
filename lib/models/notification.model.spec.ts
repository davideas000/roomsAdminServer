import { NotificationModel } from './notification.model';

describe("NotificationModel", () => {
  
  it("should be created",  () => {
    const notifi = new NotificationModel({
      message: "Nofication 001",
      status: "unread"
    });
    const e = notifi.validateSync();
    expect(e).toBeUndefined();
  });
  
  it("should not be created without data",  () => {
    const notifi = new NotificationModel();
    const e = notifi.validateSync();
    
    expect(e).toBeDefined();
    expect(e.errors.message.message).toBe("Path `message` is required.");
    expect(e.errors.status.message).toBe("Path `status` is required.");
  });
  
});
