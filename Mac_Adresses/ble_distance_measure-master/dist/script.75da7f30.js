// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"node_modules/bleuio/index.js":[function(require,module,exports) {
let port,
    reader,
    inputDone,
    outputDone,
    inputStream,
    outputStream,
    arr = [];
async function connect() {
    (port = await navigator.serial.requestPort()), await port.open({ baudRate: 9600 });
    const t = new TextEncoderStream();
    (outputDone = t.readable.pipeTo(port.writable)), (outputStream = t.writable);
    let e = new TextDecoderStream();
    (inputDone = port.readable.pipeTo(e.writable)), (inputStream = e.readable.pipeThrough(new TransformStream(new LineBreakTransformer()))), (reader = inputStream.getReader());
}
async function disconnect() {
    return (
        reader && (await reader.cancel(), await inputDone.catch(() => {}), (reader = null), (inputDone = null)),
        outputStream && (await outputStream.getWriter().close(), await outputDone, (outputStream = null), (outputDone = null)),
        await port.close(),
        (port = null),
        "Dongle Disconnected!"
    );
}
function writeCmd(t) {
    const e = outputStream.getWriter();
    e.write(t), "" !== t && e.write("\r"), e.releaseLock();
}
/**
 * @at_connect
 * Connects Device
*/
(exports.at_connect = async function () {
    return await connect(), "device connected";
}),
/**
 * @at_connect
 * Disconnects Device
*/
(exports.at_disconnect = async function () {
    return await disconnect(), "device disconnected";
}),
/**
 * @ati
 * Device information query.
 * @return {Promise} returns promise
 * 
*/
    (exports.ati = () => (port ? (writeCmd("ATI"), readLoop("ati")) : "Device not connected.")),
/**
 * @at_central
 * Sets the device Bluetooth role to central role.
 * @return {Promise} returns promise
 * 
*/  
/**
 * @ate
 * Turn echo on/off. (On per default). ex ate(0)
 * @param {number} status int (0 or 1, 0 for off 1 for on)
 * @return {Promise} returns promise
 * 
*/
(exports.ate = function (status) {
    return writeCmd("ATE"+status), readLoop("ate");
}),
/**
 * @at_central
 * Sets the device Bluetooth role to central role.
 * @return {Promise} returns promise
 * 
*/  
(exports.at_central = function () {
    return writeCmd("AT+CENTRAL"), readLoop("at_central");
}),
/**
 * @at_peripheral
 * Sets the device Bluetooth role to peripheral.
 * @return {Promise} returns promise
 * 
*/ 
(exports.at_peripheral = function () {
    return writeCmd("AT+PERIPHERAL"), readLoop("at_peripheral");
}),
/**
 * @atr
 * Trigger platform reset.
 * @return {Promise} returns promise
 * 
*/
(exports.atr = function () {
    return writeCmd("ATR"), readLoop("atr");
}),
/**
 * @at_advstart
 * Starts advertising .
 * @return {Promise} returns promise
 * 
*/
(exports.at_advstart = function () {
    return writeCmd("AT+ADVSTART"), readLoop("at_advstart");
}),
/**
 * @at_advstop
 * Stops advertising .
 * @return {Promise} returns promise
 * 
*/
(exports.at_advstop = function () {
    return writeCmd("AT+ADVSTOP"), readLoop("at_advstop");
}),
/**
 * @at_advdata
 * Sets or queries the advertising data.if left empty it will query what advdata is set. 
 * @param {string} t hex str format: xx:xx:xx:xx:xx.. (max 31 bytes)
 * @return {Promise} returns a promise
 * 
*/
(exports.at_advdata = (t) => (writeCmd(t ? "AT+ADVDATA=" + t : "AT+ADVDATA"), readLoop("at_advdata"))),
/**
 * @at_advdatai
 * Sets advertising data in a way that lets it be used as an iBeacon.
        Format = (UUID)(MAJOR)(MINOR)(TX)
        Example: at_advdatai(5f2dd896-b886-4549-ae01-e41acd7a354a0203010400).
 * @param {string} t  if left empty it will query what advdata is set
 * @return {Promise} returns a promise
 * 
*/
(exports.at_advdatai = function (t) {
    return writeCmd("AT+ADVDATAI=" + t), readLoop("at_advdatai");
}),
/**
 * @at_advresp
 *  Sets or queries scan response data. Data must be provided as hex string.
 * @param {string} t if left empty it will query what advdata is set.hex str format: xx:xx:xx:xx:xx.. (max 31 bytes)
 * @return {Promise} returns a promise
 * 
*/
(exports.at_advresp = function (t) {
    return writeCmd(t ? "AT+ADVRESP=" + t : "AT+ADVRESP"), readLoop("at_advresp");
}),
/**
 * @at_cancelconnect
 * While in Central Mode, cancels any ongoing connection attempts.
 * @return {Promise} returns a promise
 * 
*/
(exports.at_cancelconnect = function () {
    return writeCmd("AT+CANCELCONNECT"), readLoop("at_cancelconnect");
}),
/**
 * @at_client
 * Only usable in Dual role. Sets the dongle role towards the targeted connection to client.
 * @return {Promise} returns a promise
 * 
*/
(exports.at_client = function () {
    return writeCmd("AT+CLIENT"), readLoop("at_client");
}),
/**
 * @at_dual
 * Sets the device Bluetooth role to dual role. This means it has the capabilities of both Central and Peripheral role. Advertising must be stopped and, any connection must be terminated before the role change is accepted.
 * @return {Promise} returns a promise
 * 
*/
(exports.at_dual = function () {
    return writeCmd("AT+DUAL"), readLoop("at_dual");
}),
/**
 * @at_enterpasskey
 * Enter the 6-digit passkey to continue the pairing and bodning request.
 * @param {string} t Enter the 6-digit passkey.
 * @return {Promise} returns a promise
 * 
*/
(exports.at_enterpasskey = function (t=123456) {
    return writeCmd("AT+ENTERPASSKEY=" + t), readLoop("at_enterpasskey");
}),
/** @at_numcompa
* Used for accepting a numeric comparison authentication request or enabling/disabling auto-accepting numeric comparisons.
* @param {number} t 0 or 1. 0 for disabled 1 for enable. Enabled by default.
* @return {Promise} returns a promise
* 
*/
(exports.at_numcompa = function (t) {
    return writeCmd(t ? "AT+NUMCOMPA=" + t : "AT+NUMCOMPA"), readLoop("at_numcompa");
 }),
