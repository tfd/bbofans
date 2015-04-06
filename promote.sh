#!/bin/sh
cd "$( dirname "$0" )"
wget http://127.0.0.1:3000/promotion/promote -q -O promote.json
echo "[$(date)] promote" >> promote.log
cat promote.json >> promote.log
echo " " >> promote.log
