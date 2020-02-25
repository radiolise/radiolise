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

var prevcolor,
  relaxed = false,
  vinterval;

const Effects = {
  changeColor: function () {
    var color =
      (settings.changecolor || settings.theme == 3) && !player.paused
        ? "hsl(" +
        currentstation.toUpperCase().charCodeAt(0) * 20 +
        ", 50%, 60%)"
        : "";
    if (color != prevcolor) {
      prevcolor = color;
      $("body").css({
        background: color.replace("60%", "30%")
      });
      $("body")[0].style.setProperty("--themecolor", color);
      console.info("Style color set");
    }
  },

  relaxMode: {
    enter: function () {
      if (
        prevdata != nostream &&
        prevdata != loading &&
        location.hash != "#dialog" &&
        settings.relax &&
        player.videoHeight == 0
      ) {
        relaxed = true;
        if (vinterval == undefined) {
          Effects.visualization.enable();
        }
        $("body")
          .addClass("relaxed")
          .css({
            background:
              "hsl(" +
              currentstation.toUpperCase().charCodeAt(0) * 20 +
              ", 50%, 30%)"
          });
        console.info("Entered relax mode");
      }
    },

    leave: function () {
      if (relaxed) {
        relaxed = false;
        if (!settings.visualization) {
          Effects.visualization.disable();
        }
        $("body").removeClass("relaxed");
        if (!settings.changecolor && settings.theme != 3) {
          $("body").css({
            background: ""
          });
        }
        console.info("Left relax mode");
      }
    }
  },

  visualization: {
    enable: function () {
      if (settings.visualization || relaxed) {
        vinterval = setInterval(function () {
          $("#visualization")
            .children()
            .each(function () {
              $(this).css({
                top: Math.random() * 15 + 50 + "%"
              });
            });
        }, 100);
        $("#visualization").show();
        console.info("Pseudo-visualization shown");
      }
    },

    disable: function () {
      if (vinterval != undefined) {
        clearInterval(vinterval);
        vinterval = undefined;
        $("#visualization")
          .children()
          .css({
            top: "100%"
          });
        $("#visualization").hide();
        console.info("Pseudo-visualization hidden");
      }
    }
  }
};
