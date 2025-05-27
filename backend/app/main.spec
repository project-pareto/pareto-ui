# -*- mode: python ; coding: utf-8 -*-
from pathlib import Path
import sys
sys.setrecursionlimit(5000)

block_cipher = None


extra_data = [('GUROBI_RUN.py','.')]

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
    'pint', 
    'numbers', 
    'pyutilib', 
    'pyomo',
    'pkg_resources.extern'],
    hookspath=['extra-hooks'],
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
