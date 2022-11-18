import setuptools
from glob import iglob
import os

'''
def get_all_files(dir=""):
    path = os.path.dirname(os.path.realpath(__file__))
    path = os.path.join(path, "tensorboard_plugin_example_raw_scalars")
    path = os.path.join(path, dir)
    print(path)

    files = []
    for filename in iglob(path + '/**/*', recursive=True):
        files.append(filename)
    return files
'''


setuptools.setup(
    name="tensorboard_plugin_log_management",
    version="0.1.0",
    description="Rename and delete log folders.",
    packages=["tensorboard_plugin_log_management"],
    package_data={
        "tensorboard_plugin_log_management": [
            "static/**", 
            "plugin/log_management/static/**",
            ],
    },
    entry_points={
        "tensorboard_plugins": [
            "log_management = tensorboard_plugin_log_management.plugin:LogManagement",
        ],
    },
)



