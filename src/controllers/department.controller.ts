import { Request, Response } from 'express';
import { DepartmentModel } from '../models/department.model';

export class DepartmentController {
  getDeps(req: Request, res: Response) {
    DepartmentModel.find({}, 'name acronym', (err, deps) => {
      if (err) {
        return res.status(500).send({message: err.message});
      }

      res.send(deps);
    });
  }
}
