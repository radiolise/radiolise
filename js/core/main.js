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
function main() {
  $("[tr]").each(function() {
    $(this).html(tr($(this).html()));
  });
  $("[title]").each(function() {
    $(this).attr("title", tr($(this).attr("title")));
  });
  $("[label]").each(function() {
    $(this).attr("label", tr($(this).attr("label")));
  });
  $("[placeholder]").each(function() {
    $(this).attr("placeholder", tr($(this).attr("placeholder")));
  });
  defaultdata = "{\"lists\":{\"" + tr("Favorites") + "\":[]},\"settings\":" + defaultsettings + ",\"likes\":[],\"titles\":{\"history\":[],\"favorites\":[]}}";
  try {
    lists = JSON.parse(localStorage.data || defaultdata).lists;
  }
  catch (e) {
    lists = JSON.parse(defaultdata).lists;
  }
  try {localStorage}
  catch (e) {
    $("noscript")[0].outerHTML = $("noscript").text();
    $("#initfail h1").text(tr("Please enable offline storage!"));
    $("#initfail p").text(tr("Offline storage is used to ensure that application data (e.g. stations and settings) won’t get lost. This page does not collect any personal data. Third parties (broadcasters) might act differently."));
  }
  if (navigator.userAgent.indexOf("Trident") != -1 && !localStorage.try) {
    $("noscript")[0].outerHTML = $("noscript").text();
    $("#initfail h1").text(tr("Compatibility issues possible"));
    $("#initfail p").html(tr("Internet Explorer does not support some of the basic functionalities that this web application relies on.") + " <a href=\"#\" onclick=\"localStorage.try = '1'; location = location.href\">" + tr("Try anyway (may not work)") + "</a>");
  }
  listname = Object.keys(lists)[0];
  Data.settings.load();
  likes = JSON.parse(localStorage.data || defaultdata).likes || [];
  titles = JSON.parse(localStorage.data || defaultdata).titles || {"history":[],"favorites":[]};
  $("html").attr("lang", tr("en"));
  if (settings.language == "auto") {
    $("#locales [value=auto]").append(" (" + tr("en") + ")");
    detected = true;
  }
  nostream = tr("Ready");
  loading = "<i class='fa fa-spin fa-spinner'></i> " + tr("Loading…");
  console.info("Locale strings loaded");
  Player.update.setName(nostream);
  if (localStorage.lastList) {
    setList(localStorage.lastList);
  }
  $(".name").text(appname);
  $("#query").val(null);
  var hash = decodeURIComponent(location.hash);
  if (hash !== "") {
    switch (hash.substring(1)) {
      case "dialog":
        break;
      default:
        UI.hint.show("<b>" + tr("Invalid hashtag") + "</b><br><br> " + tr("‘") + hash + tr("’ is unknown."));
    }
    history.replaceState({}, document.title, ".");
  }    
  UI.adjust();
  $("select:has([data-type])").prop("disabled", true);
  applyLists();
  player.volume = settings.volume / 100;
  $("#volumeslider div").css({
    width: settings.volume + "%"
  });
  Data.list.sync(false);
  $("#relaxcaption").css({
    "font-size": Math.sqrt($(window).width() * 1.2) + "pt"
  });    
  function param(param) {
    if (param = (new RegExp("[?&]" + encodeURIComponent(param) + "=([^&]*)")).exec(location.search)) {
      return decodeURIComponent(param[1]);
    }
  }
  var source = param("src");
  var id = param("id");
  var keepoff = param("keepoff");
  var query = param("q");
  history.replaceState(null, null, ".");
  function autoStart() {
    if (!keepoff || keepoff == false) {
      for (var i in currentlist) {
        if (currentlist[i].id == id) {
          Player.stream.start(currentlist[i]);
        }
      }
    }
  }
  if (source) {
    setList(tr("Added via ") + source);
    if (id) {
      if (!Data.list.stationExists(id)) {
        $.post("https://www.radio-browser.info/webservice/json/stations/byid/" + id, function(data) {
          if (!lists[tr("Added via ") + source]) {
            lists[tr("Added via ") + source] = [];
          }
          applyLists();
          currentlist.push({"name":data[0].name,"url":data[0].url,"homepage":data[0].homepage,"icon":data[0].favicon,"country":data[0].country,"state":data[0].state,"language":data[0].language,"tags":data[0].tags,"id":data[0].id});
          UI.updateList(true);
          autoStart();
        }).fail(function() {
          UI.message(tr("Sorry, the station could not be added via ") + source + tr(" because a request failed."));
        });
      }
      else {
        autoStart();
      }
    }
    else if (query) {
      applyLists();
      setTimeout(function() {
        $("#query").val(query);
        UI.dialog.open("addstation");
      }, 0);
    }
  }
  $("#hidefooter").on("click", function() {
    $("#footer").css({
      top: "100%",
      visibility: "hidden"
    });
  });
  $("#chremove").on("click", function() {
    currentlist.splice(gearclicked, 1);
    UI.updateList(true);
    UI.dialog.close();
  });
  $("body").on("keydown", function(event) {
    if (event.which == 32 && location.hash != "#dialog") {
      event.preventDefault();
    }
  });
  var typing = false;
  var typetimer;
  $("body").on("keyup", function(event) {
    var key = event.key;
    clearTimeout(typetimer);
    if (!($("input").is(":focus") || event.ctrlKey || event.altKey || event.shiftKey || event.metaKey)) {
      switch (key) {
        case "-":
          Player.volume.change(false, true);
          break;
        case "+":
          Player.volume.change(true, true);
          break;
        case " ":
          if (!$(".stop").hasClass("disabled")) {
            UI.hint.show("<i style='font-size: 60px; margin: 16px 0' class='fa fa-" + (($(".stop i").hasClass("fa-play")) ? "play" : "stop") + "'></i>", true);
            $(".stop:first").trigger("click");
          }
          break;
        case "f":
          if ($(".fsdiv").css("display") != "none") {
            $(".fullscreen").trigger("click");
          }
          else {
            UI.hint.show("<i class='fa fa-exclamation-triangle'></i> " + tr("No video stream"));
          }
          break;
        case "p":
          $(".prevstation:first").trigger("click");
          UI.hint.show("<i style='font-size: 60px; margin: 16px 0' class='fa fa-step-backward'></i>", true);
          break;
        case "n":
          $(".nextstation:first").trigger("click");
          UI.hint.show("<i style='font-size: 60px; margin: 16px 0' class='fa fa-step-forward'></i>", true);
          break;
        default:
          if (!isNaN(key)) {
            var number = $("#hint span").html() || "";
            typetimer = setTimeout(function() {
              if ($("#hint span").length) {
                var digit = $("#hint span").html().replace(/–/g, "");
                typing = false;
                if (digit <= currentlist.length && digit > 0) {
                  UI.hint.hide();
                  Player.stream.start(currentlist[digit - 1]);
                }
                else {
                  UI.hint.show("<i class='fa fa-fw fa-exclamation-triangle'></i> " + tr("Station ") + +digit + tr(" doesn’t exist."));
                }
              }
            }, 2000);
            if (!typing || !number.match(/–/g)) {
              typing = true;
              var output = "";
              for (var i = 0; i < currentlist.length.toString().length - 1; i++){
                output += "–";
              }
              UI.hint.show("<span style='font-size: 32px'>" + key + output + "</span>", true, false);
            }
            else {
              $("#hint span").html(number.replace("–", key));
            }
          }
      }
    }
    if (location.hash == "#dialog" && key == "Escape") {
      history.back();
    }
  });
  $("[placeholder='" + tr("Tags") + "']").on("input", function() {
    UI.stationManager.refreshTagItems($(this).val());
  });
  $("#customstations input").on("blur", function() {
    if ($("[placeholder='Name']").val() && $("[placeholder='URL']").val()) {
      currentlist[gearclicked].name     = $("[placeholder='" + tr("Name")     + "']").val();
      currentlist[gearclicked].url      = $("[placeholder='" + tr("URL")      + "']").val();
      currentlist[gearclicked].homepage = $("[placeholder='" + tr("Homepage") + "']").val();
      currentlist[gearclicked].icon     = $("[placeholder='" + tr("Icon")     + "']").val();
      currentlist[gearclicked].country  = $("[placeholder='" + tr("Country")  + "']").val();
      currentlist[gearclicked].state    = $("[placeholder='" + tr("State")    + "']").val();
      currentlist[gearclicked].language = $("[placeholder='" + tr("Sprache")  + "']").val();
      currentlist[gearclicked].tags     = $("[placeholder='" + tr("Tags")     + "']").val();
      Data.list.sync(true);
      UI.updateList(true);
    }
    else {
      UI.hint.show("<i class='fa fa-exclamation-triangle'></i> " + tr("Saving failed: Bad station data"));
    }      
  });
  $("#done").on("click", function() {
    UI.dialog.close();
  });
  $(".menu").on("click", function() {
    UI.dialog.open("menu");
  });
  $(".wrench").on("click", function() {
    UI.dialog.open("listmanager");
  });
  $("#closesettings").on("click", function() {
    $('#discardsettings').trigger('click');
  });
  $(".stop").on("click", function() {
    var icon = $(this).children();
    if (icon.hasClass("fa-stop")) {
      Player.stream.stop();
      Player.update.setName(nostream);
    }
    else {
      if (prevstation != undefined) {
        Player.stream.start(prevstation);
      }
      else if (localStorage.lastStation) {
        Player.stream.start(JSON.parse(localStorage.lastStation));
      }
      else if (currentlist.length > 0) {
        Player.stream.start(currentlist[0]);
      }
      else {
        UI.hint.show("<i class='fa fa-fw fa-exclamation-triangle'></i>" + tr("Please add a station to the list first."));
      }
    }
  });
  $("#video .expand").on("click", function() {
    if ($("#infobox").is(":visible")) {
      $("#infobox").slideUp();
      $("#video .expand i").css({
        transform: "rotate(0deg)"
      });
      if ($("#video").hasClass("fs")) {
        $(".player > div").show();
      }
      else {
        $(".player > div:not(.fsdiv)").show();
      }
      $("#video .station").css({
        maxWidth: 0,
        whiteSpace: "nowrap"
      });      
    }
    else {
      $("#infobox").slideDown();
      $("#video .expand i").css({
        transform: "rotate(-180deg)"
      });      
      $(".player > div:not(.station, .fsdiv)").hide();
      $("#video .station").css({
        maxWidth: "none",
        whiteSpace: "normal"
      });
    }
    $(document).trigger("scroll");
  });
  $(":not(#video) .expand").on("click", function() {
    $("html").animate({
      scrollTop: 0
    });
    if ($("#infobox").is(":hidden")) {
      $("#video .expand").trigger("click");
    }
  });
  $(".station").on("click", function() {
    $(this).closest(".videobar").find(".expand").trigger("click");
  }); 
  $("#showrecent").on("click", function() {
    if ($("#recent").css("display") == "none") {
      UI.titleManager.insertList("history");
      $("#recent").slideDown();
      $("#showrecent i").css({
        transform: "rotate(-180deg)"
      });
      UI.titleManager.updateTimes();
    }
    else {
      $("#recent").slideUp();
      $(".reload").hide();
      $("#showrecent i").css({
        transform: "rotate(0deg)"
      });        
    }
  });
  $("#showbookmarks").on("click", function() {
    if ($("#favorites").css("display") == "none") {
      $("#favorites").slideDown();
      $("#showbookmarks i").css({
        transform: "rotate(-180deg)"
      });
    }
    else {
      $("#favorites").slideUp();
      $("#showbookmarks i").css({
        transform: "rotate(0deg)"
      });        
      UI.titleManager.updateTimes();
    }      
  });
  $(".reload a").on("click", function() {
    $(".reload").hide();
    $("#recent").fadeOut(function() {
      UI.titleManager.insertList("history");
      $("#recent").fadeIn()
    });
  });
  $(".download a").on("click", function() {
    var output = moment(new Date()).format("[# " + appname.toUpperCase() + " BOOKMARKS\n# As of:] L LT[\n\n]");
    for (var i = 0; i < titles.favorites.length; i++) {
      var item = titles.favorites[i];
      output += moment(item.time * 60).format("- L LT | [" + item.info + " (" + item.station + ")\n]");
    }
    $('#blob').attr('href', URL.createObjectURL(new Blob([output], {type: "text/plain"})));
    $('#blob').attr('download', "Bookmarks_" + (new Date).getTime() + ".txt");
    $('#blob')[0].click();    
  });
  $(".prevstation").on("click", function() {
    if (currentlist.length > 1) {
      var index = currentlist.indexOf(prevstation);
      if (index > 0) {
        Player.stream.start(currentlist[index - 1]);
      }
      else if (index >= 0) {
        Player.stream.start(currentlist[currentlist.length - 1]);
      }
    }
  });
  $(".nextstation").on("click", function() {
    if (currentlist.length > 1) {
      var index = currentlist.indexOf(prevstation);
      if (index >= 0 && index < currentlist.length - 1) {
        Player.stream.start(currentlist[index + 1]);
      }
      else if (index >= 0) {
        Player.stream.start(currentlist[0]);
      }
    }
  });
  $(".like").on("click", function() {
    Network.radioBrowser.likeStation(prevstation.id);
  });
  $(".showhistory").on("click", function() {
    UI.dialog.open("history");
  });
  $(".plushistory").on("click", function() {
    if (info && info != "<br>") {
      Data.createBookmark({
        station: currentstation,
        info: info,
        time: Math.floor(+new Date() / 60)
      });
    }
    else {
      UI.message("<i class='fa fa-exclamation-triangle'></i> Currently, there is no ‘Now playing’ information available.");
    }
  });
  $("#history").on("click", ".listitem", function() {
    $(this).siblings().find(".options").slideUp();
    $(this).find(".options").slideToggle();
  });
  $("#history").on("click", ".options", function(e) {
    e.stopPropagation();
  });  
  $("#external").on("click", function() {
    Player.stream.stop();
  });
  $("#vcontain").on("dblclick", function() {
    $(".fullscreen").trigger("click");
  });
  $("#video").on("mousedown mouseup mousemove", function() {
    Player.showVideoBar();
  });
  $("#tryfetch").on("click", function() {
    Network.radioBrowser.browse();
  });
  $("#redoajax").on("click", function() {
    Network.radioBrowser.loadEntries();
    UI.search.showLoadingInfo();
    $("#failure").hide();
  });
  $(".minus").on("click", function() {
    Player.volume.change(false);
  });
  $(".plus").on("click", function() {
    Player.volume.change(true);
  });
  $(".fullscreen").on("click", function() {
    var video = $("#video")[0];
    if ($(".fullscreen i").hasClass("fa-expand")) {
      if (video.requestFullscreen) {
        video.requestFullscreen();
      }
      else if (video.msRequestFullscreen) {
        video.msRequestFullscreen();
      }
      else if (video.mozRequestFullScreen) {
        video.mozRequestFullScreen();
      }
      else if (video.webkitRequestFullscreen) {
        video.webkitRequestFullscreen();
      }
      if ($("#infobox").is(":visible")) {
        $("#video .expand").trigger("click");
      }
    }
    else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      }
      else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
      $("#video").removeClass("fs")
    }
  });
  $("video").on("contextmenu", function() {
    return false;
  });
  function fullscreenChange() {
    if (document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement) {
      $(".fullscreen i").removeClass("fa-expand").addClass("fa-compress");
      $("#video").addClass("fs");
      $("#hint").prependTo("#video");
      console.info("Entered fullscreen");
    }
    else {
      $(".fullscreen i").removeClass("fa-compress").addClass("fa-expand");
      $("#video").removeClass("fs");
      $("#hint").insertAfter("#modals");
      clearTimeout(bartimer);
      console.info("Left fullscreen");
    }
    Player.showVideoBar();
    $(document).trigger("scroll");
  }
  $(document).on("fullscreenchange", fullscreenChange).on("webkitfullscreenchange", fullscreenChange).on("mozfullscreenchange", fullscreenChange);
  $(window).on("hashchange", function() {
    if (location.hash === "" && $(".shown").length == 1) {
      UI.dialog.close();
    }
  }).on("dragstart", function() {
      return false;
  }).on("mousemove mousedown keydown touchstart", function() {
    if (settings.relax) {
      clearTimeout(relaxtimer);
      Effects.relaxMode.leave();
      relaxtimer = setTimeout(function() {
        Effects.relaxMode.enter(); 
      }, settings["relax-timeout"] * 1000);
    }
  }).on("resize", function() {
    $("#relaxcaption").css({
      "font-size": Math.sqrt($(window).width() * 1.2) + "pt"
    });
    if (relaxed) {
      Effects.relaxMode.enter();
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
    $(document).trigger("scroll");
  });
  $("#findstation").on("click", function() {
    if (searching) {
      UI.search.showLoadingInfo();
      $("#modals").finish().animate({
        scrollTop: $("#query").offset().top - $(window).scrollTop() + $("#modals").scrollTop()
      });
    }
  });
  $("#country").on("change", function() {
    $("#state").val("");
    UI.search.refreshResults();
    $.post("https://www.radio-browser.info/webservice/json/states", {
      country: $("#country").val()
    }, function(data) {
      var options = "<option value=''>" + tr("All ") + tr("states") + "</option>";
      for (var i in data) {
        options += "<option value='" + data[i].name + "'>" + data[i].name + "</option>";
      }
      $("[data-type=states]").html(options);
    }).fail(function() {
      $("[data-type=states]").html("<option value=\"\">" + tr("Request failed") + "</option>");
      $("#failmsg").slideDown();
    });
  });
  $("#addstation select:not(#country)").on("change", UI.search.refreshResults);
  $("#moreoptions a").on("click", function() {
    if ($("#filters").css("display") == "none") {
      $("#filters").stop().slideDown();
      $("#moreoptions span").text(tr("Hide options"));
      $("#moreoptions i").css({
        transform: "rotate(-180deg)"
      });
    }
    else {
      $("#filters").stop().slideUp();
      $("#moreoptions span").text(tr("Show options"));
      $("#moreoptions i").css({
        transform: "rotate(0deg)"
      });
    }
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
      offset = 0;
      $("#loadmore").show();
      Network.radioBrowser.loadEntries($("input").val().trim().replace(/\s+/g, " "));
      $("#findstation").removeClass("disabled");
      $(".selected").trigger("click");
      $("#loadmore").hide();
    }).on("focus", function() {
      $(this).parent().css({
        background: "rgba(0, 0, 0, .1)"
      });
    }).on("blur", function() {
      UI.search.showLoadingInfo();
      $(this).parent().css({
        background: ""
      });
    });
  $("form").on("submit", function(event) {
      event.preventDefault();
  });
  $("#addlist").on("click", addList);
  $(".closer").on("click", function() {
    UI.dialog.close();
  });
  $("#modals > div").on("click", function(event) {
    event.stopPropagation();
  });
  $(".addbutton").on("click", function() {
    UI.dialog.open("addstation");
  });
  $(".settingsbutton").on("click", function() {
    UI.dialog.open("settings");
  });
  $(".learnmorebutton").on("click", function() {
    UI.dialog.open("learnmore");
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
      Data.settings.save();
      UI.dialog.close();
    }
    else {
      UI.message(tr("At least one invalid number input has been detected."));
    }
  });
  $("#discardsettings").on("click", function() {
    settings = JSON.parse(localStorage.data || defaultdata).settings;
    Data.settings.load();
    UI.dialog.close();
  });
  $("#reset").on("click", function() {
    settings = JSON.parse(defaultsettings);
    Data.settings.load();
    Data.settings.save();
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
    if ($(this).is("#reverse") || $(this).is("#showbroken")) {
      UI.search.refreshResults();
    }
    if ($(this).css("opacity") == .5) {
      UI.hint.show("<i class='fa fa-exclamation-triangle'></i> " + tr("Screen or window not wide enough") + ".");
    }
  }).on("select", function() {
    return false;
  });
  $("#listdl").on("change", function() {
    if ($(this).val() != "cancel") {
      var output;
      var type;
      switch ($(this).val()) {
        case "m3u":
          output = "#EXTM3U\n";
          type = "audio/mpegurl";
          currentlist.forEach(function(item) {
            output += "#EXTINF:-1," + item.name + "\n" + item.url + "\n";
          });
          break;
        case "pls":
          output = "[playlist]\n";
          type = "audio/x-scpls";
          currentlist.forEach(function(item, index) {
            output += "File" + ++index + "=" + item.url + "\nTitle" + index + "=" + item.name + "\n";
          });
          output += "Version=2\n";
          break;
        case "xspf":
          output = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<playlist version=\"1\" xmlns=\"http://xspf.org/ns/0/\">\n  <trackList>\n";
          type = "application/xspf+xml";
          currentlist.forEach(function(item, index) {
            output += "    <track>\n      <title>" + item.name + "</title>\n      <location>" + item.url + "</location>\n    </track>\n";
          });
          output += "  </trackList>\n</playlist>\n";
      }  
      $("#blob").attr("href", URL.createObjectURL(new Blob([output], {type: type})));
      $("#blob").attr("download", listname.replace(/ /g, "_") + "_" + (new Date).getTime() + "." + $(this).val());
      $("#blob")[0].click();
    }
    $(this).val("icon");
  });
  $("input[type=file]").on("change", function(event) {
    var file = event.target.files[0];
    var reader = new FileReader;
    reader.readAsText(file);
    reader.onload = function(event) {
      settings = JSON.parse(event.target.result);
      Data.settings.load();
      Data.settings.save();
      UI.hint.show(tr("Import successful."));
    }
    reader.onerror = function() {
      UI.message(tr("Error reading file."));
    }
    $(this).val("");
  });
  $("#import").on("click", function() {
    $("input[type=file]").trigger("click");
  });
  $("#export").on("click", function() {
    Data.settings.save();
    $("#blob").attr("href", URL.createObjectURL(new Blob([JSON.stringify(settings)], {type: "application/json"})));
    $("#blob").attr("download", "Settings_" + (new Date).getTime() + ".json");
    $("#blob")[0].click();
  });
  $(".minus, .plus, #volumeslider").on("DOMMouseScroll", function(event) {
    event.preventDefault();
    Player.volume.change(event.originalEvent.detail < 0);
  }).on("mousewheel", function(event) {
    event.preventDefault();
    Player.volume.change(event.originalEvent.wheelDelta > 0);
  });  
  $("#theme").on("change", UI.settings.toggleThemeDescription);
  $(document).on("scroll", function(event) {
    $(window).trigger("mousemove");
    if ($("#video").offset().top + $("#video").outerHeight() - $(".videobar").outerHeight() - $(window).scrollTop() <= 50 && !$("#video").hasClass("fs")) {
      $("body").addClass("fixedplayer");
    }
    else {
      $("body").removeClass("fixedplayer");
    }
  });
  $(document).trigger("scroll");
  $("#modals").on("scroll", function() {
    if (searching && $("#addstation").hasClass("shown") && $("#loadmore").offset().top - $(window).height() - $(window).scrollTop() < 0) {
      searching = false;
      offset += 20;
      Network.radioBrowser.loadEntries();
    }
  });
  $("#lists").on("change", function() {
    if ($(this).prop("selectedIndex") == $("#lists > optgroup > option").length) {
      setList(listname);
      UI.dialog.open("listmanager");
      $("#listul").empty();
      for (var key in lists) {
        $("#listul").append("<li>" + key + "</li>");
      }
    }
    else {
      setList($(this).val());      
    }
  });
  $(document).on("mousedown", ".smartmenu", function() {
    dragging = false;
    $("#tomove").hide();   
  }).on("change", ".smartmenu", function() {
    gearclicked = $(this).index("#stations .smartmenu");
    switch ($(this).val()) {
      case "homepage":
        open(currentlist[gearclicked].homepage, "_blank");
        break;
      case "like":
        Network.radioBrowser.likeStation(currentlist[gearclicked].id);
        break;
      case "edit":
        UI.dialog.open("stationmanager");        
        break;
      case "moveup":
        Data.moveArrayIndex(currentlist, gearclicked, gearclicked - 1);
        UI.updateList(true);
        break;
      case "movedown":
        Data.moveArrayIndex(currentlist, gearclicked, gearclicked + 1);
        UI.updateList(true);
        break;
      case "delete":
        var stationbackup = currentlist.slice();
        var victim = currentlist[gearclicked].name;
        currentlist.splice(gearclicked, 1);
        UI.updateList(true);    
        Data.offerUndeletion(tr("Station named ‘") + victim + tr("’ has been removed."), stationbackup, "currentlist", function() {
          UI.updateList(true);
        });          
    }
    $(this).val("icon");
  });
  $("#addchecked").on("click", function() {
    $(".selected").each(function(index) {
      var meta = $(this).data("meta");
      currentlist.push({"name":meta.name,"url":meta.url,"homepage":meta.homepage,"icon":meta.favicon,"country":meta.country,"state":meta.state,"language":meta.language,"tags":meta.tags,"id":meta.id});
    });
    UI.updateList(true);
    UI.dialog.close();
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
            UI.hint.show(tr("New list named ‘") + name + tr("’ created"));
          }
          if ($("#lists").val() == oldname) {
            listname = name;
          }
          applyLists();      
        }
        else {
          UI.hint.show(tr("Invalid name"));   
          applyLists();
        }
      }
      else {
        UI.hint.show(tr("Already existing"));
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
    else if (!Data.list.stationExists($(this).data("meta").id)) {
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
      UI.message(tr("‘") + $(this).data("meta").name + tr("’ has already been added to ‘") + listname + tr("’."));
    }
    if ($(".selected").length != 1) {
      $("#stationcount").html($(".selected").length + tr(" stations"));      
    }
    else {
      $("#stationcount").html(tr("‘") + $(".selected").data("meta").name + tr("’"));      
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
  var moving = false;
  $("#volumeslider").on("mousedown touchstart", function(e) {
    moving = true;
    Player.volume.moveSlider(e);
  });
  var dragging = false;
  var dragindex;
  var row;
  var cursor;
  var newcursor;
  var newindex;
  $("#stations").on("mousedown", "tr", function(e) {
    dragging = true;
    dragindex = $(this).index();
    newindex = dragindex;
    row = $(this);
    $("#tomove").html(row[0].outerHTML.replace(/id=/g, ""));
    cursor = e.pageY;
    $("#tomove").css({
      height: row.height(),
      width: row.width(),
      left: row.offset().left,
      top: row.offset().top - $(window).scrollTop()
    });
  });
  var moveinterval;
  $(document).on("mousemove touchmove", function(e) {
    if (dragging) {
      $("html").addClass("dragging");
      $("#tomove").show();
      clearInterval(moveinterval);
      moveinterval = undefined;
      newcursor = e.pageY;
      var setIndex = function(y) {
        newindex = Math.floor((y - $("#stations").offset().top) / $("#stations tr").height());
        if (newindex < 0) {
          newindex = 0;
        }
        else if (newindex >= $("#stations tr").length) {
          newindex = $("#stations tr").length - 1;
        }
        $("#stations tr").removeClass("hovered");
        $("#stations tr:nth-child(" + (newindex + 1) + ")").addClass("hovered");
        var newtop = row.offset().top + y - cursor - $(window).scrollTop();
        var mintop = $("#stations").offset().top - $(window).scrollTop();
        var maxtop = $("#stations").offset().top + $("#stations").height() - $("#tomove").height() - $(window).scrollTop();
        if (newtop < mintop) {
          $("#tomove").css({
            transform: "translateY(" + (mintop - newtop) + "px)"
          });
        }
        else if (newtop > maxtop) {
          $("#tomove").css({
            transform: "translateY(" + (maxtop - newtop) + "px)"
          });
        }
        else {
          $("#tomove").css({
            transform: ""
          });
        }
        $("#tomove").css({
          top: newtop
        });
      }
      var position = parseInt($("#tomove").css("top"), 10);
      if (position <= 50 + $(".videobar").outerHeight()) {
        moveinterval = setInterval(function() {
          $(window).scrollTop($(window).scrollTop() - 20);
          newcursor -= 20;
          setIndex(newcursor);
        }, 10);
      }
      else if ($(window).height() - position - $("#tomove").height() <= 0) {
        moveinterval = setInterval(function() {
          $(window).scrollTop($(window).scrollTop() + 20);
          newcursor += 20;
          setIndex(newcursor);
        }, 10);
      }
      else {
        setIndex(newcursor);
      }
    }
    else if (moving) {
      Player.volume.moveSlider(e);
    }
  }).on("mouseup touchend", function(e) {
    $("html").removeClass("dragging");
    if (dragging) {
      dragging = false;
      clearInterval(moveinterval);
      moveinterval = undefined;
      $("#tomove").hide();
      $("#tomove").empty();
      if (newindex != dragindex) {
        Data.moveArrayIndex(currentlist, dragindex, newindex);
        UI.updateList(true);
      }
      $("#stations tr").removeClass("hovered");
    }
    else if (moving) {
      moving = false;
    }
  }).on("click", "#stations tr", function() {
    if ($(this).hasClass("playing")) {
      $(".stop:first").trigger("click");
    }
    else {
      Player.stream.start(currentlist[$(this).index()]);
    }
  }).on("click", "#stations td:nth-child(3)", function(e) {
    e.stopPropagation();
  }); 
}
