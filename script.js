$(function () {
    console.log("[moodle assistant for NITech] page: " + location.href);
    $('body').css('background-color', 'sandybrown'); // 背景色変更

    // ナビゲーションを非表示にして、動画表示サイズを大きくする(動画視聴時のみ…？)
    chrome.storage.local.get('invisibleLeftNavigationOnlyVideo', function (data) {
        if (data.invisibleLeftNavigationOnlyVideo == undefined) {
            data.invisibleLeftNavigationOnlyVideo = false;
        } else {
            let invisibleLeftNavigationOnlyVideo = data.invisibleLeftNavigationOnlyVideo;
            console.log("[moodle assistant for NITech] invisibleLeftNavigationOnlyVideo: " + invisibleLeftNavigationOnlyVideo);

            if (invisibleLeftNavigationOnlyVideo && location.href == "https://cms6.ict.nitech.ac.jp/moodle38a/mod/scorm/player.php") {
                console.log("[moodle assistant for NITech] executed: invisibleLeftNavigationOnlyVideo");
                $('#page-content.blocks-pre .columnleft ').css({
                    'display': 'none',
                });
                $('#page-content.blocks-pre .region-main').css({
                    'flex': '0 0 100%',
                    'max-width': '100%',
                    'padding': '0 1rem 0 1rem'
                });
            }
        }
    });

    var value = $('.coursename');
    if (location.href == "https://cms6.ict.nitech.ac.jp/moodle38a/my/" || location.href == "https://cms6.ict.nitech.ac.jp/moodle38a/my/index.php" || location.href == "https://cms6.ict.nitech.ac.jp/moodle38a/my/#") {
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
                //todolistの作成
                var todolist = new Array()
                chrome.storage.local.get("todolist", function (data_todolist) {
                    if (data_todolist.todolist != undefined) {
                        todolist = data_todolist.todolist
                    }




                    var coursenum = value.length;
                    const courselist_short = $('.course-listitem .text-muted div').text().slice(1).split("|");
                    var courselist = new Array()
                    courselist = $('.course-listitem .coursename').text().replace(/\s+/g, "").split("コース星付きコース名");
                    courselist.shift();
                    console.log($(".course-listitem .coursename").first().attr("href"))

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
                            url[i] = $(".course-listitem .coursename").eq(i).attr("href")
                        } else {
                            //通常クラス
                            name[i] = container[0]
                            container[1] = container[1].split("期")
                            term[i] = container[1].shift();
                            container[1] = container[1][0].split("曜")
                            day[i] = container[1].shift();
                            container[1] = container[1][0].split("限")
                            time[i] = container[1].shift()
                            url[i] = $(".course-listitem .coursename").eq(i).attr("href")
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


                    //直近イベントを見やすく  ->http requestつかって何の教科か出したいけど、セッションとかがわからん ->サーバーには負荷をかけない方向でいこう(http requestとかはなしで)
                    var events = calendar_upcoming.children("div").children("div").children("div").first().children("div").children("div")
                    for (var i = 0; i < events.length; i++) {


                        $(events[i]).children(".date").append("")
                        $(events[i]).children(".date").append("<br>残り時間 ： <span class=\"date-left-extension\">計算中</span>")

                    }
                    $(".date-left-extension").css("color", "black")


                    console.log(todolist)

                    //メインの時間割とか
                    $("#page").append("<!-- インテリセンスを使うためだけに生まれた悲しいHTML --><div id=\"main_extension\"style=\"position:absolute; top:100px; left:400px; width: calc(100vw - 450px); background-color: #f8f9fa; border-radius:3px ;\"><div id=\"content_extension\" style=\"padding: 16px;\"><h1 style=\"font-size:18.75px; font-weight: medium;\">時間割・授業</h1><div style=\"display: flex; margin: 50px 50px;\"><div style=\"background-color: #e9ecef; border-radius: 3px; padding: 16px;\"><h1 style=\"font-size:18.75px; font-weight: medium;\"><span class=\"extension_delete\">今日(</span><span id=\"classtable_extension_term\">NaN</span>期<span id=\"classtable_extension_day\">NaN</span>曜日<span class=\"extension_delete\">)</span>の時間割<select name=\"term_select_extension\" id=\"term_select_extension\"><option value=\"前\">前期</option><option value=\"後\">後期</option></select><select name=\"day_select_extension\" id=\"day_select_extension\"><option value=\"1\">月曜日</option><option value=\"2\">火曜日</option><option value=\"3\">水曜日</option><option value=\"4\">木曜日</option><option value=\"5\">金曜日</option><option value=\"6\">週刊表示</option></select></h1><table style=\"border-collapse: collapse\" id=\"classtable_extension\"><tr><td style=\"height:90px\">1限<br>8：50～9：35</td><td rowspan=\"2\" id=\"onegen_extension\"></td></tr><tr><td style=\"height:90px\">2限<br>9：35～10：20</td></tr><tr><td style=\"height:20px\">休憩<br>10：20～10：30</td><td class=\"tenminyasumi\"></td></tr><tr><td style=\"height:90px\">3限<br>10：30～11：15</td><td rowspan=\"2\" id=\"threegen_extension\"></td></tr><tr><td style=\"height:90px\">4限<br>11：15～12：00</td></tr><tr><td style=\"height:120px\">昼休み<br>12：00～13：00</td><td class=\"tenminyasumi\"></td></tr><tr><td style=\"height:90px\">5限<br>13：00～13：45</td><td rowspan=\"2\" id=\"fivegen_extension\"></td></tr><tr><td style=\"height:90px\">6限<br>13：45～14：30</td></tr><tr><td style=\"height:20px\">休憩<br>14：30～14：40</td><td class=\"tenminyasumi\"></td></tr><tr><td style=\"height:90px\">7限<br>14：40～15：25</td><td rowspan=\"2\" id=\"sevengen_extension\"></td></tr><tr><td style=\"height:90px\">8限<br>15：25～16：10</td></tr><tr><td style=\"height:20px\">休憩<br>16：10～60：20</td><td class=\"tenminyasumi\"></td></tr><tr><td style=\"height:90px\">9限<br>16：20～17：05</td><td rowspan=\"2\" id=\"ninegen_extension\"></td></tr><tr><td style=\"height:90px\">10限<br>17：05～17：50</td></tr></table></div><div style=\"background-color: #e9ecef; border-radius: 3px; padding: 16px;\"><h1 style=\"font-size:18.75px; font-weight: medium;\">今日やるべきこと</h1><table id=\"today_todo_extension\"><tr><td id=\"task_done_extension\">今日のやるべきことがまだ残っています！<br>今日もがんばりましょう...！</td></tr></table></div><div style=\"background-color: #e9ecef; border-radius: 3px; padding: 16px;\"><h1 style=\"font-size:18.75px; font-weight: medium;\">時間割外のクラス</h1><table id=\"special_class_extension\"><tr><td>登録されていないようです。</td></tr></table></div></div></div></div>")
                    var classtabletrtd = {
                        "padding": "0px 10px 0px 10px",
                        "border": "2px solid orange",
                        "background-color": "white"
                    }

                    $("#classtable_extension").css("border", "2px solid orange")
                    $("#classtable_extension tr td").css(classtabletrtd)
                    $(".tenminyasumi").css("background-color", "gainsboro")
                    var today = new Date()
                    var now_day = today.getDay()
                    var day_select_css = {
                        "margin-left": "1em",
                        "border": "none"
                    }
                    $("#day_select_extension").css(day_select_css);
                    $("#term_select_extension").css(day_select_css);

                    $("#onegen_extension").css("min-width", "100px")
                    var term_now = "後"
                    if (term_now == "前") {
                        $("#term_select_extension option").eq(0).prop("selected", true)
                    } else {
                        $("#term_select_extension option").eq(1).prop("selected", true)
                    }
                    draw_classes(term_now, now_day, courses, todolist)

                    //時間割外のクラスを追加
                    draw_specialclasses(courses)
                    var specialtrtd = {
                        "padding": "0px 10px 0px 10px",
                        "background-color": "white",
                        "border-radius": "3px",
                        "padding": "10px",
                    }

                    $("#special_class_extension tr td").css(specialtrtd)
                    $("#special_class_extension").css("border-collapse", "separate")
                    $("#special_class_extension").css("border-spacing", "0px 10px")

                    //元のコース概要消去
                    $("#block-region-content").remove()
                    //動的に残り時間を変更
                    var oldmin, newmin
                    setInterval(function () {
                        var now_date = new Date();
                        oldmin = newmin;
                        newmin = now_date.getMinutes()
                        if (oldmin == newmin) {
                            //分が変わってなければ
                        } else {
                            //分が変わっていれば
                            $(".date-left-extension").empty()
                            for (var i = 0; i < events.length; i++) {
                                var task_date
                                var task_date_txt = $(events[i]).children(".date").text()
                                task_date = task_date_txt.replace(/[\s+,]/g, "").split(/[:年日月残]/)

                                if (task_date.length == 6) {
                                    var task_date_calc = new Date(task_date[0], task_date[1] - 1, task_date[2], task_date[3], task_date[4])
                                    var date_now = new Date()
                                } else {
                                    if (task_date[0] == "明") {
                                        var date_now = new Date()
                                        var task_date_calc = new Date(date_now.getFullYear(), date_now.getMonth(), date_now.getDate(), task_date[1], task_date[2])
                                        task_date_calc.setDate(task_date_calc.getDate() + 1)
                                    } else {
                                        var date_now = new Date()
                                        var task_date_calc = new Date(date_now.getFullYear(), date_now.getMonth(), date_now.getDate(), task_date[1], task_date[2])
                                    }
                                }


                                $($(".date-left-extension")[i]).text(msToTime(task_date_calc - date_now))
                                if (task_date_calc - date_now < 86400000) {
                                    //1日を切ってたら文字を赤くしよう
                                    $($(".date-left-extension")[i]).css("color", "red")
                                    var already_exixsts = false
                                    var index_todo_min
                                    for (var j = 0; j < todolist.length; j++) {
                                        if (todolist[j].name == $(events[i]).children("a").text()) {
                                            already_exixsts = true
                                            index_todo_min = j
                                        }
                                    }
                                    if (already_exixsts == false) {
                                        todolist.push({
                                            "name": $(events[i]).children("a").text(),
                                            "time": msToTime(task_date_calc - date_now),
                                            "url": $(events[i]).children("a").attr("href"),
                                            "complete": false
                                        })

                                    } else {
                                        todolist[index_todo_min].time = msToTime(task_date_calc - date_now)
                                        todolist[index_todo_min].url = $(events[i]).children("a").attr("href")
                                    }
                                } else {
                                    $($(".date-left-extension")[i]).css("color", "black")
                                }
                            }
                            console.log(todolist)
                            chrome.storage.local.set({ "todolist": todolist }, function () {
                                //todoリストにあるけど課題一覧にないもの消去(過ぎた課題)
                                chrome.storage.local.get("todolist", function (data_min) {
                                    todolist = data_min.todolist
                                    var new_todolist = todolist.filter(function (element) {
                                        var exists = false;
                                        if (!element.time.match(/-/)) {
                                            for (var i = 0; i < events.length; i++) {
                                                if ($(events[i]).children("a").text() == element.name) {
                                                    exists = true;
                                                }
                                            }
                                        } else {
                                            exists = true
                                        }
                                        return exists
                                    });
                                    todolist = new_todolist
                                    //todoを更新
                                    console.log("reflesh todo")
                                    console.log(todolist)
                                    $("#today_todo_extension").empty()
                                    var todo_remain = false;
                                    for (var i = 0; i < todolist.length; i++) {
                                        if (todolist[i].complete == false) {
                                            todo_remain = true;
                                        }
                                    }
                                    if (todo_remain == true) {
                                        $("#today_todo_extension").append("<tr><td id=\"task_done_extension\">今日のやるべきことがまだ残っています！<br>今日もがんばりましょう...！</td></tr>")
                                    } else {
                                        $("#today_todo_extension").append("<tr><td id=\"task_done_extension\">今日のやるべきことはすべて終了しました🎊<br>💮お疲れさまでした💮</td></tr>")
                                    }
                                    for (var i = 0; i < todolist.length; i++) {
                                        var todolist_index = i;
                                        if (todolist[i].time.match(/-/)) {
                                            $("#today_todo_extension").append("<tr><td><h1 style=\"font-size:18.75px; font-weight: medium;\">授業<button data-index_extension=\"" + todolist_index + "\" class=\"todo_button_extension\" type=\"button\">完了する</button></h1><span class=\"strike_todo_extension\">" + todolist[i].name + "<br>時間 ： " + timetableToTime(todolist[i].time) + "</span><br><a href=\"" + todolist[i].url + "\">この授業のページに移動する</a></td></tr>")
                                        } else {

                                            $("#today_todo_extension").append("<tr><td><h1 style=\"font-size:18.75px; font-weight: medium;\">課題<button data-index_extension=\"" + todolist_index + "\" class=\"todo_button_extension\" type=\"button\">完了する</button></h1><span class=\"strike_todo_extension\">" + todolist[i].name + "<br>残り時間 ： <span style=\"color:red\">" + todolist[i].time + "</span></span><br><a href=\"" + todolist[i].url + "\">この課題の提出先に移動する</a></td></tr>")
                                        }
                                        if (todolist[i].complete == true) {
                                            // console.log($("#today_todo_extension tr").last().children("td").children("h1").children(".todo_button_extension"))
                                            // console.log($("#today_todo_extension tr").last().children("td").children("h1").children(".todo_button_extension").parent())
                                            $("#today_todo_extension tr").last().children("td").children("h1").children(".todo_button_extension").parent().parent().animate({ "opacity": "0.6" }, 100)
                                            $("#today_todo_extension tr").last().children("td").children("h1").children(".todo_button_extension").text("未完了に戻す")
                                            $("#today_todo_extension tr").last().children("td").children("h1").children(".todo_button_extension").parent().parent().children(".strike_todo_extension").wrap("<s>")

                                        }
                                    }

                                    var todotrtd = {
                                        "padding": "0px 10px 0px 10px",
                                        "background-color": "white",
                                        "border-radius": "3px",
                                        "padding": "10px",
                                    }
                                    var buttoncss = {
                                        "border": "solid 1px chocolate",
                                        "font-size": ".9375rem",
                                        "background-color": "white",
                                        "color": "chocolate",
                                        "border-radius": "3px",
                                        "margin-left": "10px"
                                    }
                                    $("#today_todo_extension tr td").css(todotrtd)
                                    $("#today_todo_extension").css("border-collapse", "separate")
                                    $("#today_todo_extension").css("border-spacing", "0px 10px")
                                    $(".todo_button_extension").css(buttoncss)

                                    $(".todo_button_extension").click(function () {
                                        if ($(this).parent().parent().css("opacity") == "1") {
                                            $(this).parent().parent().animate({ "opacity": "0.6" }, 100)
                                            $(this).text("未完了に戻す")
                                            $(this).parent().parent().children(".strike_todo_extension").wrap("<s>")
                                            todolist[$(this).attr("data-index_extension")].complete = true
                                            chrome.storage.local.set({ "todolist": todolist }, function () {
                                            })

                                        } else {
                                            $(this).parent().parent().animate({ "opacity": "1.0" }, 100)
                                            $(this).text("完了する")
                                            $(this).parent().parent().children("s").children(".strike_todo_extension").unwrap()
                                            todolist[$(this).attr("data-index_extension")].complete = false
                                            chrome.storage.local.set({ "todolist": todolist }, function () {
                                            })
                                        }
                                        var todo_remain = false;
                                        for (var i = 0; i < todolist.length; i++) {
                                            if (todolist[i].complete == false) {
                                                todo_remain = true;
                                            }
                                        }
                                        if (todo_remain == true) {
                                            $("#today_todo_extension tr").first().remove()
                                            $("#today_todo_extension").prepend("<tr><td id=\"task_done_extension\">今日のやるべきことがまだ残っています！<br>今日もがんばりましょう...！</td></tr>")
                                        } else {
                                            $("#today_todo_extension tr").first().remove()
                                            $("#today_todo_extension").prepend("<tr><td id=\"task_done_extension\">今日のやるべきことはすべて終了しました🎊<br>💮お疲れさまでした💮</td></tr>")
                                        }

                                        var todotrtd = {
                                            "padding": "0px 10px 0px 10px",
                                            "background-color": "white",
                                            "border-radius": "3px",
                                            "padding": "10px",
                                        }
                                        var buttoncss = {
                                            "border": "solid 1px chocolate",
                                            "font-size": ".9375rem",
                                            "background-color": "white",
                                            "color": "chocolate",
                                            "border-radius": "3px",
                                            "margin-left": "10px"
                                        }
                                        $("#today_todo_extension tr td").css(todotrtd)
                                        $("#today_todo_extension").css("border-collapse", "separate")
                                        $("#today_todo_extension").css("border-spacing", "0px 10px")
                                        $(".todo_button_extension").css(buttoncss)
                                    })

                                    $(".todo_button_extension").on({
                                        'mouseenter': function () {
                                            $(this).css({
                                                "background-color": "chocolate",
                                                "color": "white"
                                            })
                                        },
                                        'mouseleave': function () {
                                            $(this).css({
                                                "background-color": "white",
                                                "color": "chocolate"
                                            })
                                        }
                                    })
                                })

                            })


                        }
                    }, 1000)

                    //カレンダーがうまく動かない(first.jsのcalendar_miniとか、calendar_get_monthなんちゃらとかが関係してるけど、ちょっと読めない(miniのほうが大事そう)) ->issue立てて隠ぺいしよう!(人任せ)
                    $(".arrow").css("visibility", "hidden")
                    $(".arrow_link").css("cursor", "default")
                    calendar_month.children("div").append("<br><a id=\"link-to-calendar\" href=\"\">カレンダーに移動する</a>")
                    $("#link-to-calendar").attr('href', $(".current").eq(1).children("a").attr("href"));
                    $("#link-to-calendar").css("margin", "auto auto auto 150px")


                })
            }
        }, 500)
        function draw_specialclasses(courses) {
            var special_exists = false
            $("#special_class_extension").empty()
            for (var i = 0; i < courses.length; i++) {
                if (courses[i].time == "none") {
                    special_exists = true;
                    $("#special_class_extension").append("<tr><td>" + courses[i].name + "<br><a href=\"" + courses[i].url + "\">この授業のページに移動する</a></td></tr>")
                }
            }
            if (special_exists == false) {
                $("#special_class_extension").append("<tr><td>登録されていないようです。</td></tr>")
            }
        }

        function draw_classes(term_now, now_day, courses, todolist) {
            $("#classtable_extension_term").text(term_now)
            $("#day_select_extension option").eq(now_day - 1).prop('selected', true);
            now_day = ["日", "月", "火", "水", "木", "金", "土"][now_day]
            $("#classtable_extension_day").text(now_day)
            var set = [false, false, false, false, false]
            for (var i = 0; i < courses.length; i++) {
                if (courses[i].term == term_now) {
                    if (courses[i].day == now_day) {
                        if (todolist != undefined) {
                            var already_exixsts_todo = false
                            for (var j = 0; j < todolist.length; j++) {
                                if (todolist[j].name == courses[i].name) {
                                    already_exixsts_todo = true;
                                }
                            }

                            if (already_exixsts_todo == false) {
                                todolist.push({
                                    "time": courses[i].time,
                                    "name": courses[i].name,
                                    "url": courses[i].url,
                                    "complete": false
                                })
                            }


                        }
                        switch (courses[i].time) {
                            case "1-2":
                                $("#onegen_extension").css("background-color", "white")
                                $("#onegen_extension").text(courses[i].name)
                                $("#onegen_extension").append("<br><a href=\"" + courses[i].url + "\">この授業のページに移動する</a>")
                                set[0] = true;

                                break;
                            case "3-4":

                                $("#threegen_extension").css("background-color", "white")
                                $("#threegen_extension").text(courses[i].name + "\n")
                                $("#threegen_extension").append("<br><a href=\"" + courses[i].url + "\">この授業のページに移動する</a>")
                                set[1] = true;
                                break;
                            case "5-6":

                                $("#fivegen_extension").css("background-color", "white")
                                $("#fivegen_extension").text(courses[i].name + "\n")
                                $("#fivegen_extension").append("<br><a href=\"" + courses[i].url + "\">この授業のページに移動する</a>")
                                set[2] = true;
                                break;
                            case "7-8":

                                $("#sevengen_extension").css("background-color", "white")
                                $("#sevengen_extension").text(courses[i].name + "\n")
                                $("#sevengen_extension").append("<br><a href=\"" + courses[i].url + "\">この授業のページに移動する</a>")
                                set[3] = true;
                                break;
                            case "9-10":

                                $("#ninegen_extension").css("background-color", "white")
                                $("#ninegen_extension").text(courses[i].name + "\n")
                                $("#ninegen_extension").append("<br><a href=\"" + courses[i].url + "\">この授業のページに移動する</a>")
                                set[4] = true;
                                break;

                        }
                    }
                }
            }
            //todoリストにあるけどクラスにないもの消去(昨日の授業)
            if (todolist != undefined) {
                var new_todolist = todolist.filter(function (element) {
                    var exists = false;
                    if (element.time.match(/-/)) {
                        for (var j = 0; j < courses.length; j++) {
                            if (courses[j].term == term_now) {
                                if (courses[j].day == now_day) {
                                    if (courses[j].name == element.name) {
                                        exists = true
                                    }
                                }
                            }
                        }
                    } else {
                        exists = true
                    }
                    return exists
                });
                todolist = new_todolist
                chrome.storage.local.set({ "todolist": todolist }, function () {
                    //todoを追加
                    for (var i = 0; i < todolist.length; i++) {

                        var todolist_index = i;
                        if (todolist[i].time.match(/-/)) {
                            $("#today_todo_extension").append("<tr><td><h1 style=\"font-size:18.75px; font-weight: medium;\">授業<button data-index_extension=\"" + todolist_index + "\" class=\"todo_button_extension\" type=\"button\">完了する</button></h1><span class=\"strike_todo_extension\">" + todolist[i].name + "<br>時間 ： " + timetableToTime(todolist[i].time) + "</span><br><a href=\"" + todolist[i].url + "\">この授業のページに移動する</a></td></tr>")
                        } else {

                            $("#today_todo_extension").append("<tr><td><h1 style=\"font-size:18.75px; font-weight: medium;\">課題<button data-index_extension=\"" + todolist_index + "\" class=\"todo_button_extension\" type=\"button\">完了する</button></h1><span class=\"strike_todo_extension\">" + todolist[i].name + "<br>残り時間 ： " + todolist[i].time + "</span><br><a href=\"" + todolist[i].url + "\">この課題の提出先に移動する</a></td></tr>")
                        }
                        if (todolist[i].complete == true) {
                            // console.log($("#today_todo_extension tr").last().children("td").children("h1").children(".todo_button_extension"))
                            // console.log($("#today_todo_extension tr").last().children("td").children("h1").children(".todo_button_extension").parent())
                            $("#today_todo_extension tr").last().children("td").children("h1").children(".todo_button_extension").parent().parent().animate({ "opacity": "0.6" }, 100)
                            $("#today_todo_extension tr").last().children("td").children("h1").children(".todo_button_extension").text("未完了に戻す")
                            $("#today_todo_extension tr").last().children("td").children("h1").children(".todo_button_extension").parent().parent().children(".strike_todo_extension").wrap("<s>")

                        }
                    }

                    var todotrtd = {
                        "padding": "0px 10px 0px 10px",
                        "background-color": "white",
                        "border-radius": "3px",
                        "padding": "10px",
                    }
                    var buttoncss = {
                        "border": "solid 1px chocolate",
                        "font-size": ".9375rem",
                        "background-color": "white",
                        "color": "chocolate",
                        "border-radius": "3px",
                        "margin-left": "10px"
                    }
                    $("#today_todo_extension tr td").css(todotrtd)
                    $("#today_todo_extension").css("border-collapse", "separate")
                    $("#today_todo_extension").css("border-spacing", "0px 10px")
                    $(".todo_button_extension").css(buttoncss)

                    $("#day_select_extension").change(function () {
                        console.log($("#day_select_extension").val())
                        if($("#day_select_extension").val()==6){
                            //週刊選択が一覧の場合の処理
                            console.log("syuukan")
                            $("body").append("<div id=\"overlay_extension\"></div>")
                            $("head").append('<style>#overlay_extension::-webkit-scrollbar{width: 10px;}#overlay_extension::-webkit-scrollbar-track{background: #fff;border: none;border-radius: 10px;box-shadow: inset 0 0 2px #777;}#overlay_extension::-webkit-scrollbar-thumb{background: #ccc;border-radius: 10px;box-shadow: none;}</style>')
                            var overlaycss ={
                                "position":"fixed",
                                "z-index":"9999",
                                "background-color":"rgba(0,0,0,0.5)",
                                "top":"10vh",
                                "left":"10vw",
                                "width":"80vw",
                                "height":"80vh",
                                "border-radius":"3px",
                                "color":"black"
                            }
                            $("#overlay_extension").css(overlaycss)
                            $("#overlay_extension").append("<table style=\"border-collapse: collapse\" id=\"classtable_extension_overlay\"><tr><td style=\"height:90px\">1限<br>8：50～9：35</td><td rowspan=\"2\" id=\"onegen_extension_overlay\"></td></tr><tr><td style=\"height:90px\">2限<br>9：35～10：20</td></tr><tr><td style=\"height:20px\">休憩<br>10：20～10：30</td><td class=\"tenminyasumi\"></td></tr><tr><td style=\"height:90px\">3限<br>10：30～11：15</td><td rowspan=\"2\" id=\"threegen_extension_overlay\"></td></tr><tr><td style=\"height:90px\">4限<br>11：15～12：00</td></tr><tr><td style=\"height:120px\">昼休み<br>12：00～13：00</td><td class=\"tenminyasumi\"></td></tr><tr><td style=\"height:90px\">5限<br>13：00～13：45</td><td rowspan=\"2\" id=\"fivegen_extension_overlay\"></td></tr><tr><td style=\"height:90px\">6限<br>13：45～14：30</td></tr><tr><td style=\"height:20px\">休憩<br>14：30～14：40</td><td class=\"tenminyasumi\"></td></tr><tr><td style=\"height:90px\">7限<br>14：40～15：25</td><td rowspan=\"2\" id=\"sevengen_extension_overlay\"></td></tr><tr><td style=\"height:90px\">8限<br>15：25～16：10</td></tr><tr><td style=\"height:20px\">休憩<br>16：10～60：20</td><td class=\"tenminyasumi\"></td></tr><tr><td style=\"height:90px\">9限<br>16：20～17：05</td><td rowspan=\"2\" id=\"ninegen_extension_overlay\"></td></tr><tr><td style=\"height:90px\">10限<br>17：05～17：50</td></tr></table>")
                            var classoverlaycss={
                                "overflow-x": "hidden",
                                "overflow-y": "scroll",
                                "border": "2px solid orange",
                                "padding":"10px"
                            }
                            $("#overlay_extension").css(classoverlaycss)
                            var classtableoverlaytrtd = {
                                "padding": "0px 10px 0px 10px",
                                "border": "2px solid orange",
                                "background-color": "white"
                            }
                            $("#overlay_extension tr td").css(classtableoverlaytrtd)

                        }
                        draw_classes($("#term_select_extension").val(), $(this).val(), courses)
                        $(".extension_delete").empty()
                    })
                    $("#term_select_extension").change(function () {
                        draw_classes($(this).val(), $("#day_select_extension").val(), courses)
                        $(".extension_delete").empty()
                    })

                    $(".todo_button_extension").on({
                        'mouseenter': function () {

                            $(this).css({
                                "background-color": "chocolate",
                                "color": "white"
                            })

                        },
                        'mouseleave': function () {
                            $(this).css({
                                "background-color": "white",
                                "color": "chocolate"
                            })


                        }
                    })
                    $(".todo_button_extension").click(function () {
                        if ($(this).parent().parent().css("opacity") == "1") {
                            $(this).parent().parent().animate({ "opacity": "0.6" }, 100)
                            $(this).text("未完了に戻す")
                            $(this).parent().parent().children(".strike_todo_extension").wrap("<s>")
                            todolist[$(this).attr("data-index_extension")].complete = true
                            chrome.storage.local.set({ "todolist": todolist }, function () {
                            })

                        } else {
                            $(this).parent().parent().animate({ "opacity": "1.0" }, 100)
                            $(this).text("完了する")
                            $(this).parent().parent().children("s").children(".strike_todo_extension").unwrap()
                            todolist[$(this).attr("data-index_extension")].complete = false
                            chrome.storage.local.set({ "todolist": todolist }, function () {
                            })
                        }
                        var todo_remain = false;
                        for (var i = 0; i < todolist.length; i++) {
                            if (todolist[i].complete == false) {
                                todo_remain = true;
                            }
                        }
                        if (todo_remain == true) {
                            $("#today_todo_extension tr").first().remove()
                            $("#today_todo_extension").prepend("<tr><td id=\"task_done_extension\">今日のやるべきことがまだ残っています！<br>今日もがんばりましょう...！</td></tr>")
                        } else {
                            $("#today_todo_extension tr").first().remove()
                            $("#today_todo_extension").prepend("<tr><td id=\"task_done_extension\">今日のやるべきことはすべて終了しました🎊<br>💮お疲れさまでした💮</td></tr>")
                        }
                        var todotrtd = {
                            "padding": "0px 10px 0px 10px",
                            "background-color": "white",
                            "border-radius": "3px",
                            "padding": "10px",
                        }
                        var buttoncss = {
                            "border": "solid 1px chocolate",
                            "font-size": ".9375rem",
                            "background-color": "white",
                            "color": "chocolate",
                            "border-radius": "3px",
                            "margin-left": "10px"
                        }
                        $("#today_todo_extension tr td").css(todotrtd)
                        $("#today_todo_extension").css("border-collapse", "separate")
                        $("#today_todo_extension").css("border-spacing", "0px 10px")
                        $(".todo_button_extension").css(buttoncss)
                    })

                })
            }
            for (var i = 0; i < set.length; i++) {

                if (set[i] == false) {
                    switch (i) {
                        case 0:
                            $("#onegen_extension").css("background-color", "gainsboro")
                            $("#onegen_extension").empty()
                            break;
                        case 1:
                            $("#threegen_extension").css("background-color", "gainsboro")
                            $("#threegen_extension").empty()
                            break;
                        case 2:
                            $("#fivegen_extension").css("background-color", "gainsboro")
                            $("#fivegen_extension").empty()
                            break;
                        case 3:
                            $("#sevengen_extension").css("background-color", "gainsboro")
                            $("#sevengen_extension").empty()
                            break;
                        case 4:
                            $("#ninegen_extension").css("background-color", "gainsboro")
                            $("#ninegen_extension").empty()
                            break;

                    }
                }
            }


        }


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
                    }
                }
                if (tf === false) {
                    if (count == listnum) {
                        //トップに戻るボタン
                        $(this).children("p").children("a").text("マイページに戻る");
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
    var message_return
    if (duration > 0) {
        var milliseconds = parseInt((duration % 1000) / 100),
            seconds = Math.floor((duration / 1000) % 60),
            minutes = Math.floor((duration / (1000 * 60)) % 60),
            hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
        days = Math.floor((duration / (1000 * 60 * 60 * 24)) % 365);

        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;
        if (days == 0) {
            if (hours == 0) {
                return minutes + "分";
            }
            return hours + "時間 " + minutes + "分";

        }

        message_return = days + "日 " + hours + "時間 " + minutes + "分";
    } else {
        duration = -duration
        var milliseconds = parseInt((duration % 1000) / 100),
            seconds = Math.floor((duration / 1000) % 60),
            minutes = Math.floor((duration / (1000 * 60)) % 60),
            hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
        days = Math.floor((duration / (1000 * 60 * 60 * 24)) % 365);

        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;
        if (days == 0) {
            if (hours == 0) {
                return minutes + "分 超過しています";
            }
            return hours + "時間 " + minutes + "分 超過しています";

        }

        message_return = days + "日 " + hours + "時間 " + minutes + "分 超過しています";
    }
    return message_return
}

//時間割から時間にするやつ

function timetableToTime(timetable) {

    var truetime;
    switch (timetable) {
        case "1-2":
            truetime = "8：50～10：20"
            break;
        case "3-4":
            truetime = "10：30～12：00"
            break;
        case "5-6":
            truetime = "13：00～14：30"
            break;
        case "7-8":
            truetime = "14：40～16：10"
            break;
        case "9-10":
            truetime = "16：20～17：50"
            break;
    }
    return truetime
}
