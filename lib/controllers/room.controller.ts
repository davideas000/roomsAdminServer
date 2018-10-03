import { Request, Response, NextFunction } from 'express';
import { RoomModel } from '../models/room.model';
import { ReservationModel } from '../models/reservation.model';

export class RoomController {
  
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

  // FIXME: english grammar
  // check if the user has provided start/end date/time, if so
  // find rooms that are already reserved in the given period.
  // this result will be used in the next middleware to exclude
  // rooms that are already reserved
  getExcludes(req: Request, res: Response, next: NextFunction) {
    
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const startTime = req.query.startTime;
    const endTime = req.query.endTime;

    if (startDate && endDate && startTime && endTime) {
      const tempreserv = new ReservationModel(
        {
          startDate: startDate,
          endDate: endDate,
          startTime: startTime,
          endTime: endTime
        }
      );

      tempreserv.findOverlappingReservations((err, result: any[]) => {
        if (err) {
          return res.status(500).send({success: false, message: err.message});
        }
        let excludes: any[] = result.map((reserv) => reserv.room.toString());
        res.locals.excludes = excludes;
        next();
      });
    } else {
      next();
    }
    
  }

  // FIXME: english grammar
  // this function send to the client rooms that are not reserved in the specified
  // period and satisfy the given parameters
  findRoomsAndExclude (req: Request, res: Response) {
    const width = req.query.width || 0;
    const length = req.query.length || 0;
    const capacity = req.query.capacity || 0;
    const department = req.query.department;
    const rtype = req.query.type;

    const roomsQuery: any =  {
      width: {$gte: width},
      length: {$gte: length},
      capacity: {$gte: capacity}
    };
    if (department) {
      roomsQuery.department = department;
    }
    if (rtype) {
      roomsQuery.type = rtype;
    }

    RoomModel.find(
      roomsQuery,
      (err, rooms:any[]) => {
        if (err) {
          return res.status(500).send({success: false, message: err.message});
        }

        if (res.locals.excludes) {
          rooms = rooms.filter((r) => {
            return res.locals.excludes.indexOf(r._id.toString()) === -1;
          });
        }
        
        res.send({success: true, result: rooms});
      }
    );
  }
  
}
