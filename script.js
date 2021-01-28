
$(function () {

    console.log(location.href);
    $('body').css('background-color', 'orange');
    var value = $('.coursename');
    if (location.href == "https://cms6.ict.nitech.ac.jp/moodle38a/my/" || location.href == "https://cms6.ict.nitech.ac.jp/moodle38a/my/index.php"|| location.href == "https://cms6.ict.nitech.ac.jp/moodle38a/my/#") {
        // topページでの処理
        var load = setInterval(function () {
            if (value[0] === undefined) {
                //メインコンテンツ読み込めたかcheck
                value = $('.coursename');
                console.log("yet");
            } else {
                clearInterval(load);
                console.log("done");
                //読み込み終わったらの処理



                var coursenum = value.length;
                const courselist_short = $('.course-listitem .text-muted div').text().slice(1).split("|");
                var courselist = new Array()
                courselist = $('.course-listitem .coursename').text().replace(/\s+/g, "").split("コース星付きコース名");
                courselist.shift();

                var for_split = courselist_short;



                var short = new Array(coursenum);
                var term = new Array(coursenum);
                var day = new Array(coursenum);
                var name = new Array(coursenum);
                var time = new Array(coursenum);
                var url = new Array(coursenum);


                var courses = new Array(coursenum)

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
                    courses[i] = new Object();
                    courses[i].term = term[i]
                    courses[i].name = name[i]
                    courses[i].day = day[i]
                    courses[i].short = short[i]
                    courses[i].time = time[i]
                    courses[i].url = url[i]
                }


                //ナビゲーション文字入れ替え
                var listnum = $(".depth_1 ul").first().children("li").eq(2).children("ul").children("li").length
                var count = 0;
                $(".depth_1 ul").first().children("li").last().children("ul").children("li").each(function () {
                    var tf = false;
                    count++
                    for (var i = 0; i < coursenum; i++) {
                        if ($(this).children("p").children("a").text() == courses[i].short) {
                            $(this).children("p").children("a").text(courses[i].name);
                            tf = true;
                            console.log("replaced")
                        }
                    }
                    if (tf === false) {
                        if (count == listnum) {
                            //トップに戻るボタン
                            $(this).remove();
                        } else {
                            $(this).remove();
                        }
                    }

                });

                //ストレージに保持(local->syncで他拡張機能と共有可能?)
                chrome.storage.local.set({ "courses": courses }, function () {
                })

                //myコースの表示設定消去
                $(".block_mycourse_config").remove()

                //header消去
                $("header").empty().css("height", "50px")

                //navバー操作
                $("nav").prepend("<p>Hello Moodle</p>")

                //navを左に集める＆順番最適化
                $("#page-header").after("<div id=\"side-nav-extension\"></div>")
                var side_nav_extensions_css = {
                    "width": "360px",
                    "margin": "0px 0 0 0"
                }
                $("#side-nav-extension").css(side_nav_extensions_css)
                $("#side-nav-extension").append($(".columnleft").html())
                $(".columnleft").remove()
                $("#side-nav-extension").append($(".columnright").html())
                $(".columnright").remove()

                var search_course = $("[data-block=\"html\"]").last()
                // var jyouhou_security=$("[data-block=\"html\"]").first()
                var navigator = $("[data-block=\"navigation\"]")
                var mysyllabus = $("[data-block=\"mysyllabus\"]")
                var private_files = $("[data-block=\"private_files\"]")
                var calendar_upcoming = $("[data-block=\"calendar_upcoming\"]")
                var badges = $("[data-block=\"badges\"]")
                var calendar_month = $("[data-block=\"calendar_month\"]")

                $("#block-region-side-post").empty()
                $("#block-region-side-pre").remove()
                $("#block-region-side-post").append(calendar_month, calendar_upcoming, navigator, search_course, mysyllabus, private_files, badges)


                //直近イベントを見やすく  ->http requestつかって何の教科か出したいけど、セッションとかがわからん
                var events = calendar_upcoming.children("div").children("div").children("div").first().children("div").children("div")
                for (var i = 0; i < events.length; i++) {
                    var task_date= $(events[i]).children(".date").text().replace(/[\s+,]/g, "").split(/[:年日月]/)
                    console.log(task_date)
                    var task_date_calc=new Date(task_date[0],task_date[1]-1,task_date[2],task_date[3],task_date[4])
                    var date_now = new Date()

                    console.log(msToTime(task_date_calc-date_now))
                    $(events[i]).children(".date").append("")
                    $(events[i]).children(".date").append("<br>残り時間 ： <span class=\"date-left-extension\">"+msToTime(task_date_calc-date_now)+"</span>")
                    
                }
                $(".date-left-extension").css("color","black")

                //動的に残り時間を変更
                var oldmin,newmin
                setInterval(function(){
                    var now_date=new Date();
                    oldmin=newmin;
                    newmin=now_date.getMinutes()
                    if(oldmin==newmin){
                        //分が変わってなければ
                    }else{
                        //分が変わっていれば
                        $(".date-left-extension").empty()
                        for (var i = 0; i < events.length; i++) {
                            var task_date= $(events[i]).children(".date").text().replace(/[\s+,]/g, "").split(/[:年日月残]/)
                            console.log(task_date)
                            var task_date_calc=new Date(task_date[0],task_date[1]-1,task_date[2],task_date[3],task_date[4])
                            var date_now = new Date()
        
                            console.log(msToTime(task_date_calc-date_now))
                            $($(".date-left-extension")[i]).text(msToTime(task_date_calc-date_now))
                            
                        }
                    }
                    console.log("hi")
                },1000)

                //カレンダーがうまく動かない(first.jsのcalendar_miniとか、calendar_get_monthなんちゃらとかが関係してるけど、ちょっと読めない(miniのほうが大事そう)) ->issue立てて隠ぺいしよう!(人任せ)
                $(".arrow").css("visibility","hidden")
                calendar_month.children("div").append("<a id=\"link-to-calendar\" href=\"\">カレンダーに移動する</a>")
                $("#link-to-calendar").attr('href', $(".current").eq(1).children("a").attr("href"));
                $("#link-to-calendar").css("margin","auto auto auto 150px")
            }
        }, 100)
    } else {
        //topページ以外での処理
        chrome.storage.local.get("courses", function (data) {
            var coursenum = data.courses.length
            //ナビゲーション文字入れ替え
            var listnum = $(".depth_1 ul").first().children("li").eq(2).children("ul").children("li").length
            var count = 0;

            $(".depth_1 ul").first().children("li").eq(2).children("ul").children("li").each(function () {

                var tf = false;
                count++
                for (var i = 0; i < coursenum; i++) {
                    if ($(this).children("p").children("a").text() == data.courses[i].short) {
                        $(this).children("p").children("a").text(data.courses[i].name);
                        tf = true;
                        console.log("replaced")
                    }
                }
                if (tf === false) {
                    if (count == listnum) {
                        //トップに戻るボタン
                        $(this).children("p").children("a").text("マイページに戻る");
                        console.log("top")
                    } else {
                        $(this).remove();
                    }
                }

            });
        })

    }

});
//ミリ秒から時間計算するやつ ->マイナスの時間の処
function msToTime(duration) {
    var milliseconds = parseInt((duration % 1000) / 100),
      seconds = Math.floor((duration / 1000) % 60),
      minutes = Math.floor((duration / (1000 * 60)) % 60),
      hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
      days = Math.floor((duration / (1000 * 60 * 60 *24)) % 365);
  
    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
  
    return days+"日 " + hours + "時間 " + minutes + "分";
  }
  