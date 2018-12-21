#!/usr/bin/env bash

jest
jest --testPathIgnorePatterns --runTestsByPath 'lib/admin.app.spec.ts'
jest --testPathIgnorePatterns --testMatch '**/lib/extra-tests/*.spec.ts'
