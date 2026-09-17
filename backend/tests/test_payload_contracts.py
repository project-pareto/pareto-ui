"""Check wire compatibility, including the models used on live table saves."""
from copy import deepcopy
import json
from pathlib import Path
import tempfile
import unittest

from pydantic import ValidationError

from app.schemas.map import MapData
from app.schemas.scenario import Scenario
from app.schemas.table_save import SavedTableScenario, UpdateExcelRequest
from app.schemas.validation import ScenarioValidation
from app.internal.validation.scenario_validation import validate_inputs
from app.internal.maps.kml_parser import ParseKMZ
from app.internal.maps.shapefile_parser import extract_shp_paths, parseShapefiles
from scenario_fixtures import map_files

ROOT = Path(__file__).resolve().parents[2]
SHARED_FIXTURE = ROOT / 'electron/ui/src/tests/fixtures/scenario-contract.json'


class PayloadContractTests(unittest.TestCase):
    def assert_round_trip(self, model, payload):
        # Comparing JSON also distinguishes false/0 and 1/1.0, which Python's
        # dictionary equality would otherwise consider equal.
        checked = model.model_validate(payload)
        self.assertEqual(json.dumps(checked.to_payload(), sort_keys=True),
                         json.dumps(payload, sort_keys=True))
        return checked

    def test_shared_payload_preserves_source_metadata_and_scalar_types(self):
        payload = json.loads(SHARED_FIXTURE.read_text())
        checked = self.assert_round_trip(Scenario, payload)
        self.assertIsInstance(checked.data_input.map_data, MapData)
        self.assertEqual(checked.id, 0)
        self.assertEqual(checked.data_input.map_data.all_nodes['P1'].coordinates,
                         ['-103', '34', '0'])
        self.assertNotIn('validation', checked.to_payload())
        self.assertNotIn('optimized_override_values', checked.to_payload())
        self.assertEqual(checked.data_input.df_parameters['Units'],
                         payload['data_input']['df_parameters']['Units'])
        self.assertEqual(checked.data_input.map_data.arcs['pipe'].length, '1.0')

    def test_legacy_metadata_keeps_integer_and_float_values(self):
        payload = json.loads(SHARED_FIXTURE.read_text())
        for values in ({'inlet_salinity': 100, 'recovery': 1},
                       {'inlet_salinity': 100.0, 'recovery': 0.5}):
            with self.subTest(values=values):
                payload['data_input']['df_parameters']['DesalinationSurrogate'] = values
                self.assert_round_trip(Scenario, payload)

    def test_legacy_map_without_arcs_preserves_omission_on_read_and_table_save(self):
        payload = json.loads(SHARED_FIXTURE.read_text())
        del payload['data_input']['map_data']['arcs']
        for model in (Scenario, SavedTableScenario):
            with self.subTest(model=model.__name__):
                checked = self.assert_round_trip(model, payload)
                self.assertNotIn('arcs', checked.to_payload()['data_input']['map_data'])

    def test_scalar_metadata_does_not_weaken_ordinary_table_columns(self):
        payload = json.loads(SHARED_FIXTURE.read_text())
        payload['data_input']['df_parameters']['PadRates'] = {'T01': 100}
        with self.assertRaises(ValidationError):
            Scenario.model_validate(payload)

    def test_bundled_scenarios_keep_legacy_keys_and_missing_fields(self):
        records = json.loads((ROOT / 'backend/app/internal/assets/v1_default/scenarios.json').read_text())
        for record in records['_default'].values():
            with self.subTest(id=record['scenario']['id']):
                self.assert_round_trip(Scenario, record['scenario'])

    def test_real_map_import_payloads_match_the_map_contract(self):
        with tempfile.TemporaryDirectory() as directory:
            kml, archive = map_files(directory)
            for source, parsed in (
                ('kml', ParseKMZ(str(kml), 'NetworkNode')),
                ('shapefile', parseShapefiles(extract_shp_paths(str(archive)), 'NetworkNode')),
            ):
                with self.subTest(source=source):
                    # The contract describes JSON crossing the API. Python parser
                    # tuples become arrays at that existing serialization boundary.
                    self.assert_round_trip(MapData, json.loads(json.dumps(parsed)))

    def test_invalid_numeric_inputs_remain_representable_for_completion(self):
        payload = json.loads(SHARED_FIXTURE.read_text())
        payload['data_input']['df_parameters']['PadRates']['T01'] = ['not a number']
        self.assert_round_trip(Scenario, payload)
        validation = validate_inputs(payload)
        self.assert_round_trip(ScenarioValidation, validation)
        self.assertTrue(any(issue['code'] == 'invalid_value' for issue in validation['issues']))

    def test_optional_map_and_transient_rename_alias_round_trip(self):
        payload = json.loads(SHARED_FIXTURE.read_text())
        original = deepcopy(payload)
        payload['data_input']['map_data']['_node_renames'] = {'P1': 'P2'}
        self.assert_round_trip(Scenario, payload)
        payload['data_input']['map_data'] = None
        self.assert_round_trip(Scenario, payload)
        del payload['data_input']['map_data']
        self.assert_round_trip(Scenario, payload)
        self.assertNotIn('_node_renames', original['data_input']['map_data'])

    def test_contract_check_does_not_coerce_scenario_identity(self):
        payload = json.loads(SHARED_FIXTURE.read_text())
        for value in ('0', False):
            with self.subTest(id=value), self.assertRaises(ValidationError):
                Scenario.model_validate({**payload, 'id': value})

    def test_table_request_preserves_cells_and_legacy_scalar_metadata(self):
        for name, table in (
            ('PadRates', {'T01': [0, 0.0, '', None, '001', 'not a number']}),
            ('PadRates', {'T01': [], 'T02': [0]}),
            ('PadRates', {}),
            ('Units', {'volume': 'bbl', 'decision period': 'week'}),
            ('DesalinationSurrogate', {'zero': 0, 'float': 1.0, 'text': '001', 'blank': '', 'null': None}),
            ('DesalinationSurrogate', {'INDEX': ['recovery'], 'VALUE': [0.5]}),
        ):
            with self.subTest(table=name, values=table):
                payload = {'id': 0, 'tableKey': name, 'updatedTable': table, 'source': {'enabled': False}}
                self.assert_round_trip(UpdateExcelRequest, payload)
                for revision in ('', None, 'saved-revision'):
                    self.assert_round_trip(UpdateExcelRequest, {**payload, 'revision': revision})

    def test_table_request_normalizes_only_canonical_text_ids(self):
        payload = {'id': 0, 'tableKey': 'PadRates', 'updatedTable': {}}
        for value in (0, '0', 1, '1', 2**53 - 1, str(2**53 - 1)):
            with self.subTest(id=value):
                self.assertEqual(UpdateExcelRequest.model_validate({**payload, 'id': value}).id, int(value))
        for value in (True, False, 0.0, 1.5, -1, None, '01', '-1', '1.0', '+1', ' 1', '1\n', '١', '', 2**53, str(2**53), '1' * 5000):
            with self.subTest(id=repr(value)[:30]), self.assertRaises(ValidationError):
                UpdateExcelRequest.model_validate({**payload, 'id': value})

    def test_saved_table_response_preserves_shared_and_bundled_scenarios(self):
        records = json.loads((ROOT / 'backend/app/internal/assets/v1_default/scenarios.json').read_text())
        payloads = [json.loads(SHARED_FIXTURE.read_text())] + [r['scenario'] for r in records['_default'].values()]
        for payload in payloads:
            with self.subTest(id=payload['id']):
                self.assert_round_trip(SavedTableScenario, {**payload, 'input_revision': 'saved-revision'})
