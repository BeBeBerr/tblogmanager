import mimetypes
import os
import shutil

from werkzeug import wrappers

from tensorboard import errors
from tensorboard import plugin_util
from tensorboard.backend import http_util
from tensorboard.data import provider
from tensorboard.plugins import base_plugin
from tensorboard.plugins.scalar import metadata
import tensorboard

_SCALAR_PLUGIN_NAME = metadata.PLUGIN_NAME
_PLUGIN_DIRECTORY_PATH_PART = "/data/plugin/log_management/"
_PLUGIN_DIRECTORY_PATH_PART_CHROME = "/data/plugin/log_management/plugin/log_management/"


class LogManagement(base_plugin.TBPlugin):

    plugin_name = "log_management"

    def __init__(self, context):
        self.log_path = os.path.abspath(context.logdir)

        self._data_provider = context.data_provider

    def get_plugin_apps(self):
        return {
            "/rename": self._serve_rename,
            "/delete": self._serve_delete,
            "/folders": self._serve_folders,
            "/static/*": self._serve_static_file,
            "/plugin/log_management/static/*": self._serve_static_file_chrome,
        }

    @wrappers.Request.application
    def _serve_folders(self, request):
        files = list(os.listdir(self.log_path))
        full_path_files = list(map(lambda x: os.path.join(self.log_path, x), files))

        folder_info = {}
        for i, each in enumerate(full_path_files):
            if os.path.isdir(each):
                folder_info[files[i]] = full_path_files[i]

        return http_util.Respond(request, folder_info, "application/json")

    @wrappers.Request.application
    def _serve_rename(self, request):
        folder = request.args['folder']
        new_name = request.args['new_name']
        folder = os.path.join(self.log_path, folder)
        new_folder = os.path.join(self.log_path, new_name)
        isSuccess = True
        try:
            os.rename(folder, new_folder)
        except OSError as err:
            print(err)
            isSuccess = False

        if isSuccess:
            return http_util.Respond(request, "Success", "application/json")
        else:
            return http_util.Respond(request, "Rename Error", "application/json", code=500)

    @wrappers.Request.application
    def _serve_delete(self, request):
        folder = request.args['folder']
        folder = os.path.join(self.log_path, folder)
        isSuccess = True
        try:
            shutil.rmtree(folder)
        except shutil.Error as err:
            print(err)
            isSuccess = False

        if isSuccess:
            return http_util.Respond(request, "Success", "application/json")
        else:
            return http_util.Respond(request, "Delete Error", "application/json", code=500)

    def _serve_static(self, request, plugin_path):
        static_path_part = request.path[len(plugin_path) :]
        resource_name = os.path.normpath(
            os.path.join(*static_path_part.split("/"))
        )
        if not resource_name.startswith("static" + os.path.sep):
            return http_util.Respond(
                request, "Not found", "text/plain", code=404
            )

        resource_path = os.path.join(os.path.dirname(__file__), resource_name)
        with open(resource_path, "rb") as read_file:
            mimetype = mimetypes.guess_type(resource_path)[0]
            return http_util.Respond(
                request, read_file.read(), content_type=mimetype
            )

    @wrappers.Request.application
    def _serve_static_file(self, request):
        return self._serve_static(request, _PLUGIN_DIRECTORY_PATH_PART)
        

    @wrappers.Request.application
    def _serve_static_file_chrome(self, request):
        return self._serve_static(request, _PLUGIN_DIRECTORY_PATH_PART_CHROME)

    def is_active(self):
        return True

    def frontend_metadata(self):
        return base_plugin.FrontendMetadata(es_module_path="/plugin/log_management/static/index.js")
