#!/bin/sh
cd "$( dirname "$0" )"
wget http://127.0.0.1:3000/blacklist/update -q -O update-blacklist.json
echo "[$(date)] update blacklist" >> update-blacklist.log
cat update-blacklist.json >> update-blacklist.log
echo " " >> update-blacklist.log
