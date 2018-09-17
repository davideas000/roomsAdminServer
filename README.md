server caracteristics
The server does not delete approved reservations from the database, it only changes
the reservation status to removed, but it deletes pending reservaions.
This behavior is because approved and removed reservations are used in the reports
generation.
