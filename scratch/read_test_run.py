# -*- coding: utf-8 -*-
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('docs/testing/EP/product/FutureSushi - EP Product API Test Suite.postman_test_run.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

results = data.get('results', [])
print(f"Total results: {len(results)}")

for idx, r in enumerate(results):
    name = r.get('name')
    time_ms = r.get('time')
    resp = r.get('responseCode', {})
    code = resp.get('code')
    code_name = resp.get('name')
    tests = r.get('tests', {})
    all_passed = all(tests.values())
    failed_tests = [k for k, v in tests.items() if not v]
    
    print(f"[{idx+1}] {name}")
    print(f"    Status: {code} {code_name} ({time_ms}ms) -> {'PASS' if all_passed else 'FAIL'}")
    if failed_tests:
        print(f"    Failures: {failed_tests}")
