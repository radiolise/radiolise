/**
 * 
 * Interested in the source code of Radiolise?
 * Visit 'http://gitlab.com/radiolise/radiolise.gitlab.io' for more details.
 *
 * @licstart  The following is the entire license notice for the 
 * JavaScript code in this page.
 *
 * Copyright (C) 2017 Marco Bauer
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
window.onerror = function(message) {
  alert(message);
}
var online = true;
window.ononline = function() {
  online = true;
}
window.onoffline = function() {
  online = false;
  if (!audio.paused) {
    alert("Oh no! The stream was interrupted due to a sudden disconnect.");
  }
  stopStream();
  updateFinish(nostream);
}
var currentstation, prevdata, prevvolume, prevstation, gearclicked, hinttimer, volumetimer, volumerequest, slow, timedout, relaxtimer, currentlist,
audio = new Audio(),
appname = "Radiolise",
visible = false,
fetch,
nostream = "Radio off",
defaultsettings = '{"theme":1,"visualization":false,"relax":false,"relax-timeout":10,"theme-hue":0,"random-color":true,"volume":100,"transitions":true}',
defaultdata = '{"lists":{"Favorites":[]},"settings":' + defaultsettings + '}',
listsbackup = {},
lists = JSON.parse(localStorage.data || defaultdata).lists,
listname = Object.keys(lists)[0],
ismousedown = false,
settings = JSON.parse(localStorage.data || defaultdata).settings;
console.log("\n\n%c Welcome to " + appname + "! \n%c > and Happy Hacking!_%c\n\nhttps://gitlab.com/radiolise/radiolise.gitlab.io\n\n", "font-size: 30px; background-color: #ccc; color: #000; font-family: sans-serif", "font-size: 20px", "font-family: sans-serif; font-size: 14px");
console.info("%cRadiolise is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.\nType%c learnMore() %cfor more details.", "font-size: 14px; font-family: sans-serif", "font-size: 14px", "font-size: 14px; font-family: sans-serif");
function refreshData() {
  var dataobject = {"lists":lists,"settings":settings};
  var data = JSON.stringify(dataobject);
  if (data != localStorage.data) {
    localStorage.data = data;
    console.info("Storage data updated:");
    console.log(JSON.stringify(dataobject, null, 2));
    return true;
  }
  return false;
}
function init() {
  $(".name").text(appname);
  $("#query").val(null);
  var hash = location.hash;
  if (hash !== "") {
    switch (hash.substring(1)) {
      case "dialog":
        break;
      case "noscript":
        hint("JavaScript has been enabled successfully.");
        break;
      default:
        hint("<b>Invalid hashtag</b><br><br> ‘" + hash + "’ is unknown.");
    }
    history.replaceState({}, document.title, ".");
  }
  $("#themestyle").attr("href", "css/" + (["dark", "vivid"][settings.theme - 2] || "light") + ".css");
  $("#splash").css({
    "background-image": "none",
    "pointer-events": "none",
    opacity: 0
  });
  setTimeout(function() {
    $("#splash").remove();
  }, 2000);
  if (prevcolor == "" || settings.theme != 3) {
    changeColor();
  }
  if (!audio.paused) {
    if (settings.visualization) {
      if (vinterval == undefined) {
        visualise();
      }
    }
    else {
      stopV();
    }
    clearTimeout(relaxtimer);
  }
  if (settings.transitions) {
    $("#notransitions").remove();
  }
  else if ($("#notransitions").length == 0) {
    $("head").append("<style id=\"notransitions\">\n  * {\n    transition: none !important;\n  }\n</style>");  
  }
  console.info("Initialization completed");
}
$(function() {
  console.info("Document ready");
  updateFinish(nostream);
  init();
  $("select:has([data-type])").prop("disabled", true);
  applyLists();
  audio.volume = settings.volume / 100;
  sync(false);
  $("#hidefooter").on("click", function() {
    $("#footer").css({
      top: "100%",
      visibility: "hidden"
    });
  });
  $(document).on("click", ".trashcan", function() {
//     var stationbackup = currentlist.slice();
//     var victim = currentlist[gearclicked][0];
//     currentlist.splice(gearclicked, 1);
//     stationUpdate(true);    
//     undelete("Station named ‘" + victim + "’ has been removed.", stationbackup, "currentlist", restoreStation);
    modal("stationmanager");
    $("#customstations").show();
    $("[placeholder='Name']").val(currentlist[gearclicked].name);
    $("[placeholder='URL']").val(currentlist[gearclicked].url);
    $("[placeholder='Homepage']").val(currentlist[gearclicked].homepage);
    $("[placeholder='Icon']").val(currentlist[gearclicked].icon);
    $("[placeholder='Country']").val(currentlist[gearclicked].country);
    $("[placeholder='State']").val(currentlist[gearclicked].state);
    $("[placeholder='Language']").val(currentlist[gearclicked].language);
    $("[placeholder='Tags']").val(currentlist[gearclicked].tags);
    $("#deletestation").show();
  });
  $("#chremove").on("click", function() {
    currentlist.splice(gearclicked, 1);
    stationUpdate(true);
    closeModal();
  });
  $("body").on("keydown", function(event) {
    if (event.which == 32 && location.hash != "#dialog") {
      event.preventDefault();
    }
  });
  $("body").on("keyup", function(event) {
    var key = event.key;
    if (!(location.hash == "#dialog" || event.ctrlKey || event.altKey || event.shiftKey || event.metaKey)) {
      switch (key) {
        case "-":
          showVolume(false);
          break;
        case "+":
          showVolume(true);
          break;
        case " ":
          if ($("#stop").hasClass("disabled") == false) {
            if (!$("#stop").children().hasClass("fa-toggle-off")) {
              hint("<i style='font-size: 60px; margin: 16px 0' class='fa fa-stop'></i>", true);
            }
            $("#stop").trigger("click");
          }
          break;
        default:
          if (!isNaN(key)) {
            var digit = key - 1;
            if (key == 0) {
              digit = 9;
            }
            if (digit < currentlist.length) {
              startStream(currentlist[digit]);
            }
            else {
              hint("<i class='fa fa-fw fa-exclamation-triangle'></i> Station " + (digit + 1) + " doesn’t exist.");
            }
          }
      }
    }
    if (location.hash == "#dialog" && key == "Escape") {
      history.back();
    }
  });
  $("[placeholder='Tags']").on("input", function() {
    refreshTags($(this).val());
  });
  $("#customstations input").on("blur", function() {
    if (validStation()) {
      currentlist[gearclicked].name = $("[placeholder='Name']").val();
      currentlist[gearclicked].url = $("[placeholder='URL']").val();
      currentlist[gearclicked].homepage = $("[placeholder='Homepage']").val();
      currentlist[gearclicked].icon = $("[placeholder='Icon']").val();
      currentlist[gearclicked].country = $("[placeholder='Country']").val();
      currentlist[gearclicked].state = $("[placeholder='State']").val();
      currentlist[gearclicked].language = $("[placeholder='Language']").val();
      currentlist[gearclicked].tags = $("[placeholder='Tags']").val();
      sync(true);
    }
  });
  $("#done").on("click", function() {
    closeModal();
  });
  $("#deletestation").on("click", function() {
    closeModal();
    var stationbackup = currentlist.slice();
    var victim = currentlist[gearclicked].name;
    currentlist.splice(gearclicked, 1);
    stationUpdate(true);    
    undelete("Station named ‘" + victim + "’ has been removed.", stationbackup, "currentlist", restoreStation);
  });
  $("#wrench").on("click", function() {
    modal("listmanager");
  });
  $("#closesettings").on("click", function() {
    $('#discardsettings').trigger('click');
  });
  $("#stop").on("click", function() {
    var icon = $(this).children();
    if (icon.hasClass("fa-toggle-on")) {
      stopStream();
      updateFinish(nostream);
    }
    else {
      if (prevstation != undefined) {
        startStream(prevstation);
      }
      else if (currentlist.length > 0) {
        startStream(currentlist[0]);
      }
      else {
        hint("<i class='fa fa-fw fa-exclamation-triangle'></i>Please add a station to the list first.");
        console.warn("Radio not turned on: Station list is empty");
      }
    }
  });
  $("#tryfetch").on("click", function() {
    $("#failmsg").slideUp();
    browseCrb();
  });
  $("#minus").on("click", function() {
      showVolume(false);
  });
  $("#plus").on("click", function() {
      showVolume(true);
  });
  $(window).on("hashchange", function() {
      if (location.hash === "" && $(".shown").length == 1) {
        closeModal();
      }
  }).on("dragstart", function() {
      return false;
  }).on("mousemove mousedown keydown touchstart", function() {
    if (settings.relax) {
      clearTimeout(relaxtimer);
      wakeUp();
      relaxtimer = setTimeout(function() {
          relax(); 
      }, settings["relax-timeout"] * 1000);
    }
  }).on("resize", function() {
      if (relaxed) {
          relax();
      }
      if ($("#footer").css("visibility") == "visible") {
        $("#footer").css({
          top: "calc(100% - " + $("#footer").height() + "px)"
        });
      }
      if ($("#addfooter").css("visibility") == "visible") {
        $("#addfooter").css({
          top: "calc(100% - " + $("#addfooter").height() + "px)"
        });
      }        
  });
  $("#findstation").on("click", function() {
    showLoading();
    $("#modals").finish().animate({
      scrollTop: $("#query").offset().top - $(window).scrollTop()
    });
  });
  $("#addstation select").on("change", function() {
    $("#query").trigger("input");
    showLoading();
  });
  $("#query")
    .on("keyup", function(event) {
        if (event.which == 13) {
            $("#findstation").trigger("click");
            $("#query").blur();
        }
    }).on("input", function() {
      if (fetch != undefined && "abort" in fetch) {
        fetch.abort();
      }
      findStation($('input').val());
      $("#findstation").removeClass("disabled");
      $(".selected").trigger("click");
      $("#loadmore").hide();
    }).on("blur", function() {
      showLoading();
    });
  $("form").on("submit", function(event) {
      event.preventDefault();
  });
  $("#addlist").on("click", addList);
  $("#modals, .closer").on("click", function() {
    closeModal();
  });
  $("#modals > div").on("click", function(event) {
    event.stopPropagation();
  });
  $("#addbutton").on("click", function() {
    modal("addstation");
  });
  $("#settingsbutton").on("click", function() {
    modal("settings");
  });
  $("#learnmorebutton").on("click", function() {
    modal("learnmore");
  });
  $("#applysettings").on("click", function() {
    var valid = true;
    $("input[type=number]").each(function() {
      var value = Number($(this).val())
      if (valid && ($(this).attr("min") > value || $(this).attr("max") < value || Math.floor(value) != value || $(this).val() == "")) {
        valid = false;
      }
    });
    if (valid) {
      saveSettings();
      closeModal();
    }
    else {
      alert("At least one invalid number input has been detected.");
    }
  });
  $("#discardsettings").on("click", function() {
    settings = JSON.parse(localStorage.data || defaultdata).settings;
    loadSettings();
    closeModal();
  });
  $("#reset").on("click", function() {
    settings = JSON.parse(defaultsettings);
    loadSettings();
    saveSettings();
    init();
  });
  $(".checkable").on("click", function() {
    if ($(this).hasClass("checked")) {
      $(this).removeClass("checked");
      if ($(this).attr("id") == "relaxmode") {
        $("#relaxtimeoutdiv").hide();
      }            
    }
    else {
      $(this).addClass("checked");
      if ($(this).attr("id") == "relaxmode") {
        $("#relaxtimeoutdiv").show();
      }
    }
  }).on("select", function() {
    return false;
  });
  $("input[type=file]").on("change", function(event) {
    var file = event.target.files[0];
    var reader = new FileReader;
    reader.readAsText(file);
    reader.onload = function(event) {
      settings = JSON.parse(event.target.result);
      loadSettings();
      saveSettings();
      hint("Import successful.");
    }
    reader.onerror = function() {
      alert("Error reading file.");
    }
  });
  $("#import").on("click", function() {
    $("input[type=file]").trigger("click");
  });
  $("#export").on("click", function() {
    saveSettings();
    $("#blob").attr("href", URL.createObjectURL(new Blob([JSON.stringify(settings)], {type: "application/json"})));
    $("#blob").attr("download", "Radiolise_" + (new Date).getTime() + ".json");
    $("#blob")[0].click();
  });
  $("#theme").on("change", themeSet);
  var clicked = false, clickY, scrollleft, tagdiv;
  $(document).on("mousedown", ".tags", function(e) {
    clicked = true;
    clickY = e.pageX;
    scrollleft = $(this).scrollLeft();
    tagdiv = $(this);
    $("body, .tags").css({
      cursor: "-webkit-grabbing"
    }).css({
      cursor: "grabbing"
    });
  }).on("mousemove", function(e) {
      if (clicked) {
        tagdiv.scrollLeft(scrollleft + clickY - e.pageX);
      }
  }).on("mouseup", function() {
    clicked = false;
    $("body").css({
      cursor: "auto"
    });
    $(".tags").css({
      cursor: "-webkit-grab"
    }).css({
      cursor: "grab"
    });    
  });
  $("#modals").on("scroll", function() {
    if (searching && $("#addstation").hasClass("shown") && $("#loadmore").offset().top - $(window).height() - $(window).scrollTop() < 0) {
      searching = false;
      offset += 20;
      loadEntries();
    }
  });
  $("#lists").on("change", function() {
    if ($(this).prop("selectedIndex") == $("#lists > optgroup > option").length) {
      setList(listname);
      modal("listmanager");
      $("#listul").empty();
      for (var key in lists) {
        $("#listul").append("<li>" + key + "</li>");
      }
    }
    else {
      setList($(this).val());      
    }
  });
  $("#addchecked").on("click", function() {
    $(".selected").each(function(index) {
      var meta = $(this).data("meta");
      currentlist.push({"name":meta.name,"url":meta.url,"homepage":meta.homepage,"icon":meta.favicon,"country":meta.country,"state":meta.state,"language":meta.language,"tags":meta.tags,"id":meta.id});
    });
    stationUpdate(true);
    closeModal();
  });
  $(document).on("blur", ".itemname", function() {
    $(this).next().find(".okay").hide();
    $(this).next().find(".renamelist").show();
    var item = $(this);
    var oldname = $(this).closest("[data-item]").data("item");
    var name = item.val().trim().replace(/\s+/g, " ") || null;
    if (oldname != name) {
      if (lists[name] == undefined) {
        if (name) {
          if (lists[oldname]) {
            lists[name] = lists[oldname].slice();
            delete lists[oldname];
          }
          else {
            lists[name] = [];
            hint("New list named ‘" + name + "’ created");
          }
          if ($("#lists").val() == oldname) {
            listname = name;
          }
          applyLists();      
        }
        else {
          hint("Invalid name");   
          applyLists();
        }
      }
      else {
        hint("Already existing");
        applyLists();
      }
    }
  }).on("focus", ".itemname", function() {
    $(this).next().find(".okay").show();
    $(this).next().find(".renamelist").hide();
    $(this).select();      
  }).on("keydown", "div[data-item] > .itemname", function(event) {
    if (event.which == 13) {
      event.preventDefault();
      $(this).blur();
    }
  });
  $("#customstations input").on("keydown", function(event) {
    if (event.which == 13) {
      $(this).blur();
    }
  });
  $("#listtools").on("mouseenter", function() {
    $(this).css({
      opacity: 1
    });
  }).on("mouseleave", function() {
    $(this).css({
      opacity: .5
    });
  });
  $("#deselectall").on("click", function() {
    $(".selected").trigger("click");
  });
  $("#results").on("click", ".result", function() {
    if ($(this).hasClass("selected")) {
      $(this).removeClass("selected");
      if ($(".selected").length == 0) {
        $("#addfooter").css({
          top: "100%",
          visibility: "hidden"
        });    
      }
      $(this).children().first().css({
        width: 0,
        opacity: 0
      });
    }
    else if (!stationExists($(this).data("meta").id)) {
      $(this).addClass("selected");
      $("#addfooter").css({
        top: "calc(100% - " + $("#addfooter").height() + "px)",
        visibility: "visible"
      });  
      $(this).children().first().css({
        width: "25px",
        opacity: 1
      });
    }
    else {
      alert("‘" + $(this).data("meta").name + "’ has already been added to ‘" + listname + "’.");
    }
    if ($(".selected").length != 1) {
      $("#stationcount").html($(".selected").length + " stations");      
    }
    else {
      $("#stationcount").html("‘" + $(".selected").data("meta").name + "’");      
    }
    if ($(".selected").length > 0) {
      var topheight = "calc(100% - " + $("#addfooter").height() + "px)";
      $("#addfooter").css({
        top: topheight
      });
      $("#modals").css({
        height: topheight
      });      
    }
    else {
      $("#modals").css({
        height: "100%"
      });  
    }
  });
});
audio.onpause = function() {
  stopStream();
  updateFinish(nostream);
}
audio.onplay = function() {
  if (audio.getAttribute("src") == null) {
    $("#stop").trigger("click");
  }
}

loadSettings();
function showLoading() {
  if (requesting) {
    $("#results").empty();
    $("#loadmore").show();
  }
}
function loadSettings() {
  $(".checked").removeClass("checked");
  $("#theme").val(["simple", "vivid"][+(settings.theme == 3)]);
  themeSet();
  if (settings.theme == 2) {
    $("#nightmode").addClass("checked");
  }
  if (settings.theme != 3) {
    $("#nightmode").show();
  }
  else {
    $("#nightmode").hide();
  }
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
  console.info("Initial values written into settings dialog");
}

function themeSet() {
  if ($("#theme").val() == "simple") {
    $("#simple").show();
    $("#vivid").hide();
    $("#nightmode").show();
  }
  else {
    $("#vivid").show();
    $("#simple").hide();
    $("#nightmode").hide();
  }          
}
function saveSettings() {      
  settings.theme = $("#theme").val() == "simple" ? 1 + $("#nightmode").hasClass("checked") : 3;
  settings.visualization = $("#pseudovsl").hasClass("checked");
  settings.relax = $("#relaxmode").hasClass("checked");
  settings["relax-timeout"] = +$("#relaxtimeout").val();
  settings.volume = +$("#defaultvolume").val();
  settings.transitions = $("#transitions").hasClass("checked");
  var log = "Settings set to the following values:";
  var settingskeys = Object.keys(settings);
  for (i = 0; i < settingskeys.length; i++) {
    var settingsarray = settingskeys[i]
    log += "\n" + settingsarray.replace(/-/g, " ") + " = " + settings[settingsarray];
  }
  console.info(log);
  refreshData();
  init();
}
$("title").text(appname);
function showVolume(plus) {
    $(window).scrollTop(0);
    var newvol = audio.volume;
    if (plus) {
      newvol += .1;
    }
    else {
      newvol -= .1;
    }
    if (newvol > 1) {
      newvol = 1;
    }
    else if (newvol < 0) {
      newvol = 0;
    }
    audio.volume = newvol.toFixed(1);
    var rvolume = audio.volume * 100;
    hint("<i style='font-size: 60px' class='fa fa-volume-" + ((rvolume > 0) ? "up" : "off") + "'></i><div style='font-size: 25px'>" + ((rvolume > 0) ? rvolume + "%" : "Off") + "</div>", true);
}
function restoreStation() {
  stationUpdate(true);
}
var secondinterval;
function undelete(message, backup, mod, func, listname) {
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
  var secondfunction = function() {
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
  secondfunction();
  secondinterval = setInterval(secondfunction, 1000);
  $("#restore").off("click");
  $("#restore").on("click", function() {
    if (mod != "list") {
      window[mod] = backup.slice();
    }
    else {
      lists[listname] = backup.slice();
    }
    func();
    $("#footer").css({
      top: "100%",
      visibility: "hidden"
    });    
  });
}
function learnMore() {
  modal("learnmore");
  console.info($("#infotext").text());
}
function hint(text, square, confirm) {
    clearTimeout(hinttimer);
    $("#navbar").css({
      opacity: .5
    });    
    $("#hint").css({
      opacity: 1,
      visibility: "visible"
    }).children().html((text != "load") ? text : "<i style='font-size: 60px; margin: 16px 0' class='fa fa-spinner fa-spin'></i>");
    var timems = 5000;
    if (confirm) {
      $("#hint > div").append("<div style='text-align: right'><a onclick='closeHint()' class='button'>OK</a></div>")
    }
    else if (text != "load") {
      hinttimer = setTimeout(function() {
        closeHint();
      }, timems);      
    }
    if (square || text == "load") {
      $("#hint > div").css({
        "width": "100px"
      });
      timems = 2000;
    }
    else {
      $("#hint > div").css({
        "width": "300px"
      });
    }
    $("#hint > div").css({
      transform: "scale(1, 1)"
    });
}
function closeHint() {
  $("#navbar").css({
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
function alert(text) {
  hint(text, false, true);
}
function browseCrb() {
  var items = ["countries", "states", "languages"];
  for (i = 0; i < items.length; i++) (function(item) {
    var current = $("[data-type=" + item + "]");
    if (current.parent().prop("disabled")) {
      $.post("https://www.radio-browser.info/webservice/json/" + item, function(data) {
        var options = "<option value=''>All " + item + "</option>";
        for (i in data) {
          options += "<option value='" + data[i].name + "'>" + data[i].name + "</option>";
        }
        current.html(options).parent().prop("disabled", false);
      }).fail(function() {
        current.html("<option>Request failed</option>");
        $("#failmsg").slideDown();
      });
    }
  })(items[i]);
}
function updateFinish(newstation) {
  if (newstation == nostream) {
      $('title').html(appname);
      changeColor();
      stopV();
      wakeUp();
  } else {
      $('title').html(newstation + " – " + appname);
      currentstation = newstation;
      changeColor();
      if (vinterval == undefined) {
          visualise();
      }
      if (prevdata == nostream && settings.relax) {
          clearTimeout(relaxtimer);
          relaxtimer = setTimeout(function() {
              relax(); 
          }, settings["relax-timeout"] * 1000);
      }
  }
  $("#station").css({
    opacity: 0,
    transform: "rotateY(45deg)"
  });
  setTimeout(function() {
    $("#station").html(newstation).css({
      opacity: 1,
      transform: ""
    });
  }, 400);
}
function setPlaying(station) {
  $(".playbutton > i").addClass("fa-play").removeClass("fa-stop");
  $("#stations > tr").removeClass("playing");
  if (station) {
    for (i in currentlist) {
      if (JSON.stringify(currentlist[i]) == JSON.stringify(station)) {
        $(".playbutton:eq(" + i + ") > i").addClass("fa-stop").removeClass("fa-play");
        $("#stations > tr:eq(" + i + ")").addClass("playing");
      }
    }
  }
}
function startStream(index) {
  stopStream();
  $("body").css({
    scrollTop: 0
  });
  setPlaying(index);
  audio.onloadeddata = function() {
    updateFinish(index.name);
    toggle(true);
    prevstation = index;
    console.info("Radio turned on: Playing '" + index.name + "'");
  };
  audio.onerror = function(e) {
    alert("Sorry, an error has occurred. Please try again later.");
    closeHint();
    updateFinish(nostream);
    toggle(false);
    stopStream();
  }
  audio.onwaiting = function() {
    hint("load");
  }
  audio.oncanplay = function() {
    closeHint();
  }
  audio.load();
  var play = function(url) {
    audio.setAttribute("src", url);
    audio.play();
  };
  if (index.id) {
    $.post("https://www.radio-browser.info/webservice/v2/json/url/" + index.id, function(data) {
      play(data.url);
    }).fail(function() {
      play(index.url);
    });
  }
  else {
    play(index.url);
  }
  hint("load");
}
function stopStream() {
  if (audio.getAttribute("src") != null) {
    closeHint();
    audio.onerror = null;
    audio.removeAttribute("src")
    audio.load();
    toggle(false);
    stopV();
    setPlaying(null);
    console.info("Radio turned off");
  }
}
function stationExists(id) {
  var existing = false;
  for (i = 0; i < currentlist.length; i++) {
    if (currentlist[i].id == id) {
      existing = true;
      break;
    } 
  }
  return existing;
}
function stationUpdate(save) {
    if (save) {
      sync(true);
    }
    $("#stations").empty();
    for (i = 0; i < currentlist.length; i++) {
      var content = "<tr><td style='vertical-align: middle'><div><div class='playbutton' onclick='if ($(this).children().hasClass(\"fa-play\")) { startStream(currentlist[" + i + "]); } else { updateFinish(nostream); stopStream(); }'><i style='display: table-cell; vertical-align: middle' class='fa fa-fw fa-play'></i></div>" + "<img style='margin: 0 20px; border-radius: 50%; object-fit: cover; height: 35px; width: 35px; display: block; font-size: 26px; text-align: center; color: #fff' alt='" + currentlist[i].name[0].toUpperCase() + "' src='" + currentlist[i].icon + "' onerror='$(this).css({ background: \"hsl(" + currentlist[i].name.toUpperCase().charCodeAt(0) * 20 + ", 50%, 50%)\" })'>" + "</div></td><td><div style='display: block; padding-bottom: 20px; cursor: pointer' onclick='$(this).closest(\"tr\").find(\".playbutton\").trigger(\"click\")'><div><h4 style='font-weight: 500; display: inline'>" + currentlist[i].name + "</h4></div></div><div style='position: relative; overflow: hidden; height: 30px'><div style='position: absolute; overflow-x: scroll; overflow-y: hidden; width: 100%' class='tags'><div style='white-space: nowrap; height: 30px'><span class='label'>" + currentlist[i].country + "</span> <span class='label'>" + currentlist[i].state + "</span> ";
      for (z = 0; z < currentlist[i].tags.split(",").length; z++) {
          content += "<span class='label'>" + currentlist[i].tags.split(",")[z].trim() + "</span> ";
      }
      content += "</div></div></div></div></td><td style='padding-right: 15px'><a class='trashcan' style='font-size: 18px' onclick='gearclicked = " + i + "'><i class='fa fa-fw fa-ellipsis-v'></i></a></td></tr>";
      $("#stations").append(content);
    }
    if (!audio.paused) {
      setPlaying(prevstation);
    }
    if (currentlist.length != 0) {
      $("#zero").hide();
      $("#stations").hide().stop().fadeIn();
    }
    else {
      $("#zero").stop().fadeIn();
    }
}
function sync(save) {
  var stations = JSON.parse(localStorage.data || defaultdata).lists;
  if (currentlist != stations) {
    if (save) {
      //SAVE
      lists[listname] = currentlist;
      refreshData();
    }
    else {
      //LOAD
      currentlist = stations[listname] || [];
      lists[listname] = currentlist;
      stationUpdate(false);
    }
  }
}
function validStation() {
  return !!($("[placeholder='Name']").val() && $("[placeholder='URL']").val());
}
function addCustomStation() {
  currentlist.push({});
  $("#customstations input").val("");
  gearclicked = currentlist.length - 1;
  $("#deletestation").hide();
  modal("stationmanager");
}
function setList(name) {
  $("#lists").val(name);
  if (listname != name) {
    listname = name;
    sync(false);  
  }
}
function addList() {
  if ($("[data-item=\"\"]").length == 0) {
    appendList("");
  }
  $("div[data-item=\"\"] > input").attr("placeholder", "Please specify a name").select();
  var yposition = $("div[data-item=\"\"]").offset().top + $("#modals").scrollTop() - $("body").scrollTop();
  $("#modals").animate({
    scrollTop: yposition
  });
}
function removeList(name) {
  var listbackup = lists[name].slice();
  delete lists[name];
  applyLists();
  if (name == listname) {
    setList($("#lists > optgroup > option").html());
  }
  undelete("List named ‘" + name + "’ has been removed.", listbackup, "list", applyLists, name);
}
function renameList(oldname) {
  $("div[data-item=\"" + oldname + "\"] > .itemname").focus();
}
function applyLists() {
  refreshData();
  $("#listdiv").empty();
  $("#lists > optgroup").empty();
  for (var list in lists) {
    $("#lists > optgroup").append("<option>" + list + "</option>");
    appendList(list)
  }
  $("#lists").val(listname);
}
function refreshStorage() {
  //TODO
}
function refreshTags(tagstring) {
  $("#preview").empty();
  if (tagstring.trim()) {
    var tags = tagstring.split(",");
    for (i in tags) {
      $("#preview").append("<span class='label'>" + tags[i].trim() + "</span> ");
    }
    $("#tagview").show();
  }
  else {
    $("#tagview").hide();
  }
}
function appendList(name) {
  $("#listdiv").append("<div data-item='" + name + "' style='display: table-row'><input class='itemname' placeholder='New name' value='" + name + "'><div style='display: table-cell; white-space: nowrap'><a class='renamelist' onclick='renameList(\"" + name + "\")'><i class='fa fa-fw fa-pencil'></i></a><a class='okay' style='display: none'><i class='fa fa-fw fa-check'></i></a>" + ((name != "" && Object.keys(lists).length > 1) ? "<a onclick='removeList(\"" + name + "\")'><i class='fa fa-fw fa-trash-o'></i></a>" : "") + "</div></div>");  
}
var searching = false;
function loadEntries() {
  requesting = true;
  fetch = $.post("https://www.radio-browser.info/webservice/json/stations/search", {
    name: stationsearched,
    offset: offset,
    limit: 20,
    country: $("#country").val(),
    state: $("#state").val(),
    language: $("#language").val(),
    order: $("#order").val(),
    reverse: ($("#order").prop("selectedIndex") < 5) ? !!$("#reverse").prop("selectedIndex") : !$("#reverse").prop("selectedIndex")
  }, function(data) {    
    requesting = false;
    var sum = 0;
    var results = "";
    var icons = [null, "flag", "map-marker", "commenting fa-flip-horizontal", "file-audio-o", "play", "thumbs-up"];
    for (i = 0; i < data.length; i++) {
      if (data[i].lastcheckok == "1") {       
        results += "<div style='cursor: pointer; display: table; table-layout: fixed; width: 100%' data-meta='" + JSON.stringify(data[i]).replace(/'/g, "&apos;") + "' class='result'><div class='checkmark' style='display: table-cell; opacity: 0; width: 0; color: #008000'><i class='fa fa-check' style='margin-left: 10px'></i></div><div style='padding: 10px; margin-bottom: 10px; display: table-cell'><h4 style='margin: 0'>" + data[i].name + "</h4><br>" + (($("#order").prop("selectedIndex") > 0) ? "<span class='label' style='background: #008000; font-weight: 500; color: #fff'><i class='fa fa-" + icons[$("#order").prop("selectedIndex")] + "'></i> " + (data[i][$("#order").val()] || "<i class='fa fa-question'></i>") + "</span> " : "") + (($("#order").prop("selectedIndex") != 1) ? "<span class='label'>" + data[i].country + "</span> " : "") + (($("#order").prop("selectedIndex") != 2) ? "<span class='label'>" + data[i].state + "</span> " : "");
        if (data[i].tags != "") { 
          for (z = 0; z < data[i].tags.split(",").length; z++) {
            results += "<span class='label'>" + data[i].tags.split(",")[z].trim() + "</span> ";
          }
        }
        else {
          results += "<br>";
        }
        results += "</div></div>";
      }
      sum++;
    }
    if (offset == 0) {
      $("#results").empty();
      $("#loadmore").show();
    }
    if (sum < 20) {
      searching = false;
      $("#loadmore").hide();
      if (sum + offset == 0) {
        results += "<p style='font-size: 18px; text-align: center'><i class='fa fa-fw fa-meh-o'></i>No matching stations found.</p>";
      }
    }
    else {
      searching = true;
    }
    $("#results").append(results);
    $("#results").show();
  });
}
var offset = 0;
var stationsearched;
function findStation(name) {
  offset = 0;
  stationsearched = name;
  $("#loadmore").show();
  loadEntries();
}
var prevcolor;
function changeColor() {
  var color;
  if (settings.theme == 3) {
    if (audio.paused) {
      color = "#333";
    }
    else {
      color = "hsl(" + currentstation.toUpperCase().charCodeAt(0) * 20 + ", 50%, 30%)";
    }
  }
  else {
    color = "";
  }
  if (color != prevcolor) {
    prevcolor = color;
    $("body").css({
      "background": color
    });
    $("body, input, button:not(#navbar > div > div > button), a:not(#loading > div > a), select").css({
      "color": color
    });
    $("#footer, #addfooter").css({
      "border-top-color": color
    });
    console.info("Style color set");
  }
}
var relaxed = false;
function relax() {
  if (!audio.paused && location.hash != "#dialog" && settings.relax) {
    relaxed = true;
    if (vinterval == undefined) {
      visualise();
    }
    $("body").addClass("relaxed");
    $("#station").css({
      "font-size": Math.sqrt($(window).width() * 1.2) + "pt"
    });
    console.info("Relax mode entered");
  }
}
function wakeUp() {
  if (relaxed) {
    relaxed = false;
    if (!settings.visualization) {
      stopV();
    }
    $("body").removeClass("relaxed");
    $("#station").css({
        "font-size": "18pt"
    });
    console.info("Relax mode left");
  }
}
function modal(id) {
  if (id != "hint") {
    $("#modals").css({
      transform: "scale(1)",
      opacity: 1,
      "pointer-events": "auto"
    });
    $("body").css({
      overflow: "hidden"
    });
  }
  if (id == "addstation") {
    browseCrb();
    $("#query").trigger("input");
    $("#loadmore").show();
    setTimeout(function() {
      $("#query").select();
    }, 100);
  }
  else if (id == "stationmanager") {
    refreshTags(currentlist[gearclicked].tags || "");
  }
  $("#modals").scrollTop(0);
  $("#" + id).show().addClass("shown");
  $("#modals > div:not(#" + id + ")").hide();
  if (id != "hint") {
    history.pushState(null, null, "#dialog");
  }
  wakeUp();
  console.info("Dialog with tag ID " + id + " shown");
}
function closeModal() {
  if ($(".shown").attr("id") == "listmanager") {
    applyLists();
  }
  else if ($(".shown").attr("id") == "stationmanager") {
    $("#customstations input").trigger("blur");
    if (validStation()) {
      stationUpdate(true);
    }
    else {
      hint("<i class='fa fa-exclamation-triangle'></i> Saving failed: Bad station data");
    }
  }
  $("#modals").css({
    transform: "scale(1.1)",
    opacity: 0,
    "pointer-events": "none"
  });
  $("body").css({
    overflow: "auto"
  });
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
    setTimeout(function() {
      $("#query").val("");
      $("#results").hide();
    }, 400);
  }
  $(".shown").removeClass("shown");
  clearTimeout(relaxtimer);
  if (settings.relax) {
    relaxtimer = setTimeout(function() {
      relax(); 
    }, settings["relax-timeout"] * 1000);
  }
  console.info("Dialog hidden");
}
var vinterval;
function visualise() {
  if (settings.visualization || relaxed) {
    vinterval = setInterval(function() {
        $("#visualization").children().each(function() {
            $(this).css({
                "top": Math.random() * 15 + 50 + "%"
            });
        });
    }, 100);
    console.info("Pseudo-visualization shown");
  }
}
function stopV() {
  if (vinterval != undefined) {
    clearInterval(vinterval);
    vinterval = undefined;
    $("#visualization").children().css({
        "top": "100%" 
    });
    console.info("Pseudo-visualization hidden");
  }
}
function toggle(on) {
  var icon = $("#stop").children();
  if (on) {
    icon
      .removeClass("fa-toggle-off")
      .addClass("fa-toggle-on");
  }
  else {
    icon
      .removeClass("fa-toggle-on")
      .addClass("fa-toggle-off");
  }
}
