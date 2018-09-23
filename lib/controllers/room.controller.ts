import { Request, Response } from 'express';
import { RoomModel } from '../models/room.model';

export class RoomController {
  
  // TODO: add tests
  getTypes(req: Request, res: Response) {
    RoomModel.find({}, 'type', (err, result) => {
      if (err) {
        return res.status(502).send({success: false, message: err.message});
      }

      const rtypes = new Set<string>();
      for(let room of result) {
        rtypes.add(room.type);
      }

      res.send({success: true, result: Array.from(rtypes)});
    });
  }
  
}
