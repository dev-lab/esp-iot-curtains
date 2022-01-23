#!/bin/bash

# 1. Determine flash memory size:
esptool --port /dev/ttyUSB1 flash_id
