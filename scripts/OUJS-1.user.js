// ==UserScript==
// @name                    [TS] OUJS-1
// @namespace               TimidScript
// @version                 1.0.8
// @description             OpenuserJS: New post/issue notification, adds install and ratings history stats, improves table view, list all user scripts in one page, improves library page...
// @icon                    https://imgur.com/RCyq4C8.png
// @author                  TimidScript
// @homepageURL             https://openuserjs.org/users/TimidScript
// @copyright               © 2014 TimidScript, All Rights Reserved.
// @license                 Creative Commons BY-NC-SA + Please notify me if distributing
// @include                 http*://openuserjs.org/*
// @require                 https://openuserjs.org/src/libs/TimidScript/TSL_-_Generic.js
// @require                 https://openuserjs.org/src/libs/TimidScript/TSL_-_GM_Update.js
// @homeURL                 https://openuserjs.org/scripts/TimidScript/[TS]_OUJS-1
// @grant                   GM_getValue
// @grant                   GM_setValue
// @grant                   GM_deleteValue
// @grant                   GM_xmlhttpRequest
// @grant                   GM_listValues
// @grant                   GM_registerMenuCommand
// @grant                   GM_setClipboard
// ==/UserScript==


/*
********************************************************************************************
Copyright © 2014 TimidScript, All Rights Reserved.
Script's Homepage:              Check homepages below

TimidScript's Homepage:         https://openuserjs.org/users/TimidScript
                                https://greasyfork.org/users/1455-timidscript
                                https://monkeyguts.com/author.php?un=timidscript


                                http://userscripts.org/users/TimidScript
                                http://userscripts-mirror.org/users/100610/scripts

------------------------------------
 Version History
------------------------------------
1.0.8 Initial public release (2014/10/01)
 - Improved table view with numbering.
 - All profile scripts listed on one page
 - Script are listed on profile page also, so no need to click on Scripts tab
 - User scripts ordered by type (Script, Library and defunct)
 - Stats history for installs and ratings with sensible time spacing
 - Top install listing
 - Profile table view sort implemented within the script
 - Notification on issues raised on users scripts
 - Notification on the forum
 - Stores logged username so you do not need to be logged in to get script stats and notifications
 - Changed the interface of library scripts
 - Added copy button on library
 - List all author's scripts in profile tab.
 - List all author's scripts in one page
 - Limits size of image in frame on forum and icon size in library page
********************************************************************************************/

if (window !== window.top) return;
console.info("OUJS-1 is Running");

function ToggleIssuesView(discuss, issues)
{
    discuss.onmouseover = MouseOver;
    discuss.onmouseleave = MouseLeave;
    issues.onmouseover = MouseOver;
    issues.onmouseleave = MouseLeave;

    function MouseOver()
    {
        clearTimeout(document.to);
        issues.style.display = "block";
    }

    function MouseLeave()
    {
        document.to = setTimeout(function () { issues.style.display = "none"; }, 500);
    }
}

function RemoveNotice(e)
{
    var meta = JSON.parse(GM_getValue("USER-P:" + this.getAttribute("username")));
    meta[this.postID] = this.postdata;
    GM_setValue("USER-P:" + this.getAttribute("username"), JSON.stringify(meta));

    TSL.removeNode(this.parentElement);
    if (!document.querySelector("#IssuesListing li")) TSL.removeNode("IssuesListing");
}


function ClickedHistory(e)
{
    TSL.removeClass(this.parentElement.getElementsByClassName("selected")[0], "selected");
    TSL.addClass(this, "selected");
    DisplayStats(this.data, this.parentElement.data);
}

