#!/bin/sh
cd "$( dirname "$0" )"
wget http://127.0.0.1:3000/update -q -O update.json
echo "[$(date)] update score" >> update.log
cat update.json >> update.log
echo " " >> update.log
