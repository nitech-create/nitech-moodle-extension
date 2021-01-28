$(function () {

    console.log(location.href);
    $('body').css('background-color', 'orange');
    var value = $('.coursename');
    if (location.href == "https://cms6.ict.nitech.ac.jp/moodle38a/my/" || location.href == "https://cms6.ict.nitech.ac.jp/moodle38a/my/index.php") {
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
                chrome.storage.local.set({"courses":courses},function(){
                })

                //myコースの表示設定消去
                $(".block_mycourse_config").remove()

                //header消去
                $("header").empty().css("height","50px")

                //navバー操作
                $("nav").prepend("<p>Hello Moodle</p>")

                //navを左に集める＆順番最適化
                $("#page-header").after("<div id=\"side-nav-extension\"></div>")
                var side_nav_extensions_css={
                    "width": "360px",
                    "margin": "0px 0 0 0"
                }
                $("#side-nav-extension").css(side_nav_extensions_css)
                $("#side-nav-extension").append($(".columnleft").html())
                $(".columnleft").remove()
                $("#side-nav-extension").append($(".columnright").html())
                $(".columnright").remove()

                var search_course=$("[data-block=\"html\"]").last()
                var jyouhou_security=$("[data-block=\"html\"]").first()
                var navigator=$("[data-block=\"navigation\"]")
                var mysyllabus=$("[data-block=\"mysyllabus\"]")
                var private_files=$("[data-block=\"private_files\"]")
                var calendar_upcoming=$("[data-block=\"calendar_upcoming\"]")
                var badges=$("[data-block=\"badges\"]")
                var calendar_month=$("[data-block=\"calendar_month\"]")

                $("#block-region-side-pre").empty()
                $("#block-region-side-post").remove()
                $("#block-region-side-pre").append(jyouhou_security,calendar_month,calendar_upcoming,navigator,search_course,mysyllabus,private_files,badges)


            }
        }, 100)
    }else{
        //topページ以外での処理
        chrome.storage.local.get("courses",function(data){
            var coursenum=data.courses.length
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