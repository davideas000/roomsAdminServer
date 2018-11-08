#!/usr/bin/env fish

if test -z $argv
    printf "Usage: feeddb OPTION\n\n"
    printf "Options: \n"
    echo "   local-user       insert users in the local db"
    echo "   local-db         insert data (reservs, rooms, etc) in the local db"
    echo "   remote-user      insert users in the remote db (mlab)"
    echo "   remote-db        insert data (reservs, rooms, etc) in the remote db (mlab)"
else if test $argv[1] = "remote-user"
    echo "feeding remote development database, collection user"
    env MONGODB_URI=mongodb://dev:proinferno000@ds151753.mlab.com:51753/roomsadmin \
    ts-node lib/extras/user-notifications.ts
    echo "OK"
else if test $argv[1] = "remote-db"
    echo "feeding remote development database"
    env MONGODB_URI=mongodb://dev:proinferno000@ds151753.mlab.com:51753/roomsadmin \
    ts-node lib/extras/feed-fake-data.ts 
    echo "OK"
else if test $argv[1] = "local-user"
    echo "feeding local development database, collection user"
    ts-node lib/extras/user-notifications.ts
    echo "OK"
else if test $argv[1] = "local-db"
    echo "feeding local development database"
    ts-node lib/extras/feed-fake-data.ts 
    echo "OK"
end

