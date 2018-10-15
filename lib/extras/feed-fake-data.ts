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
    { // 0
      name: 'sala 100',
      description: 'sala comum',
      width: 200,
      length: 300,
      capacity: 10,
      type: 'sala',
      department: deps[0]._id
    },
    
    {
      name: 'lab 1',
      description: 'laboratorio de informatica',
      width: 100,
      length: 100,
      capacity: 40,
      type: 'laboratorio',
      department: deps[0]._id
    },
    
    {
      name: 'auditorio 7',
      width: 270,
      length: 200,
      capacity: 1000,
      type: 'auditorio',
      department: deps[1]._id
    },
    
    {
      name: 'lab 3',
      width: 2100,
      length: 500,
      capacity: 100,
      type: 'laboratorio',
      department: deps[1]._id
    }
  ];

  const rooms = await RoomModel.insertMany(roomsTest);

  const user = await UserModel.findOne({email: 'david.edews@gmail.com'});
  const reservationTest = [
    
    { // 0
      reason: 'aula de alguma coisa, e outra coisa',
      startDate: new Date('2018-08-01'),
      endDate: new Date('2018-08-31'),
      startTime: new Date('2018-01-01T08:00'),
      endTime: new Date('2018-01-01T18:00'),
      code: 21,
      sequence: 1,
      status: 'approved',
      user: user._id,
      room: rooms[0]._id
    },
    
    { // 1
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

    { // 2
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

    { // 3
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

    { // 4
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

    { // 5
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

    { // 6
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

    { // 7
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

