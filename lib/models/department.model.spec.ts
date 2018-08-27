import { DepartmentModel } from './department.model';

describe("DeparmentModel", () => {

  it("should be created", async () => {
    const dep = new DepartmentModel({
      name: "dep blu",
      acronym: "DB",
      userId: "userid001",
    });
    const e = dep.validateSync();
    expect(e).toBeUndefined();
  });
  
  it("should not be created with invalid data", () => {
    const dep = new DepartmentModel();
    const e = dep.validateSync();
    expect(e).toBeDefined();
    expect(e.errors.userId.message).toBe("Path `userId` is required.");
    expect(e.errors.acronym.message).toBe("Path `acronym` is required.");
  });
  
});
