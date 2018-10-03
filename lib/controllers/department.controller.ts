import { Request, Response } from 'express';
import { DepartmentModel } from '../models/department.model';

export class DepartmentController {
  // TODO: add tests
  getDeps(req: Request, res: Response) {
    DepartmentModel.find({}, 'name acronym', (err, deps) => {
      if (err) {
        return res.status(500).send({success: false, message: err.message});
      }

      res.send({success: true, result: deps});
    });
  }
}
