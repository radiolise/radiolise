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

var hasvideo;
var updatetimer;
var info;
var bartimer;

const Player = {
  volume: {
    change: function(increase, showhint) {
      var newvol = player.volume;
      if (increase) {
        newvol += 0.1;
      } else {
        newvol -= 0.1;
      }
      if (newvol > 1) {
        newvol = 1;
      } else if (newvol < 0) {
        newvol = 0;
      }
      player.volume = newvol.toFixed(1);
      var rvolume = player.volume * 100;
      if (showhint) {
        UI.hint.show(
          "<i style='font-size: 60px' class='fa fa-volume-" +
            (rvolume > 0 ? "up" : "off") +
            "'></i><div style='font-size: 25px'>" +
            (rvolume > 0 ? rvolume + "%" : tr("Off")) +
            "</div>",
          true
        );
      }
      $("#volumeslider div").css({
        width: rvolume + "%"
      });
    },

    moveSlider: function(e) {
      e.preventDefault();
      var volume = +(
        ((e.type.startsWith("touch") ? e.changedTouches[0].pageX : e.pageX) -
          $("#volumeslider").offset().left) /
        $("#volumeslider").width()
      ).toFixed(2);
      if (volume < 0) {
        volume = 0;
      } else if (volume > 1) {
        volume = 1;
      }
      player.volume = volume;
      $("#volumeslider div").css({
        width: (volume * 100).toFixed() + "%"
      });
    }
  },

  update: {
    setName: function(newstation) {
      if (prevdata != newstation) {
        $(".broadcaster").attr("title", newstation);
        if (newstation == nostream) {
          newstation = nostream;
          $("#tags").slideUp();
          $(".like, .homepage, .plushistory").each(function() {
            if ($(this).closest("#infobox").length) {
              $(this).slideUp();
            } else {
              $(this).hide();
            }
          });
          $("title").html(appname);
          Effects.changeColor();
          Effects.visualization.disable();
          Effects.relaxMode.leave();
          $(".stop")
            .children()
            .removeClass("fa-stop")
            .addClass("fa-play");
        } else {
          if (newstation != loading) {
            $("title").html(newstation + " - " + appname);
            currentstation = newstation;
            Effects.changeColor();
            if (vinterval == undefined) {
              Effects.visualization.enable();
            }
            if (settings.relax) {
              clearTimeout(relaxtimer);
              relaxtimer = setTimeout(function() {
                Effects.relaxMode.enter();
              }, settings["relax-timeout"] * 1000);
            }
          }
          $(".stop")
            .children()
            .removeClass("fa-play")
            .addClass("fa-stop");
        }
        $(".broadcaster").css({
          opacity: 0
        });
        setTimeout(function() {
          $(".broadcaster, #relaxcaption div:eq(0)")
            .html(newstation)
            .css({
              opacity: 1
            });
        }, 400);
        prevdata = newstation;
      }
    },

    setInfo: function(newinfo) {
      if (newinfo != info) {
        $(".info").attr("title", newinfo);
        $(".info").css({
          opacity: 0
        });
        setTimeout(function() {
          $(".info, #relaxcaption div:eq(1)")
            .html(newinfo)
            .css({
              opacity: 1
            });
        }, 400);
        if (newinfo != "<br>") {
          $("#vcontain").css({
            "background-image": ""
          });
          Network.musicBrainz.getCoverArt(newinfo);
          $(".info").slideDown();
          if (newinfo) {
            $(".plushistory").each(function() {
              if ($(this).closest("#infobox").length) {
                $(this).slideDown();
              } else {
                $(this).show();
              }
            });
            for (var i = 0; i < titles.history.length; i++) {
              if (
                titles.history[i].station == currentstation &&
                titles.history[i].info == newinfo
              ) {
                titles.history.splice(i, 1);
              }
            }
            if (titles.history.length == 5) {
              titles.history.splice(0, 1);
            }
            titles.history.push({
              station: currentstation,
              info: newinfo,
              time: Math.floor(+new Date() / 60)
            });
            Data.refresh();
            var current = titles.favorites[titles.favorites.length - 1];
            if (
              !current ||
              current.station != currentstation ||
              current.info != newinfo
            ) {
              $(".plushistory").removeClass("active");
            } else {
              $(".plushistory").addClass("active");
            }
            if (
              $("#recent").is(":visible") &&
              JSON.stringify(titles.history) != $("#recent").data("content")
            ) {
              $(".reload").show();
            }
          } else {
            $(".plushistory").each(function() {
              if ($(this).closest("#infobox").length) {
                $(this).slideUp();
              } else {
                $(this).hide();
              }
            });
          }
        } else {
          $("#vcontain").hide();
          $(".info").slideUp();
        }
        info = newinfo;
      }
    }
  },

  stream: {
    start: function(index) {
      const showBuffering = function() {
        Player.update.setName(
          "<i class='fa fa-spin fa-spinner'></i> " + tr("Loading…")
        );
      };
      Player.stream.stop();
      showBuffering();
      $("body").css({
        scrollTop: 0
      });
      UI.assignStatePlaying(index);
      $("#tags").html(
        "<span class='label'>" +
          index.country.trim() +
          "</span> <span class='label'>" +
          index.state.trim() +
          "</span> "
      );
      var tags = index.tags.split(",");
      for (var i in tags) {
        $("#tags").append("<span class='label'>" + tags[i].trim() + "</span> ");
      }
      $("#tags").slideDown();
      $(".like, .homepage").each(function() {
        if ($(this).closest("#infobox").length) {
          $(this).slideDown();
        } else {
          $(this).show();
        }
      });
      $(".homepage")
        .attr("href", index.homepage)
        .attr(
          "title",
          tr("Visit homepage") + "\n" + new URL(index.homepage).hostname
        );
      if (likes.indexOf(index.id) != -1) {
        $(".like").addClass("active");
      }
      $.post(
        "https://www.radio-browser.info/webservice/json/stations/byid/" +
          index.id,
        function(data) {
          $(".like").attr(
            "title",
            tr("Like") +
              "\n" +
              data[0].votes +
              "+" +
              tr(" people like this station.")
          );
          $(".likecounter").text(data[0].votes);
        }
      );
      player.ontimeupdate = function() {
        if (hasvideo != player.videoHeight > 0) {
          hasvideo = player.videoHeight > 0;
          if (player.videoHeight > 0) {
            $("#vcontain").show();
            $(".fsdiv").show();
            $(document).trigger("scroll");
            Effects.relaxMode.leave();
          } else {
            $("#vcontain").hide();
          }
        }
      };
      player.onloadedmetadata = function() {
        prevstation = index;
        localStorage.lastStation = JSON.stringify(index);
        Player.update.setName(index.name);
        var post = function() {
          metarequest = $.post(
            "https://service.radiolise.com/",
            {
              url: player.src
            },
            function(data) {
              var name = data.name || index.name;
              Player.update.setName(name);
              if (
                data.title ||
                !$("<div/>")
                  .html(info)
                  .text()
              ) {
                var description = data.title || data.description || "";
                if (name.toLowerCase() != description.toLowerCase()) {
                  Player.update.setInfo(description);
                } else {
                  Player.update.setInfo("<br>");
                }
              }
            }
          ).always(function() {
            if (!updatetimer) {
              updatetimer = setTimeout(function() {
                updatetimer = undefined;
                post();
              }, 10000);
            }
          });
        };
        post();
        $("#external").attr("href", index.url);
        $("#external").show();
        console.info("Started streaming '" + index.name + "'");
      };
      player.onwaiting = function() {
        if (prevdata != loading) {
          UI.hint.show("load");
        }
      };
      player.oncanplay = function() {
        UI.hint.hide();
      };
      player.load();
      var play = function(url) {
        if (!url) {
          url = "";
        }
        if (navigator.onLine) {
          if (
            (function(url) {
              if (!url) {
                return "";
              }
              var index = url.lastIndexOf("/");
              if (index !== -1) {
                url = url.substring(index + 1);
              }
              index = url.indexOf("?");
              if (index !== -1) {
                url = url.substring(0, index);
              }
              index = url.indexOf("#");
              if (index !== -1) {
                url = url.substring(0, index);
              }
              index = url.lastIndexOf(".");
              return index !== -1 ? url.substring(index + 1) : "";
            })(url) == "m3u8"
          ) {
            showBuffering();
            hls.loadSource(
              location.protocol == "https:"
                ? url.replace("http:", "https:")
                : url
            );
            hls.attachMedia(player);
          } else {
            player.setAttribute(
              "src",
              "https://service.radiolise.com/?url=" +
                encodeURIComponent(url) +
                "&play=1"
            );
            player.play().catch(function(e) {
              errormessage = e.message;
              Player.stream.stop();
              if (e.name != "AbortError") {
                if (e.name == "NotAllowedError") {
                  UI.message(
                    tr("User gesture seems to be required. Click on ‘") +
                      index.name +
                      tr("’ to start the stream.")
                  );
                  Player.update.setName(nostream);
                } else if (!url.endsWith("/;")) {
                  if (url != index.url) {
                    play(index.url);
                  } else {
                    play((url + "/;").replace("//;", "/;"));
                  }
                  UI.assignStatePlaying(index);
                } else {
                  UI.message(
                    tr("Sorry, an error has occurred. ") + errormessage
                  );
                  Player.update.setName(nostream);
                }
              } else {
                Player.update.setName(nostream);
              }
            });
          }
        } else {
          Player.stream.stop();
          Player.update.setName(nostream);
          UI.message(tr("Please make sure that you are online."));
        }
      };
      if (index.id) {
        $.post(
          "https://www.radio-browser.info/webservice/v2/json/url/" + index.id,
          function(data) {
            play(data.url);
          }
        ).fail(function() {
          play(index.url);
        });
      } else {
        play(index.url);
      }
    },

    stop: function() {
      $("#vcontain").hide();
      $(".fsdiv").hide();
      $(".like").removeClass("active");
      $(".plushistory").each(function() {
        if ($(this).closest("#infobox").length) {
          $(this).slideUp();
        } else {
          $(this).hide();
        }
      });
      $(document).trigger("scroll");
      hasvideo = false;
      if ($(".fullscreen i").hasClass("fa-compress")) {
        $(".fullscreen").trigger("click");
      }
      hls.detachMedia();
      hls.stopLoad();
      if (
        $(".stop")
          .children()
          .hasClass("fa-stop")
      ) {
        console.info("Stopped streaming");
      }
      UI.assignStatePlaying(null);
      if ($("#hint").find(".fa-spinner").length) {
        UI.hint.hide();
      }
      player.onerror = null;
      player.removeAttribute("src");
      player.load();
      Effects.visualization.disable();
      Player.update.setInfo("<br>");
      if (metarequest) {
        metarequest.abort();
      }
      clearTimeout(updatetimer);
      updatetimer = undefined;
    }
  },

  showVideoBar: function() {
    clearTimeout(bartimer);
    $(".videobar, .stationdiv")
      .finish()
      .show();
    $("#video").css({
      cursor: "auto"
    });
    if (player.videoHeight > 0 && $("#video").hasClass("fs")) {
      bartimer = setTimeout(function() {
        $(".videobar, .stationdiv").fadeOut();
        $("#video").css({
          cursor: "none"
        });
      }, 3000);
    }
  }
};
