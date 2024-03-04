/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */


// Note: This example requires that you consent to location sharing when
// prompted by your browser. If you see the error "The Geolocation service
// failed.", it means you probably did not give permission for the browser to
// locate you.
(function ($) {
    var _callback;
    //function to init geolocation services for use with map
    window.geolocationService = {
        init: function (callback) {
            _callback = callback;
            //check if geolocation exists
            if ('geolocation' in navigator) {
                //get current lat lng
                navigator.geolocation.getCurrentPosition(this.success, this.error);
            }
            else {
                console.log('Sorry, Geolocation is not supported by your browser. You will have to manually enter you zip code for the map functionality.');
            }
        },
        success: function (position) {
            _callback(position)
        },
        error: function (error) {
            console.log('Sorry, there was a problem accesssing your location: (' + error.code + ')' + error.message);
        }
    }

    window.googleMapsLoader = {
            loadGoogleMaps : (function (window) {
                "use strict";
    
                var now = $.now(),
                    promise;
    
                return function (version, apiKey, language, sensor) {
                    if (promise) {
                        return promise;
                    }
    
                    //Create a Deferred Object
                    var deferred = $.Deferred(),
                        //Declare a resolve function, pass google.maps for the done functions
                        resolve = function () {
                            deferred.resolve(window.google && window.google.maps ? window.google.maps : false);
                        },
                        //global callback name
                        callbackName = "loadGoogleMaps_" + (now++),
    
                        // Default Parameters
                        params = $.extend({
                            "sensor": sensor || "false"
                        },
                        apiKey ? {
                            "key": apiKey
                        } : {},
                        language ? {
                            "language": language
                        } : {});
    
                    //If google.maps exists, then Google Maps API was probably loaded with the <script> tag
                    if (window.google && window.google.maps) {
                        resolve();
                        //If the google.load method exists, lets load the Google Maps API in Async.
                    } else if (window.google && window.google.load) {
                        window.google.load("maps", version || 3, {
                            "other_params": $.param(params),
                            "callback": resolve
                        });
                        //Last, try pure jQuery Ajax technique to load the Google Maps API in Async.
                    } else {
                        //Ajax URL params
                        params = $.extend(params, {
                            'callback': callbackName
                        });
    
                        //Declare the global callback
                        window[callbackName] = function () {
                            resolve();
    
                            //Delete callback
                            setTimeout(function () {
                                try {
                                    delete window[callbackName];
                                } catch (e) { }
                            }, 20);
                        };
    
                        //Can't use the jXHR promise because 'script' doesn't support 'callback=?'
                        $.ajax({
                            dataType: 'script',
                            data: params,
                            url: '//maps.googleapis.com/maps/api/js'
                        });
    
                    }
    
                    promise = deferred.promise();
    
                    return promise;
                };
    
            })(window)
    }
    function Geocoder() { };//geocoder is initialized as new google maps geocoder obj in returned init function
    function geocode(requestProperties, callback) {
        Geocoder.geocode(requestProperties, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                var userLatLng = results[0].geometry.location;
                var coords = [userLatLng.lat(), userLatLng.lng()];
                callback(coords);
            } else if (status == google.maps.GeocoderStatus.ZERO_RESULTS) {
                callback(null);
            }
        });
    }

    var reverseGeocodeCoordinates = function (lat, lng, callback) {
        var coords = geocode({
            'location': { lat: lat, lng: lng }
        }, callback);
    };

    var geoCodeAddress = function (address, callback) {
        var coords = geocode({
            'address': address
        }, callback);
    };

    Number.prototype.toRad = function () {
        return this * Math.PI / 180;
    }
    

    // load in location results from script
    // inserted in page header scripts field
    var results;
    if (!_.isUndefined(window.CGPLocationData)) {
        results = CGPLocationData;
    }

    //distance calculation implemented with haversine formula
    function calcDistance(latLng1, latLng2) {
        var radius = 6371; //in kilometers
        var lat1 = latLng1[Object.keys(latLng1)[0]];
        var lng1 = latLng1[Object.keys(latLng1)[1]];
        var lat2 = latLng2[Object.keys(latLng2)[0]];
        var lng2 = latLng2[Object.keys(latLng2)[1]];
        var x1 = lat2 - lat1;
        var dLat = x1.toRad();
        var x2 = lng2 - lng1;
        var dLon = x2.toRad();
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                        Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = radius * c;
        return d;
    };

    var getClosestResult = function (coords) {
        var closest = -1;
        var closestIndex = -1;
        for (var result in results) {
            var distance = calcDistance(coords, results[result].latlng);
            if (distance < closest || closest < 0) {
                closest = distance;
                closestIndex = result;
            }
        }
        return results[closestIndex];
    }

    function displayResult(result) {
        var resultHtml;
        if (typeof mapBuilder.map !== 'undefined' && result) {
            mapBuilder.zoomToMap(result.latlng, 11);

            resultHtml = "<div class=''><div class='result'><h4 class='name'>" + result.businessSegment + "</h4><span class='name'>Type: " + result.businessType + "</span><br /><span class='name'>Division: " + result.businessSubType + "</span><br /><span class='address'>" + result.addrFormatted + "</span><br /></div></div>"
        } else if (!result) {
            resultHtml = '<div class="result"><h4>No results found.</h4><span>Try searching with a different ZIP code.</span></div>';
        }
        $('.map-search-container .map-search-result').html(resultHtml);
    }

    //determine icon to use for map based on the business segment type
    //corporate, garden, or pet
    function getLocationIcon(location) {
        var type = location.businessType ? location.businessType.trim() : '';
        if (type == "Office") {
            var segment = location.businessSegment ? location.businessSegment.trim() : '';
            if (segment == "Corporate") {
                return mapBuilder.markerIconCorporate;
            }
            return mapBuilder.markerIconOffice;
        } else if (type == "Distribution") {
            return mapBuilder.markerIconDistribution;
        } else if (type == "Manufacturing") {
            return mapBuilder.markerIconManufacturing;
        }
    }

    window.mapBuilder = {
        container: '.map-container',
        centerCoords:{ lat: 41.84, lng: -87.6847 },
        checkSearch: function (input) {
            input = input.trim();
            if (input.match(/(^\d{4}?\d$|^\d{4}?\d-\d{4}$)/)) {
                $('.zip-error').hide();
                //ga('send', 'event', 'Locations Map', 'search', input);
                geoCodeAddress(input, function (coords) {
                    if (coords) {
                        displayResult(getClosestResult(coords));
                    } else {
                        displayResult(null);
                    }
                });
            } else {
                $('.map-search-container .map-search-result').empty();
                $('.zip-error').show();
            }
        },
        zoomToMap: function (latlng, zoom) {
            if (latlng) {
                if (this.map.getZoom() < zoom) {
                    this.map.setZoom(zoom);
                }
                this.map.panTo(latlng);
            }
        },
        setMarkers: function (map, locations) {
            for (var i = 0; i < locations.length; i++) {
                var myLatLng = new google.maps.LatLng(locations[i].latlng.lat, locations[i].latlng.lng);
                var marker = new google.maps.Marker({
                    position: myLatLng,
                    map: map,
                    title: locations[i].name,
                    zIndex: 1,
                    icon: getLocationIcon(locations[i])
                });
                locations[i].marker = marker; // give location result a reference to its marker
                marker.locationData = locations[i]; // give marker a reference to its location
                marker.addListener('click', function () {
                    displayResult(this.locationData);
                });
            }
        },
        initGoogleStyledMap: function () {
            var styledMapType = new google.maps.StyledMapType(
            [
              {
                  "elementType": "geometry",
                  "stylers": [
                    {
                        "color": "#f5f5f5"
                    }
                  ]
              },
              {
                  "elementType": "labels.icon",
                  "stylers": [
                    {
                        "visibility": "off"
                    }
                  ]
              },
              {
                  "elementType": "labels.text.fill",
                  "stylers": [
                    {
                        "color": "#616161"
                    }
                  ]
              },
              {
                  "elementType": "labels.text.stroke",
                  "stylers": [
                    {
                        "color": "#f5f5f5"
                    }
                  ]
              },
              {
                  "featureType": "administrative.land_parcel",
                  "elementType": "labels.text.fill",
                  "stylers": [
                    {
                        "color": "#bdbdbd"
                    }
                  ]
              },
              {
                  "featureType": "poi",
                  "elementType": "geometry",
                  "stylers": [
                    {
                        "color": "#eeeeee"
                    }
                  ]
              },
              {
                  "featureType": "poi",
                  "elementType": "labels.text.fill",
                  "stylers": [
                    {
                        "color": "#757575"
                    }
                  ]
              },
              {
                  "featureType": "poi.park",
                  "elementType": "geometry",
                  "stylers": [
                    {
                        "color": "#e5e5e5"
                    }
                  ]
              },
              {
                  "featureType": "poi.park",
                  "elementType": "labels.text.fill",
                  "stylers": [
                    {
                        "color": "#9e9e9e"
                    }
                  ]
              },
              {
                  "featureType": "road",
                  "elementType": "geometry",
                  "stylers": [
                    {
                        "color": "#ffffff"
                    }
                  ]
              },
              {
                  "featureType": "road.arterial",
                  "elementType": "labels.text.fill",
                  "stylers": [
                    {
                        "color": "#757575"
                    }
                  ]
              },
              {
                  "featureType": "road.highway",
                  "elementType": "geometry",
                  "stylers": [
                    {
                        "color": "#dadada"
                    }
                  ]
              },
              {
                  "featureType": "road.highway",
                  "elementType": "labels.text.fill",
                  "stylers": [
                    {
                        "color": "#616161"
                    }
                  ]
              },
              {
                  "featureType": "road.local",
                  "elementType": "labels.text.fill",
                  "stylers": [
                    {
                        "color": "#9e9e9e"
                    }
                  ]
              },
              {
                  "featureType": "transit.line",
                  "elementType": "geometry",
                  "stylers": [
                    {
                        "color": "#e5e5e5"
                    }
                  ]
              },
              {
                  "featureType": "transit.station",
                  "elementType": "geometry",
                  "stylers": [
                    {
                        "color": "#eeeeee"
                    }
                  ]
              },
              {
                  "featureType": "water",
                  "elementType": "geometry",
                  "stylers": [
                    {
                        "color": "#c9c9c9"
                    }
                  ]
              },
              {
                  "featureType": "water",
                  "elementType": "labels.text.fill",
                  "stylers": [
                    {
                        "color": "#9e9e9e"
                    }
                  ]
              }
            ],
            { name: 'Styled Map' }
            );

            // Create a map object, and include the MapTypeId to add
            // to the map type control.
            var _map = new google.maps.Map(document.getElementById('map-canvas'), {
                center: this.centerCoords,
                zoom: 4,
                mapTypeControlOptions: {
                    mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain',
                            'styled_map']
                }
            });

            //Associate the styled map with the MapTypeId and set it to display.
            _map.mapTypes.set('styled_map', styledMapType);
            _map.setMapTypeId('styled_map');

            this.setMarkers(_map, results);
            this.map = _map;
        },
        init: function () {
            
            $(this.container).attr('id', 'map-canvas');
            var markerOfficeIcon = document.getElementById('MarkerOfficeIcon').value;
			var markerCorporateIcon = document.getElementById('MarkerCorporateIcon').value;
			var markerDistributionIcon = document.getElementById('MarkerDistributionIcon').value;
			var markerManufacturingIcon = document.getElementById('MarkerManufacturingIcon').value;
            if (typeof google !== 'undefined') {
                //settings
                this.markerIconOffice = {
                    url: markerOfficeIcon,
                    size: new google.maps.Size(35, 35),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(18, 35)
                };
                this.markerIconDistribution = {
                    url: markerDistributionIcon,
                    size: new google.maps.Size(35, 35),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(18, 35)
                };
                this.markerIconManufacturing = {
                    url: markerManufacturingIcon,
                    size: new google.maps.Size(35, 35),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(18, 35)
                };
                this.markerIconCorporate = {
                    url: markerCorporateIcon,
                    size: new google.maps.Size(35, 35),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(18, 35)
                };

                mapBuilder.initGoogleStyledMap();

                geolocationService.init(function (userLocation) {
                    if (typeof userLocation != 'undefined') {
                        var coords = [userLocation.coords.latitude, userLocation.coords.longitude];
                        displayResult(getClosestResult(coords));
                    }
                });
            }
        }
    }

    $(document).ready(function () {
        $('.address').keypress(function (e) {
            if (e.keyCode === 13) {
                var _userInput = $(".address").val();
                mapBuilder.checkSearch(_userInput);
                return false;
            }
        });

        $('.submit').on('click', function (e) {
            e.stopPropagation();
            e.preventDefault();
            var _userInput = $(".address").val();
            mapBuilder.checkSearch(_userInput);
        });

        $('.map-container').closest('.collapse').on('shown.bs.collapse', function () {
            if (typeof google != 'undefined') {
                google.maps.event.trigger(mapBuilder.map, 'resize');
                mapBuilder.map.setCenter(mapBuilder.centerCoords);
            }
        });
    });
    // var args = document.getElementById('mapkey').value
    function init(args) {
        if (!args)
            throw new Error("Cannot initialize without API Key");
        $.when(googleMapsLoader.loadGoogleMaps(3, args)).then(function () {
            Geocoder = new google.maps.Geocoder();
            mapBuilder.init();
        });
    }
   if($('.map-container').length){ 
        init(document.getElementById('mapkey').value);
    }

})(jQuery);