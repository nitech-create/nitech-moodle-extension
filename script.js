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



            var short= new Array(coursenum);
            var term = new Array(coursenum);
            var day= new Array(coursenum);
            var name = new Array(coursenum);
            var time = new Array(coursenum);
            var url = new Array(coursenum);
            

            var courses=new Array(coursenum)

            for (i = 0; i < coursenum; i++) {
                var container = new Array();
                short[i] = courselist_short[i];
                for_split[i] = String(20) + for_split[i].replace(/-/g, "");
                container = courselist[i].split(for_split[i]);
                if (container.length == 1) {
                    //特殊なクラス(時間割じゃないコース)
                    term[i] = "none"
                    name[i] = container[0]
                    time[i] = "none"
                } else {
                    //通常クラス
                    name[i] = container[0]
                    container[1] = container[1].split("期")
                    term[i] = container[1].shift();
                    container[1] = container[1][0].split("曜")
                    day[i] = container[1].shift();
                    container[1] = container[1][0].split("限")
                    time[i] = container[1].shift()
                }
                courses[i]=new Object();
                courses[i].term = term[i]
                courses[i].name = name[i]
                courses[i].day = day[i]
                courses[i].short = short[i]
                courses[i].time = time[i]
                courses[i].url= url[i]
            }
            console.log(courses);
        }
    }, 100)



});