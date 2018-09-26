import { Request, Response } from 'express';
import { DepartmentModel } from '../models/department.model';

export class DepartmentController {
  // TODO: add tests
  getAcronyms(req: Request, res: Response) {
    DepartmentModel.find({}, 'acronym', (err, result) => {
      if (err) {
        return res.status(502).send({success: false, message: err.message});
      }

      const names = new Set<string>();
      for(let dep of result) {
        names.add(dep.acronym);
      }

      res.send(Array.from(names));
    });
  }
}
