$(function () {

    console.log("コンテントスクリプトだよ");
    $('body').css('background-color', 'orange');
    var value = $('.coursename');

    var load =setInterval(function(){
        if(value[0]===undefined){
            value = $('.coursename');
            console.log("yet");
        }else{
            clearInterval(load);
            console.log("done");
            chrome.storage.sync.set({ 'key': value }, function () {
            });
        }
    },100)
    console.log(value[0]);
    


});