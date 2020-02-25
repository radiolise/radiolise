/**
 *
 * Interested in the source code of Radiolise?
 * Visit 'http://gitlab.com/radiolise/radiolise.gitlab.io' for more details.
 *
 * @licstart  The following is the entire license notice for the
 * JavaScript code in this page.
 *
 * Copyright (C) 2017-2020 Marco Bauer
 *
 * Radiolise is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * @licend  The above is the entire license notice
 * for the JavaScript code in this page.
 *
 */

var modaltimer, closetimer;

const UI = {
  adjust: function () {
    $("#themestyle").attr(
      "href",
      "css/" +
      (["pure-dark", "pure", "chic", "chic-dark"][settings.theme - 2] ||
        "pure") +
      ".css?v=3"
    );
    $("#splash").css({
      "background-image": "none",
      "pointer-events": "none",
      opacity: 0
    });
    setTimeout(function () {
      $("#splash").remove();
    }, 2000);
    if (prevcolor == "" || settings.theme != 3) {
      Effects.changeColor();
    }
    if (!player.paused) {
      if (settings.visualization) {
        if (vinterval == undefined) {
          Effects.visualization.enable();
        }
      } else {
        Effects.visualization.disable();
      }
      clearTimeout(relaxtimer);
    }
    if (settings.transitions) {
      $("#notransitions").remove();
    } else if ($("#notransitions").length == 0) {
      $("head").append(
        '<style id="notransitions">\n  * {\n    transition: none !important;\n  }\n</style>'
      );
    }
    console.info("User interface adjusted");
  },

  assignStatePlaying: function (station) {
    $("#stations .playbutton > i")
      .addClass("fa-play")
      .removeClass("fa-stop");
    $("#stations > tr").removeClass("playing");
    if (station) {
      for (var i in currentlist) {
        if (JSON.stringify(currentlist[i]) == JSON.stringify(station)) {
          $("#stations .playbutton:eq(" + i + ") > i")
            .addClass("fa-stop")
            .removeClass("fa-play");
          $("#stations > tr:eq(" + i + ")").addClass("playing");
        }
      }
    }
  },

  updateList: function (save) {
    if (save) {
      Data.list.sync(true);
    }
    $("#stations").empty();
    for (var i = 0; i < currentlist.length; i++) {
      var content =
        "<tr><td style='vertical-align: middle'><div><div class='playbutton'><i style='display: table-cell; vertical-align: middle' class='fa fa-fw fa-play'></i></div>" +
        "<div class='icontain'><img class='icon' src='" +
        (settings.loadpolicy ? currentlist[i].icon : "") +
        '\' onerror=\'$(this).replaceWith("<div class=\\"icon\\" style=\\"background: hsl(' +
        currentlist[i].name.toUpperCase().charCodeAt(0) * 20 +
        ', 50%, 50%)\\"><span>' +
        currentlist[i].name[0].toUpperCase() +
        "</span></div>\")'>" +
        "</div></div></td><td><div style='display: block; padding-bottom: 20px'><div><h4 style='font-weight: 500; display: inline'>" +
        currentlist[i].name +
        "</h4></div></div><div style='position: relative; overflow: hidden; height: 30px'><div style='position: absolute; overflow-x: scroll; overflow-y: hidden; width: 100%' class='tags'><div style='white-space: nowrap; height: 30px'><span class='label'>" +
        currentlist[i].country +
        "</span> <span class='label'>" +
        currentlist[i].state +
        "</span> ";
      for (var z = 0; z < currentlist[i].tags.split(",").length; z++) {
        content +=
          "<span class='label'>" +
          currentlist[i].tags.split(",")[z].trim() +
          "</span> ";
      }
      content +=
        "</div></div></div></div></td><td style='padding-right: 15px'><select class='smartmenu' title='" +
        tr("Options for ‘") +
        currentlist[i].name +
        tr("’") +
        "'><option selected hidden value='icon'>&#xf142;&nbsp;</option><optgroup label='" +
        tr("Options for ‘") +
        currentlist[i].name +
        tr("’") +
        "'><option value='like'>" +
        tr("Like") +
        "</option><option value='homepage'>" +
        tr("Visit homepage") +
        "</option><option value='edit'>" +
        tr("Edit") +
        "</option>" +
        (i > 0 ? "<option value='moveup'>" + tr("Move up") + "</option>" : "") +
        (i < currentlist.length - 1
          ? "<option value='movedown'>" + tr("Move down") + "</option>"
          : "") +
        "<option value='delete'>" +
        tr("Delete") +
        "</option></optgroup><option>" +
        tr("Cancel") +
        "</option></select></td></tr>";
      $("#stations").append(content);
    }
    if (!player.paused) {
      UI.assignStatePlaying(prevstation);
    }
    if (currentlist.length != 0) {
      $("#zero").hide();
      $("#stations").show();
    } else {
      $("#zero").show();
    }
  },

  hint: {
    show: function (text, square, confirm) {
      clearTimeout(hinttimer);
      $("#navbar, .videobar").css({
        opacity: 0.5
      });
      $("#hint").css({
        opacity: 1,
        visibility: "visible"
      });
      if (text != "load") {
        $("#hint > div").html(text);
      } else if ($("#hint .fa-spinner").length == 0) {
        $("#hint > div").html(
          "<i style='font-size: 60px; margin: 16px 0' class='fa fa-spinner fa-spin'></i>"
        );
      }
      var timems = 5000;
      if (confirm) {
        $("#hint > div").append(
          "<div style='text-align: right'><a onclick='UI.hint.hide()' class='button'>" +
          tr("OK") +
          "</a></div>"
        );
      } else if (text != "load") {
        hinttimer = setTimeout(function () {
          UI.hint.hide();
        }, timems);
      }
      if (square || text == "load") {
        $("#hint > div").css({
          width: "100px"
        });
        timems = 2000;
      } else {
        $("#hint > div").css({
          width: "300px"
        });
      }
      $("#hint > div").css({
        transform: "scale(1, 1)"
      });
    },

    hide: function () {
      $("#navbar, .videobar").css({
        opacity: 1
      });
      $("#hint").css({
        opacity: 0,
        visibility: "hidden"
      });
      $("#hint > div").css({
        transform: "scale(1, .5)"
      });
    }
  },

  message: function (text) {
    UI.hint.show(text, false, true);
  },

  dialog: {
    open: function (id) {
      const showDialog = function (id) {
        if (id != "hint") {
          $("#modals").css({
            left: "0",
            opacity: 1,
            visibility: "visible",
            "pointer-events": "auto"
          });
          $("body").addClass("dialog");
          //     $("body").css({
          //       overflow: "hidden"
          //     });
        }
        if (id == "addstation") {
          Network.radioBrowser.browse();
          $("#query").trigger("input");
          $("#loadmore").show();
          setTimeout(function () {
            $("#query").select();
          }, 100);
        } else if (id == "stationmanager") {
          $("#stationname").text(currentlist[gearclicked].name);
          $("#customstations").show();
          $("[placeholder='" + tr("Name") + "']").val(
            currentlist[gearclicked].name
          );
          $("[placeholder='" + tr("URL") + "']").val(
            currentlist[gearclicked].url
          );
          $("[placeholder='" + tr("Homepage") + "']").val(
            currentlist[gearclicked].homepage
          );
          $("[placeholder='" + tr("Icon") + "']").val(
            currentlist[gearclicked].icon
          );
          $("[placeholder='" + tr("Country") + "']").val(
            currentlist[gearclicked].country
          );
          $("[placeholder='" + tr("State") + "']").val(
            currentlist[gearclicked].state
          );
          $("[placeholder='" + tr("Language") + "']").val(
            currentlist[gearclicked].language
          );
          $("[placeholder='" + tr("Tags") + "']").val(
            currentlist[gearclicked].tags
          );
          UI.stationManager.refreshTagItems(
            currentlist[gearclicked].tags || ""
          );
        } else if (id == "history") {
          UI.titleManager.insertList("favorites");
          UI.titleManager.updateTimes();
        }
        $("#modals").scrollTop(0);
        $("#" + id)
          .show()
          .addClass("shown");
        $("#modals > div:not(#" + id + ")").hide();
        if (id != "hint") {
          history.pushState(null, null, "#dialog");
        }
        Effects.relaxMode.leave();
        console.info("Dialog with tag ID " + id + " shown");
      };
      if (location.hash == "#dialog") {
        if ($(".shown").attr("id") != id || id == "stationmanager") {
          clearTimeout(modaltimer);
          modaltimer = setTimeout(function () {
            showDialog(id);
          }, 400);
          UI.dialog.close(true);
        } else {
          UI.dialog.close();
        }
      } else {
        showDialog(id);
      }
    },

    close: function (reopen) {
      if ($(".shown").attr("id") == "listmanager") {
        applyLists();
      }
      $("#modals").css({
        left: "-200px",
        opacity: 0,
        visibility: "hidden",
        "pointer-events": "none"
      });
      if (!reopen) {
        $("body").removeClass("dialog");
      }
      //   $("body").css({
      //     overflow: "auto"
      //   });
      if (location.hash == "#dialog") {
        history.back();
        $(window).trigger("mousemove");
      }
      if ($(".shown").has("#addstation")) {
        $("#addfooter").css({
          top: "100%",
          visibility: "hidden"
        });
        $("#modals").css({
          height: "100%"
        });
        closetimer = setTimeout(function () {
          $("#query").val("");
          $("#results").hide();
        }, 400);
      }
      $(".shown").removeClass("shown");
      clearTimeout(relaxtimer);
      if (settings.relax) {
        relaxtimer = setTimeout(function () {
          Effects.relaxMode.enter();
        }, settings["relax-timeout"] * 1000);
      }
      console.info("Dialog hidden");
    }
  },

  search: {
    refreshResults: function () {
      $("#query").trigger("input");
      UI.search.showLoadingInfo();
    },

    showLoadingInfo: function () {
      if (requesting) {
        $("#results").empty();
        $("#loadmore").show();
      }
    }
  },

  settings: {
    toggleThemeDescription: function () {
      $("#descriptions > span").hide();
      $("#" + $("#theme").val()).show();
    }
  },

  stationManager: {
    refreshTagItems: function (tagstring) {
      $("#preview").empty();
      if (tagstring.trim()) {
        var tags = tagstring.split(",");
        for (var i in tags) {
          $("#preview").append(
            "<span class='label'>" + tags[i].trim() + "</span> "
          );
        }
        $("#tagview").show();
      } else {
        $("#tagview").hide();
      }
    }
  },

  titleManager: {
    insertList: function (type) {
      moment.locale(language);
      var content = "";
      if (titles[type].length > 0) {
        var month;
        for (var i = titles[type].length - 1; i >= 0; i--) {
          var item = titles[type][i];
          if (type == "favorites") {
            var currentmonth = moment(item.time * 60).format("MMMM YYYY");
            if (month != currentmonth) {
              content +=
                "<div class='monthseparator' style='margin: 10px 0; padding: 5px 10px; font-size: 20px; font-weight: 500; opacity: .7'>" +
                currentmonth +
                "</div>";
              month = moment(item.time * 60).format("MMMM YYYY");
            }
          }
          content +=
            "<div class='listitem' style='padding: 10px'><div style='margin-bottom: 5px; font-weight: normal; font-size: 17px; font-weight: 500'>" +
            item.info +
            "</div><div style='opacity: .7'><span style='float: left'>" +
            item.station +
            "</span>&nbsp;<span data-time='" +
            item.time +
            "' style='float: right'>" +
            moment(item.time * 60).fromNow() +
            "</span></div><div class='options' style='display: none'>" +
            (type == "favorites"
              ? "<a class='button' href='https://musicbrainz.org/search?query=" +
              encodeURIComponent(item.info) +
              "&type=recording' target='_blank' style='margin-bottom: 0'><i class='fa fa-fw fa-search'></i><span tr>MusicBrainz</span></a><a class='button' style='margin-bottom: 0' onclick='Data.offerUndeletion(\"" +
              tr("‘") +
              item.info +
              tr("’ has been removed from bookmarks.") +
              '", titles.favorites.slice(), "bookmarks", function() {Data.refresh(); UI.titleManager.insertList("favorites")}); titles.favorites.splice(' +
              i +
              ", 1); Data.refresh(); UI.titleManager.insertList(\"favorites\")'><i class='fa fa-fw fa-times'></i><span>" +
              tr("Remove") +
              "</span></a>"
              : "<a class='button' style='margin-bottom: 0' onclick='Data.createBookmark(" +
              JSON.stringify(item) +
              ")'><i class='fa fa-music'></i><i class='fa fa-fw fa-xs fa-plus' style='vertical-align: super; margin: 0'></i><span>" +
              tr("Bookmark") +
              "</span></a><a class='button' href='https://musicbrainz.org/search?query=" +
              encodeURIComponent(item.info) +
              "&type=recording' target='_blank' style='margin-bottom: 0'><i class='fa fa-fw fa-search'></i><span tr>MusicBrainz</span></a>") +
            "</div></div>";
        }
      } else {
        content += tr(
          "<p style='padding: 0; text-align: center'>" +
          tr("This list is currently empty.") +
          "</p>"
        );
      }
      $("#" + (type == "favorites" ? "favorites" : "recent"))
        .html(content)
        .data("content", JSON.stringify(titles[type]));
      if (type == "favorites") {
        var current = titles.favorites[titles.favorites.length - 1];
        if (
          !current ||
          current.station != currentstation ||
          current.info != info
        ) {
          $(".plushistory").removeClass("active");
        } else {
          $(".plushistory").addClass("active");
        }
        if (titles.favorites.length > 0) {
          $(".download").show();
        } else {
          $(".download").hide();
        }
      }
      console.info("Wrote " + type);
    },

    updateTimes: function () {
      if (timeupdater) {
        clearTimeout(timeupdater);
      }
      timeupdater = setInterval(function () {
        var i = 0;
        if ($("#history").hasClass("shown")) {
          $(":visible > .listitem [data-time]").each(function () {
            var time = moment($(this).data("time") * 60).fromNow();
            if ($(this).text() != time) {
              $(this).text(time);
            }
            i++;
          });
        }
        if (i == 0) {
          clearTimeout(timeupdater);
        }
      }, 5000);
    }
  }
};