function DisplayStats(old, current)
{
    var totalI = totalR = 0, row, sups = document.querySelectorAll(".dStatP, .dStatN");

    for (var i = 0; sups && i < sups.length; i++) TSL.removeNode(sups[i]);
    TSL.removeNode("TopTen");

    var arr = [];
    for (var scriptID in current)
    {
        row = document.querySelector('tr[scriptid="' + scriptID + '"]');
        if (!row) continue;
        if (old[scriptID])
        {
            var diff = current[scriptID].installs - old[scriptID].installs;
            totalI += diff;
            if (diff) row.querySelector("td:nth-child(2) p").appendChild(TSL.createElementHTML("<sup class='dStat" + ((diff > 0) ? "P" : "N") + "'>" + diff + "</sup>"));

            if (diff) arr.push ({name: row.querySelector("b").textContent,  installs : diff} );

            diff = current[scriptID].rating - old[scriptID].rating;
            totalR += diff;
            if (diff) row.querySelector("td:nth-child(3) p").appendChild(TSL.createElementHTML("<sup class='dStat" + ((diff > 0) ? "P" : "N") + "'>" + diff + "</sup>"));
        }
    }

    if (totalI) document.querySelector(".table thead th:nth-child(2) a").appendChild(TSL.createElementHTML("<sup class='dStat" + ((totalI > 0) ? "P" : "N") +   "'>" + totalI + "</sup>"));
    if (totalR) document.querySelector(".table thead th:nth-child(3) a").appendChild(TSL.createElementHTML("<sup class='dStat" + ((totalR > 0) ? "P" : "N") +   "'>" + totalR + "</sup>"));

    if (arr.length < 4) return;
    arr.sort(function(a, b)
    {
        if (a.installs < b.installs) return -1;
        if (a.installs > b.installs) return 1;

        return 0;
    });
    arr.reverse();

    var panel = document.createElement("div");
    panel.className = "panel panel-default";
    panel.id = "TopTen";
    panel.appendChild(document.createElement("div"));
    document.querySelector(".container-fluid.col-sm-4").appendChild(panel);

    panel = panel.firstElementChild;
    panel.className = "panel-body";

    var el = document.createElement("h3");
    el.textContent = "Top Installs During Period";
    panel.appendChild(el);

    var ol = document.createElement("ol");
    ol.setAttribute("style","font-size:14px; font-weight: 500;");
    panel.appendChild(ol);

    while (arr.length > 0)
    {
        el = document.createElement("li");
        el.innerHTML = arr[0].name + " (<span style='color:green; font-weight: 700;'>" + arr[0].installs + "</span>)";
        ol.appendChild(el);
        arr.shift();
    }
}



function addScriptListingNumbers()
{
    TSL.addStyle("ScriptNumbers", ".script_number {display: inline-block; background-color: #2C3E50; color: white; padding: 1px 2px 0 2px; margin: 0; border-radius: 3px; font-size: 13px; line-height: 13px; font-family: 'Courier New', Courier, monospace}"
        + ".col-sm-8 .table .tr-link td {vertical-align: middle !important; }"
        + ".col-sm-8 .table .tr-link td .progress { margin-bottom: 0px; }"
        //+ ".col-sm-8 .table .tr-link td:nth-child(2) p {margin-bottom: 14px;}"
    );

    var sn = document.getElementsByClassName("script_number");
    while (sn.length > 0) TSL.removeNode(sn[0]);

    var start = document.querySelector(".pagination .active a");
    if (start) start = (parseInt(start.textContent) - 1) * 25 + 1;
    else start = 1;

    var rows = document.querySelector(".table");
    rows = rows.querySelectorAll(".tr-link");
    if (!rows) return;
    var prefix = "".lPad("0", rows.length.toString().length);
    for (var i = 0, row, cell; i < rows, row = rows[i]; i++)
    {
        var counter = document.createElement("span");
        counter.className = "script_number";
        counter.textContent = (prefix + (i + start)).slice(-1 * prefix.length);
        row.firstElementChild.insertBefore(counter, row.firstElementChild.children[0]);
    }
}

