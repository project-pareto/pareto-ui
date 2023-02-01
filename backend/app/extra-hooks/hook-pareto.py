import importlib
from pathlib import Path
import re

datas = []

skip_expr = re.compile(r"_test|test_|__")

# add all png files to pyinstaller data
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