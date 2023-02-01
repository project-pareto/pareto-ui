import importlib
from pathlib import Path
import re

datas = []
# for package in ["pareto"]:
#     pkg = importlib.import_module(package)
    
#     try:
#         pkg_path = Path(pkg.__file__).parent.parent
#     except TypeError:  # missing __init__.py perhaps
#         print(
#             f"Cannot find package '{package}' directory, possibly "
#             f"missing an '__init__.py' file"
#         )
#     if not pkg_path.is_dir():
#         print(
#             f"Cannot load from package '{package}': "
#             f"path '{pkg_path}' not a directory"
#         )

skip_expr = re.compile(r"_test|test_|__")

# add all png files to pyinstaller data
# pkg = "../../../project-pareto/docs/img"
pkg = "../../../project-pareto/docs/img"
pkg_path = Path(f'{pkg}')
dst_name = f"docs/img"
src_name = ""
for png_file in pkg_path.glob("**/*.png"):
    file_name = '/' + png_file.as_posix().split('/')[-1]
    print(file_name)
    if skip_expr.search(str(png_file)):
        continue
    relative_path = png_file.relative_to(pkg_path)
    dotted_name = relative_path.as_posix()
    src_name = f"{pkg}/" + dotted_name
    try:
        datas.append((src_name,dst_name))
    except Exception as err:  # assume the import could do bad things
        print(f"Import of file '{png_file}' failed: {err}")
        continue
datas.append((src_name, 'pareto'))
print(datas)