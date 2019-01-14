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
 * NOTICE: This file provides additional functions for testing or development.
 * 
 */
function learnMore() {
  UI.dialog.open("learnmore");
  return $("#infotext").text().replace(/          /g, "\n").trim();
}

function enableCoverArt() {
  Network.musicBrainz.coverart = true;
  Network.musicBrainz.getCoverArt(info);
}

function addCustomStation() {
  currentlist.push({});
  $("#customstations input").val("");
  gearclicked = currentlist.length - 1;
  UI.dialog.open("stationmanager");
}