/**
 * @at_gapiocap
 * Sets or queries what input and output capabilities the device has.
 * @param {number} t int between 0 to 4. 0 - Display only, 1 - Display + yes & no, 2 - Keyboard only, 3- No input no output, 4 - Keyboard + display
 * @return {Promise} returns a promise
 * 
*/
(exports.at_gapiocap = function (t=1) {
    return writeCmd("AT+GAPIOCAP=" + t), readLoop("at_gapiocap");
}),
/**
 * @at_gappair
 * Starts a pairing or bonding procedure. Depending on whether the device is master or slave on the connection, it will send a pairing or a security request respectively.
Only usable when connected to a device.
 * @param {number} t leave blank for pairing and write BOND for bonding.
 * @return {Promise} returns a promise
 * 
*/
(exports.at_gappair = function (t) {
    return writeCmd(t ? "AT+GAPPAIR=" + t : "AT+GAPPAIR"), readLoop("at_gappair");
}),
/**
 * @at_gapunpair
 * Unpair paired devices. This will also remove the device bond data from BLE storage. Usable both when device is connected and when not. 
 * @param {number} t Leave blank to unpair all paired devices or selected paired device (device_mac_address). Public= [0] or private= [1] address type prefix required before mac address. ex: [x]xx:xx:xx:xx:xx:xx
 * @return {Promise} returns a promise
 * 
*/
(exports.at_gapunpair = function (t) {
    return writeCmd(t ? "AT+GAPUNPAIR=" + t : "AT+GAPUNPAIR"), readLoop("at_gapunpair");
}),
/**
 * @at_gapscan
 * Starts a Bluetooth device scan with or without timer set in seconds. If no timer is set, it will scan for only 1 second.
 * @param {number} t int (time in seconds)
 * @param {boolean} e true/false, true will show real time device in console
 * @return {Promise} returns a promise
 * 
*/
(exports.at_gapscan = function (t = 1,e=true) {
    return writeCmd("AT+GAPSCAN=" + t), readLoop("at_gapscan",e);
}),
/** @at_seclvl
* Sets or queries what minimum security level will be used when connected to other devices.
* @param {number} t leave blank for quering security level or set security level from 1 to 3. 1- No authentication and no encryption, 2-Unauthenticated pairing with encryption, 3 -Authenticated pairing with encryption
* @return {Promise} returns a promise
* 
*/
(exports.at_seclvl = function (t) {
    return writeCmd(t ? "AT+SECLVL=" + t : "AT+SECLVL"), readLoop("at_seclvl");
 }),
