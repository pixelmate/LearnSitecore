(function ($) {

	///
	/// Bind an element so that it moves with the mouse
	///
	if ($(".foodplot").length) {
		window.FollowCursor = {
			$element: null
			, xOffset: 0
			, yOffset: 0
			, isFollowing: false

			, elementFollowsCursor: function ($element, xOffset, yOffset) {
				//console.log("Starting to follow cursor");
				if ($element.css("position") != "fixed") {
					console.warn("Element position is not fixed so it can't follow cursor", $element);
				}

				FollowCursor.$element = $element;
				FollowCursor.xOffset = xOffset;
				FollowCursor.yOffset = yOffset;
				FollowCursor.isFollowing = true;

				$(document).mousemove(FollowCursor.updatePositionToCursor);
			}

			, updatePositionToCursor: function (event) {
				var x;
				var y;

				x = event.originalEvent.clientX + FollowCursor.xOffset;
				y = event.originalEvent.clientY + FollowCursor.yOffset;

				FollowCursor.$element.css({ 'top': y, 'left': x });
			}
			, stopFollowingCursor: function () {
				//console.log("Stopping following cursor");
				$(document).unbind("mousemove", FollowCursor.updatePositionToCursor);
				FollowCursor.isFollowing = false;
			}
		}
		///
		/// Some helper functions with Google Maps
		///
		window.MapHelper = {
			calculateArea: function (pointList) {
				var area;

				if (pointList.length < 3) {
					return 0;
				}

				area = google.maps.geometry.spherical.computeArea(pointList);

				return area;
			}
			, calculateAcreage: function (pointList) {
				var metersSquared = MapHelper.calculateArea(pointList);

				return MapHelper.convertMetersToAcreage(metersSquared);
			}
			, convertMetersToAcreage: function (metersSquared) {
				var result = (metersSquared / 4046.86);

				result = Math.round(result * 1000) / 1000;
				result.toFixed(3);

				return result;
			}
			, polygonOnEdit: function (polygon, onEditFunction) {
				// Loop through all paths in the polygon and add listeners
				// to them. If we just used `getPath()` then we wouldn't 
				// detect all changes to shapes like donuts.
				polygon.getPaths().forEach(function (path, index) {

					google.maps.event.addListener(path, 'insert_at', function () {
						// New point
						onEditFunction(polygon);
					});

					google.maps.event.addListener(path, 'remove_at', function () {
						// Point was removed
						onEditFunction(polygon);
					});

					google.maps.event.addListener(path, 'set_at', function () {
						// Point was moved
						onEditFunction(polygon);
					});
				});
			}
			, polylineOnEdit: function (line, onEditFunction) {
				var path = line.getPath()

				google.maps.event.addListener(path, 'insert_at', function () {
					// New point
					onEditFunction(line);
				});

				google.maps.event.addListener(path, 'remove_at', function () {
					// Point was removed
					onEditFunction(line);
				});

				google.maps.event.addListener(path, 'set_at', function () {
					// Point was moved
					onEditFunction(line);
				});
			}
		}

		///
		/// Some helper functions with Browser
		///
		window.GeoLocationHelper = {


			GetLocation: function (callback) {
				if (navigator.geolocation) {
					navigator.geolocation.getCurrentPosition(function (data) {
						GeoLocationHelper.ShowPosition(data, callback)
					}, GeoLocationHelper.ShowError);
				} else {
					//x.innerHTML = 
					console.log("Geolocation is not supported by this browser.");
				}
			}
			, ShowPosition: function (position, callback) {
				console.log(position);
				console.log(position.address);
				//x.innerHTML = "Latitude: " + position.coords.latitude + "<br>Longitude: " + position.coords.longitude;

				this.GoogleMapsTranslateGPS(position.coords.latitude, position.coords.longitude, callback);
			}
			, ShowError: function (error) {
				switch (error.code) {
					case error.PERMISSION_DENIED:
						console.log("User denied the request for Geolocation.");
						break;
					case error.POSITION_UNAVAILABLE:
						console.log("Location information is unavailable.");
						break;
					case error.TIMEOUT:
						console.log("The request to get user location timed out.");
						break;
					case error.UNKNOWN_ERROR:
						console.log("An unknown error occurred.");
						break;
				}
			}
			, GoogleMapsTranslateGPS: function (lat, lng, callback, failCallback, errorCallback) {
				//console.log("GoogleMapsTranslateGPS");
				var defaultReturnInfo = [""];
				try {
					var point = new google.maps.LatLng(lat, lng);
					new google.maps.Geocoder().geocode(
						{ 'latLng': point },
						function (results, status) {
							if (results != null) {
								var result = results[0].address_components;
								var info = [];

								for (var i = 0; i < result.length; ++i) {
									if (result[i].types[0] == "administrative_area_level_1") { info.push(result[i].short_name) }
								}
								//console.log("GoogleMapsTranslateGPS callback");
								callback(info, lat, lng);
							}
							else {
								failCallback(defaultReturnInfo, lat, lng);
							}
						}
					);
				}
				catch (err) {
					errorCallback(err);
				}
			}
		}

		///
		/// Save data to the browser that can be retrieved in a later session
		///
		window.Storage = {
			SaveString: function (key, value) {
				localStorage.setItem(key, value);
			}
			, GetString: function (key) {
				return localStorage.getItem(key);
			}
			, SaveJson: function (key, object) {
				var jsonstring = JSON.stringify(object);

				//console.log("Saving " + key, jsonstring);
				Storage.SaveString(key, jsonstring);
			}
			, GetJson: function (key) {
				var jsonobject;
				var jsonstring;

				jsonstring = Storage.GetString(key);
				jsonobject = JSON.parse(jsonstring);

				return jsonobject;
			}
			, Clear: function () {
				localStorage.clear();
			}
		}

		///
		/// Check device 
		///
		window.DeviceHelper = {
			IsMobileDevice: function () {
				var check = false;
				(function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
				return check;
			}
			, IsMobileAndTablet: function () {
				var check = false;
				(function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
				return check;
			}
			, IsAndroid: function () {
				return navigator.userAgent.match(/Android/i);
			}
			, IsIOS: function () {
				return navigator.userAgent.match(/iPhone|iPad|iPod/i);
			}
			, BrowserName: function () {
				if (DeviceHelper.IsMobileAndTablet() && DeviceHelper.IsIOS()) {
					//ios
					if ((/CriOS/).test(navigator.userAgent)) {
						return 'Chrome';
					}
					else if ((/FxiOS/).test(navigator.userAgent)) {
						return 'Firefox';
					}
					else if ((/OPiOS/).test(navigator.userAgent)) {
						return 'Opera';
					}
					else if ((/mercury/).test(navigator.userAgent)) {
						return 'Mercury';
					}
					else {
						return 'Safari';
					}
				}
				else {
					//desktop or android
					if ((navigator.userAgent.indexOf("Opera") || navigator.userAgent.indexOf('OPR')) != -1) {
						return 'Opera';
					}
					else if (navigator.userAgent.indexOf("Edge") != -1) {
						return 'Edge';
					}
					else if (navigator.userAgent.indexOf("SamsungBrowser") != -1) {
						return 'Samsung';
					}
					else if (navigator.userAgent.indexOf("Chrome") != -1) {
						return 'Chrome';
					}
					else if (navigator.userAgent.indexOf("Safari") != -1) {
						return 'Safari';
					}
					else if (navigator.userAgent.indexOf("Firefox") != -1) {
						return 'Firefox';
					}
					else if ((navigator.userAgent.indexOf("MSIE") != -1) || (!!document.documentMode == true)) //IF IE > 10
					{
						return 'IE';
					}
					else {
						return 'unknown';
					}
				}


			}
		}
		
		var DeerstandhighlightedIcon = (document.getElementById('DeerstandhighlightedIcon').value);
		var DeerstandIcon = (document.getElementById('DeerstandIcon').value);
		var MappinIcon = (document.getElementById('Mappinicon').value);
		window.MapPlotter = {
			pointList: new Array()
			, foodPlotData: null
			, foodPlotList: new Array()
			, foodPlotPolygonList: new Array()
			, pathList: new Array()
			, pathPolylineList: new Array()
			, pathInProgress: null
			, polygonInProgress: null
			, polylineToCursor: null
			, isMouseActive: true
			, map: null
			, acreageDiv: null
			, acreageValue: 0
			, deerStandList: new Array()
			, deerStandMarkerList: new Array()
			, currentPinType: ""
			, minSelectDistance: 10
			, foodPlotPin: MappinIcon
			, deerStandPin: DeerstandhighlightedIcon
			, pinHighlighted: DeerstandIcon
			, movableDoubleClickToEndInstructions: null
			, movableClickToBeginInstructions: null
			, foodPlotListKey: "FoodPlotList"
			, pathListKey: "PathList"
			, deerStandListKey: "DeerStandList"
			, savedMapsKey: "SavedMaps"
			, savedMaps: new Object()
			, currentMapName: ""
			, currentState: ""
			, currentStateLat: ""
			, currentStateLng: ""
			, defaultLat: 39.381266
			, defaultLng: - 97.922211
			, defaultZoomLevel: 4
			, specieList: new Array()
			, undoEvent: []
			, undoDrawDotEvent: []
			, initialize: function () {
				
				var dataJson = FoodPlotdataJson;
				$(window).click(function (e) {
					MapPlotter.windowClicked(e);
				})

				MapPlotter.drawingMode();
				MapPlotter.acreageDiv = document.getElementById("acreage");

				MapPlotter.initMapFromStorage();

				MapPlotter.initializeGoogleMaps();

				MapPlotter.loadMapsFromStorage();

				MapPlotter.foodPlotData = JSON.parse(dataJson);

				document.getElementById('btnDone').addEventListener("click", MapPlotter.btnDoneClicked);
				document.getElementById('btnDoneXs').addEventListener("click", MapPlotter.btnDoneClicked);
				document.getElementById('btnReset').addEventListener("click", MapPlotter.btnCancelClicked);
				document.getElementById('btnResetXs').addEventListener("click", MapPlotter.btnCancelClicked);
				//document.getElementById('btnEditDrawing').addEventListener("click", MapPlotter.btnEditDrawingClicked);
				//document.getElementById('btnEditDrawingXs').addEventListener("click", MapPlotter.btnEditDrawingClicked);
				document.getElementById('btnUndoDrawing').addEventListener("click", MapPlotter.btnUndoDrawingClicked);
				document.getElementById('btnUndoDrawingXs').addEventListener("click", MapPlotter.btnUndoDrawingClicked);
				document.getElementById('btnUndoDrawDot').addEventListener("click", MapPlotter.btnUndoDrawDotClicked);
				document.getElementById('btnUndoDrawDotXs').addEventListener("click", MapPlotter.btnUndoDrawDotClicked);



				document.getElementById('btnAddNew').addEventListener("click", MapPlotter.btnAddNewClicked);
				//document.getElementById('btnSaveAsNew').addEventListener("click", MapPlotter.btnSaveAsNewClicked);




				var speciesCheckboxList = "";
				for (var i = 0; i < MapPlotter.foodPlotData.Species.length; i++) {
					speciesCheckboxList += '<div class=" col-xs-6 col-sm-3 col-md-3 col-lg-4 NoPadding">';
					speciesCheckboxList += '<input class="classChbListSpecies" type="checkbox" value="' + MapPlotter.foodPlotData.Species[i] + '" /> ' + MapPlotter.foodPlotData.Species[i] + '&nbsp;&nbsp;'
					speciesCheckboxList += '</div>';
				}
				$('#speciesCheckboxList').html(speciesCheckboxList);


				$(".pinTypeBtn").click(function () {

					$(".pinTypeBtn").removeClass("active");
					$(this).addClass("active");

					MapPlotter.updatePinType();

					MapPlotter.drawingMode();
					//console.log("drawingmode");
					if (MapPlotter.currentPinType == "FoodPlot") {
						MapPlotter.map.draggableCursor = "context-menu";
					}
					else if (MapPlotter.currentPinType == "Path") {
						MapPlotter.map.draggableCursor = "context-menu";
					}
					else if (MapPlotter.currentPinType == "DeerStand") {
						MapPlotter.map.draggableCursor = "context-menu";
					}
					else if (MapPlotter.currentPinType == "Edit") {
						//console.log("editmode");
						MapPlotter.editMode();
						MapPlotter.map.draggableCursor = "pointer";
					}
					else if (MapPlotter.currentPinType == "Erase") {
						MapPlotter.map.draggableCursor = "pointer";
					}
				});


				//$(".btn-group > .btn").click(function () {
				//    $(".btn-group > .btn").removeClass("active");
				//    $(this).addClass("active");
				//});


				//$(".dropdown-menu li a").click(function () {
				//    $(this).parents(".btn-group").find('.pinTypeSelection').text($(this).text());
				//    $(this).parents(".btn-group").find('.pinTypeSelection').attr("pintypevalue", $(this).attr("pintypevalue"));
				//    MapPlotter.updatePinType();

				//    MapPlotter.drawingMode();
				//    //console.log("drawingmode");
				//    if (MapPlotter.currentPinType == "FoodPlot") {
				//        MapPlotter.map.draggableCursor = "context-menu";
				//    }
				//    else if (MapPlotter.currentPinType == "Path") {
				//        MapPlotter.map.draggableCursor = "context-menu";
				//    }
				//    else if (MapPlotter.currentPinType == "DeerStand") {
				//        MapPlotter.map.draggableCursor = "context-menu";
				//    }
				//    else if (MapPlotter.currentPinType == "Edit") {
				//        //console.log("editmode");
				//        MapPlotter.editMode();
				//        MapPlotter.map.draggableCursor = "pointer";
				//    }
				//    else if (MapPlotter.currentPinType == "Erase") {
				//        MapPlotter.map.draggableCursor = "pointer";
				//    }
				//});



				$('#btnExportMaps').click(MapPlotter.ExportMapsToFile);

				$('#btnPrintMaps').click(function () {
					window.print();
				});

				$('#myLocation').click(function () {
					MapPlotter.GetCurrentLocation();
				});


				$('#btnLoadMaps').click(function () {
					$('#hidFileUpload').prop("value", "")
					$('#hidFileUpload').trigger('click');
				});

				$('#hidFileUpload').change(function () {
					MapPlotter.LoadMapsFromFile();
				});




				$(".classChbListSpecies").change(function () {
					//console.log("classChbListSpecies");
					MapPlotter.GetSelectedSpeciesString();
					MapPlotter.saveData();
					MapPlotter.refreshSuggestion();
				});

				MapPlotter.movableDoubleClickToEndInstructions = $('.moveableDoubleClickToEnd');
				MapPlotter.movableClickToBeginInstructions = $('.moveableClickToBegin');
				MapPlotter.hideFloatingDoubleClickToEndInstructions();
				MapPlotter.hideFloatingClickToStartInstructions();
				google.maps.visualRefresh = true;
				//google.maps.event.addDomListener(window, 'load', MapPlotter.initializeGoogleMaps);

				MapPlotter.centerOnMarkers();

				google.maps.event.addListener(MapPlotter.map, 'click', function (event) {
					//console.log("map click");
					MapPlotter.processClick(event.latLng);
				});

				google.maps.event.addListener(MapPlotter.map, 'dblclick', function (event) {
					//console.log("map dblclick");
					MapPlotter.processDoubleClick(event.latLng);
				});


				google.maps.event.addListener(MapPlotter.map, 'mousemove', function (event) {
					//console.log("map mousemove");
					MapPlotter.mouseMove(event.latLng);

				});

				google.maps.event.addListener(MapPlotter.map, 'mouseout', function (event) {
					//console.log("map mouseout");
					MapPlotter.mouseOut(event.latLng);
				});

				//google.maps.event.addListener(MapPlotter.map, 'mouseover', function (event) {
				//    //console.log("map mouseover");
				//    MapPlotter.mouseOver(event.latLng);
				//});

				// Wire-up Pin Type
				//$('#selectPinType').on('change', function () {
				//    MapPlotter.updatePinType();
				//});

				// Initialize pin type
				MapPlotter.updatePinType();

				// Initize drawing on map
				MapPlotter.refreshMapDrawing();

				//console.log("FoodPlot initialization complete");
				MapPlotter.initSearchInputAutocomplete();

				MapPlotter.initializeAccordion();

				MapPlotter.clearUndoQueue();

			}
			, btnAddNewClicked: function () {
				var newMapName = $('#newMapName').val();
				if (!newMapName) {
					alert("Map Name is required");
				}
				else {
					var newMap = new Object();
					newMap.savedMapName = newMapName;
					newMap.storedFoodPlotList = [];
					newMap.storedPathList = [];
					newMap.storedDeerStandList = [];
					newMap.storedSpecieList = [];

					if (!MapPlotter.savedMaps) {
						MapPlotter.savedMaps = new Object();
					}
					//deep clone of newMap                
					MapPlotter.savedMaps[newMapName] = JSON.parse(JSON.stringify(newMap));
					MapPlotter.saveMapsToStorage();
					MapPlotter.loadSavedMap(newMapName);
					MapPlotter.clearUndoQueue();
					MapPlotter.drawSavedMaps();
					MapPlotter.refreshMapDrawing();
					MapPlotter.map.setZoom(MapPlotter.defaultZoomLevel);
					MapPlotter.map.setCenter(new google.maps.LatLng(MapPlotter.defaultLat, MapPlotter.defaultLng));
					$('#newMapName').val("");
				}
			}
			//, btnSaveAsNewClicked: function () {
			//    var newMapName = $('#newMapName').val();
			//    var mapName = MapPlotter.saveCurrentMap(newMapName);
			//    MapPlotter.saveMapsToStorage();
			//    MapPlotter.loadSavedMap(mapName);
			//    //reload map
			//    MapPlotter.drawSavedMaps();
			//    MapPlotter.centerOnMarkers();
			//    MapPlotter.refreshMapDrawing();
			//}

			, btnLoadExistingMap: function (mapName) {
				MapPlotter.loadSavedMap(mapName);
				MapPlotter.clearUndoQueue();
				//reload map
				MapPlotter.drawSavedMaps();
				MapPlotter.centerOnMarkers();
				MapPlotter.refreshMapDrawing();
			}

			, saveCurrentMap: function (mapName) {
				//if (mapName == "") {
				//    if (MapPlotter.savedMaps) {
				//        mapName = "Map-" + (Object.keys(MapPlotter.savedMaps).length + 1)
				//    }
				//    else {
				//        mapName = "Map-1"
				//    }
				//}
				mapName = MapPlotter.getRandomMapName(mapName);
				var newMap = new Object();
				newMap.savedMapName = mapName;
				newMap.storedFoodPlotList = MapPlotter.foodPlotList;
				newMap.storedPathList = MapPlotter.pathList;
				newMap.storedDeerStandList = MapPlotter.deerStandList;
				newMap.storedSpecieList = MapPlotter.specieList;

				if (!MapPlotter.savedMaps) {
					MapPlotter.savedMaps = new Object();
				}
				//deep clone of newMap                
				MapPlotter.savedMaps[mapName] = JSON.parse(JSON.stringify(newMap));
				MapPlotter.saveMapsToStorage();
				MapPlotter.currentMapName = mapName;
				return mapName;
			}
			, deleteMap: function (mapName) {
				var result = confirm("Are you sure you want to delete " + mapName + "?");
				if (result) {
					delete MapPlotter.savedMaps[mapName];
					MapPlotter.saveMapsToStorage();

					if (MapPlotter.currentMapName == mapName) {
						MapPlotter.currentMapName = "";
						MapPlotter.loadMapsFromStorage();
						MapPlotter.centerOnMarkers();
						MapPlotter.refreshMapDrawing();
						MapPlotter.clearUndoQueue();
					}
					MapPlotter.drawSavedMaps();
					ga('send', 'event', 'foodplot', 'deleteMap', 'map');
				}
			}
			, loadSavedMap: function (mapName) {
				MapPlotter.showdebug('loadsavedmap:before');
				MapPlotter.currentMapName = "";
				var sMap = MapPlotter.savedMaps[mapName];
				if (sMap) {
					MapPlotter.currentMapName = mapName;
					MapPlotter.foodPlotList = [];
					MapPlotter.pathList = [];
					MapPlotter.deerStandList = [];
					MapPlotter.specieList = [];
					if (sMap.storedFoodPlotList) {
						MapPlotter.foodPlotList = sMap.storedFoodPlotList;
					}
					if (sMap.storedPathList) {
						MapPlotter.pathList = sMap.storedPathList;
					}
					if (sMap.storedDeerStandList) {
						MapPlotter.deerStandList = sMap.storedDeerStandList;
					}
					if (sMap.storedSpecieList) {
						MapPlotter.specieList = sMap.storedSpecieList;
					}
				}
				else {
					//load blank map
					MapPlotter.currentMapName = mapName;
					MapPlotter.foodPlotList = [];
					MapPlotter.pathList = [];
					MapPlotter.deerStandList = [];
					MapPlotter.saveCurrentMap(mapName);
				}
				MapPlotter.showdebug('loadsavedmap:after');
			}
			, getRandomMapName: function (mapName) {
				if (mapName) return mapName;
				if (MapPlotter.savedMaps) {
					for (var i = 1; i < 100; i++) {
						var rMapName = "Map-" + i;
						var mapExists = MapPlotter.savedMaps[rMapName];
						if (!mapExists) {
							//console.log("should break");
							return rMapName;
						}
						//else {
						//    console.log("keep looping");
						//}
					}
					return mapName = "New-Map";
				}
				else {
					return "Map-1"
				}
			}

			, saveMapsToStorage: function (skipUndoTracking) {
				//console.log('MapPlotter.savedMaps');
				//console.log(MapPlotter.savedMaps);

				try {
					if (Storage.GetJson(MapPlotter.savedMapsKey) && MapPlotter.savedMaps && (!skipUndoTracking || skipUndoTracking == false)) {

						//backup before save new *maintain array within 10 items to avoid overflow
						var previousMapString = JSON.stringify(Storage.GetJson(MapPlotter.savedMapsKey)[MapPlotter.currentMapName]);
						var currentMapString = JSON.stringify(MapPlotter.savedMaps[MapPlotter.currentMapName]);

						if (previousMapString != currentMapString) {

							//console.log('**********************start******************************');
							//console.log(previousMapString);
							//console.log(currentMapString);
							//console.log('**********************done******************************');

							MapPlotter.undoEvent.push(previousMapString)

							if (MapPlotter.undoEvent.length > 10) {
								MapPlotter.undoEvent.shift();
							}
						}
						//else {
						//    console.log('same string skipped');
						//}
					}
				}
				catch (err) {
					//console.log(err);
				}
				finally {
					Storage.SaveJson(MapPlotter.savedMapsKey, MapPlotter.savedMaps);
					MapPlotter.refreshUndoStatus();
				}

			}
			, clearUndoDrawDotQueue: function () {
				MapPlotter.undoDrawDotEvent = [];
				MapPlotter.refreshUndoStatus();
			}
			, btnUndoDrawDotClicked: function () {

				var previousDotList = JSON.parse(MapPlotter.undoDrawDotEvent.pop());
				MapPlotter.pointList = JSON.parse(JSON.stringify(previousDotList));

				MapPlotter.refreshMapDrawing();
				//MapPlotter.showFloatingDoubleClickToEndInstructions();
				MapPlotter.refreshUndoStatus();
			}


			, clearUndoQueue: function () {
				MapPlotter.undoEvent = [];
				MapPlotter.refreshUndoStatus();
				//console.log("undo queue cleared");
			}
			, btnUndoDrawingClicked: function () {
				//add undo logic here
				var previousMap = JSON.parse(MapPlotter.undoEvent.pop());
				MapPlotter.savedMaps[MapPlotter.currentMapName] = JSON.parse(JSON.stringify(previousMap));
				MapPlotter.loadSavedMap(MapPlotter.currentMapName);
				MapPlotter.saveMapsToStorage(true);

				MapPlotter.refreshMapDrawing();
				//MapPlotter.centerOnMarkers();
				MapPlotter.refreshUndoStatus();
			}
			, refreshUndoStatus: function () {

				$('#btnUndoDrawing').hide();
				$('#btnUndoDrawingXs').hide();
				$('#divUndoDrawing').hide();
				$('#divUndoDrawingXs').hide();

				if (MapPlotter.undoDrawDotEvent && MapPlotter.undoDrawDotEvent.length > 0) {
					//enable undo button
					$('#btnUndoDrawDot').show();
					$('#btnUndoDrawDotXs').show();
					$('#divUndoDrawDot').show();
					$('#divUndoDrawDotXs').show();
					//console.log("enable undo button");
				}
				else {
					//disable undo button
					$('#btnUndoDrawDot').hide();
					$('#btnUndoDrawDotXs').hide();
					$('#divUndoDrawDot').hide();
					$('#divUndoDrawDotXs').hide();
					//console.log("disable undo button");

					//only show undo drawing after done 
					if (MapPlotter.undoEvent && MapPlotter.undoEvent.length > 0) {
						//enable undo button
						$('#btnUndoDrawing').show();
						$('#btnUndoDrawingXs').show();
						$('#divUndoDrawing').show();
						$('#divUndoDrawingXs').show();
						//console.log("enable undo button");
					}
				}


				//console.log("MapPlotter.undoEvent:" + MapPlotter.undoEvent.length);
			}
			, clearMapsFromStorage: function () {
				//console.log('clearmapsfromstorage');
				MapPlotter.savedMaps = new Object();
				Storage.Clear();
			}
			, initMapFromStorage: function () {
				MapPlotter.savedMaps = Storage.GetJson(MapPlotter.savedMapsKey);
				//console.log(MapPlotter.savedMaps);
				if (MapPlotter.savedMaps && (Object.keys(MapPlotter.savedMaps).length > 0)) {
					var mapToLoad = Object.keys(MapPlotter.savedMaps)[0];
					MapPlotter.loadSavedMap(mapToLoad);
					MapPlotter.clearUndoQueue();
				}
			}
			, loadMapsFromStorage: function () {

				//console.log("loadMapsFromStorage");
				//console.log(Storage.GetJson(MapPlotter.savedMapsKey));
				MapPlotter.LoadMapsFromJson(Storage.GetJson(MapPlotter.savedMapsKey));

				//MapPlotter.savedMaps = Storage.GetJson(MapPlotter.savedMapsKey);
				////console.log(MapPlotter.savedMaps);
				//if (MapPlotter.savedMaps && (Object.keys(MapPlotter.savedMaps).length > 0)) {
				//    var mapToLoad = Object.keys(MapPlotter.savedMaps)[0];
				//    MapPlotter.loadSavedMap(mapToLoad);
				//}
				//else {
				//    MapPlotter.clearAllList();
				//    MapPlotter.map.setZoom(MapPlotter.defaultZoomLevel);
				//    MapPlotter.map.setCenter(new google.maps.LatLng(MapPlotter.defaultLat, MapPlotter.defaultLng));
				//}
				//MapPlotter.drawSavedMaps();
			}
			, drawSavedMaps: function () {
				//divSavedMaps
				var savedMapString = "";
				for (var savedMap in MapPlotter.savedMaps) {
					var myMapClass = "MyMap";
					// check if the property/key is defined in the object itself, not in parent
					if (MapPlotter.savedMaps.hasOwnProperty(savedMap)) {
						var mapName = MapPlotter.savedMaps[savedMap];
						if (MapPlotter.currentMapName == savedMap) {
							myMapClass = "MyMapActive"
							//    savedMapString += '<div style="display:inline-block; height: 65px; border: 3px solid yellow; background-color: #f8d4d4; padding: 10px; position: relative; "><div style="cursor: pointer;" onclick="MapPlotter.btnLoadExistingMap(\'' + savedMap + '\')">' + savedMap + '</div><div style="position:absolute; top: -6px; right: -6px; cursor: pointer;" onclick="MapPlotter.deleteMap(\'' + savedMap + '\')">X</div></div>&nbsp;&nbsp;';
						}
						//else {
						//    savedMapString += '<div style="display:inline-block; height: 60px; border: 1px solid #ccc;   background-color: #f8d4d4; padding: 10px; position: relative; "><div style="cursor: pointer;" onclick="MapPlotter.btnLoadExistingMap(\'' + savedMap + '\')">' + savedMap + '</div><div style="position:absolute; top: -6px; right: -6px; cursor: pointer;" onclick="MapPlotter.deleteMap(\'' + savedMap + '\')">X</div></div>&nbsp;&nbsp;';
						//}
						//savedMapString += '<div class="col-md-1 col-sm-2 col-xs-4">'
						savedMapString += '<div class="' + myMapClass + '"><div class="MyMapLogo cursor-pointer" onclick="MapPlotter.btnLoadExistingMap(\'' + savedMap + '\')"></div><div class="cursor-pointer" onclick="MapPlotter.btnLoadExistingMap(\'' + savedMap + '\')" >' + savedMap + '</div><div class="MyMapCancel" onclick="MapPlotter.deleteMap(\'' + savedMap + '\')"></div></div>'
						//savedMapString += '</div>'
					}
				}
				savedMapString = "<div class='MyMaps'>" + savedMapString + "</div>";
				$('#divSavedMaps').html(savedMapString);



			}
			//, getSavedData: function () {
			//    //console.log("getSavedData");
			//    //console.log(Storage.GetJson(MapPlotter.foodPlotListKey));
			//    //console.log(MapPlotter.foodPlotData.Species);
			//    var storedFoodPlotList = Storage.GetJson(MapPlotter.foodPlotListKey);
			//    var storedPathList = Storage.GetJson(MapPlotter.pathListKey);
			//    var storedDeerStandList = Storage.GetJson(MapPlotter.deerStandListKey);

			//    if (storedFoodPlotList) {
			//        MapPlotter.foodPlotList = storedFoodPlotList;
			//    }
			//    if (storedPathList) {
			//        MapPlotter.pathList = storedPathList;
			//    }
			//    if (storedDeerStandList) {
			//        MapPlotter.deerStandList = storedDeerStandList;
			//    }
			//}
			, centerOnMarkers: function () {
				// Get all marker Lat Lng
				var latlngbounds = new google.maps.LatLngBounds();

				// Don't try to center if there are no markers
				if (MapPlotter.foodPlotList.length == 0 && MapPlotter.pathList.length == 0 && MapPlotter.deerStandList.length == 0) {
					//console.log("No Makers, so not cetnering map");

					MapPlotter.map.setZoom(MapPlotter.defaultZoomLevel);
					MapPlotter.map.setCenter(new google.maps.LatLng(MapPlotter.defaultLat, MapPlotter.defaultLng));
					return;
				}

				// Get all markers from FoodPlot
				//MapPlotter.foodPlotList.forEach(i => {
				//    i.forEach(function (latLng) {
				//        latlngbounds.extend(latLng);
				//    });
				//});
				for (let i = 0; i < MapPlotter.foodPlotList.length; i++) {
					//MapPlotter.foodPlotList.forEach(i => {
					var foodPlot = MapPlotter.foodPlotList[i];
					foodPlot.forEach(function (latLng) {
						latlngbounds.extend(latLng);
					});
				};

				// Get all markers from Paths
				for (let i = 0; i < MapPlotter.pathList.length; i++) {
					//MapPlotter.pathList.forEach(i => {
					var pathList = MapPlotter.pathList[i];
					pathList.forEach(function (latLng) {
						latlngbounds.extend(latLng);
					});
				};

				// Get all markers from Deerstands
				MapPlotter.deerStandList.forEach(function (latLng) {
					latlngbounds.extend(latLng);
				});

				var center = latlngbounds.getCenter();

				MapPlotter.map.setCenter(center);
				MapPlotter.map.fitBounds(latlngbounds);
			}
			, updatePinType: function (newValue) {
				MapPlotter.currentPinType = MapPlotter.GetCurrentPinType(); //$('#selectPinType').val(); // newValue;
				//console.log(MapPlotter.currentPinType);
				//MapPlotter.hideFloatingDoubleClickToEndInstructions();
				MapPlotter.refreshMapDrawing();
			}
			, initializeGoogleMaps: function () {
				var mapOptions = {
					center: new google.maps.LatLng(MapPlotter.defaultLat, MapPlotter.defaultLng),
					zoom: MapPlotter.defaultZoomLevel,
					scrollwheel: false,
					draggable: true,
					mapTypeId: google.maps.MapTypeId.HYBRID,
					draggableCursor: 'context-menu',
					disableDoubleClickZoom: true,
					styles: [
						{
							"featureType": "poi",
							"stylers": [
								{ "visibility": "off" }
							]
						},
						{
							"featureType": "road",
							"stylers": [
								{ "visibility": "on" }
							]
						},
					]
				};

				MapPlotter.map = new google.maps.Map(document.getElementById("map"), mapOptions)


			}
			, refreshMapDrawing: function () {
				//console.log("refreshMapDrawing");
				if (MapPlotter.polylineToCursor) {
					MapPlotter.polylineToCursor.setMap(null);
				}
				if (MapPlotter.currentPinType == "FoodPlot") {
					MapPlotter.drawFoodPlotInProgress();
				}
				if (MapPlotter.currentPinType == "Path") {
					MapPlotter.drawPathInProgress();
				}
				MapPlotter.markSpeciesCheckbox();
				MapPlotter.drawFoodPlots();
				MapPlotter.drawPaths();
				MapPlotter.drawDeerStands();
				MapPlotter.acreageValue = MapPlotter.getAcreage();
				MapPlotter.acreageDiv.innerHTML = MapPlotter.acreageValue;
				MapPlotter.refreshSuggestion();
			}
			, isEraseMode: function () {
				var eraseMode;

				if (MapPlotter.currentPinType == "Erase") {
					eraseMode = true;
				}
				else {
					eraseMode = false;
				}

				return eraseMode;
			}
			, isEditable: function () {
				var editable;

				if (MapPlotter.currentPinType == "Edit") {
					editable = true;
				}
				else {
					editable = false;
				}

				return editable;
			}
			, drawFoodPlots: function () {
				// Clear polygons off of map
				MapPlotter.deleteMapElementArray(MapPlotter.foodPlotPolygonList);

				// Recreate polygons
				for (let i = 0; i < MapPlotter.foodPlotList.length; i++) {
					//MapPlotter.foodPlotList.forEach(i => {
					var foodPlot = MapPlotter.foodPlotList[i];
					var newPolygon = MapPlotter.drawPolygon(foodPlot, "#80F0F0", MapPlotter.isEditable(), MapPlotter.isEraseMode());
					MapPlotter.foodPlotPolygonList.push(newPolygon);
				}
			}
			, drawPaths: function () {
				// Clear lines off of map
				MapPlotter.deleteMapElementArray(MapPlotter.pathPolylineList);

				// Recreate polylines
				for (let i = 0; i < MapPlotter.pathList.length; i++) {
					//MapPlotter.pathList.forEach(i => {
					var pathList = MapPlotter.pathList[i];
					var newPolyline = MapPlotter.drawPolyline(pathList, "#F5F822", MapPlotter.isEditable(), MapPlotter.isEraseMode());
					MapPlotter.pathPolylineList.push(newPolyline);
				}
			}
			, drawDeerStands: function () {

				//MapPlotter.showdebug('drawDeerStands:before');
				// Clear markers off of map
				MapPlotter.deleteMapElementArray(MapPlotter.deerStandMarkerList);

				//console.log('drawDeerStands - check here');
				//console.log(MapPlotter.deerStandMarkerList);
				//console.log(MapPlotter.deerStandList);
				//console.log('drawDeerStands - check done');
				//// Recreate markers
				//console.log("START deer stand");
				for (let i = 0; i < MapPlotter.deerStandList.length; i++) {

					//MapPlotter.deerStandList.forEach(i => {
					var deerStand = MapPlotter.deerStandList[i];
					var newMarker = MapPlotter.drawDeerStand(deerStand);
					MapPlotter.deerStandMarkerList.push(newMarker);
					//console.log(MapPlotter.deerStandList[i]);
				}
				//MapPlotter.showdebug('drawDeerStands:after');
				//console.log("DONE deer stand");
			}
			, drawPolygon: function (points, fillColor, editable, canErase) {
				var newPolygon = null;

				if (points && points.length > -1) {
					newPolygon = new google.maps.Polygon({
						path: points
						, fillColor: fillColor
						, editable: editable
						, clickable: canErase
					});

					newPolygon.setMap(MapPlotter.map);
					google.maps.event.addListener(newPolygon, 'click', function () {
						// Point was removed
						this.setMap(null);
						MapPlotter.foodPlotsEdited();
					});
					if (canErase) {
						google.maps.event.addListener(newPolygon, 'mouseover', function () {
							this.setOptions({ fillColor: 'red' })
							//MapPlotter.foodPlotsEdited();
						});
						google.maps.event.addListener(newPolygon, 'mouseout', function () {
							this.setOptions({ fillColor: fillColor })
							//MapPlotter.foodPlotsEdited();
						});
					}

					MapHelper.polygonOnEdit(newPolygon, MapPlotter.foodPlotsEdited);
				}

				return newPolygon;
			}
			, drawPolyline: function (points, color, editable, canErase) {
				var newPolyline = null;

				if (points && points.length > -1) {
					newPolyline = new google.maps.Polyline({
						path: points
						, strokeColor: color
						, editable: editable
						, clickable: canErase
					});

					newPolyline.setMap(MapPlotter.map);
					google.maps.event.addListener(newPolyline, 'click', function () {
						// Point was removed
						this.setMap(null);
						MapPlotter.pathsEdited();
					});
					if (canErase) {
						google.maps.event.addListener(newPolyline, 'mouseover', function () {
							this.setOptions({ strokeColor: 'red' })
							//MapPlotter.foodPlotsEdited();
						});
						google.maps.event.addListener(newPolyline, 'mouseout', function () {
							this.setOptions({ strokeColor: color })
							//MapPlotter.foodPlotsEdited();
						});
					}
					MapHelper.polylineOnEdit(newPolyline, MapPlotter.pathsEdited);
				}

				return newPolyline;
			}
			, deleteMapElementArray: function (elementArray) {
				if (!elementArray)
					return;

				for (let i = 0; i < elementArray.length; i++) {
					//elementArray.forEach(i => {
					var element = elementArray[i];
					element.setMap(null);
				};

				elementArray.length = 0;// = new Array();
			}
			, drawFoodPlotInProgress: function () {
				var polygonColor = '#F0F0F0';
				var newPolygon;

				if (MapPlotter.polygonInProgress) {
					MapPlotter.polygonInProgress.setMap(null);
				}

				// if (MapPlotter.isMouseActive == false)
				// {
				// 	polygonColor = '#80F090';
				// }

				newPolygon = MapPlotter.drawPolygon(MapPlotter.pointList, polygonColor, false, false);
				MapPlotter.polygonInProgress = newPolygon;
			}
			, drawPathInProgress: function () {
				var lineColor = '#F0b0F0';
				var newPolyline;

				if (MapPlotter.pathInProgress) {
					MapPlotter.pathInProgress.setMap(null);
				}

				newPolyline = MapPlotter.drawPolyline(MapPlotter.pointList, lineColor, false, false);
				MapPlotter.pathInProgress = newPolyline;
			}
			, markSpeciesCheckbox: function () {
				$('.classChbListSpecies').each(function () {
					if (MapPlotter.specieList.includes($(this).val())) {
						$(this).prop('checked', true);
					}
					else {
						$(this).prop('checked', false);
					}
				});
			}
			, getAcreage: function () {
				var acreage = 0;
				var roundedValue;

				if (MapPlotter.foodPlotPolygonList) {
					for (let i = 0; i < MapPlotter.foodPlotPolygonList.length; i++) {
						//MapPlotter.foodPlotPolygonList.forEach(i => {
						var foodPlotPolygon = MapPlotter.foodPlotPolygonList[i];
						//console.log("map area found", i.getPath().getArray())
						acreage += MapHelper.calculateAcreage(foodPlotPolygon.getPath().getArray());
					};
				}

				//get Path total
				//var totalPathLengthInMeter = 0;
				//if (MapPlotter.pathPolylineList) {
				//    MapPlotter.pathPolylineList.forEach(markersPath => {
				//        var polyLengthInMeters = google.maps.geometry.spherical.computeLength(markersPath.getPath().getArray());
				//        totalPathLengthInMeter += polyLengthInMeters;
				//    });
				//}
				//var totalPathLengthInAcreage = MapHelper.convertMetersToAcreage(totalPathLengthInMeter);

				roundedValue = acreage.toFixed(3);

				if (acreage == 0) return '<span style="font-size: 14px;">Food plot not found</span>';

				return roundedValue;
			}
			, getClosestMarker: function (point, markerList, maxDistance) {
				var minDistance = -1;
				var minDistanceMarker;

				//console.log("MarkerList", markerList);

				for (let i = 0; i < markerList.length; i++) {
					//markerList.forEach(i => {
					var marker = markerList[i];
					var distance;

					distance = google.maps.geometry.spherical.computeDistanceBetween(point, marker.position);

					if (minDistance == -1 || distance < minDistance) {
						minDistance = distance;
						minDistanceMarker = marker;
					}
				};

				//console.log("minDistance", minDistance);

				if (minDistance > maxDistance) {
					minDistanceMarker = null;
				}

				return minDistanceMarker;
			}
			, removeMarker: function (marker, markerList) {
				var found = false;

				for (var i = markerList.length - 1; i >= 0; i--) {
					if (markerList[i] === marker) {
						markerList.splice(i, 1);
						found = true;
					}
				}

				if (!found) {
					console.warn("Marker not found in array so it could not be removed");
				}
			}
			, processDoubleClick: function (location) {
				//console.log("dbl click")
				MapPlotter.btnDoneClicked();
			}


			//calculates distance between two points in km's
			//, calcDistance: function (p1, p2) {
			//	return (google.maps.geometry.spherical.computeDistanceBetween(p1, p2) / 1000).toFixed(2);
			//}
			, processClick: function (location) {
				//click outside of map, make it as done
				//MapPlotter.btnDoneClicked();

				var currentPinType = MapPlotter.currentPinType;

				//console.log("Current Pin Type: ", currentPinType);

				if (currentPinType == "DeerStand") {
					MapPlotter.createDeerStand(location);
				}
				else if (currentPinType == "FoodPlot") {
					MapPlotter.placeMarker(location);
				}
				else if (currentPinType == "Path") {
					MapPlotter.placeMarker(location);
				}
				//else if (currentPinType == "Erase") {
				//    var closest = MapPlotter.getClosestMarker(location, MapPlotter.deerStandMarkerList, MapPlotter.minSelectDistance);
				//    //console.log("closest", closest);

				//    if (closest) {
				//        closest.setMap(null);
				//        MapPlotter.showdebug('removeMarker:before');
				//        MapPlotter.removeMarker(closest, MapPlotter.deerStandMarkerList);
				//        MapPlotter.showdebug('removeMarker:after');
				//        MapPlotter.deerStandsEdited();
				//    }
				//}
			}
			, drawDeerStand: function (location, icon) {

				// Default icon
				if (!icon) {
					icon = MapPlotter.deerStandPin;
				}


				var deerStandDraggable = false;
				var deerStandClickable = false;

				if (MapPlotter.currentPinType == "Edit") {
					deerStandDraggable = true;
				}
				else if (MapPlotter.currentPinType == "Erase") {
					deerStandClickable = true;
				}

				// Create the marker
				var marker = new google.maps.Marker({
					draggable: deerStandDraggable,
					clickable: deerStandClickable,
					position: location,
					map: MapPlotter.map,
					icon: MapPlotter.deerStandPin,
				});


				if (MapPlotter.currentPinType == "Erase" || MapPlotter.currentPinType == "Edit") {

					google.maps.event.addListener(marker, 'mouseover', function () {
						//console.log('marker mouseover');
						marker.setIcon(MapPlotter.pinHighlighted);
					});

					google.maps.event.addListener(marker, 'mouseout', function () {
						//console.log('marker mouseout');
						marker.setIcon(MapPlotter.deerStandPin);
					});

					// Bind marker moved event
					google.maps.event.addListener(marker, 'dragstart', function () {
						MapPlotter.showdebug('dragstart');
					});

					// Bind marker moved event
					google.maps.event.addListener(marker, 'dragend', function () {
						MapPlotter.showdebug('dragend');
						MapPlotter.deerStandsEdited();
					});

					if (MapPlotter.currentPinType == "Erase") {
						google.maps.event.addListener(marker, 'click', function (point) {
							marker.setMap(null);
							MapPlotter.deerStandsEdited();
						});
					}
				}


				marker.setMap(MapPlotter.map);
				//console.log("adding marker to deerStandMarkerList", marker);
				//MapPlotter.deerStandMarkerList.push(marker);

				return marker;
			}

			, showdebug: function (debugtype) {
				//console.log('**********************debugtype' + debugtype + '*****************************');
				//console.log(MapPlotter.deerStandMarkerList);
				//console.log(MapPlotter.deerStandList);

			}
			, createDeerStand: function (location) {
				MapPlotter.showdebug('createDeerStand:before');
				MapPlotter.deerStandList.push(location);
				var marker = MapPlotter.drawDeerStand(location);
				MapPlotter.deerStandMarkerList.push(marker);
				MapPlotter.showdebug('createDeerStand:after');

				MapPlotter.saveData();
			}
			, placeMarker: function (location) {
				//backup each dot added *maintain array within 10 items to avoid overflow
				var previousPlaceMarkerString = JSON.stringify(MapPlotter.pointList);

				MapPlotter.pointList.push(location);
				MapPlotter.refreshMapDrawing();
				//MapPlotter.showFloatingDoubleClickToEndInstructions();

				var currentPlaceMarkerString = JSON.stringify(MapPlotter.pointList);

				if (previousPlaceMarkerString != currentPlaceMarkerString) {
					MapPlotter.undoDrawDotEvent.push(previousPlaceMarkerString)
					if (MapPlotter.undoDrawDotEvent.length > 10) {
						MapPlotter.undoDrawDotEvent.shift();
					}
				}
				MapPlotter.refreshUndoStatus();
			}


			, showFloatingClickToStartInstructions: function () {
				if (!FollowCursor.isFollowing) {
					MapPlotter.movableClickToBeginInstructions.show();
					FollowCursor.elementFollowsCursor(MapPlotter.movableClickToBeginInstructions, 30, 30);
				}
			}
			, hideFloatingClickToStartInstructions: function () {
				MapPlotter.movableClickToBeginInstructions.hide();

				// Unsubscribe instructions from the FollowCursor function
				if (FollowCursor.isFollowing) {
					FollowCursor.stopFollowingCursor();
				}
			}

			, showFloatingDoubleClickToEndInstructions: function () {
				if (!FollowCursor.isFollowing) {
					MapPlotter.movableDoubleClickToEndInstructions.show();
					FollowCursor.elementFollowsCursor(MapPlotter.movableDoubleClickToEndInstructions, 30, 30);
				}
			}
			, hideFloatingDoubleClickToEndInstructions: function () {
				MapPlotter.movableDoubleClickToEndInstructions.hide();

				// Unsubscribe instructions from the FollowCursor function
				if (FollowCursor.isFollowing) {
					FollowCursor.stopFollowingCursor();
				}
			}
			, mouseMove: function (location) {
				MapPlotter.hideFloatingClickToStartInstructions();
				MapPlotter.hideFloatingDoubleClickToEndInstructions();

				if (MapPlotter.isMouseActive == true && MapPlotter.currentPinType == "FoodPlot") {
					MapPlotter.drawFoodPlotCompletionLines(location);


					//show click to start
					if (MapPlotter.pointList.length <= 0) {
						MapPlotter.showFloatingClickToStartInstructions();
					}
					else {
						MapPlotter.showFloatingDoubleClickToEndInstructions();
					}
				}

				if (MapPlotter.isMouseActive == true && MapPlotter.currentPinType == "Path") {
					MapPlotter.drawTrailCompletionLines(location);

					//show click to start
					if (MapPlotter.pointList.length <= 0) {
						MapPlotter.showFloatingClickToStartInstructions();
					}
					else {
						MapPlotter.showFloatingDoubleClickToEndInstructions();
					}
				}

				//if (MapPlotter.currentPinType == "Erase") {
				//    MapPlotter.highlightClosestDeerStand(location);
				//}
			}
			, mouseOut: function () {
				if (MapPlotter.currentPinType == "FoodPlot")
					MapPlotter.clearCompletionLine();

				MapPlotter.hideFloatingClickToStartInstructions();
				MapPlotter.hideFloatingDoubleClickToEndInstructions();
			}
			//, mouseOver: function (location) {
			//    //console.log("mouse is over");
			//}
			//, highlightClosestDeerStand: function (location) {
			//    var closestMarker = MapPlotter.getClosestMarker(location, MapPlotter.deerStandMarkerList, MapPlotter.minSelectDistance);

			//    for (let i = 0; i < MapPlotter.deerStandMarkerList.length; i++) {
			//    //MapPlotter.deerStandMarkerList.forEach(i => {
			//        var deerStandMarker = MapPlotter.deerStandMarkerList[i];
			//        if (closestMarker && deerStandMarker === closestMarker) {
			//            console.log("in");
			//            deerStandMarker.setIcon(MapPlotter.pinHighlighted);
			//            //deerStandMarker.setDraggable(false);
			//            //MapPlotter.updateMarkerIcon(deerStandMarker, MapPlotter.pinHighlighted, MapPlotter.deerStandMarkerList)
			//        } else {
			//            console.log("out");
			//            deerStandMarker.setIcon(MapPlotter.deerStandPin);
			//            //deerStandMarker.setDraggable(true);
			//            //MapPlotter.updateMarkerIcon(deerStandMarker, MapPlotter.deerStandPin, MapPlotter.deerStandMarkerList)
			//        }
			//    };
			//}
			, updateMarkerIcon: function (marker, newIcon, markerList) {
				// Don't do anything if icon is already set correctly
				if (marker.icon == newIcon)
					return;

				marker.setIcon(newIcon);
			}
			, drawFoodPlotCompletionLines: function (location) {
				MapPlotter.clearCompletionLine();

				if (MapPlotter.pointList.length == 0)
					return;

				var firstPoint = MapPlotter.pointList[0];
				var lastPoint = MapPlotter.pointList[MapPlotter.pointList.length - 1];

				var newPoints = [
					firstPoint
					, location
					, lastPoint
				];

				var newLines = MapPlotter.drawPolyline(newPoints, "#000000", false, false);

				MapPlotter.polylineToCursor = newLines;
			}
			, drawTrailCompletionLines: function (location) {
				MapPlotter.clearCompletionLine();

				if (MapPlotter.pointList.length == 0)
					return;

				var lastPoint = MapPlotter.pointList[MapPlotter.pointList.length - 1];

				var newPoints = [
					location
					, lastPoint
				];

				var newLines = MapPlotter.drawPolyline(newPoints, "#000000", false, false);

				MapPlotter.polylineToCursor = newLines;
			}
			, clearCompletionLine: function () {
				if (MapPlotter.polylineToCursor)
					MapPlotter.polylineToCursor.setMap(null);
			}
			, btnDoneClicked: function () {
				if (MapPlotter.currentPinType == "FoodPlot") {

					// Only save the point list if it is a polygon (no lines)
					if (MapPlotter.pointList.length >= 3) {
						MapPlotter.foodPlotList.push(MapPlotter.pointList);
						MapPlotter.saveData();
					}

					MapPlotter.getPointLists(MapPlotter.foodPlotPolygonList);
				}
				else if (MapPlotter.currentPinType == "Path") {
					if (MapPlotter.pointList.length >= 2) {
						MapPlotter.pathList.push(MapPlotter.pointList);
						MapPlotter.saveData();
					}
				}
				else if (MapPlotter.currentPinType == "Edit" || MapPlotter.currentPinType == "Erase") {
					//console.log("clicked done on edit");
					$('#ddPingTypeFoodPlot')[0].click();
				}
				MapPlotter.clearUndoDrawDotQueue();
				MapPlotter.clearPathInProgress();
				//MapPlotter.hideFloatingDoubleClickToEndInstructions();
				MapPlotter.pointList = new Array();
				MapPlotter.refreshMapDrawing();
			}
			, clearAllList: function () {
				MapPlotter.clearFoodPlotInProgress();
				MapPlotter.clearPathInProgress();
				MapPlotter.clearFoodPlots();
				MapPlotter.clearPaths();
				MapPlotter.clearDeerStands();
				MapPlotter.clearSpecies();
			}
			, btnCancelClicked: function () {
				MapPlotter.clearAllList();
				MapPlotter.refreshMapDrawing();
				MapPlotter.refreshSuggestion();
			}

			//, btnEditDrawingClicked: function () {
			//    MapPlotter.centerOnMarkers();
			//    $('#ddPingTypeEdit')[0].click();
			//}
			, clearFoodPlotInProgress: function () {
				if (MapPlotter.polygonInProgress) {
					MapPlotter.polygonInProgress.setMap(null);
				}
				if (MapPlotter.polylineToCursor) {
					MapPlotter.polylineToCursor.setMap(null);
				}
				MapPlotter.pointList = new Array();
			}
			, clearPathInProgress: function () {
				if (MapPlotter.pathInProgress && MapPlotter.pathInProgress.setmap)
					MapPlotter.pathInProgress.setmap(null);

				if (MapPlotter.polylineToCursor && MapPlotter.polylineToCursor.setMap)
					MapPlotter.polylineToCursor.setMap(null);

				MapPlotter.pointList = new Array();
			}
			, clearDeerStands: function () {
				MapPlotter.showdebug('clearDeerStands:before');
				MapPlotter.deleteMapElementArray(MapPlotter.deerStandMarkerList);
				MapPlotter.deerStandList = new Array();
				MapPlotter.showdebug('clearDeerStands:after');
			}
			, clearPaths: function () {
				MapPlotter.deleteMapElementArray(MapPlotter.pathPolylineList);
				MapPlotter.pathList = new Array();
				MapPlotter.saveData();
			}
			, clearFoodPlots: function () {
				MapPlotter.deleteMapElementArray(MapPlotter.foodPlotPolygonList);
				MapPlotter.foodPlotList = new Array();
				MapPlotter.saveData();
			}
			, clearSpecies: function () {
				MapPlotter.specieList = new Array();
				MapPlotter.saveData();
			}
			, getPointLists: function (polygonList) {
				var pathList = new Array();

				//console.log("Processing polygonList", polygonList);

				for (let i = 0; i < polygonList.length; i++) {
					//polygonList.forEach(currentPolygon => {
					var currentPolygon = polygonList[i];
					// Only process polygons that are attached to the map
					if (currentPolygon.getMap()) {
						var newPath = currentPolygon.getPath().getArray();
						pathList.push(newPath);
					}
				};

				//console.log("processed for " + i + " loops and skipped " + skip + " times");

				return pathList;
			}
			, getPointList: function (markerList) {
				var pointList = new Array();
				for (let i = 0; i < markerList.length; i++) {
					//markerList.forEach(currentMarker => {
					var currentMarker = markerList[i];
					// Only process markers that are attached to the map
					if (currentMarker.getMap()) {
						var newMarker = currentMarker.getPosition();
						pointList.push(newMarker);
					}
				};

				//console.log("processed for " + i + " loops and skipped " + skip + " times");

				return pointList;
			}
			, foodPlotsEdited: function () {
				var pointLists = MapPlotter.getPointLists(MapPlotter.foodPlotPolygonList);

				//console.log("FoodPlots were: ", MapPlotter.foodPlotList);

				MapPlotter.foodPlotList = pointLists;
				MapPlotter.saveData();

				//console.log("FoodPlots now: ", MapPlotter.foodPlotList);
				MapPlotter.refreshMapDrawing();
			}

			, pathsEdited: function () {
				var pointLists = MapPlotter.getPointLists(MapPlotter.pathPolylineList);

				//console.log("Paths were: ", MapPlotter.pathList);

				MapPlotter.pathList = pointLists;
				MapPlotter.saveData();

				//console.log("Paths now: ", MapPlotter.pathList);
				MapPlotter.refreshMapDrawing();
			}
			, deerStandsEdited: function () {
				MapPlotter.showdebug('deerStandsEdited');
				var pointLists = MapPlotter.getPointList(MapPlotter.deerStandMarkerList);

				//console.log("MapPlotter.deerStandMarkerList");
				//console.log(MapPlotter.deerStandMarkerList);
				//console.log("pointLists");
				//console.log(pointLists);

				//console.log("Deer Stands were: ", MapPlotter.deerStandList);

				MapPlotter.deerStandList = pointLists;
				MapPlotter.saveData();

				//console.log("Deer Stands now: ", MapPlotter.deerStandList);
				MapPlotter.refreshMapDrawing();
			}
			, saveData: function () {
				MapPlotter.saveCurrentMap(MapPlotter.currentMapName);

				//Storage.SaveJson(MapPlotter.deerStandListKey, MapPlotter.deerStandList);
				//Storage.SaveJson(MapPlotter.pathListKey, MapPlotter.pathList);
				//Storage.SaveJson(MapPlotter.foodPlotListKey, MapPlotter.foodPlotList);
			}
			, showSelectElement: function (elememtId) {
				var x = document.getElementById(elememtId);
				if (x) {
					x.style.display = "inline-block";
					x.selectedIndex = 0;
					x.addEventListener("change", MapPlotter.refreshSuggestion);
				}
			}
			, hideSelectElement: function (elememtId) {
				var x = document.getElementById(elememtId);
				if (x) {
					x.removeEventListener("change", MapPlotter.refreshSuggestion);
					x.selectedIndex = 0;
					x.style.display = "none";
				}
			}

			, getStateFromDrawing: function (callback, failCallback) {
				try {
					var lat = 0;
					var lng = 0;

					if (MapPlotter.foodPlotList.length <= 0) {
						callback(MapPlotter.currentState, MapPlotter.currentStateLat, MapPlotter.currentStateLng);
					}
					else {
						for (let i = 0; i < MapPlotter.foodPlotList.length; i++) {
							//MapPlotter.foodPlotList.forEach(i => {
							var foodPlot = MapPlotter.foodPlotList[i];
							foodPlot.forEach(function (latLng) {
								if (lat == 0 && lng == 0) {

									try {
										lat = latLng.lat();
										lng = latLng.lng();
									}
									catch (ex) {
										//after page refresh will not found lat() as function.
										lat = latLng.lat;
										lng = latLng.lng;
									}

									if (lat == MapPlotter.currentStateLat && lng == MapPlotter.currentStateLng) {
										//same lat lng as now, return current state
										callback(MapPlotter.currentState, lat, lng);
									}
									else {
										GeoLocationHelper.GoogleMapsTranslateGPS(lat, lng, callback, failCallback);
									}
								}
							});
						};
					}
				}
				catch (ex) {
					//stateCode = "NA";
				}

			}
			, refreshSuggestionProcessCallback: function (stateId, lat, lng) {
				var selectedState = '';
				if (stateId instanceof Array) {
					selectedState = stateId[0];
				} else {
					selectedState = stateId;
				}
				//replace blank to default state "CT"
				if (selectedState == "") {
					selectedState = "CT";
				}
				else {
					//save here
					if (selectedState && lat && lng && lat != "" && lng != "") {
						MapPlotter.currentState = selectedState;
						MapPlotter.currentStateLat = lat;
						MapPlotter.currentStateLng = lng;
					}
				}
				//console.log("stateId:" + stateId);
				//$('#currentState').html(stateId);
				//console.log("refreshSuggestion - stateId:" + stateId);
				//var selectedState = $('#states-list').children("option:selected").val();
				//var selectedSpecies = $('#species-list').val();
				var selectedSpecies = MapPlotter.GetSelectedSpeciesString();
				var selectedAreaInAcre = MapPlotter.acreageValue;
				//console.log("selectedState:" + selectedState);
				//console.log("selectedSpecies:" + selectedSpecies);

				//console.log("selectedAreaInAcre:" + selectedAreaInAcre);
				$('#divRecommendedProducts').html("No Result...");
				var suggestProduct = "";
				//console.log(MapPlotter.foodPlotData.Data);
				//$('#qty-needed-value').html("");

				for (let i = 0; i < MapPlotter.foodPlotData.Data.length; i++) {
					//MapPlotter.foodPlotData.Data.forEach(item => {
					var item = MapPlotter.foodPlotData.Data[i];
					if (item.item.states.includes(selectedState)) {
						if (item.item.species != null && selectedSpecies != null) {
							if (MapPlotter.containsAll(item.item.species, selectedSpecies)) {
								//console.log('found match : ' + item.item.suggestedProduct);
								//console.log("selectedAreaInAcre:" + selectedAreaInAcre);
								//console.log("item.item.suggestedProductSizeCoverageInArces:" + item.item.suggestedProductSizeCoverageInArces);

								var suggestedQty = Math.ceil(selectedAreaInAcre / item.item.suggestedProductSizeCoverageInArces);
								var suggestedQtyUnit = "bags";
								if (suggestedQty <= 1) {
									suggestedQtyUnit = "bag";
								}
								//console.log("item.item.suggestedQty:" + suggestedQty);

								//$('#qty-needed-value').html(suggestedQty);
								if (!Number.isNaN(suggestedQty)) {
									suggestProduct += '<a href="' + item.item.suggestedProductUrl + '" target="_blank">' + item.item.suggestedProduct + " (" + item.item.suggestedProductSize + " " + item.item.suggestedProductUnit + ") " + '</a> - ' + suggestedQty + ' ' + suggestedQtyUnit + ' <br />';
								}
								//$('#product-name-value').append('Product: <a href="' + item.item.suggestedProductUrl + '" target="_blank">' + item.item.suggestedProduct + " (" + item.item.suggestedProductSize + " " + item.item.suggestedProductUnit + ") " + '</a> - Qty: ' + suggestedQty + ' <br />');


							}
							//else {
							//    console.log("3");
							//}
						}
						//else {
						//    console.log("2");
						//}
					}
					//else {
					//    console.log("1");
					//}
				};
				//console.log("suggestProduct:" + suggestProduct);
				if (suggestProduct != "") {
					$('#divRecommendedProducts').html(suggestProduct);
				}
			}

			, refreshSuggestion: function () {
				var callbackFunction = MapPlotter.refreshSuggestionProcessCallback;
				//console.log("call refreshState");
				MapPlotter.getStateFromDrawing(callbackFunction, callbackFunction);
			}
			, containsAll: function (arrList, arrContainAll) {
				var itemNotfound = false;
				for (let i = 0; i < arrContainAll.length; i++) {
					//arrContainAll.forEach(item => {
					var item = arrContainAll[i];
					if (!arrList.includes(item)) {
						//console.log(item + " not found")
						itemNotfound = true;
						return false;
					}
				}
				return !itemNotfound;
			}

			, GetSelectedSpeciesString: function () {
				var selectedSpecies = [];
				var found = false;
				var checkedVals = $('.classChbListSpecies:checkbox:checked').map(function () {
					found = true;
					var xx = this.value;
					selectedSpecies.push(this.value);
					return this.value;
				}).get();
				//return checkedVals.join(",");

				MapPlotter.specieList = selectedSpecies;

				return selectedSpecies;
			}


			, GetCurrentPinType: function () {
				try {
					return $('.pinTypeBtn.active').attr("pintypevalue");
					//return $('.pinTypeSelection').attr("pintypevalue");
				}
				catch (ex) {
					return "FoodPlot";
				}
			}

			, ExportMapsToFile: function () {

				var alertBrowserNotSupport = false;
				if (DeviceHelper.IsMobileAndTablet()) {
					var browserName = DeviceHelper.BrowserName();
					if (DeviceHelper.IsIOS() && browserName !== "Safari") {
						alertBrowserNotSupport = true;
					}
					else if (DeviceHelper.IsAndroid()) {
						if (browserName !== "Chrome" && browserName !== "Firefox" && browserName !== "Samsung") {
							alertBrowserNotSupport = true;
						}
					}
				}
				if (alertBrowserNotSupport) {
					alert('Exporting is not fully supported by this browser. Trying to export.....');
				}


				var filename = "FoodPlot_Maps.json";
				if (MapPlotter.currentMapName != "") {
					filename = MapPlotter.currentMapName + ".json";
				}
				let dataStr = JSON.stringify(MapPlotter.savedMaps);
				let dataUri = encodeURIComponent(dataStr);

				var link = document.createElement("a");
				if (window.navigator && window.navigator.msSaveBlob) // IE 10+
				{
					var blobObject = new Blob([dataStr], { type: "application/json;charset=utf-8;" });
					link.onclick = function () {
						window.navigator.msSaveBlob(blobObject, filename);
					}
					link.click();
				}
				else {
					if (link.download !== undefined) // feature detection
					{
						// Browsers that support HTML5 download attribute
						link.setAttribute("href", 'data:application/json;charset=utf-8;,' + dataUri);
						link.setAttribute("download", filename);
						link.style.visibility = 'hidden';
						document.body.appendChild(link);
						link.click();
						document.body.removeChild(link);


					}
					else {

						//for iphone, save as csv\
						var blob = new Blob([dataStr], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
						link.href = window.URL.createObjectURL(blob);
						link.download = filename;
						document.body.appendChild(link);
						link.click();
						document.body.removeChild(link);

						//filename = "FoodPlot_Maps.csv";
						//link.setAttribute("href", 'data:text/csv;charset=utf-8;,' + dataUri);
						//link.setAttribute("download", filename);
						//link.style.visibility = 'hidden';
						//document.body.appendChild(link);
						//link.click();
						//document.body.removeChild(link);

					}
				}
			}

			, LoadMapsFromFile: function () {
				//console.log("LoadMapsFromFile");
				var fileReader = new FileReader();
				fileReader.onload = function () {
					//console.log("LoadMapsFromFile onload");
					var txtMaps = fileReader.result;  // data <-- in this var you have the file data in Base64 format
					var jMaps = JSON.parse(txtMaps);
					MapPlotter.clearMapsFromStorage();
					MapPlotter.LoadMapsFromJson(jMaps);
					MapPlotter.saveMapsToStorage();
					alert("Maps upload successful.");
				};
				fileReader.onerror = function () {
					alert("Error, please try again later.");
					//console.log("LoadMapsFromFile onerror");
				}
				fileReader.readAsText($('#hidFileUpload').prop('files')[0]);
				//console.log("LoadMapsFromFile exit");
				MapPlotter.clearUndoQueue();
			}

			, LoadMapsFromJson: function (jMaps) {
				MapPlotter.clearAllList();
				MapPlotter.savedMaps = jMaps;
				MapPlotter.saveMapsToStorage();
				//console.log(MapPlotter.savedMaps);
				if (MapPlotter.savedMaps && (Object.keys(MapPlotter.savedMaps).length > 0)) {
					var mapToLoad = Object.keys(MapPlotter.savedMaps)[0];
					MapPlotter.loadSavedMap(mapToLoad);
					MapPlotter.clearUndoQueue();
					MapPlotter.refreshMapDrawing();
					MapPlotter.centerOnMarkers();
				}
				else {
					MapPlotter.clearAllList();
					MapPlotter.map.setZoom(MapPlotter.defaultZoomLevel);
					MapPlotter.map.setCenter(new google.maps.LatLng(MapPlotter.defaultLat, MapPlotter.defaultLng));
				}
				MapPlotter.drawSavedMaps();
			}

			, initSearchInputAutocomplete: function () {

				// Create the search box and link it to the UI element.
				var input = document.getElementById('searchAddInput');
				var searchBox = new google.maps.places.SearchBox(input);
				//MapPlotter.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

				// Bias the SearchBox results towards current map's viewport.
				//MapPlotter.map.addListener('bounds_changed', function () {
				//    searchBox.setBounds(MapPlotter.map.getBounds());
				//});

				var markers = [];
				// Listen for the event fired when the user selects a prediction and retrieve
				// more details for that place.
				searchBox.addListener('places_changed', function () {
					var places = searchBox.getPlaces();

					//console.log(places);

					//if (places.length == 0) {
					//    return;
					//}

					// Clear out the old markers.
					markers.forEach(function (marker) {
						marker.setMap(null);
					});
					markers = [];

					// For each place, get the icon, name and location.
					var bounds = new google.maps.LatLngBounds();
					places.forEach(function (place) {
						if (!place.geometry) {
							//console.log("Returned place contains no geometry");
							return;
						}
						var icon = {
							url: place.icon,
							size: new google.maps.Size(71, 71),
							origin: new google.maps.Point(0, 0),
							anchor: new google.maps.Point(17, 34),
							scaledSize: new google.maps.Size(25, 25)
						};

						// Create a marker for each place.
						markers.push(new google.maps.Marker({
							map: map,
							icon: icon,
							title: place.name,
							position: place.geometry.location
						}));

						if (place.geometry.viewport) {
							// Only geocodes have viewport.
							bounds.union(place.geometry.viewport);
						} else {
							bounds.extend(place.geometry.location);
						}
					});
					MapPlotter.map.fitBounds(bounds);
				});
			}

			, GetCurrentLocation: function () {
				if (navigator.geolocation) {
					navigator.geolocation.getCurrentPosition(function (position) {
						var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
						MapPlotter.map.setCenter(latlng);
						MapPlotter.map.setZoom(18);
					});
				}
			}
			, /*initializeAccordion: function () {
				//console.log("init accordion");
				$('.panel-collapse').on('show.bs.collapse', function () {
					
					$(this).siblings('.panel-heading').addClass('active');
				});

				$('.panel-collapse').on('hide.bs.collapse', function () {
					//console.log("panel-collapse on hide");
					$(this).siblings('.panel-heading').removeClass('active');
				});
			}*/
			initializeAccordion: function () {
			
				//you can now use $ as your jQuery object.
				$(".panel-heading").click(function(e) {
				
						e.preventDefault();
			  
						if ($(this).hasClass("active")) {
			  
						  $(this).removeClass("active");
			  
						  $(this).parent().removeClass("show");
			  
						} else {
			  
						  $(this).addClass("active");
			  
						  $(this).parent().addClass("show");
			  
						}
						$(this)

						.parent()
			
						.addClass("show")
			
						.find(".foodplotHowToContent ")
			
						.slideToggle();
			
			
			
					  $(".panel-heading")
			
						.not(this)
			
						.parent()
			  
						.removeClass("show")
			
						.find(".foodplotHowToContent")
			
						.slideUp();
			
					});
			}
			, windowClicked: function (event) {
				if (!document.getElementById('map').contains(event.target)
					&& !document.getElementById('pinTypeButtonGroup').contains(event.target)
					//&& !document.getElementById('btnEditDrawing').contains(event.target)
					//&& !document.getElementById('btnEditDrawingXs').contains(event.target)
					&& !document.getElementById('btnUndoDrawDot').contains(event.target)
					&& !document.getElementById('btnUndoDrawDotXs').contains(event.target)) {
					// Clicked outside the map when drawing
					if ((MapPlotter.pointList.length > 0) || MapPlotter.currentPinType == "Edit" || MapPlotter.currentPinType == "Erase") {
						MapPlotter.btnDoneClicked();
						return;
					}
				}
			}

			, editMode: function () {
				MapPlotter.showdebug('editmode');
				$('#btnDone').html("Done Editing");
				$('#btnDoneXs').html("Done Editing");
				$('#btnDone').show();
				$('#btnDoneXs').show();

				$('#btnReset').hide();
				$('#btnResetXs').hide();
				//$('#btnEditDrawing').hide();
				//$('#btnEditDrawingXs').hide();         
			}
			, drawingMode: function () {
				$('#btnDone').html("Done Drawing");
				$('#btnDoneXs').html("Done Drawing");
				$('#btnDone').hide();
				$('#btnDoneXs').hide();
				$('#btnReset').show();
				$('#btnResetXs').show();
				//$('#btnEditDrawing').show();
				//$('#btnEditDrawingXs').show();
			}
		}
		var script = document.createElement('script');
		var apiKey = (document.getElementById('FoodPlotGoogleApiId').value);
		var callback = "MapPlotter.initialize";
		//callback = "initializeMap";
		var srcString = "https://maps.googleapis.com/maps/api/js?key=" + apiKey + "&callback=" + callback + "&libraries=geometry,places";
		script.src = srcString;
		console.log(srcString);
		document.getElementsByTagName('head')[0].appendChild(script);
	}
})(jQuery);