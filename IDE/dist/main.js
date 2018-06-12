"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var http = require("http");
var child_process = require("child_process");
var socket_manager = require("./SocketManager");
var file_manager = require("./FileManager");
var paths = require("./paths");
var routes = require("./RouteManager");
var path = require("path");
var TerminalManager = require('./TerminalManager');
function init() {
    return __awaiter(this, void 0, void 0, function () {
        var app, server;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('starting IDE');
                    return [4 /*yield*/, check_lockfile()
                            .catch(function (e) { return console.log('error checking lockfile', e); })];
                case 1:
                    _a.sent();
                    app = express();
                    server = new http.Server(app);
                    setup_routes(app);
                    // start serving the IDE on port 80
                    server.listen(80, function () { return console.log('listening on port', 80); });
                    // initialise websocket
                    socket_manager.init(server);
                    TerminalManager.init();
                    return [2 /*return*/];
            }
        });
    });
}
exports.init = init;
var backup_file_stats = {};
function check_lockfile() {
    return __awaiter(this, void 0, void 0, function () {
        var lockfile_exists, file_path, filename, project_path, tmp_backup_file, backup_file_exists, backup_filename;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, file_manager.file_exists(paths.lockfile)];
                case 1:
                    lockfile_exists = _a.sent();
                    if (!lockfile_exists) {
                        backup_file_stats.exists = false;
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, file_manager.read_file(paths.lockfile)];
                case 2:
                    file_path = _a.sent();
                    filename = path.basename(file_path);
                    project_path = path.dirname(file_path) + '/';
                    tmp_backup_file = project_path + '.' + filename + '~';
                    return [4 /*yield*/, file_manager.file_exists(tmp_backup_file)];
                case 3:
                    backup_file_exists = _a.sent();
                    if (!backup_file_exists) {
                        backup_file_stats.exists = false;
                        return [2 /*return*/];
                    }
                    backup_filename = filename + '.bak';
                    return [4 /*yield*/, file_manager.copy_file(tmp_backup_file, project_path + backup_filename)];
                case 4:
                    _a.sent();
                    console.log('backup file copied to', project_path + backup_filename);
                    backup_file_stats.exists = true;
                    backup_file_stats.filename = filename;
                    backup_file_stats.backup_filename = backup_filename;
                    backup_file_stats.project = path.basename(project_path);
                    return [4 /*yield*/, file_manager.delete_file(paths.lockfile)];
                case 5:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.check_lockfile = check_lockfile;
function get_backup_file_stats() {
    return backup_file_stats;
}
exports.get_backup_file_stats = get_backup_file_stats;
function setup_routes(app) {
    // static paths
    app.use(express.static(paths.webserver_root)); // all files in this directory are served to bela.local/
    app.use('/documentation', express.static(paths.Bela + 'Documentation/html'));
    // ajax routes
    // file and project downloads
    app.get('/download', routes.download);
    // doxygen xml
    app.get('/documentation_xml', routes.doxygen);
    // hack for workship script
    app.get('/rebuild-project', routes.rebuild_project);
}
function get_xenomai_version() {
    return new Promise(function (resolve, reject) {
        child_process.exec('/usr/xenomai/bin/xeno-config --version', function (err, stdout, stderr) {
            if (err) {
                console.log('error reading xenomai version');
                reject(err);
            }
            if (stdout.includes('2.6')) {
                paths.set_xenomai_stat('/proc/xenomai/stat');
            }
            else if (stdout.includes('3.0')) {
                paths.set_xenomai_stat('/proc/xenomai/sched/stat');
            }
            resolve(stdout);
        });
    });
}
exports.get_xenomai_version = get_xenomai_version;
function set_time(time) {
    child_process.exec('date -s "' + time + '"', function (err, stdout, stderr) {
        if (err || stderr) {
            console.log('error setting time', err, stderr);
        }
        else {
            console.log('time set to:', stdout);
        }
    });
}
exports.set_time = set_time;
function shutdown() {
    child_process.exec('shutdown -h now', function (err, stdout, stderr) { return console.log('shutting down', err, stdout, stderr); });
}
exports.shutdown = shutdown;
function board_detect() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    child_process.exec('board_detect', function (err, stdout, stderr) {
                        if (err)
                            reject(err);
                        if (stderr)
                            reject(stderr);
                        console.log('running on', stdout);
                        resolve(stdout);
                    });
                })];
        });
    });
}
exports.board_detect = board_detect;
process.on('warning', function (e) { return console.warn(e.stack); });
/*process.on('uncaughtException', err => {
    console.log('uncaught exception');
    throw err;
});
process.on('SIGTERM', () => {
    console.log('SIGTERM');
    throw new Error('SIGTERM');
});*/

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QUFNLENBQUMsQ0FBQzt3QkFDM0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLENBQUM7d0JBQ2xDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDakIsQ0FBQyxDQUFDLENBQUM7Z0JBQ0osQ0FBQyxDQUFDLEVBQUM7OztDQUNIO0FBVEQsb0NBU0M7QUFFRCxPQUFPLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxVQUFBLENBQUMsSUFBSSxPQUFBLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFyQixDQUFxQixDQUFDLENBQUM7QUFDbEQ7Ozs7Ozs7S0FPSyIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgZXhwcmVzcyBmcm9tICdleHByZXNzJztcbmltcG9ydCAqIGFzIGh0dHAgZnJvbSAnaHR0cCc7XG5pbXBvcnQgKiBhcyBjaGlsZF9wcm9jZXNzIGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuaW1wb3J0ICogYXMgc29ja2V0X21hbmFnZXIgZnJvbSAnLi9Tb2NrZXRNYW5hZ2VyJztcbmltcG9ydCAqIGFzIGZpbGVfbWFuYWdlciBmcm9tICcuL0ZpbGVNYW5hZ2VyJztcbmltcG9ydCAqIGFzIHBhdGhzIGZyb20gJy4vcGF0aHMnO1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICcuL3V0aWxzJztcbmltcG9ydCAqIGFzIHJvdXRlcyBmcm9tICcuL1JvdXRlTWFuYWdlcic7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xudmFyIFRlcm1pbmFsTWFuYWdlciA9IHJlcXVpcmUoJy4vVGVybWluYWxNYW5hZ2VyJyk7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpbml0KCl7XG5cdGNvbnNvbGUubG9nKCdzdGFydGluZyBJREUnKTtcblxuXHRhd2FpdCBjaGVja19sb2NrZmlsZSgpXG5cdFx0LmNhdGNoKCAoZTogRXJyb3IpID0+IGNvbnNvbGUubG9nKCdlcnJvciBjaGVja2luZyBsb2NrZmlsZScsIGUpICk7XG5cblx0Ly8gc2V0dXAgd2Vic2VydmVyIFxuXHRjb25zdCBhcHA6IGV4cHJlc3MuQXBwbGljYXRpb24gPSBleHByZXNzKCk7XG5cdGNvbnN0IHNlcnZlcjogaHR0cC5TZXJ2ZXIgPSBuZXcgaHR0cC5TZXJ2ZXIoYXBwKTtcblx0c2V0dXBfcm91dGVzKGFwcCk7XG5cblx0Ly8gc3RhcnQgc2VydmluZyB0aGUgSURFIG9uIHBvcnQgODBcblx0c2VydmVyLmxpc3Rlbig4MCwgKCkgPT4gY29uc29sZS5sb2coJ2xpc3RlbmluZyBvbiBwb3J0JywgODApICk7XG5cblx0Ly8gaW5pdGlhbGlzZSB3ZWJzb2NrZXRcblx0c29ja2V0X21hbmFnZXIuaW5pdChzZXJ2ZXIpO1xuXG5cdFRlcm1pbmFsTWFuYWdlci5pbml0KCk7XG59XG5cbmxldCBiYWNrdXBfZmlsZV9zdGF0czogdXRpbC5CYWNrdXBfRmlsZV9TdGF0cyA9IHt9O1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNoZWNrX2xvY2tmaWxlKCl7XG5cdGxldCBsb2NrZmlsZV9leGlzdHMgPSAgYXdhaXQgZmlsZV9tYW5hZ2VyLmZpbGVfZXhpc3RzKHBhdGhzLmxvY2tmaWxlKTtcblx0aWYgKCFsb2NrZmlsZV9leGlzdHMpe1xuXHRcdGJhY2t1cF9maWxlX3N0YXRzLmV4aXN0cyA9IGZhbHNlO1xuXHRcdHJldHVybjtcblx0fVxuXHRsZXQgZmlsZV9wYXRoOiBzdHJpbmcgPSBhd2FpdCBmaWxlX21hbmFnZXIucmVhZF9maWxlKHBhdGhzLmxvY2tmaWxlKTtcblx0bGV0IGZpbGVuYW1lOiBzdHJpbmcgPSBwYXRoLmJhc2VuYW1lKGZpbGVfcGF0aCk7XG5cdGxldCBwcm9qZWN0X3BhdGg6IHN0cmluZyA9IHBhdGguZGlybmFtZShmaWxlX3BhdGgpKycvJztcblx0bGV0IHRtcF9iYWNrdXBfZmlsZTogc3RyaW5nID0gcHJvamVjdF9wYXRoKycuJytmaWxlbmFtZSsnfic7XG5cdGxldCBiYWNrdXBfZmlsZV9leGlzdHM6IGJvb2xlYW4gPSBhd2FpdCBmaWxlX21hbmFnZXIuZmlsZV9leGlzdHModG1wX2JhY2t1cF9maWxlKTtcblx0aWYgKCFiYWNrdXBfZmlsZV9leGlzdHMpe1xuXHRcdGJhY2t1cF9maWxlX3N0YXRzLmV4aXN0cyA9IGZhbHNlO1xuXHRcdHJldHVybjtcblx0fVxuXHRsZXQgYmFja3VwX2ZpbGVuYW1lOiBzdHJpbmcgPSBmaWxlbmFtZSsnLmJhayc7XG5cdGF3YWl0IGZpbGVfbWFuYWdlci5jb3B5X2ZpbGUodG1wX2JhY2t1cF9maWxlLCBwcm9qZWN0X3BhdGgrYmFja3VwX2ZpbGVuYW1lKTtcblx0Y29uc29sZS5sb2coJ2JhY2t1cCBmaWxlIGNvcGllZCB0bycsIHByb2plY3RfcGF0aCtiYWNrdXBfZmlsZW5hbWUpO1xuXHRiYWNrdXBfZmlsZV9zdGF0cy5leGlzdHMgPSB0cnVlO1xuXHRiYWNrdXBfZmlsZV9zdGF0cy5maWxlbmFtZSA9IGZpbGVuYW1lO1xuXHRiYWNrdXBfZmlsZV9zdGF0cy5iYWNrdXBfZmlsZW5hbWUgPSBiYWNrdXBfZmlsZW5hbWU7XG5cdGJhY2t1cF9maWxlX3N0YXRzLnByb2plY3QgPSBwYXRoLmJhc2VuYW1lKHByb2plY3RfcGF0aCk7XG5cdGF3YWl0IGZpbGVfbWFuYWdlci5kZWxldGVfZmlsZShwYXRocy5sb2NrZmlsZSk7XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0X2JhY2t1cF9maWxlX3N0YXRzKCk6IHV0aWwuQmFja3VwX0ZpbGVfU3RhdHMge1xuXHRyZXR1cm4gYmFja3VwX2ZpbGVfc3RhdHM7XG59XG5cblxuZnVuY3Rpb24gc2V0dXBfcm91dGVzKGFwcDogZXhwcmVzcy5BcHBsaWNhdGlvbil7XG5cdC8vIHN0YXRpYyBwYXRoc1xuXHRhcHAudXNlKGV4cHJlc3Muc3RhdGljKHBhdGhzLndlYnNlcnZlcl9yb290KSk7IC8vIGFsbCBmaWxlcyBpbiB0aGlzIGRpcmVjdG9yeSBhcmUgc2VydmVkIHRvIGJlbGEubG9jYWwvXG5cdGFwcC51c2UoJy9kb2N1bWVudGF0aW9uJywgZXhwcmVzcy5zdGF0aWMocGF0aHMuQmVsYSsnRG9jdW1lbnRhdGlvbi9odG1sJykpO1xuXG5cdC8vIGFqYXggcm91dGVzXG5cdC8vIGZpbGUgYW5kIHByb2plY3QgZG93bmxvYWRzXG5cdGFwcC5nZXQoJy9kb3dubG9hZCcsIHJvdXRlcy5kb3dubG9hZCk7XG5cdC8vIGRveHlnZW4geG1sXG5cdGFwcC5nZXQoJy9kb2N1bWVudGF0aW9uX3htbCcsIHJvdXRlcy5kb3h5Z2VuKTtcblx0Ly8gaGFjayBmb3Igd29ya3NoaXAgc2NyaXB0XG5cdGFwcC5nZXQoJy9yZWJ1aWxkLXByb2plY3QnLCByb3V0ZXMucmVidWlsZF9wcm9qZWN0KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldF94ZW5vbWFpX3ZlcnNpb24oKTogUHJvbWlzZTxzdHJpbmc+e1xuXHRyZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KXtcblx0XHRjaGlsZF9wcm9jZXNzLmV4ZWMoJy91c3IveGVub21haS9iaW4veGVuby1jb25maWcgLS12ZXJzaW9uJywgKGVyciwgc3Rkb3V0LCBzdGRlcnIpID0+IHtcblx0XHRcdGlmIChlcnIpe1xuXHRcdFx0XHRjb25zb2xlLmxvZygnZXJyb3IgcmVhZGluZyB4ZW5vbWFpIHZlcnNpb24nKTtcblx0XHRcdFx0cmVqZWN0KGVycik7XG5cdFx0XHR9XG5cdFx0XHRpZiAoc3Rkb3V0LmluY2x1ZGVzKCcyLjYnKSl7XG5cdFx0XHRcdHBhdGhzLnNldF94ZW5vbWFpX3N0YXQoJy9wcm9jL3hlbm9tYWkvc3RhdCcpO1xuXHRcdFx0fSBlbHNlIGlmIChzdGRvdXQuaW5jbHVkZXMoJzMuMCcpKXtcblx0XHRcdFx0cGF0aHMuc2V0X3hlbm9tYWlfc3RhdCgnL3Byb2MveGVub21haS9zY2hlZC9zdGF0Jyk7XG5cdFx0XHR9XG5cdFx0XHRyZXNvbHZlKHN0ZG91dCk7XG5cdFx0fSk7XG5cdH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0X3RpbWUodGltZTogc3RyaW5nKXtcblx0Y2hpbGRfcHJvY2Vzcy5leGVjKCdkYXRlIC1zIFwiJyt0aW1lKydcIicsIChlcnIsIHN0ZG91dCwgc3RkZXJyKSA9PiB7XG5cdFx0aWYgKGVyciB8fCBzdGRlcnIpe1xuXHRcdFx0Y29uc29sZS5sb2coJ2Vycm9yIHNldHRpbmcgdGltZScsIGVyciwgc3RkZXJyKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc29sZS5sb2coJ3RpbWUgc2V0IHRvOicsIHN0ZG91dCk7XG5cdFx0fVxuXHR9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNodXRkb3duKCl7XG5cdGNoaWxkX3Byb2Nlc3MuZXhlYygnc2h1dGRvd24gLWggbm93JywgKGVyciwgc3Rkb3V0LCBzdGRlcnIpID0+IGNvbnNvbGUubG9nKCdzaHV0dGluZyBkb3duJywgZXJyLCBzdGRvdXQsIHN0ZGVycikgKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGJvYXJkX2RldGVjdCgpOiBQcm9taXNlPGFueT57XG5cdHJldHVybiBuZXcgUHJvbWlzZSggKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdGNoaWxkX3Byb2Nlc3MuZXhlYygnYm9hcmRfZGV0ZWN0JywgKGVyciwgc3Rkb3V0LCBzdGRlcnIpID0+IHtcblx0XHRcdGlmIChlcnIpIHJlamVjdChlcnIpO1xuXHRcdFx0aWYgKHN0ZGVycikgcmVqZWN0KHN0ZGVycik7XG5cdFx0XHRjb25zb2xlLmxvZygncnVubmluZyBvbicsIHN0ZG91dCk7XG5cdFx0XHRyZXNvbHZlKHN0ZG91dCk7XG5cdFx0fSk7XG5cdH0pO1xufVxuXG5wcm9jZXNzLm9uKCd3YXJuaW5nJywgZSA9PiBjb25zb2xlLndhcm4oZS5zdGFjaykpO1xuLypwcm9jZXNzLm9uKCd1bmNhdWdodEV4Y2VwdGlvbicsIGVyciA9PiB7XG5cdGNvbnNvbGUubG9nKCd1bmNhdWdodCBleGNlcHRpb24nKTtcblx0dGhyb3cgZXJyO1xufSk7XG5wcm9jZXNzLm9uKCdTSUdURVJNJywgKCkgPT4ge1xuXHRjb25zb2xlLmxvZygnU0lHVEVSTScpO1xuXHR0aHJvdyBuZXcgRXJyb3IoJ1NJR1RFUk0nKTtcbn0pOyovXG4iXX0=
