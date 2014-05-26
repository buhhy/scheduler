logdir=`pwd`/logs
mkdir -p $logdir
export NODE_ENV=production
forever start -l $logdir/forever.log -i $logdir/output.log -e $logdir/error.log -a --minUptime 2500 --spinSleepTime 1500 server.js
