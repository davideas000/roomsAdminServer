#!/usr/bin/env bash

jest
jest --testPathIgnorePatterns --testMatch '**/lib/extra-tests/*.spec.ts'
