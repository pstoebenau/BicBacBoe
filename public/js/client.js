"use strict";
exports.__esModule = true;
var socket_io_client_1 = require("socket.io-client");
var Client = /** @class */ (function () {
    function Client() {
        this.socket = socket_io_client_1["default"]();
        this.socket = socket_io_client_1["default"]();
        console.log(this.socket);
        socket.on('socketID', function (id) {
            document.getElementById("clientID").innerHTML = "Client ID: " + id;
        });
    }
    Client.prototype.sendBoardData = function (data) {
        socket.emit('update', data);
    };
    Client.prototype.pickOpponent = function (id) {
        socket.emit('updateOpponentID', id);
    };
    Client.prototype.setPlayerMark = function (mark) {
        socket.emit('setPlayerMark', mark);
    };
    return Client;
}());
exports["default"] = Client;
