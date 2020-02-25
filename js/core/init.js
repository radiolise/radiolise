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

window.onunload = Player.stream.stop;
function tr(string) {
  return i18next.t(string);
}
window.onoffline = function() {
  if (!player.paused) {
    UI.message(
      tr("Oh no! The stream was interrupted due to a sudden disconnect.")
    );
  }
  Player.stream.stop();
  Player.update.setName(nostream);
};
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}
var defaultsettings =
    '{"theme":4,"visualization":false,"relax":false,"relax-timeout":10,"changecolor":false,"volume":100,"transitions":true,"loadpolicy":true,"language":"auto"}',
  lists,
  settings,
  currentstation,
  prevdata,
  prevvolume,
  prevstation,
  defaultdata,
  loading,
  gearclicked,
  hinttimer,
  volumetimer,
  volumerequest,
  slow,
  timedout,
  relaxtimer,
  currentlist,
  likes,
  titles,
  player = $("video")[0],
  appname = $("title").text(),
  visible = false,
  fetch,
  nostream,
  listsbackup = {},
  listname,
  ismousedown = false,
  metarequest,
  timeupdater;
console.log(
  "%c Welcome to " + appname + "! ",
  "font-size: 30px; background-color: #ccc; color: #000; font-family: sans-serif"
);
console.log("%c > and Happy Hacking!_", "font-size: 20px");
console.log(
  "%c\nhttps://gitlab.com/radiolise/radiolise.gitlab.io\n\n",
  "font-family: sans-serif; font-size: 14px"
);
console.info(
  "%c" +
    appname +
    " is free software, and you are welcome to redistribute it under certain conditions; type%c learnMore() %cfor details.",
  "font-size: 14px; font-family: sans-serif",
  "font-size: 14px",
  "font-size: 14px; font-family: sans-serif"
);
player.onpause = function() {
  Player.stream.stop();
  Player.update.setName(nostream);
};
player.onplay = function() {
  if (player.getAttribute("src") == null) {
    $(".stop:first").trigger("click");
  }
};
$("title").text(appname);
var hls = new Hls();
var errormessage;
hls.on(Hls.Events.MANIFEST_PARSED, function() {
  UI.hint.hide();
  player.play();
});
hls.on(Hls.Events.ERROR, function(_, data) {
  Player.stream.stop();
  Player.update.setName(nostream);
  UI.message(
    tr("Sorry, an error has occurred. ") +
      (Hls.isSupported()
        ? data.details != "levelLoadTimeOut"
          ? data.details
          : tr(
              "Timeout: Your network connection seems to be too slow at the moment."
            )
        : tr(
            "The stream may need a protocol like HLS, which doesn’t seem to be supported by your browser."
          ))
  );
});
function setList(name) {
  $("#lists").val(name);
  if (listname != name) {
    listname = name;
    Data.list.sync(false);
    localStorage.lastList = name;
  }
}
function addList() {
  if ($('[data-item=""]').length == 0) {
    appendList("");
  }
  $('div[data-item=""] > input')
    .attr("placeholder", tr("Please specify a name"))
    .select();
  var yposition =
    $('div[data-item=""]').offset().top +
    $("#modals").scrollTop() -
    $("body").scrollTop();
  $("#modals").animate({
    scrollTop: yposition
  });
}
function removeList(name) {
  var listbackup = JSON.stringify(lists);
  delete lists[name];
  applyLists();
  if (name == listname) {
    setList($("#lists > optgroup > option").html());
  }
  Data.offerUndeletion(
    tr("List named ‘") + name + tr("’ has been removed."),
    listbackup,
    "list",
    applyLists
  );
}
function renameList(oldname) {
  $('div[data-item="' + oldname + '"] > .itemname').focus();
}
function applyLists() {
  Data.refresh();
  $("#listdiv").empty();
  $("#lists > optgroup").empty();
  for (var list in lists) {
    $("#lists > optgroup").append("<option>" + list + "</option>");
    appendList(list);
  }
  $("#lists").val(listname);
}
function appendList(name) {
  var input = document.createElement("input");
  input.setAttribute("class", "itemname");
  input.setAttribute("placeholder", tr("New name"));
  input.setAttribute("value", name);
  var div = document.createElement("div");
  div.setAttribute("data-item", name);
  div.setAttribute("style", "display: table-row");
  div.innerHTML =
    input.outerHTML +
    "<div style='display: table-cell; white-space: nowrap'><a class='renamelist' onclick='renameList($(this).closest(\"[data-item]\").data(\"item\"))'><i class='fa fa-fw fa-edit'></i></a><a class='okay' style='display: none'><i class='fa fa-fw fa-check'></i></a>" +
    (name != "" && Object.keys(lists).length > 1
      ? "<a onclick='removeList($(this).closest(\"[data-item]\").data(\"item\"))'><i class='fa fa-fw fa-trash'></i></a>"
      : "") +
    "</div>";
  $("#listdiv").append(div);
}
var languages = [];
try {
  settings = JSON.parse(
    localStorage.data || '{"settings":' + defaultsettings + "}"
  ).settings;
} catch (e) {
  settings = JSON.parse(defaultsettings);
}
var prevlanguage = settings.language || "auto";
var language = prevlanguage;
if (language == "auto") {
  language = navigator.language.substring(0, 2);
  if (navigator.languages != undefined) {
    languages = navigator.languages.slice();
    $.each(languages, function(i, item) {
      languages[i] = item.substring(0, 2);
    });
    languages = Array.from(
      new Set(
        languages.slice(
          0,
          languages.includes("en") ? languages.indexOf("en") : Infinity
        )
      )
    );
  }
}
var detected = false;
i18next.use(i18nextXHRBackend).init(
  {
    lng: language != "en" ? language : null,
    fallbackLng: languages,
    nsSeparator: null,
    keySeparator: null,
    backend: {
      loadPath: "locales/{{lng}}.json?v=3"
    }
  },
  main
);
