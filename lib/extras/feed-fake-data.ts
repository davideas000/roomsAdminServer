import * as mongoose from 'mongoose';
import { config } from '../config/config';
import { ReservationModel } from '../models/reservation.model';
import { UserModel } from '../models/user.model';
import { DepartmentModel } from '../models/department.model';
import { RoomModel } from '../models/room.model';

const con = mongoose.connect(config.mongoURL, {useNewUrlParser: true});

async function dropCollection (coll: string) {
  try {
    await mongoose.connection.dropCollection(coll);
  } catch(e) {
    console.log(`error while dropping \'${coll}\' collection`, e.message);    
  }  
}

async function initializeDB () {

  await dropCollection('departments');
  await dropCollection('rooms');
  await dropCollection('reservations');
  
  const resp1 = await UserModel.findOne({email: 'saber@example.com'});
  const resp2 = await UserModel.findOne({email: 'marsh@example.com'});
  
  const depsTest = [
    {
      user: resp1._id,
      name: 'instituto blablabla',
      acronym: 'IEG'
    },
    {
      user: resp2._id,
      name: 'instituto blublublu',
      acronym: 'IOG'
    },
    
  ];

  const deps = await DepartmentModel.insertMany(depsTest);

  const roomsTest = [
    {
      name: 'sala 100',
      description: 'sala comum',
      width: 200,
      length: 300,
      capacity: 100,
      type: 'sala',
      department: deps[0]._id
    },
    
    {
      name: 'lab 1',
      description: 'laboratorio de informatica',
      width: 200,
      length: 300,
      capacity: 100,
      type: 'laboratorio',
      department: deps[0]._id
    },
    
    {
      name: 'auditorio 7',
      width: 200,
      length: 300,
      capacity: 100,
      type: 'auditorio',
      department: deps[1]._id
    },
    
    {
      name: 'lab 3',
      width: 200,
      length: 300,
      capacity: 100,
      type: 'laboratorio',
      department: deps[1]._id
    }
  ];

  const rooms = await RoomModel.insertMany(roomsTest);

  const user = await UserModel.findOne({email: 'david.edews@gmail.com'});
  const reservationTest = [
    
    {
      reason: 'aula de alguma coisa, e outra coisa',
      startDate: new Date(),
      endDate: new Date(),
      startTime: new Date(),
      endTime: new Date(),
      code: 21,
      sequence: 1,
      status: 'approved',
      user: user._id,
      room: rooms[0]._id
    },
    
    {
      reason: 'aula de alguma coisa, coisa',
      startDate: new Date(),
      endDate: new Date(),
      startTime: new Date(),
      endTime: new Date(),
      code: 21,
      sequence: 1,
      status: 'approved',
      user: user._id,
      room: rooms[1]._id
    },

    {
      reason: 'outra razão',
      startDate: new Date(),
      endDate: new Date(),
      startTime: new Date(),
      endTime: new Date(),
      code: 21,
      sequence: 1,
      status: 'approved',
      user: user._id,
      room: rooms[2]._id
    },

    {
      startDate: new Date(),
      endDate: new Date(),
      startTime: new Date(),
      endTime: new Date(),
      code: 21,
      sequence: 1,
      status: 'approved',
      user: user._id,
      room: rooms[3]._id
    },

    {
      startDate: new Date(),
      endDate: new Date(),
      startTime: new Date(),
      endTime: new Date(),
      code: 21,
      sequence: 1,
      status: 'approved',
      user: user._id,
      room: rooms[2]._id
    },

    {
      startDate: new Date(),
      endDate: new Date(),
      startTime: new Date(),
      endTime: new Date(),
      code: 21,
      sequence: 1,
      status: 'pending',
      user: user._id,
      room: rooms[2]._id
    },

    {
      startDate: new Date(),
      endDate: new Date(),
      startTime: new Date(),
      endTime: new Date(),
      code: 21,
      sequence: 1,
      status: 'pending',
      user: user._id,
      room: rooms[1]._id
    },

    {
      startDate: new Date(),
      endDate: new Date(),
      startTime: new Date(),
      endTime: new Date(),
      code: 21,
      sequence: 1,
      status: 'pending',
      user: user._id,
      room: rooms[3]._id
    }
    
  ];
  
  const reservs = await ReservationModel.insertMany(reservationTest);
  console.log("fake data inserted");
}

initializeDB();

