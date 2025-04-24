#!/bin/sh

if [ "$NODE_ENV" = "development" ]; then
    echo "Starting in development mode...running debug"
    npm run debug
else
    echo "Starting in production mode..."
    npm start
fi 