#!/usr/bin/env bash

jest
jest --testPathIgnorePatterns --runTestsByPath './src/admin.app.spec.ts'
jest --testPathIgnorePatterns --testMatch '**/src/extra-tests/*.spec.ts'
