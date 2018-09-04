import { RoomModel } from "./room.model";

describe("RoomModel", () => {

  it("should be created", () => {
    const instance = new RoomModel({
      name: "sala 999",
      width: 10,
      length: 18,
      capacity: 10,
      type: "sala",
      department: "dep991",
      photos: ["./storage/roomphoto1.png", "./storage/roomphoto2.png"]
    });
    const result = instance.validateSync();
    expect(result).toBeUndefined();
    expect(instance.location.type).toBe("Point");
    expect(instance.location.coordinates[0]).toBe(0);
    expect(instance.location.coordinates[1]).toBe(0);
  });

  it("should not be created with invalid data", () => {
    const instance = new RoomModel();
    const result = instance.validateSync();
    expect(result).toBeTruthy();
    
    expect(result.errors.name.message).toBe("Path `name` is required.");
    expect(result.errors.width.message).toBe("Path `width` is required.");
    expect(result.errors.length.message).toBe("Path `length` is required.");
    expect(result.errors.capacity.message).toBe("Path `capacity` is required.");
    expect(result.errors.type.message).toBe("Path `type` is required.");
    expect(result.errors.department.message).toBe("Path `department` is required.");
  });
  
})
