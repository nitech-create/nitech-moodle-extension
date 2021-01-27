$(function () {

    console.log("コンテントスクリプトだよ");
    $('body').css('background-color', 'orange');
    var value = $('.coursename');

    var load = setInterval(function () {
        if (value[0] === undefined) {
            //メインコンテンツ読み込めたかcheck
            value = $('.coursename');
            console.log("yet");
        } else {
            clearInterval(load);
            console.log("done");
            //読み込み終わったらの処理
            chrome.storage.sync.set({ 'key': value }, function () {
            });


            var coursenum = value.length;
            const courselist_short = $('.course-listitem .text-muted div').text().slice(1).split("|");
            var courselist = new Array()
            courselist = $('.course-listitem .coursename').text().replace(/\s+/g, "").split("コース星付きコース名");
            courselist.shift();

            var for_split = courselist_short;



            var courses = new Array(coursenum);
            const courses_member = {
                short: "",
                term: "",
                day: "",
                name: "",
                time: "",
                url: ""
            }
            for (var i = 0; i < coursenum; i++) {
                courses[i] = courses_member;
            }
            console.log(courses)

            console.log(coursenum)
            for (i = 0; i < coursenum; i++) {
                var container = new Array();
                courses[i].short = courselist_short[i];
                for_split[i] = String(20) + for_split[i].replace(/-/g, "");
                container = courselist[i].split(for_split[i]);
                console.log(container)
                if (container.length == 1) {
                    //特殊なクラス(時間割じゃないコース)
                    courses[i].term = "none"
                    courses[i].name = container[0]
                    courses[i].time = "none"
                    courses[i].url = ""
                } else {
                    //通常クラス
                    courses[i].name = container[0]
                    container[1] = container[1].split("期")
                    courses[i].term = container[1].shift();
                    container[1] = container[1][0].split("曜")
                    courses[i].day = container[1].shift();
                    container[1] = container[1][0].split("限")
                    courses[i].time = container[1].shift()
                }
            }
            console.log(courses)
        }
    }, 100)



});