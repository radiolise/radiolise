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
var allids;
var liking = false;
var searching = false;

const Network = {
  
  radioBrowser: {
    
    browse: function() {
      var items = ["countries", "states", "languages"];
      for (var i = 0; i < items.length; i++) (function(item) {
        var current = $("[data-type=" + item + "]");
        if (current.parent().prop("disabled")) {
          $.post("https://www.radio-browser.info/webservice/json/" + item, function(data) {
            var options = "<option value=''>" + tr("All ") + tr(item) + "</option>";
            for (var i in data) {
              options += "<option value='" + data[i].name + "'>" + data[i].name + "</option>";
            }
            current.html(options).parent().prop("disabled", false);
          }).fail(function() {
            current.html("<option value=\"\">" + tr("Request failed") + "</option>");
            $("#failmsg").slideDown();
          });
        }
      })(items[i]);
    },
    
    likeStation: function(id) {
      if (!liking && likes.indexOf(id) == -1) {
        liking = true;
        $.post("https://www.radio-browser.info/webservice/json/vote/" + id, function(data) {
          likes.push(id);
          Data.refresh();
          if (!player.paused && prevstation.id == id) {
            var likecount = $(".like").attr("title").split("\n").pop().split("+")[0];
            $(".like").attr("title", $(".like").attr("title").replace(likecount, ++likecount));
          };
          $.post("https://www.radio-browser.info/webservice/json/stations/byid/" + id, function(data) {
            UI.message(data[0].votes + "+" + tr(" people like this station.") + "<br>" + tr("Your like has been submitted to the Community Radio Browser."));
            $(".like").addClass("active");
            $(".likecounter").text(data[0].votes);
          });
        }).fail(function() {
          if (navigator.onLine) {
            UI.message(tr("Sorry, an error has occurred. Please try again later."));
          }
          else {
            UI.message(tr("Please make sure that you are online."));
          }
        }).always(function() {
          liking = false;
        });
      }
      else {
        $.post("https://www.radio-browser.info/webservice/json/stations/byid/" + id, function(data) {
          UI.message(data[0].votes + "+" + tr(" people like this station.") + "<br>" + tr("You have already voted."));
        });
      }
    },

    loadEntries: function(searchterm) {
      requesting = true;
      fetch = $.post("https://www.radio-browser.info/webservice/json/stations/search", {
        name: searchterm,
        offset: offset,
        limit: 20,
        country: $("#country").val(),
        state: $("#state").val(),
        language: $("#language").val(),
        order: $("#order").val(),
        reverse: ($("#order").prop("selectedIndex") < 5) ? $("#reverse").hasClass("checked") : !$("#reverse").hasClass("checked")
      }, function(data) {  
        $("#failure").hide();
        requesting = false;
        var sum = 0;
        var results = "";
        var icons = [null, "flag", "map-marker", "comment-alt fa-flip-horizontal", "file-audio", "play", "thumbs-up"];
        for (var i = 0; i < data.length; i++) {
          if ($("#showbroken").hasClass("checked") || data[i].lastcheckok == "1") {
            var available = true;
            for (var z in currentlist) {
              if (currentlist[z].id == data[i].id) {
                available = false;
                break;
              }
            }
            results += "<div style='cursor: pointer; display: table; table-layout: fixed; width: 100%" + ((available) ? "" : "; opacity: .5; cursor: not-allowed' title='" + tr("This station has already been added to ‘") + listname + tr("’.")) + "' data-meta='" + JSON.stringify(data[i]).replace(/'/g, "&apos;") + "' class='result'><div class='checkmark green' style='display: table-cell; opacity: 0; width: 0'><i class='fa fa-check' style='margin-left: 10px'></i></div><div style='padding: 10px; margin-bottom: 10px; display: table-cell'><h4 style='margin: 0'>" + ((available) ? "" : "<i class='fa fa-ban red'></i> ") + data[i].name + "</h4><br>" + ((data[i].lastcheckok == 0) ? "<span class='label red' style='font-weight: 500'>" + tr("BROKEN") + "</span> " : "") + (($("#order").prop("selectedIndex") > 0) ? "<span class='label green' style='font-weight: 500'><i class='fa fa-" + icons[$("#order").prop("selectedIndex")] + "'></i> " + (data[i][$("#order").val()] || "<i class='fa fa-question'></i>") + "</span> " : "") + ((+data[i].hls) ? "<span class='label'>HLS</span> " : ((+data[i].bitrate) ? "<span class='label'>" + data[i].bitrate + " kBit/s</span> " : "")) + (($("#order").prop("selectedIndex") != 1) ? "<span class='label'>" + data[i].country + "</span> " : "") + (($("#order").prop("selectedIndex") != 2) ? "<span class='label'>" + data[i].state + "</span> " : "");
            if (data[i].tags != "") { 
              for (var z = 0; z < data[i].tags.split(",").length; z++) {
                results += "<span class='label'>" + data[i].tags.split(",")[z].trim() + "</span> ";
              }
            }
            else {
              results += "<br>";
            }
            results += "</div></div>";
          }
          else {
            console.warn("'" + data[i].name + "' [" + (i + offset) + "] seems to be BROKEN.");
          }
          sum++;
        }
        if (offset == 0) {
          $("#results").empty();
          $("#loadmore").show();
        }
        $("#results").append(results);
        if (sum < 20) {
          searching = false;
          $("#loadmore").hide();
          if ($("#results > div").length == 0) {
            $("#results").html("<p style='font-size: 18px; text-align: center'><i class='far fa-fw fa-meh'></i>" + tr("No matching stations found.") + "</p>");
          }
        }
        else {
          searching = true;
        }
        clearInterval(closetimer);
        $("#results").show();
        console.info("Got " + $("#results > div").length + " results.");
        $("#modals").trigger("scroll");
      }).fail(function(event) {
        if (event.statusText != "abort") {
          searching = false;
          requesting = false;
          $("#loadmore").hide();
          $("#results").hide();
          $("#failure").show();
        }
      });
    }  
  
  },
  
  musicBrainz: {
    
    findAlbum: function(title, previd) {
      if (title.match(/ \/ | - |: /g)) {
        $.get("https://musicbrainz.org/ws/2/recording/?fmt=json&query=" + encodeURIComponent(title.replace(/ \/ | - |: /g, " AND ")), function(data) {
          if (data.count) {
            var release = data.recordings[0];
            var track = release.title;
            var artist = release["artist-credit"][0].artist.name;
            var ids = [];
            for (var i = 0; i < data.count; i++) {
              var recording = data.recordings[i];
              if (recording) {
                var releases = recording.releases || [];
                for (var z = 0; z < releases.length; z++) {
                  var item = releases[z];
                  var id = item["release-group"].id;
                  if (ids.indexOf(id) == -1 && previd != id && (!item["release-group"]["secondary-types"] || item["release-group"]["secondary-types"].indexOf("Soundtrack") != -1) && (title.toLowerCase().indexOf(item.media[0].track[0].title.toLowerCase()) != -1 && (recording.title == item.title || (!item["artist-credit"] || artist == item["artist-credit"][0].artist.name)))) {
                    ids.push(id);
                  }
                }
              }
            }
            Network.musicBrainz.requestCover(ids, track, false);
          }
          else {
            console.log("Nothing found");
          }
        }).fail(function() {
          console.log("It failed! Sorry…");
        });
      }
      else {
        console.log("Malformed title");
      }
    },
    
    requestCover: function(ids, title, firsttry) {
      console.log(ids);
      if (ids.length) {
        $.get("https://coverartarchive.org/release-group/" + ids[0], function(data) {
          console.log("SUCCESS");
          var source = data.images[0].thumbnails.large;
          for (var i = 0; i < data.images.length; i++) {
            if (data.images[i].front) {
              source = data.images[i].thumbnails.large;
              break;
            }
          }
          $("#vcontain").css({
            "background-image": "url(" + source + ")"
          });
        }).fail(function() {
          Network.musicBrainz.requestCover(ids.slice(1), title, firsttry);
        });
      }
      else if (firsttry) {
        Network.musicBrainz.findAlbum(title, allids);
      }
      else {
        console.log("Nothing found");
      }
    },
    
    coverart: false,
    
    getCoverArt: function(title) {
      if (Network.musicBrainz.coverart) {
        $("#vcontain").show();
        if (!title || title.toLowerCase().indexOf(currentstation.toLowerCase()) != -1) {
          console.log("Invalid song title");
          return;
        }
    //     $("#coverart img")[0].src = "";
        $("#coverart h3").text(title);
        var newtitle = title.replace(",", " ").replace(/[^feat.a-zA-Z\d!\s:\/-]/g, "*");
        $.get("https://musicbrainz.org/ws/2/release-group/?fmt=json&query=" + encodeURIComponent(newtitle.replace(/ \/ | - |: /g, " AND ")), function(data) {
          var ids = [];
          for (var i = 0; i < data.count; i++) {
            var group = data["release-groups"][i];
            if (group && group.score == 100 && (group["primary-type"] == "Single" || group["primary-type"] == "EP") && title.toLowerCase().indexOf(group["artist-credit"][0].artist.name.toLowerCase()) != -1) {
              ids.push(group.id);
            }
          }
          allids = ids;
          Network.musicBrainz.requestCover(ids, newtitle, true);
        }).fail(function() {
          console.log("It failed! Sorry…");
        });
      }
    }    
    
  }
  
}
