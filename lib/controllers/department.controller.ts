import { Request, Response } from 'express';
import { DepartmentModel } from '../models/department.model';

export class DepartmentController {
  getAcronyms(req: Request, res: Response) {
    DepartmentModel.find({}, 'acronym', (err, result) => {
      if (err) {
        return res.status(500).send({success: false, message: err.message});
      }

      const names = new Set<string>();
      for(let dep of result) {
        names.add(dep.acronym);
      }

      res.send({success: true, result: Array.from(names)});
    });
  }
}
