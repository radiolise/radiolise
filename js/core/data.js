/**
 * 
 * Interested in the source code of Radiolise?
 * Visit 'http://gitlab.com/radiolise/radiolise.gitlab.io' for more details.
 *
 * @licstart  The following is the entire license notice for the 
 * JavaScript code in this page.
 *
 * Copyright (C) 2017-2019 Marco Bauer
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
var secondinterval;

const Data = {
  
  refresh: function() {
    var dataobject = {"lists":lists,"settings":settings,"likes":likes,"titles":titles};
    var data = JSON.stringify(dataobject);
    if (data != localStorage.data) {
      localStorage.data = data;
      console.info("Storage data updated");
      // console.log(JSON.stringify(dataobject, null, 2));
      return true;
    }
    return false;
  },
  
  list: {
    
    sync: function(save) {
      var stations = JSON.parse(localStorage.data || defaultdata).lists;
      if (currentlist != stations) {
        if (save) {
          //SAVE
          lists[listname] = currentlist;
          Data.refresh();
        }
        else {
          //LOAD
          currentlist = stations[listname] || [];
          lists[listname] = currentlist;
          UI.updateList(false);
        }
      }
    },
    
    stationExists: function(id) {
      for (var i = 0; i < currentlist.length; i++) {
        if (currentlist[i].id == id) {
          return true;
        } 
      }
      return false;
    }
    
  },
  
  settings: {
    
    load: function() {
      $(".checked").removeClass("checked");
      $("#theme").val(["pure", "puredark", "pure", "chic", "chicdark"][settings.theme - 1]);
      if (settings.changecolor || settings.theme == 3) {
        $("#colorchange").addClass("checked");
      }
      UI.settings.toggleThemeDescription();
      if (settings.visualization) {
        $("#pseudovsl").addClass("checked");
      }
      if (settings.relax) {
        $("#relaxmode").addClass("checked");
        $("#relaxtimeoutdiv").show();
      }
      else {
        $("#relaxtimeoutdiv").hide();
      }
      $("#relaxtimeout").val(settings["relax-timeout"]);
      $("#defaultvolume").val(settings.volume);
      if (settings.transitions) {
        $("#transitions").addClass("checked");
      }
      if (settings.loadpolicy) {
        $("#loadpolicy").addClass("checked");
      }
      $("#locales").val(settings.language || "auto");
      console.info("Initial values written into settings dialog");
    },
    
    save: function() {      
      switch ($("#theme").val()) {
        case "puredark":
          settings.theme = 2;
          break;
        case "chic":
          settings.theme = 4;
          break;
        case "chicdark":
          settings.theme = 5;
          break;
        default:
          settings.theme = 1;
      }
      settings.visualization = $("#pseudovsl").hasClass("checked");
      settings.relax = $("#relaxmode").hasClass("checked");
      settings["relax-timeout"] = +$("#relaxtimeout").val();
      settings.changecolor = $("#colorchange").hasClass("checked");
      settings.volume = +$("#defaultvolume").val();
      settings.transitions = $("#transitions").hasClass("checked");
      settings.loadpolicy = $("#loadpolicy").hasClass("checked");
      settings.language = $("#locales").val();
      if (settings.language != tr("en") && (!detected || settings.language != "auto")) {
        if (player.paused) {
          $(document).off("scroll");
          $("html").html("<h1 style=\"font-family: Fira Sans, sans-serif\">" + tr("One moment please…") + "</h1>"); 
          Player.stream.stop();
          location.reload();
        }
        else {
          UI.hint.show("<i class=\"fa fa-info-circle\"></i> " + tr("The page needs to be refreshed for all changes to take effect."));
        }
      }
      if (settings.language != "auto") {
        $("#locales [value=auto]").text(tr("Detect"));
        detected = false;
      }
      UI.updateList(false);
      Data.refresh();
      UI.adjust();
    } 
    
  },
  
  moveArrayIndex: function(arr, oldindex, newindex) {
    if (gearclicked == oldindex) {
      gearclicked = newindex;
    }
    if (newindex >= arr.length) {
      var k = newindex - arr.length + 1;
      while (k--) {
        arr.push(undefined);
      }
    }
    arr.splice(newindex, 0, arr.splice(oldindex, 1)[0]);
    return arr;
  },
  
  createBookmark: function(item) {
    var lastindex = titles.favorites[titles.favorites.length - 1];
    if (!lastindex || (lastindex.station != item.station || lastindex.info != item.info)) {
      item.time = Math.floor(+new Date() / 60);
      titles.favorites.push(item);
      Data.refresh();
      $(".plushistory").addClass("active");
      UI.hint.show("<i class='fa fa-check'></i> " + tr("Added to bookmarks"));
      UI.titleManager.insertList("favorites");
    }
    else {
      UI.message("<i class='fa fa-exclamation-triangle'></i> " + tr("You have already bookmarked this title."));
    }
  },
  
  offerUndeletion: function(message, backup, mod, func) {
    clearInterval(secondinterval);
    $("#progressbar").css({
      width: 0,
      transition: "none"
    });
    $("#restoretext").text(message);
    $("#footer").css({
      top: "calc(100% - " + $("#footer").height() + "px)",
      visibility: "visible"
    });
    var i = 0;
    var tick = function() {
      i += 10;
      $("#progressbar").css({
        width: i + "%",
        transition: ""
      });
      if (i == 110) {
        clearInterval(secondinterval);
        $("#footer").css({
          top: "100%",
          visibility: "hidden"
        });
      }
    };
    tick();
    secondinterval = setInterval(tick, 1000);
    $("#restore").off("click");
    $("#restore").on("click", function() {
      if (mod != "list") {
        if (mod != "bookmarks") {
          window[mod] = backup.slice();
        }
        else {
          titles.favorites = backup.slice();
        }
      }
      else {
        lists = JSON.parse(backup);
      }
      func();
      $("#footer").css({
        top: "100%",
        visibility: "hidden"
      });    
    });
  }
  
}
