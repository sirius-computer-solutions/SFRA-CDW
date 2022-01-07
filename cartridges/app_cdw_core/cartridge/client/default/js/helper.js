
var exports = {
    callWhenAvailable: function(testFunc,performFunc){
        if(testFunc()){
            performFunc();
            return true;
        } 
        else {
            var interval=setInterval(function(){
                if(testFunc()){
                    clearInterval(interval);
                    performFunc();
                }
            },50);
            return interval;
        }
    }
}

module.exports = exports;