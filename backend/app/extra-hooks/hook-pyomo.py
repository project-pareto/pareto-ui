#####################################################################################################
# PARETO was produced under the DOE Produced Water Application for Beneficial Reuse Environmental
# Impact and Treatment Optimization (PARETO), and is copyright (c) 2021-2024 by the software owners:
# The Regents of the University of California, through Lawrence Berkeley National Laboratory, et al.
# All rights reserved.
#
# NOTICE. This Software was developed under funding from the U.S. Department of Energy and the U.S.
# Government consequently retains certain rights. As such, the U.S. Government has been granted for
# itself and others acting on its behalf a paid-up, nonexclusive, irrevocable, worldwide license in
# the Software to reproduce, distribute copies to the public, prepare derivative works, and perform
# publicly and display publicly, and to permit others to do so.
#####################################################################################################
import importlib
from pathlib import Path
import re

imports = set()

# add all pyomo modules hidden imports
for package in ["pyomo"]:
    pkg = importlib.import_module(package)
    
    try:
        pkg_path = Path(pkg.__file__).parent
    except TypeError:  # missing __init__.py perhaps
        print(
            f"Cannot find package '{package}' directory, possibly "
            f"missing an '__init__.py' file"
        )
    if not pkg_path.is_dir():
        print(
            f"Cannot load from package '{package}': "
            f"path '{pkg_path}' not a directory"
        )

    skip_expr = re.compile(r"_test|test_|__")

    for python_file in pkg_path.glob("**/*.py"):
        if skip_expr.search(str(python_file)):
            continue
        relative_path = python_file.relative_to(pkg_path)
        dotted_name = relative_path.as_posix()[:-3].replace("/", ".")
        module_name = package + "." + dotted_name
        try:
            # module = importlib.import_module(module_name)
            imports.add(module_name)
        except Exception as err:  # assume the import could do bad things
            print(f"Import of file '{python_file}' failed: {err}")
            continue

        # ensure all parent modules are imported (a lot of repeats here but it works)
        relative_path=relative_path.parent
        while relative_path != Path('.'):
            dotted_name = relative_path.as_posix().replace("/", ".")
            module_name = package + "." + dotted_name
            try:
                imports.add(module_name)
                relative_path=relative_path.parent
            except:
                relative_path=relative_path.parent
                print('error on my part')
                continue

hiddenimports = list(imports)
hiddenimports.append("ipaddress")
hiddenimports.append("pyimod02_importers")
hiddenimports.append("shapely._geos")
hiddenimports.append("shapely._buildcfg")
hiddenimports.append("shapely._vectorized")