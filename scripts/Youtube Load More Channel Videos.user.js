// ==UserScript==
// @name            [TS] Youtube Load More Channel Videos
// @namespace       TimidScript
// @version         1.0.9
// @description     Auto loads more videos in channel
// @author          TimidScript
// @homepageURL     https://github.com/TimidScript
// @copyright       © 2016 TimidScript, Some Rights Reserved.
// @license         GNU General Public License v3 (GPL-3) + Read the License inside the script
// @include         http://www.youtube.*/user/*
// @include         https://www.youtube.*/user/*
// @include         http://www.youtube.*/channel/*
// @include         https://www.youtube.*/channel/*
// @require         https://greasyfork.org/scripts/19967/code/TSL - GM_update.js
// @homeURL         https://greasyfork.org/en/scripts/4688
// @updateURL       https://greasyfork.org/scripts/4688/code/4688.meta.js
// @grant           GM_xmlhttpRequest
// @grant           GM_info
// @grant           GM_getMetadata
// @grant           GM_getValue
// @grant           GM_setValue
// @grant           GM_deleteValue
// @grant           GM_registerMenuCommand
// @icon            data:image/png;base64,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
// ==/UserScript==

/* License + Copyright Notice
********************************************************************************************
Copyright © TimidScript, Some Rights Reserved.
GNU General Public License v3 (GPL-3) - http://www.gnu.org/licenses/gpl-3.0.en.html

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the
following conditions are met:

1) GPL-3 License is met
2) This copyright must be included
3) Due credits and link to original author's homepage (included in copyright).
4) Notify the original author of redistribution
5) Clear clarification to end user of the GPL-3 license

TimidScript's Homepages:  [GitHub](https://github.com/TimidScript)
                          [OpenUserJS](https://openuserjs.org/users/TimidScript)
                          [GreasyFork](https://greasyfork.org/users/1455-timidscript

/* Information
**************************************************************************************************
    Version History
----------------------------------------------
1.0.9 (2016-05-25)
 - Moving to GreasyFork and preparing to remove OUJS files
1.0.8 (2016-04-10)
 - updateURL added
1.0.7 (2016-04-03)
 - Changed license to GPL-3
1.0.6 (2015-10-05)
 - Replaced base64 bmp icon with png version
1.0.5 (2015-06-27)
 - Using URI (base64) for script icon
1.0.4 (2014-08-29)
 - Added GM_update
1.0.3 (2014-08-19)
 - Cleaned up header for OUJS
1.0.2 (2013-12-14)
 - Included "/channel/"
1.0.1 (2013-07-08)
 - Initial Release

********************************************************************************************/


var scrollOffset = 1000;
var intervalID = setInterval(ScrollPosition, 250)

function ScrollPosition()
{
    if ((window.scrollMaxY - window.scrollY) < scrollOffset)
    {
        LoadMoreVideos();
    }
}

function LoadMoreVideos()
{
    var loadMore = document.getElementsByClassName("yt-uix-load-more load-more-button yt-uix-button yt-uix-button-default");
    if (loadMore.length == 0) loadMore = document.getElementsByClassName("more-videos yt-uix-button yt-uix-button-default");

    if (loadMore.length > 0)
    {
        loadMore = loadMore[0]
        var evt = document.createEvent("MouseEvents");
        evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        loadMore.dispatchEvent(evt);
    }
    else clearInterval(intervalID);
}
