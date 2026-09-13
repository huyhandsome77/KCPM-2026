# -*- coding: utf-8 -*-
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('docs/testing/EP/product/FutureSushi - EP Product API Test Suite.postman_test_run.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"Total Pass: {data.get('totalPass')}, Total Fail: {data.get('totalFail')}")

for idx, res in enumerate(data.get('results', [])):
    name = res.get('name')
    status_code = res.get('responseCode', {})
    tests = res.get('tests', {})
    failed_tests = [test_name for test_name, passed in tests.items() if not passed]
    if failed_tests:
        print("="*60)
        print(f"[{idx}] {name}")
        print(f"Status Code: {status_code.get('code')} {status_code.get('name')}")
        print(f"Time: {res.get('time')}ms")
        for ft in failed_tests:
            print(f"  - FAILED ASSERTION: {ft}")
