#!/bin/sh
cd "$( dirname "$0" )"
wget http://127.0.0.1:3000/tournaments/update -q -O update-tournaments.json
echo "[$(date)] update score" >> update-tournaments.log
cat update-tournaments.json >> update-tournaments.log
echo " " >> update-tournaments.log