function SortScriptTable(e)
{
    e.stopImmediatePropagation();
    TSL.addStyle("OUJS-ORDER",".decen {background-color: rgba(200,255,255,0.2);} .ascen {background-color: rgba(255,220,255, 0.2);} ");
    //#F0DDFD #DAFBF6 #C2F4F7 #FF0

    var descending = TSL.hasClass(this.parentElement,"decen");
    if (document.querySelector(".decen, .ascen")) TSL.removeClass(document.querySelector(".decen, .ascen"), "decen ascen");
    TSL.addClass(this.parentElement, ((descending) ? "ascen" : "decen"));

    var tbody = document.querySelector(".table tbody");
    var rows = tbody.getElementsByClassName("tr-link");

    var idx = this.parentElement.cellIndex;

    for(var n, i = 0; i < rows.length - 1; i++)
    {
        n = i;
        for(var j=i+1; j < rows.length; j++)
        {
            if ((descending && compareRows(rows[n], rows[j]) > 0) || (!descending && compareRows(rows[n], rows[j]) < 0))
            {
                n = j;
            }
        }

        if (n != i) tbody.insertBefore(rows[n], rows[i]);
    }

    //row1 less it's negative otherwise positive
    function compareRows(row1, row2)
    {
        if (TSL.hasClass(row1, "header_row") || TSL.hasClass(row2, "header_row")) return 0;
        if (TSL.hasClass(row1, "_library") || TSL.hasClass(row1, "_defunct")) return 0;
        if (TSL.hasClass(row2, "_library") || TSL.hasClass(row2, "_defunct")) return 0;

        var selector = "b", val1, val2;
        if (idx == 1) selector = "td:nth-child(2) p";
        else if (idx == 2) selector = "td:nth-child(3) p";
        else if (idx == 3) selector = "td:nth-child(4) time";


        if (idx == 0)
        {
            val1 = row1.querySelector(selector).textContent.toLowerCase();
            val2 = row2.querySelector(selector).textContent.toLowerCase();
        }
        else if (idx == 3)
        {
            val1 = new Date(row1.querySelector(selector).getAttribute("datetime")).getTime();
            val2 = new Date(row2.querySelector(selector).getAttribute("datetime")).getTime();
        }
        else
        {
            val1 = parseInt(row1.querySelector(selector).textContent.match(/^\d+/)[0]);
            val2 = parseInt(row2.querySelector(selector).textContent.match(/^\d+/)[0]);
        }

        if (val1 < val2) return -1;
        if (val1 > val2) return 1;

        return 0;
    }

    addScriptListingNumbers();

    return false;
}


