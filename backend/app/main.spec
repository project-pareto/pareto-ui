# -*- mode: python ; coding: utf-8 -*-
from pathlib import Path
import sys

block_cipher = None

idaes_path = str(Path.home() / ".idaes")

if sys.platform == 'darwin':
    extra_data = [
        (f'{idaes_path}/bin/ipopt_sens', 'extensions/.idaes/bin/'), (f'{idaes_path}/bin/cubic_roots.so', 'extensions/.idaes/bin/'), 
        (f'{idaes_path}/bin/libstdc++.6.dylib', 'extensions/.idaes/bin/'), (f'{idaes_path}/bin/version_lib.txt', 'extensions/.idaes/bin/'), 
        (f'{idaes_path}/bin/libsipopt.dylib', 'extensions/.idaes/bin/'), (f'{idaes_path}/bin/libadolc.2.dylib', 'extensions/.idaes/bin/'), 
        (f'{idaes_path}/bin/general_helmholtz_external.so', 'extensions/.idaes/bin/'), (f'{idaes_path}/bin/libadolc.dylib', 'extensions/.idaes/bin/'), 
        (f'{idaes_path}/bin/libipopt.3.dylib', 'extensions/.idaes/bin/'), (f'{idaes_path}/bin/libadolc.la', 'extensions/.idaes/bin/'), 
        (f'{idaes_path}/bin/ipopt', 'extensions/.idaes/bin/'), (f'{idaes_path}/bin/couenne', 'extensions/.idaes/bin/'), 
        (f'{idaes_path}/bin/libipopt.dylib', 'extensions/.idaes/bin/'), (f'{idaes_path}/bin/cbc', 'extensions/.idaes/bin/'), 
        (f'{idaes_path}/bin/libgfortran.5.dylib', 'extensions/.idaes/bin/'), (f'{idaes_path}/bin/libpynumero_ASL.dylib', 'extensions/.idaes/bin/'), 
        (f'{idaes_path}/bin/functions.so', 'extensions/.idaes/bin/'), (f'{idaes_path}/bin/iapws95_external.so', 'extensions/.idaes/bin/'), 
        (f'{idaes_path}/bin/license_lib.txt', 'extensions/.idaes/bin/'), (f'{idaes_path}/bin/k_aug', 'extensions/.idaes/bin/'), 
        (f'{idaes_path}/bin/version_solvers.txt', 'extensions/.idaes/bin/'), (f'{idaes_path}/bin/ipopt_l1', 'extensions/.idaes/bin/'), 
        (f'{idaes_path}/bin/bonmin', 'extensions/.idaes/bin/'), (f'{idaes_path}/bin/swco2_external.so', 'extensions/.idaes/bin/'), 
        (f'{idaes_path}/bin/libsipopt.3.dylib', 'extensions/.idaes/bin/'), (f'{idaes_path}/bin/license.txt', 'extensions/.idaes/bin/'), 
        (f'{idaes_path}/bin/ipopt_sens_l1', 'extensions/.idaes/bin/'), (f'{idaes_path}/bin/libgcc_s.1.1.dylib', 'extensions/.idaes/bin/'), 
        (f'{idaes_path}/bin/clp', 'extensions/.idaes/bin/'), (f'{idaes_path}/bin/libgomp.1.dylib', 'extensions/.idaes/bin/'), 
        (f'{idaes_path}/bin/dot_sens', 'extensions/.idaes/bin/')]
