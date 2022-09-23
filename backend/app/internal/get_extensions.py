from pathlib import Path
from idaes.util.download_bin import download_binaries
from idaes.config import default_binary_release
import sys
import os
import requests

idaes_extensions_dir = Path.home() / ".pareto-ui" / ".idaes"
pyomo_extensions_dir = Path.home() / ".pareto-ui" / ".pyomo"

# helper function to get file names out of dictionary
def extract_file_names(files, prefix):
    ret = []
    for each in files:
        if isinstance(files[each], dict):
            ret+=extract_file_names(files[each], prefix+each)
        else:
            for each_one in files[each]:
                if len(prefix)>0:
                    ret.append(f'{prefix}/{each}/{each_one}')
                else:
                    ret.append(f'{each}/{each_one}')
    return ret

def check_for_idaes_extensions():
    print('checking for idaes extensions')
    found_extensions = os.path.exists(idaes_extensions_dir)
    print(f'found extensions: {found_extensions}')
    return found_extensions

def get_idaes_extensions():
    print('inside get idaes sextensions')
    try:
        if(sys.platform == "darwin"):
            #XXX doesnt work on idaes 2.0.0 - unsupported darwin-x86_64
            print('mac')
            print('trying to download binaries')
            download_binaries(url=f'https://idaes-extensions.s3.us-west-1.amazonaws.com/')
            print(f'extensions have been gotten, making directory')
        else:
            print('not mac')
            print(f'trying to download binaries')
            download_binaries(release=default_binary_release)
            print(f'extensions have been gotten')
        print('successfully installed idaes extensions')
    except PermissionError as e:
        print(f'unable to install extensions, permissionerror due to idaes extensions already being present: {e}\nmaking directory')
        idaes_extensions_dir.mkdir(parents=True, exist_ok=True)
        return False
    except Exception as e:
        print(f'unable to install extensions: {e}')
        return False
    idaes_extensions_dir.mkdir(parents=True, exist_ok=True)
    return True

def check_for_pyomo_extensions():
    if sys.platform != "darwin":
        return True
    print('checking for pyomo extensions')
    found_extensions = os.path.exists(pyomo_extensions_dir)
    print(f'found extensions: {found_extensions}')
    return found_extensions


def get_pyomo_extensions():
    print('inside get pyomo extensions')
    dest_path = Path.home() / ".pyomo"
    directory_names = ["include/asl", "include/asl2", "lib", "share/ampl-asl"]
    for directory_name in directory_names:
        temp = dest_path / directory_name
        temp.mkdir(parents=True, exist_ok=True)
    src = "https://idaes-extensions.s3.us-west-1.amazonaws.com/pyomo-extensions/"
    files = {
        "include": {
            "asl": [
                'asl_pfgh.h', 'jacpdim.h', 'opcode.hd', 'jac2dim.h', 'obj_adj.h', 'r_opn.hd', 'getstub.h', 'errchk.h', 'arith.h', 'nlp.h', 'stdio1.h', 'nlp2.h', 'asl.h', 'psinfo.h', 'funcadd.h', 'asl_pfg.h', 'avltree.h'
            ],
            "asl2": [
                'asl_pfgh.h', 'jacpdim.h', 'opcode.hd', 'jac2dim.h', 'obj_adj.h', 'r_opn.hd', 'opno2.h', 'getstub.h', 'errchk.h', 'arith.h', 'nlp.h', 'stdio1.h', 'nlp2.h', 'asl.h', 'psinfo.h', 'funcadd.h', 'asl_pfg.h', 'avltree.h'
            ]
        },
        "lib": ['libpynumero_ASL.dylib', 'libasl.a', 'libasl2.a'],
        "share": {
            "ampl-asl": ['ampl-asl-config.cmake', 'ampl-asl-config-noconfig.cmake']
        }
    }
    file_names = extract_file_names(files, "")
    for file in file_names:
        # url_opener.retrieve(f'{src}{file}',f'{dest.resolve()}/{file}')
        url = f'{src}{file}'
        dest = f'{dest_path.resolve()}/{file}'
        print(f'retrieving file: {file} from {url} to {dest}')
        r = requests.get(url, allow_redirects=True)
        open(dest, 'wb').write(r.content)

    pyomo_extensions_dir.mkdir(parents=True, exist_ok=True)
    return True