server caracteristics
The server does not delete approved reservations from the database, it only changes
the reservation status to removed, but it deletes pending reservaions.
This behavior is because approved and removed reservations are used in the reports
generation.

# run
To run roomsAdmin locally, mongod must be running at localhost:27017 
and you need to create a user in a database called roomsAdmin with the name of dev and 
password of dddddddd (x8 d). 
To run roomsAdmin:
`npm run dev`

# run test
To run the tests, you need create a db in mongo called raTests with a user named raTests and 
password of raTests 

Run tests:
`npm test`

# fake data
