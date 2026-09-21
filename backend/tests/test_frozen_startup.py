"""Exercise PyInstaller's real worker dispatch without starting any workers."""
from pathlib import Path
import subprocess
import sys
import textwrap
import unittest


MAIN = Path(__file__).resolve().parents[1] / 'app' / 'main.py'


class FrozenStartupTests(unittest.TestCase):
    def check_worker(self, arguments, expected):
        # A fresh interpreter avoids hiding import-time side effects behind the
        # modules already loaded by the rest of the backend test suite.
        script = textwrap.dedent('''
            import importlib.abc
            import multiprocessing.resource_tracker
            import multiprocessing.spawn
            from pathlib import Path
            import runpy
            import sys
            import PyInstaller

            hook = Path(PyInstaller.__file__).parent / 'hooks/rthooks/pyi_rth_multiprocessing.py'
            runpy.run_path(str(hook))
            multiprocessing.resource_tracker.main = lambda fd: print('tracker', fd)
            multiprocessing.spawn.spawn_main = lambda **kwargs: print('worker', kwargs)

            class RejectApplicationImports(importlib.abc.MetaPathFinder):
                def find_spec(self, fullname, path=None, target=None):
                    if fullname.split('.')[0] in {'app', 'fastapi', 'uvicorn', 'idaes', 'pyomo', 'dotenv'}:
                        raise AssertionError('Worker imported application code: ' + fullname)

            sys.meta_path.insert(0, RejectApplicationImports())
            main = sys.argv[1]
            sys.argv = sys.argv[1:]
            runpy.run_path(main, run_name='__main__')
        ''')
        result = subprocess.run(
            [sys.executable, '-c', script, str(MAIN), *arguments],
            capture_output=True, text=True, timeout=15,
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn(expected, result.stdout)

    def test_resource_tracker_exits_before_application_imports(self):
        self.check_worker(
            ['-c', 'from multiprocessing.resource_tracker import main;main(123)'],
            'tracker 123',
        )

    def test_spawn_worker_exits_before_application_imports(self):
        self.check_worker(
            ['--multiprocessing-fork', 'pipe_handle=123', 'parent_pid=None'],
            "worker {'pipe_handle': 123, 'parent_pid': None}",
        )
