#!/bin/sh
npx prisma db push --accept-data-loss
npm run next-start