(function ()
{
    var timestamp = Date.now();
    var loggedUsername = "";
    TSL.addStyle("LimitImageSize", "img {max-width: 98%;}");

    if (document.querySelector(".fa-sign-out") != undefined)
    {
        loggedUsername = document.querySelector('ul li a[href^="/users/"]').textContent;

        var meta = GM_getValue("USER-S:" + loggedUsername);
        if (!meta) //Create new user data.
        {
            meta = {};
            meta.current = {};
            meta.history = new Array();
            GM_setValue("USER-S:" + loggedUsername, JSON.stringify(meta));
        }

        meta = GM_getValue("USER-P:" + loggedUsername);
        if (!meta)
        {
            GM_setValue("USER-P:" + loggedUsername, JSON.stringify({}));
        }

        //perform cleanup by deleting old post records
        var names = getSavedUsernames();
        for (var i = 0; i < names.length; i++)
        {
            var meta = JSON.parse(GM_getValue("USER-P:" + names[i]));

            for (var key in meta)
            {
                if (timestamp - meta[key].timestamp > 86400000 * 14) //30 Days
                {
                    delete meta[key];
                    GM_deleteValue(key);
                }
            }

            GM_setValue("USER-P:" + names[i], JSON.stringify(meta));
        }
    }

    var pathname = document.location.pathname;

    if (pathname.match(/^\/$|^\/group\/\w+/))
    {
        addScriptListingNumbers();
    }
    else if (pathname.match(/^\/users\/\w+$/i)) //User profile page
    {
        var container = document.getElementsByClassName("container-fluid")[0];
        document.getElementsByClassName("col-sm-4")[0].innerHTML += '<div class="panel panel-transparent"><div class="input-group col-xs-12"><form action="" method="get"><div class="input-group col-xs-12"><input name="q" placeholder="Search Profile Scripts" class="search form-control" value="" type="text"><span class="input-group-btn"><button class="btn btn-default" type="submit"><i class="fa fa-search"></i></button></span></div></form></div></div>';
        getScriptListings(document.URL + "/scripts/?p=1");

        window.history.pushState(null, "", document.URL + "/scripts"); //Change document URL
    }
    else if (pathname.match(/^\/users\/\w+\/scripts/i)) //User script listing
    {
        TSL.addStyle("UserScripts", "ul.pagination {display: none;}");
        var nextpage = document.querySelector("ul.pagination > .active + li > a");
        if (nextpage) getScriptListings(nextpage.href);
        else if (document.querySelector(".table .tr-link")) amendUserScriptListing();
    }
    else if (pathname.match(/^\/scripts\/[^\/]+\/[^\/]+$/i)) //Script page
    {
        scriptPageAmendRateArea();
    }
    else if ((pathname.match(/^\/libs\/[^\/]+\/[^\/]+$/i))) amendLibraryPage();

    displayNewIssues();

    function displayNewIssues()
    {
        if (pathname.match(/^\/forum/))
        {
            TSL.addStyle("ForumHelper", "body .table .userpost:nth-child(2n) td {background-color: #FFD;}"
                + "body .table .userpost:nth-child(2n+1) td {background-color: #FFF9DD;}"
                + "body .table .newposts td:nth-child(4) {color: red;}"
                + "body .table .newposts td:nth-child(4) sup {color: green;}"
                + "#newIssues {background-color: #E1F9E6; padding: 1px 20px; font-weight: 600; color: green;}"
                + "#newIssues span {margin-right: 30px;}"
                );

            var notice = document.createElement("div");
            notice.id = "newIssues";
            var usernames = getSavedUsernames();
            document.querySelector(".table-responsive").parentElement.insertBefore(notice, document.querySelector(".table-responsive"));
            for (var i = 0, username; i < usernames.length, username = usernames[i]; i++)
            {
                var c = getNewPostCount(username);
                if (c.length > 0)
                {
                    var el = document.createElement("span");
                    if (usernames.length > 1) el.textContent = "(" + username + ") ";
                    el.textContent += "New posts detected on " + c.length + " issues/threads";
                    notice.appendChild(el);
                }
            }

            if (!notice.textContent) notice.textContent = "No new issues detected";
            return;
        }

        xhrPage("https://openuserjs.org/forum", function (xhr, doc)
        {
            var count = 0;
            var usernames = getSavedUsernames();
            var issues = document.createElement("section");
            issues.appendChild(document.createElement("ul"));

            for (var i = 0, username, arr; i < usernames.length, username = usernames[i]; i++)
            {
                var meta = JSON.parse(GM_getValue("USER-P:" + username));
                var updated = false;
                arr = getNewPostCount(username, doc);
                count += arr.length;
                for (var j = 0, li; j < arr.length; j++)
                {
                    li = TSL.createElementHTML("<li><a href='" + arr[j].url + "'>" + arr[j].postTitle + "</a></li>");
                    li.appendChild(TSL.createElementHTML("<span>❌</span>"));
                    issues.firstElementChild.appendChild(li);

                    li.lastElementChild.onclick = RemoveNotice;
                    li.lastElementChild.postdata = { timestamp: timestamp, replies: arr[j].replies };
                    li.lastElementChild.postID = arr[j].postID;
                    li.lastElementChild.setAttribute("username", username);

                    if (loggedUsername == username && decodeURI(document.location.pathname) == decodeURI(arr[j].url))
                    {
                        meta[arr[j].postID] = {}
                        meta[arr[j].postID].timestamp = timestamp;
                        meta[arr[j].postID].replies = arr[j].replies;
                        updated = true;
                    }
                }

                if (updated) GM_setValue("USER-P:" + username, JSON.stringify(meta));
            }

            if (count > 0)
            {
                var discuss = document.querySelector('.nav a[title="Discuss"]');
                discuss.innerHTML += " (";
                var notice = document.createElement("span");
                notice.setAttribute("style", "color: lime; display:inline-block; font-weight: 600;");
                notice.id = "newIssues";
                notice.textContent = count;
                discuss.appendChild(notice);
                discuss.innerHTML += ")";

                TSL.addStyle("OUJS-IL-BT", "#IssuesListing {position: absolute;background-color: #2C3E50; color: white; font-weight: 600; z-index: 99999;"
                    + "padding: 3px 8px; color: white; border: 1px solid black; box-sizing: border-box;}"
                    + "#IssuesListing ul {margin: 0; padding-left: 10px;}"
                    + "#IssuesListing a {display: inline-block; color: orange; }"
                    + "#IssuesListing li:hover {background-color: #435A71;}"
                    + "#IssuesListing span {color: red; margin-left: 15px; cursor: default; display: inline-block;"
                    );

                issues.id = "IssuesListing";
                document.body.appendChild(issues);

                var pos = TSL.getAbsolutePosition(discuss.parentElement);
                issues.style.top = (discuss.clientHeight + pos.top) + "px";
                if (issues.clientWidth + pos.left - 10 > window.innerWidth) issues.style.right = "2px";
                else issues.style.left = (pos.left - 30) + "px";

                TSL.addStyle("OUJS-IL-BT2", "#IssuesListing {display: none;}");

                ToggleIssuesView(discuss, issues);
            }
        });
    }

    function getScriptListings(url)
    {
        xhrPage(url, xhrCallback);

        function xhrCallback(xhr, doc)
        {
            if (!doc) return;
            var tb = document.querySelector(".table tbody");
            var scripts = doc.getElementsByClassName("tr-link");
            if (tb)
            {
                while (scripts.length > 0) tb.appendChild(scripts[0]);
            }
            else
            {
                var container = document.getElementsByClassName("col-xs-12")[0];
                var scriptPanel = doc.getElementsByClassName("panel panel-default")[0];
                container.appendChild(document.importNode(scriptPanel, true));
            }

            var nextpage = doc.querySelector("ul.pagination > .active + li > a");
            if (nextpage) getScriptListings(document.location.origin + nextpage.href, xhrCallback);
            else amendUserScriptListing();
        }
    }

    function amendUserScriptListing()
    {
        TSL.addStyle("CoolColors", ".header_row {padding: 0; font-size: 16px;}"
            + ".header_row > td {padding: 0 10px !important; font-weight: 700;}"
            + "tr._defunct {background-color: #FFF5F3;}"
            + "tr.header_row._defunct {background-color: pink; color: red;}"
            + "tr._library {background-color: #F7FDF7;}"
            + "tr.header_row._library {background-color: #ACF9AC; color: green;}"
            );
        var tbody = document.querySelector(".table tbody");
        //var tbody = document.createElement("tbody");
        var rows = tbody.querySelectorAll(".tr-link");

        ////Put libraries at the bottom of the table
        var added = false;
        for (var i = 0, row, row2, cell; i < rows, row = rows[i]; i++)
        {
            if (!row.querySelector(".script-version"))
            {
                if (!added)
                {
                    added = true;
                    row2 = tbody.insertRow();
                    row2.className = "header_row _library";
                    cell = row2.insertCell();
                    cell.setAttribute("colspan", 5);
                    cell.textContent = "Libraries";
                }
                TSL.addClass(row, "_library");
                tbody.appendChild(row);
            }
        }

        //Put defunct scripts at the bottom of the table
        added = false;
        for (var i = 0, row, row2, cell; i < rows, row = rows[i]; i++)
        {
            var version = row.querySelector(".script-version")
            if (version && version.textContent.match(/defunct|depreciated|obselete/i))
            {
                if (!added)
                {
                    added = true;
                    row2 = tbody.insertRow();
                    row2.className = "header_row _defunct";
                    cell = row2.insertCell();
                    cell.setAttribute("colspan", 5);
                    cell.textContent = "Depreciated scripts that are no longer begin supported";
                }
                TSL.addClass(row, "_defunct");
                tbody.appendChild(row);
            }
        }

        TSL.addStyle("HeaderPointer",".col-xs-12 .table th a {cursor: pointer;}");
        var headers = document.querySelectorAll(".table thead th a");
        for(var i = 0; i < headers.length; i++)
        {
            headers[i].removeAttribute("href");
            headers[i].onclick = SortScriptTable;
        }

        addScriptListingNumbers();
        appendHistory();
    }

    function getUID(name, prefix)
    {
        if (!prefix) prefix = "s";
        var id, ids = GM_listValues();

        for (var i = 0; i < ids.length, id = ids[i]; i++)
        {
            if (id[0] == prefix && id.match(/.\d+$/) && GM_getValue(id) == name) return id;
        }

        while (true)
        {
            id = (prefix || "s") + ("0000" + Math.floor(Math.random() * 10000 + 1)).slice(-4);
            if (GM_getValue(id, 0) == 0)
            {
                GM_setValue(id, name);
                return id;
            }
        }
    }

    function appendHistory()
    {
        var username = document.querySelector(".user-name").textContent;
        var meta = GM_getValue("USER-S:" + username);

        if (!meta) return;
        TSL.addStyle("HistoricalColors", ".dStatN {color: red;} .dStatP {color: green;} .dStatP:before { content: '+';}");

        meta = JSON.parse(meta);
        var oldCurrent = meta.current;
        meta = JSON.parse(GM_getValue("USER-S:" + username));

        var rows = document.querySelectorAll(".table .tr-link");
        for (var i = 0, row; i < rows, row = rows[i]; i++)
        {
            var scriptname = row.querySelector(".tr-link-a > b").textContent;
            var scriptID = getUID(scriptname);
            rows[i].setAttribute("ScriptID", scriptID);

            data = {};
            data.installs = parseInt(row.querySelector("td:nth-child(2) p").textContent);
            data.rating = parseInt(row.querySelector("td:nth-child(3) p").textContent);
            meta.current[scriptID] = data;
        }

        meta.current.timestamp = timestamp;
        if (meta.history.length == 0 || timestamp - meta.history[meta.history.length - 1].timestamp >= 86400000)
        {
            meta.history.push(meta.current);
        }

        DisplayStats(oldCurrent, meta.current);

        var MIN = 3, MAX = 13;
        if (meta.history.length > MAX) //History Cleanup
        {
            for (var i = 9, j = MAX - MIN; i > 2; i--, j--)
            {
                if (timestamp - meta.history[i].timestamp > 86400000 * 7 * j)
                {
                    meta.history = meta.history.splice(i, 1);
                    break;
                }
            }
        }
        if (meta.history.length > MAX) //History Cleanup
        {
            for (var i = MIN, j = 1; i < MAX; i++, j++)
            {
                if (timestamp - meta.history[i].timestamp < 86400000 * 7 * j)
                {
                    meta.history = meta.history.splice(i, 1);
                    break;
                }
            }
        }
        if (meta.history.length > MAX) meta.history.unshift();

        GM_setValue("USER-S:" + username, JSON.stringify(meta));

        if (meta.history.length == 1 && meta.history[0].timestamp == meta.current.timestamp) return;

        TSL.addStyle("Panel-History", "#HistoryList {padding-left: 20px;} "
            + "#HistoryList li {cursor: pointer; background-color: #E0F9FF; border-radius: 5px; margin-bottom: 1px; padding: 0 5px;}"
            + "#HistoryList li:hover {background-color: #E9FFE0;}"
            + "#HistoryList li.selected {background-color: #FBE0FF;}"
            );

        var panel = document.createElement("div");
        panel.className = "panel panel-default";
        panel.appendChild(document.createElement("div"));
        document.querySelector(".container-fluid.col-sm-4").appendChild(panel);

        //Display History List
        panel = panel.firstElementChild;
        panel.className = "panel-body";

        var el = document.createElement("h3");
        el.textContent = "Stats History";
        panel.appendChild(el);

        el = document.createElement("ul");
        el.id = "HistoryList";
        panel.appendChild(el);

        el.data = meta.current;

        li = document.createElement("li");
        li.textContent = "Current: " + timePassed(oldCurrent.timestamp);
        li.data = oldCurrent;
        li.onclick = ClickedHistory;
        el.appendChild(li);

        for (var i = meta.history.length - 1, li; i >= 0; i--)
        {
            if (meta.history[i].timestamp != meta.current.timestamp && meta.history[i].timestamp != oldCurrent.timestamp)
            {
                li = document.createElement("li");
                li.textContent = timePassed(meta.history[i].timestamp);
                li.data = meta.history[i];
                li.onclick = ClickedHistory;
                el.appendChild(li);
            }
        }
        el.firstElementChild.className = "selected";

        function timePassed(old)
        {
            var days, hrs, mins, secs, ms, ret;

            ms = timestamp - old;
            secs = Math.floor(ms / (1000)) % 60;
            mins = Math.floor(ms / (60 * 1000)) % 60;
            hrs = Math.floor(ms / (60 * 60 * 1000)) % 24;
            days = Math.floor(ms / (60 * 60 * 1000 * 24) % 7);
            weeks = Math.floor(ms / (60 * 60 * 1000 * 24) / 7);

            if (weeks) return weeks + "weeks & " + days + "days";
            if (days) return days + "days & " + hrs + "hrs";
            if (hrs) return hrs + "hrs & " + mins + "mins";
            return mins + "mins & " + secs + "secs";
        }
    }

    function amendLibraryPage()
    {
        TSL.addStyle("LibOS", ".form-group {margin-bottom: 5px;} #copyBox {text-align: right; } #copyBtn{cursor:pointer; display: inline-block;"
        + "color: #273646; border-radius: 5px; border: 1px solid #273646; background-color: #D6D6F5; width: 140px; text-align:center;}"
        + ".input-group .form-control {cursor: default}"
        + "#masterScripts .script-icon img {width: 26px; height: 26px;}"
        + "#masterScripts ul {padding: 5px; font-size: 12px;}"
        + "#masterScripts li {margin-bottom: 3px;}"
        );


        scriptPageAmendRateArea();

        var require = document.querySelector(".input-group .form-control");
        require.value = require.value.replace(/^http:/i, "https:");
        require.readOnly = true;

        var copyBox = document.createElement("div");
        copyBox.id = "copyBox";
        copyBox.innerHTML = "<span id='copyBtn'>Copy to Clipboard</span>";

        copyBox.firstChild.setAttribute("meta", "// @grant\t\t" + require.value);
        copyBox.firstChild.onclick = function (e)
        {
            GM_setClipboard(this.getAttribute("meta"));
            this.textContent = "Copied";
            this.style.backgroundColor = "#FBF6AB";
            setTimeout(function (btn) { btn.textContent = "Copy to Clipboard"; btn.style.backgroundColor = null; }, 2000, this);
        }

        var scriptmeta = document.querySelector(".script-meta");
        scriptmeta.parentElement.insertBefore(copyBox, scriptmeta);

        var panel = document.querySelector(".panel-default .panel-body h4");
        if (panel)
        {
            panel.textContent += " (" + panel.parentElement.getElementsByTagName("li").length + ")";
            panel = panel.parentElement.parentElement;
            panel.id = "masterScripts";
            var side = document.querySelector(".col-sm-4");
            side.appendChild(panel);
            //panel.getElementsByTagName("ul")[0].style.paddingLeft = "30px";
        }
    }
    function scriptPageAmendRateArea()
    {
        var counter = 0;
        var vote = document.querySelector(".vote-area");
        var fav = document.querySelector(".nav-pills li");

        var pd = document.querySelector(".col-sm-4.container-fluid .panel-default .panel-body");
        var notice = document.createElement("div");
        notice.textContent = "If you like the script, show your appreciation to the author by rating and favouring it.";
        notice.setAttribute("style", "padding: 0 10px; color: red; font-weight: 700; border-radius: 5px; background-color: yellow;");
        pd.appendChild(notice);
    }

    function xhrPage(url, callback)
    {
        GM_xmlhttpRequest({
            url: url,
            method: "GET",
            headers: { "User-agent": navigator.userAgent, "Accept": "text/xml" },
            onload: function (xhr)
            {
                if (xhr.status == 200)
                {
                    var doc = new DOMParser().parseFromString(xhr.responseText, 'text/xml');

                    dt = document.implementation.createDocumentType("html", "-//W3C//DTD HTML 4.01 Transitional//EN", "http://www.w3.org/TR/html4/loose.dtd"),
                    doc = document.implementation.createDocument("", "", dt),
                    documentElement = doc.createElement("html");
                    documentElement.innerHTML = xhr.responseText;
                    doc.appendChild(documentElement);

                    callback(xhr, doc);
                }
                else callback(xhr, null);
            }
        });
    }

    function getSavedUsernames()
    {
        var arr = new Array();
        var names = GM_listValues();

        for (var i = 0; i < names.length; i++)
        {
            if (names[i].match(/^USER-S:/))
            {
                arr.push(names[i].substr(7));
            }
        }

        return arr;
    }

    function getNewPostCount(username, doc)
    {
        var posts;
        var arr = new Array();

        if (doc) posts = doc.querySelectorAll('.table td:nth-child(2) span a[href*="/' + username + '/"]');
        else posts = document.querySelectorAll('.table td:nth-child(2) span a[href*="/' + username + '/"]');

        var meta = JSON.parse(GM_getValue("USER-P:" + username));

        for (var i = 0, post; i < posts.length, post = posts[i]; i++)
        {
            while (post.tagName != "TR") post = post.parentElement;
            if (!doc) TSL.addClass(post, "userpost");
            var replies = parseInt(post.querySelector("td:nth-child(4)").textContent);
            var postTitle = post.querySelector(".tr-link-a").textContent;
            var postID = getUID(postTitle, "p");

            if (!meta[postID]) meta[postID] = {};

            if (meta[postID].replies != replies)
            {
                TSL.addClass(post, "newposts");

                if (!doc)
                {
                    var diff = document.createElement("sup");
                    post.querySelector("td:nth-child(4) p").appendChild(diff);
                    if (replies == 0) diff.textContent = "new";
                    else diff.textContent = "+" + ((meta[postID].replies == undefined) ? replies : replies - meta[postID].replies);
                }

                var val = { postID: postID, postTitle: postTitle, replies: replies, url: post.querySelector(".tr-link-a").href };
                if (post.querySelector("td:nth-child(3) .label:last-child").textContent != username) arr.push(val);
                else
                {
                    meta[postID].replies = replies;
                    meta[postID].timestamp = timestamp;
                }
            }
        }

        GM_setValue("USER-P:" + username, JSON.stringify(meta));
        return arr;
    }
})();