"""Manual latency comparison; no disk writes, solver calls or timing assertions.

Run from the repository root with the backend environment:
    PYTHONPATH=backend python backend/benchmarks/table_contracts.py

The HTTP comparison isolates parsing, validation and response encoding using the
real contracts. It excludes the unchanged workbook/database work. Treat results
as local measurements, not production latency guarantees.
"""
from copy import deepcopy
import json
from pathlib import Path
from statistics import median
from timeit import repeat

from fastapi import FastAPI, Request
from fastapi.testclient import TestClient

from app.schemas.table_save import SavedTableScenario, UpdateExcelRequest


def median_ms(operation, number=10):
    operation()  # Warm schema/serializer caches before timing.
    return median(repeat(operation, number=number, repeat=5)) * 1000 / number


def measure(label, response):
    request = {'id': response['id'], 'tableKey': 'PadRates',
               'updatedTable': response['data_input']['df_parameters']['PadRates']}
    body = json.dumps(request)
    app = FastAPI()

    @app.post('/unchecked')
    async def unchecked(request: Request):
        await request.json()
        return response

    @app.post('/checked', response_model=SavedTableScenario, response_model_exclude_unset=True)
    async def checked(request: UpdateExcelRequest):
        return response

    request_ms = median_ms(lambda: UpdateExcelRequest.model_validate(request))
    response_ms = median_ms(lambda: SavedTableScenario.model_validate(response))
    with TestClient(app) as client:
        def send(path):
            return client.post(path, content=body, headers={'Content-Type': 'application/json'})

        before, after = send('/unchecked'), send('/checked')
        assert before.status_code == after.status_code == 200
        # JSON comparison distinguishes 0/false and integers/floats, while
        # ignoring object-key order. It also catches added default fields.
        assert json.dumps(before.json(), sort_keys=True) == json.dumps(after.json(), sort_keys=True)
        before_ms = median_ms(lambda: send('/unchecked'))
        after_ms = median_ms(lambda: send('/checked'))
    print(f'{label:<24} {request_ms:>10.3f} {response_ms:>11.3f} {before_ms:>13.3f} {after_ms:>13.3f}')


def main():
    root = Path(__file__).resolve().parents[2]
    fixture = json.loads((root / 'electron/ui/src/tests/fixtures/scenario-contract.json').read_text())
    print('Milliseconds: median of 5 batches of 10 calls (lower is better).')
    print(f'{"Payload":<24} {"Req check":>10} {"Resp check":>11} {"Old HTTP":>13} {"Checked HTTP":>13}')
    measure('Shared fixture', fixture)
    for rows in (10_000, 100_000):
        payload = deepcopy(fixture)
        payload['data_input']['df_parameters']['PadRates'] = {'ProductionPads': ['P1'] * rows, 'T01': [100.0] * rows}
        measure(f'{rows * 2:,} input cells', payload)
    payload = deepcopy(fixture)
    payload['results']['data'] = {'flow': [['P1', 'N1', 'T01', 100.0] for _ in range(50_000)]}
    measure('200,000 result cells', payload)


if __name__ == '__main__':
    main()