elif sys.platform == 'linux':
    extra_data = [
    (f'{idaes_path}/bin/ipopt_sens', 'extensions/.idaes/bin/'), (f'{idaes_path}/bin/cubic_roots.so', 'extensions/.idaes/bin/'), 
    (f'{idaes_path}/bin/libadolc.so', 'extensions/.idaes/bin/'), (f'{idaes_path}/bin/version_lib.txt', 'extensions/.idaes/bin/'), 
    (f'{idaes_path}/bin/libadolc.so.2', 'extensions/.idaes/bin/'), (f'{idaes_path}/bin/libadolc.so.2.2.0', 'extensions/.idaes/bin/'), 
    (f'{idaes_path}/bin/general_helmholtz_external.so', 'extensions/.idaes/bin/'), (f'{idaes_path}/bin/libipopt.so', 'extensions/.idaes/bin/'), 
    (f'{idaes_path}/bin/libpynumero_ASL.so', 'extensions/.idaes/bin/'), (f'{idaes_path}/bin/libadolc.la', 'extensions/.idaes/bin/'), 
    (f'{idaes_path}/bin/ipopt', 'extensions/.idaes/bin/'), (f'{idaes_path}/bin/couenne', 'extensions/.idaes/bin/'), 
    (f'{idaes_path}/bin/libsipopt.so', 'extensions/.idaes/bin/'), (f'{idaes_path}/bin/cbc', 'extensions/.idaes/bin/'), 
    (f'{idaes_path}/bin/functions.so', 'extensions/.idaes/bin/'), (f'{idaes_path}/bin/iapws95_external.so', 'extensions/.idaes/bin/'), 
    (f'{idaes_path}/bin/license_lib.txt', 'extensions/.idaes/bin/'), (f'{idaes_path}/bin/k_aug', 'extensions/.idaes/bin/'), 
    (f'{idaes_path}/bin/version_solvers.txt', 'extensions/.idaes/bin/'), (f'{idaes_path}/bin/ipopt_l1', 'extensions/.idaes/bin/'), 
    (f'{idaes_path}/bin/bonmin', 'extensions/.idaes/bin/'), (f'{idaes_path}/bin/swco2_external.so', 'extensions/.idaes/bin/'), 
    (f'{idaes_path}/bin/license.txt', 'extensions/.idaes/bin/'), (f'{idaes_path}/bin/ipopt_sens_l1', 'extensions/.idaes/bin/'), 
    (f'{idaes_path}/bin/clp', 'extensions/.idaes/bin/'), (f'{idaes_path}/bin/dot_sens', 'extensions/.idaes/bin/')]
else:
    extra_data = []

a = Analysis(
    ['main.py'],
    pathex=[],
    binaries=[],
    datas=extra_data,
    hiddenimports=[
    'idaes.commands',
    'idaes.util.download_bin',
    'idaes.config',
    'idaes.logger',
    'idaes.commands.util.download_bin',
    'pyomo.contrib.ampl_function_demo.plugins',
    'pyomo.contrib.appsi.plugins',
    'pyomo.contrib.community_detection.plugins',
    'pyomo.contrib.example.plugins',
    'pyomo.contrib.fme.plugins',
    'pyomo.contrib.gdp_bounds.plugins',
    'pyomo.contrib.gdpopt.plugins',
    'pyomo.contrib.gjh.plugins',
    'pyomo.contrib.mcpp.plugins',
    'pyomo.contrib.mindtpy.plugins',
    'pyomo.contrib.multistart.plugins',
    'pyomo.contrib.preprocessing.plugins',
    'pyomo.contrib.pynumero.plugins',
    'pyomo.contrib.trustregion.plugins',
    'pyomo.repn.util',
    'pyomo.contrib.gdpbb',
    'pyomo.contrib.gdpbb.plugins',
    'pint', 'numbers', 'pyutilib', 'pyomo', 'pyomo.environ', 'pyomo.core', 'pyomo.core.plugins', 'pyomo.dae', 'pyomo.dae.plugins', 'pyomo.gdp', 'pyomo.gdp.plugins', 'pyomo.neos', 'pyomo.neos.plugins', 'pyomo.opt', 'pyomo.opt.plugins', 'pyomo.pysp', 'pyomo.solvers.plugins', 'pyomo.solvers', 'pyomo.checker', 'pyomo.checker.plugins', 'pyomo.contrib',  'pyomo.dataportal', 'pyomo.dataportal.plugins', 'pyomo.duality', 'pyomo.duality.plugins', 'pyomo.kernel', 'pyomo.mpec', 'pyomo.mpec.plugins', 'pyomo.network', 'pyomo.network.plugins', 'pyomo.repn', 'pyomo.repn.plugins', 'pyomo.scripting', 'pyomo.scripting.plugins', 'pyomo.util', 'pyomo.common', 'pyomo.common.plugins', 'sys', 'logging', 're', 'sys', 'pyomo.core.expr.numvalue', 'pyomo.core.expr.numvalue', 'pyomo.solvers.plugins.solvers.direct_solver', 'pyomo.solvers.plugins.solvers.direct_or_persistent_solver', 'pyomo.core.kernel.component_set', 'pyomo.core.kernel.component_map', 'pyomo.opt.results.results_', 'pyomo.opt.results.solution', 'pyomo.opt.results.solver', 'pyomo.opt.base', 'pyomo.core.base.suffix', 'pyomo.core.base.var', 'pyomo.core.base.PyomoModel', 'pyomo.solvers.plugins.solvers.persistent_solver', 'pyomo.opt.base.problem', 'pyomo.opt.base.convert', 'pyomo.opt.base.formats', 'pyomo.opt.base.results', 'pyomo.core.base.block', 'pyomo.core.kernel.block', 'pyomo.core.kernel.suffix'],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=['psutil','lxml'],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)
pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='main',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='main',
)