/** @at_setpasskey
* Setting or quering set passkey for passkey authentication.
* @param {string} t leave blank for quering passkey or set six digit passkey.
* @return {Promise} returns a promise
* 
*/
(exports.at_setpasskey = function (t) {
   return writeCmd(t ? "AT+SETPASSKEY=" + t : "AT+SETPASSKEY"), readLoop("at_setpasskey");
}),
/**
 * @at_findscandata
 * Scans for all advertising/response data which contains the search params. ex. at_findscandata('FF5',10)
 * @param {string} t search params.
 * @param {number} e number of responses.
 * @return {Promise} returns a promise
 * 
*/
(exports.at_findscandata = function (t = 1,e=5) {
    return writeCmd("AT+FINDSCANDATA=" + t), readLoop("at_findscandata",e);
}),
/**
 * @at_gapconnect
 * Initiates a connection with a specific slave device.
 * @param {string} t hex str format: xx:xx:xx:xx:xx:xx
 * @return {Promise} returns a promise
 * 
*/
(exports.at_gapconnect = function (t) {
    return writeCmd("AT+GAPCONNECT=" + t), readLoop("at_gapconnect");
}),
/**
 * @at_gapdisconnect
 * Disconnects from a peer Bluetooth device.
 * @return {Promise} returns a promise
 * 
*/
(exports.at_gapdisconnect = function () {
    return writeCmd("AT+GAPDISCONNECT"), readLoop("at_gapdisconnect");
}),
/**
 * @at_getconn
 * Gets a list of currently connected devices along with their mac addresses, connection index, our role towards this connection and if it's bonded/paired.
 * @return {Promise} returns a promise
 * 
*/
(exports.at_getconn = async function () {
    return writeCmd("AT+GETCONN"), readLoop("at_getconn");
}),
/**
 * @at_getservices
 * Rediscovers a peripheral's services and characteristics.
 * @return {Promise} returns a promise
 * 
*/
(exports.at_getservices = function () {
    return writeCmd("AT+GETSERVICES"), readLoop("at_getservices");
}),
/**
 * @at_scantarget
 * Scan a target device. Displaying it's advertising and response data as it updates.
 * @param {string} t hex str format: xx:xx:xx:xx:xx:xx
 * @param {Number} e Number of responses
 * @return {Promise} returns a promise
 * 
*/
(exports.at_scantarget = function (t, e = 1) {
    return writeCmd("AT+SCANTARGET=" + t), readLoop("at_scantarget", e+2);
}),
/**
 * @at_server
 * Only usable in Dual role. Sets the dongle role towards the targeted connection to server.
 * @return {Promise} returns a promise
 * 
*/
(exports.at_server = function () {
    return writeCmd("AT+SERVER"), readLoop("at_server");
}),
/**
 * @at_setnoti
 * Enable notification for selected characteristic.
 * @param {string} t notification handle
 * @return {Promise} returns a promise
 * 
*/
(exports.at_setnoti = function (t) {
    return writeCmd("AT+SETNOTI=" + t),  readLoop("at_setnoti");
}),
/**
 * @at_spssend
 * Send a message or data via the SPS profile.Without parameters it opens a stream for continiously sending data.
 * @param {string} t if left empty it will open Streaming mode
 * @return {Promise} returns a promise
 * 
*/
(exports.at_spssend = function (t) {
        return writeCmd(t ? "AT+SPSSEND=" + t : "AT+SPSSEND"),  readLoop("at_spssend");
}),
/**
 * @at_targetconn
 * Setting or querying the connection index to use as the targeted connection.
When connected to several devices, the target connection decides which device you target when using commands such as AT+GATTCREAD, AT+GATTCWRITE, AT+GAPDISCONNECT, AT+GAPPAIR or AT+SPSSEND etc.
 * @param {string} t write connecton index of target device. if left empty it will show what device you are targeting at the momment.
 * @return {Promise} returns a promise
 * 
*/
(exports.at_targetconn = function (t) {
    return writeCmd(t ? "AT+TARGETCONN=" + t : "AT+TARGETCONN"),  readLoop("at_targetconn");
}),
/**
 * @at_gapstatus
 * Reports the Bluetooth role.
 * @return {Promise} returns a promise
 * 
*/
(exports.at_gapstatus = function () {
    return writeCmd("AT+GAPSTATUS"), readLoop("at_gapstatus");
}),
/**
 * @at_gattcwrite
 * Write attribute to remote GATT server in ASCII. Can only be used in Central role and when connected to a peripheral. ex at_gattcwrite('001B','HELLO')
 * @param {string} handle_param pass handle param as string
 * @param {string} msg pass msg as string. 
 * @return {Promise} returns a promise
 * 
*/
(exports.at_gattcwrite = function (handle_param,msg) {
    return writeCmd("AT+GATTCWRITE="+handle_param+" "+msg), readLoop("at_gattcwrite");
}),
/**
 * @at_gattcwriteb
 * Write attribute to remote GATT server in Hex. Can only be used in Central role and when connected to a peripheral.ex at_gattcwriteb('001B','0101')
 * @param {string} handle_param pass handle param as string
 * @param {string} msg pass msg as string.
 * @return {Promise} returns a promise
 * 
*/
(exports.at_gattcwriteb = function () {
    return writeCmd("AT+GATTCWRITEB="+handle_param+" "+msg), readLoop("at_gattcwriteb");
}),
/**
 * @at_gattcread
 * Read attribute of remote GATT server. Can only be used in Central role and when connected to a peripheral. ex at_gattcread('001B')
 * @param {string} handle_param pass handle param as string
 * @return {Promise} returns a promise
 * 
*/
(exports.at_gattcread = function () {
    return writeCmd("AT+GATTCREAD="+handle_param), readLoop("at_gattcread");
}),
/**
 * @help
 * Shows all AT-Commands.
 * @return {Promise} returns a promise
 * 
*/
(exports.help = function () {
    return writeCmd("--H"), readLoop("help");
}),
/**
 * @stop
 * Stops Current process.
 * @return {Promise} returns a promise
 * 
*/
(exports.stop = function () {
    return writeCmd(""), "Process Stopped";
});
class LineBreakTransformer {
    constructor() {
        this.container = "";
    }
    transform(t, e) {
        this.container += t;
        const r = this.container.split("\r\n");
        (this.container = r.pop()), r.forEach((t) => e.enqueue(t));
    }
    flush(t) {
        t.enqueue(this.container);
    }
}
async function readLoop(t, e) {
    for (arr = []; ; ) {
        const { done: r, value: a } = await reader.read();        
        switch ((a && arr.push(a), t)) {
            
            case "ati":
                if (arr.includes("Not Advertising") || arr.includes("Advertising")) return arr;
                break;
            case "ate":
                if (arr.includes("ECHO OFF") || arr.includes("ECHO ON")) return arr;
                break;
            case "at_central":
                return "Central Mode";
            case "at_peripheral":
                return "Peripheral Mode";
            case "at_advstart":
                return "Advertising";
            case "at_advstop":
                return "Advertising Stopped";
            case "at_advdata":
            case "at_advdatai":
            case "at_advresp":
                if (2 == arr.length) return arr;
                break;
            case "at_cancelconnect":
                if (arr.includes("ERROR") || arr.includes("OK")) return arr;
                break;
            case "at_client":
                return "Client";                
            case "at_dual":
                return "Dual Mode";
            case "at_enterpasskey":
                if (2 == arr.length) return arr;
                break;
            case "atr":
                return "Trigger platform reset";
            case "at_findscandata":                
                if (arr.length == e) {
                    const t = outputStream.getWriter();
                    return t.write(""), t.releaseLock(), arr;
                }
                break;
            case "at_gapiocap":
                if (3 == arr.length) return arr;
                break;            
            case "at_gappair":
                if (arr.includes("PAIRING SUCCESS") || arr.includes("BONDING SUCCESS")) return arr;
                break;
            case "at_gapunpair":
                if (arr.includes("UNPARIED.")|| 3 == arr.length) return arr;
                break;
            case "at_gapscan":
                if(e===true)
                    arr.some(function(v){ if (v.indexOf("RSSI")>=0 && a!='') console.log(a) })
                if (arr.includes("SCAN COMPLETE")) return arr;
                break;
            case "at_getconn":
               if (arr.includes("No Connections found.") || 2 == arr.length )
               {
                   return arr;
               }       
            case "at_scantarget":
                if (arr.length == e) {
                    const t = outputStream.getWriter();
                    return t.write(""), t.releaseLock(), arr.slice(2);
                }
                break;  
            case "at_setpasskey":
                if (2 == arr.length) return arr;
                break;          
            case "at_gattcwrite":
                if (4 == arr.length) return arr;
                break;
            case "at_gapstatus":
                if (arr.includes("Not Advertising") || arr.includes("Advertising")) return arr;
                break;
            case "at_gattcwrite":
                if (4 == arr.length) return arr;
                break;
            case "at_gattcwriteb":
                if (4 == arr.length) return arr;
                break;
            case "at_gattcread":
                if (4 == arr.length) return arr;
                break;
            case "at_gapconnect":
                if (arr.includes("CONNECTED.") || arr.includes("DISCONNECTED.") || arr.includes("ERROR") || arr.includes("PAIRING SUCCESS")) return arr;
                break;
            case "at_getservices":
                if (arr.includes("Value received: ")) return arr;
                break;
            case "at_gapdisconnect":
                return "Disconnected.";
            case "at_numcompa":
                if (arr.includes("ERROR") || arr.includes("OK")) return arr;
                break;
            case "at_seclvl":
                if ((2 == arr.length))  return arr;
                break;
            case "at_server":
                return "Server";                   
            case "at_setnoti":
                if (20 == arr.length) return arr;
                break;
            case "at_spssend":                
            if (2 == arr.length || arr.includes("[Sent]")) return arr;  
            case "at_targetconn":                
            if (2 == arr.length) return arr;    
            case "help":
                if (arr.includes("[A] = Usable in All Roles")) return arr;
                break;
            default:                
                return "Nothing!";
        }
        
    }
    
}
   
},{}],"script.js":[function(require,module,exports) {
"use strict";

var my_dongle = _interopRequireWildcard(require("bleuio"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

document.getElementById('connect').addEventListener('click', function () {
  my_dongle.at_connect();
});
/*
Functions to converts rssi to distance 
read more at 
https://iotandelectronics.wordpress.com/2016/10/07/how-to-calculate-distance-from-the-rssi-value-of-the-ble-beacon/
*/

var getDistance = function getDistance(rssi) {
  var n = 2;
  var mp = -69;
  return Math.pow(10, (mp - rssi) / (10 * n));
};

document.getElementById('scan').addEventListener('click', function () {
  var element = document.getElementById("scanning");
  element.classList.remove("d-none");
  my_dongle.at_central().then(function (data) {
    my_dongle.at_gapscan(4, false).then(function (dev) {
      //convert array string to array of object with key value
      var formated = dev.map(function (item) {
        var _item$split = item.split(' '),
            _item$split2 = _slicedToArray(_item$split, 7),
            id = _item$split2[0],
            dev = _item$split2[1],
            devid = _item$split2[2],
            none = _item$split2[3],
            rssi = _item$split2[4],
            rssival = _item$split2[5],
            devname = _item$split2[6];

        return {
          id: id,
          dev: dev,
          devid: devid,
          none: none,
          rssi: rssi,
          rssival: rssival,
          devname: devname
        };
      }); //array list unique

      var uniqueArr = formated.filter(function (y) {
        return y.devname != undefined;
      }); //sort based on rssi value

      uniqueArr.sort(function (a, b) {
        return a.rssival > b.rssival && 1 || -1;
      });
      var withDistance = uniqueArr.map(function (r) {
        r.distance = getDistance(r.rssival).toFixed(2) + ' meter';
        return r;
      }); //generate output

      var mytable = "<h2>Device List</h2>\n      <table class='table table-striped table-bordered'>\n      <tr>\n      <th>Device</th>\n      <th>RSSI</th>\n      <th>Distance</th>\n      </tr>";
      withDistance.map(function (j) {
        mytable += "<tr><td>" + j.devid + " - " + j.devname + "</td><td>" + j.rssival + "</td><td>" + j.distance + "</td></tr>";
      });
      mytable += "</table>";
      document.getElementById("deviceList").innerHTML = mytable;
      element.classList.add("d-none");
    });
  });
});
},{"bleuio":"node_modules/bleuio/index.js"}],"C:/Users/Shuhad/AppData/Roaming/npm/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "57690" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["C:/Users/Shuhad/AppData/Roaming/npm/node_modules/parcel-bundler/src/builtins/hmr-runtime.js","script.js"], null)
//# sourceMappingURL=/script.75da7f30.js.map