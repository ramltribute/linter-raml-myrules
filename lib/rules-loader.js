var fs = require('fs');
var callbacks = [];

function loadRules(rulesPath){
    callbacks = [];
    var files = fs.readdirSync(rulesPath);
    files.forEach(function(file){
        var cb = require(rulesPath + file);
        callbacks.push(cb);
    });
};

function getCallbacks(){
    return callbacks;
}

module.exports.loadRules = loadRules;
module.exports.callbacks = getCallbacks;
