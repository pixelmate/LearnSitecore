(function ($) {
  if ($(".store-locator").length > 0) {
    function inherits(childCtor, parentCtor) {
      /* @constructor */
      function tempCtor() {}
      tempCtor.prototype = parentCtor.prototype;
      childCtor.superClass_ = parentCtor.prototype;
      childCtor.prototype = new tempCtor();
      /* @override */
      childCtor.prototype.constructor = childCtor;
    }

    function MarkerLabel_(marker, crossURL, handCursorURL) {
      this.marker_ = marker;
      this.handCursorURL_ = marker.handCursorURL;

      this.labelDiv_ = document.createElement("div");
      this.labelDiv_.appendChild(document.createElement("div"));
      this.labelDiv_.style.cssText = "position: absolute; overflow: hidden;";

      this.eventDiv_ = document.createElement("div");
      this.eventDiv_.style.cssText = this.labelDiv_.style.cssText;

      // This is needed for proper behavior on MSIE:
      this.eventDiv_.setAttribute("onselectstart", "return false;");
      this.eventDiv_.setAttribute("ondragstart", "return false;");

      // Get the DIV for the "X" to be displayed when the marker is raised.
      this.crossDiv_ = MarkerLabel_.getSharedCross(crossURL);
    }

    inherits(MarkerLabel_, google.maps.OverlayView);

    MarkerLabel_.getSharedCross = function (crossURL) {
      var div;
      if (typeof MarkerLabel_.getSharedCross.crossDiv === "undefined") {
        div = document.createElement("img");
        div.style.cssText =
          "position: absolute; z-index: 1000002; display: none;";
        // Hopefully Google never changes the standard "X" attributes:
        div.style.marginLeft = "-8px";
        div.style.marginTop = "-9px";
        div.src = crossURL;
        MarkerLabel_.getSharedCross.crossDiv = div;
      }
      return MarkerLabel_.getSharedCross.crossDiv;
    };

    MarkerLabel_.prototype.onAdd = function () {
      var me = this;
      var cMouseIsDown = false;
      var cDraggingLabel = false;
      var cSavedZIndex;
      var cLatOffset, cLngOffset;
      var cIgnoreClick;
      var cRaiseEnabled;
      var cStartPosition;
      var cStartCenter;
      // Constants:
      var cRaiseOffset = 20;
      var cDraggingCursor = "url(" + this.handCursorURL_ + ")";

      // Stops all processing of an event.
      //
      var cAbortEvent = function (e) {
        if (e.preventDefault) {
          e.preventDefault();
        }
        e.cancelBubble = true;
        if (e.stopPropagation) {
          e.stopPropagation();
        }
      };

      var cStopBounce = function () {
        me.marker_.setAnimation(null);
      };

      this.getPanes().overlayImage.appendChild(this.labelDiv_);
      this.getPanes().overlayMouseTarget.appendChild(this.eventDiv_);
      // One cross is shared with all markers, so only add it once:
      if (typeof MarkerLabel_.getSharedCross.processed === "undefined") {
        this.getPanes().overlayImage.appendChild(this.crossDiv_);
        MarkerLabel_.getSharedCross.processed = true;
      }

      this.listeners_ = [
        google.maps.event.addDomListener(
          this.eventDiv_,
          "mouseover",
          function (e) {
            if (me.marker_.getDraggable() || me.marker_.getClickable()) {
              this.style.cursor = "pointer";
              google.maps.event.trigger(me.marker_, "mouseover", e);
            }
          }
        ),
        google.maps.event.addDomListener(
          this.eventDiv_,
          "mouseout",
          function (e) {
            if (
              (me.marker_.getDraggable() || me.marker_.getClickable()) &&
              !cDraggingLabel
            ) {
              this.style.cursor = me.marker_.getCursor();
              google.maps.event.trigger(me.marker_, "mouseout", e);
            }
          }
        ),
        google.maps.event.addDomListener(
          this.eventDiv_,
          "mousedown",
          function (e) {
            cDraggingLabel = false;
            if (me.marker_.getDraggable()) {
              cMouseIsDown = true;
              this.style.cursor = cDraggingCursor;
            }
            if (me.marker_.getDraggable() || me.marker_.getClickable()) {
              google.maps.event.trigger(me.marker_, "mousedown", e);
              cAbortEvent(e); // Prevent map pan when starting a drag on a label
            }
          }
        ),
        google.maps.event.addDomListener(
          document,
          "mouseup",
          function (mEvent) {
            var position;
            if (cMouseIsDown) {
              cMouseIsDown = false;
              me.eventDiv_.style.cursor = "pointer";
              google.maps.event.trigger(me.marker_, "mouseup", mEvent);
            }
            if (cDraggingLabel) {
              if (cRaiseEnabled) {
                // Lower the marker & label
                position = me
                  .getProjection()
                  .fromLatLngToDivPixel(me.marker_.getPosition());
                position.y += cRaiseOffset;
                me.marker_.setPosition(
                  me.getProjection().fromDivPixelToLatLng(position)
                );
                // This is not the same bouncing style as when the marker portion is dragged,
                // but it will have to do:
                try {
                  // Will fail if running Google Maps API earlier than V3.3
                  me.marker_.setAnimation(google.maps.Animation.BOUNCE);
                  setTimeout(cStopBounce, 1406);
                } catch (e) {}
              }
              me.crossDiv_.style.display = "none";
              me.marker_.setZIndex(cSavedZIndex);
              cIgnoreClick = true; // Set flag to ignore the click event reported after a label drag
              cDraggingLabel = false;
              mEvent.latLng = me.marker_.getPosition();
              google.maps.event.trigger(me.marker_, "dragend", mEvent);
            }
          }
        ),
        google.maps.event.addListener(
          me.marker_.getMap(),
          "mousemove",
          function (mEvent) {
            var position;
            if (cMouseIsDown) {
              if (cDraggingLabel) {
                // Change the reported location from the mouse position to the marker position:
                mEvent.latLng = new google.maps.LatLng(
                  mEvent.latLng.lat() - cLatOffset,
                  mEvent.latLng.lng() - cLngOffset
                );
                position = me
                  .getProjection()
                  .fromLatLngToDivPixel(mEvent.latLng);
                if (cRaiseEnabled) {
                  me.crossDiv_.style.left = position.x + "px";
                  me.crossDiv_.style.top = position.y + "px";
                  me.crossDiv_.style.display = "";
                  position.y -= cRaiseOffset;
                }
                me.marker_.setPosition(
                  me.getProjection().fromDivPixelToLatLng(position)
                );
                if (cRaiseEnabled) {
                  // Don't raise the veil; this hack needed to make MSIE act properly
                  me.eventDiv_.style.top = position.y + cRaiseOffset + "px";
                }
                google.maps.event.trigger(me.marker_, "drag", mEvent);
              } else {
                // Calculate offsets from the click point to the marker position:
                cLatOffset =
                  mEvent.latLng.lat() - me.marker_.getPosition().lat();
                cLngOffset =
                  mEvent.latLng.lng() - me.marker_.getPosition().lng();
                cSavedZIndex = me.marker_.getZIndex();
                cStartPosition = me.marker_.getPosition();
                cStartCenter = me.marker_.getMap().getCenter();
                cRaiseEnabled = me.marker_.get("raiseOnDrag");
                cDraggingLabel = true;
                me.marker_.setZIndex(1000000); // Moves the marker & label to the foreground during a drag
                mEvent.latLng = me.marker_.getPosition();
                google.maps.event.trigger(me.marker_, "dragstart", mEvent);
              }
            }
          }
        ),
        google.maps.event.addDomListener(document, "keydown", function (e) {
          if (cDraggingLabel) {
            if (e.keyCode === 27) {
              // Esc key
              cRaiseEnabled = false;
              me.marker_.setPosition(cStartPosition);
              me.marker_.getMap().setCenter(cStartCenter);
              google.maps.event.trigger(document, "mouseup", e);
            }
          }
        }),
        google.maps.event.addDomListener(this.eventDiv_, "click", function (e) {
          if (me.marker_.getDraggable() || me.marker_.getClickable()) {
            if (cIgnoreClick) {
              // Ignore the click reported when a label drag ends
              cIgnoreClick = false;
            } else {
              google.maps.event.trigger(me.marker_, "click", e);
              cAbortEvent(e); // Prevent click from being passed on to map
            }
          }
        }),
        google.maps.event.addDomListener(
          this.eventDiv_,
          "dblclick",
          function (e) {
            if (me.marker_.getDraggable() || me.marker_.getClickable()) {
              google.maps.event.trigger(me.marker_, "dblclick", e);
              cAbortEvent(e); // Prevent map zoom when double-clicking on a label
            }
          }
        ),
        google.maps.event.addListener(
          this.marker_,
          "dragstart",
          function (mEvent) {
            if (!cDraggingLabel) {
              cRaiseEnabled = this.get("raiseOnDrag");
            }
          }
        ),
        google.maps.event.addListener(this.marker_, "drag", function (mEvent) {
          if (!cDraggingLabel) {
            if (cRaiseEnabled) {
              me.setPosition(cRaiseOffset);
              // During a drag, the marker's z-index is temporarily set to 1000000 to
              // ensure it appears above all other markers. Also set the label's z-index
              // to 1000000 (plus or minus 1 depending on whether the label is supposed
              // to be above or below the marker).
              me.labelDiv_.style.zIndex =
                1000000 + (this.get("labelInBackground") ? -1 : +1);
            }
          }
        }),
        google.maps.event.addListener(
          this.marker_,
          "dragend",
          function (mEvent) {
            if (!cDraggingLabel) {
              if (cRaiseEnabled) {
                me.setPosition(0); // Also restores z-index of label
              }
            }
          }
        ),
        google.maps.event.addListener(
          this.marker_,
          "position_changed",
          function () {
            me.setPosition();
          }
        ),
        google.maps.event.addListener(
          this.marker_,
          "zindex_changed",
          function () {
            me.setZIndex();
          }
        ),
        google.maps.event.addListener(
          this.marker_,
          "visible_changed",
          function () {
            me.setVisible();
          }
        ),
        google.maps.event.addListener(
          this.marker_,
          "labelvisible_changed",
          function () {
            me.setVisible();
          }
        ),
        google.maps.event.addListener(
          this.marker_,
          "title_changed",
          function () {
            me.setTitle();
          }
        ),
        google.maps.event.addListener(
          this.marker_,
          "labelcontent_changed",
          function () {
            me.setContent();
          }
        ),
        google.maps.event.addListener(
          this.marker_,
          "labelanchor_changed",
          function () {
            me.setAnchor();
          }
        ),
        google.maps.event.addListener(
          this.marker_,
          "labelclass_changed",
          function () {
            me.setStyles();
          }
        ),
        google.maps.event.addListener(
          this.marker_,
          "labelstyle_changed",
          function () {
            me.setStyles();
          }
        ),
      ];
    };

    MarkerLabel_.prototype.onRemove = function () {
      var i;
      this.labelDiv_.parentNode.removeChild(this.labelDiv_);
      this.eventDiv_.parentNode.removeChild(this.eventDiv_);

      // Remove event listeners:
      for (i = 0; i < this.listeners_.length; i++) {
        google.maps.event.removeListener(this.listeners_[i]);
      }
    };

    MarkerLabel_.prototype.draw = function () {
      this.setContent();
      this.setTitle();
      this.setStyles();
    };

    MarkerLabel_.prototype.setContent = function () {
      var content = this.marker_.get("labelContent");
      content += "<div class='inner'></div>";
      if (typeof content.nodeType === "undefined") {
        this.labelDiv_.innerHTML = content;
        this.eventDiv_.innerHTML = this.labelDiv_.innerHTML;
      } else {
        this.labelDiv_.innerHTML = ""; // Remove current content
        this.labelDiv_.appendChild(content);
        content = content.cloneNode(true);
        this.eventDiv_.appendChild(content);
      }
    };

    MarkerLabel_.prototype.setTitle = function () {
      this.eventDiv_.title = this.marker_.getTitle() || "";
    };

    MarkerLabel_.prototype.setStyles = function () {
      var i, labelStyle;

      // Apply style values from the style sheet defined in the labelClass parameter:
      this.labelDiv_.className = this.marker_.get("labelClass");
      this.eventDiv_.className = this.labelDiv_.className;

      // Clear existing inline style values:
      this.labelDiv_.style.cssText = "";
      this.eventDiv_.style.cssText = "";
      // Apply style values defined in the labelStyle parameter:
      labelStyle = this.marker_.get("labelStyle");
      for (i in labelStyle) {
        if (labelStyle.hasOwnProperty(i)) {
          this.labelDiv_.style[i] = labelStyle[i];
          this.eventDiv_.style[i] = labelStyle[i];
        }
      }
      this.setMandatoryStyles();
    };

    MarkerLabel_.prototype.setMandatoryStyles = function () {
      this.labelDiv_.style.position = "absolute";
      this.labelDiv_.style.overflow = "hidden";
      // Make sure the opacity setting causes the desired effect on MSIE:
      if (
        typeof this.labelDiv_.style.opacity !== "undefined" &&
        this.labelDiv_.style.opacity !== ""
      ) {
        this.labelDiv_.style.MsFilter =
          '"progid:DXImageTransform.Microsoft.Alpha(opacity=' +
          this.labelDiv_.style.opacity * 100 +
          ')"';
        this.labelDiv_.style.filter =
          "alpha(opacity=" + this.labelDiv_.style.opacity * 100 + ")";
      }

      this.eventDiv_.style.position = this.labelDiv_.style.position;
      this.eventDiv_.style.overflow = this.labelDiv_.style.overflow;
      this.eventDiv_.style.opacity = 0.01; // Don't use 0; DIV won't be clickable on MSIE
      this.eventDiv_.style.MsFilter =
        '"progid:DXImageTransform.Microsoft.Alpha(opacity=1)"';
      this.eventDiv_.style.filter = "alpha(opacity=1)"; // For MSIE

      this.setAnchor();
      this.setPosition(); // This also updates z-index, if necessary.
      this.setVisible();
    };

    MarkerLabel_.prototype.setAnchor = function () {
      var anchor = this.marker_.get("labelAnchor");
      this.labelDiv_.style.marginLeft = -anchor.x + "px";
      this.labelDiv_.style.marginTop = -anchor.y + "px";
      this.eventDiv_.style.marginLeft = -anchor.x + "px";
      this.eventDiv_.style.marginTop = -anchor.y + "px";
    };

    MarkerLabel_.prototype.setPosition = function (yOffset) {
      var position = this.getProjection().fromLatLngToDivPixel(
        this.marker_.getPosition()
      );
      if (typeof yOffset === "undefined") {
        yOffset = 0;
      }
      this.labelDiv_.style.left = Math.round(position.x) + "px";
      this.labelDiv_.style.top = Math.round(position.y - yOffset) + "px";
      this.eventDiv_.style.left = this.labelDiv_.style.left;
      this.eventDiv_.style.top = this.labelDiv_.style.top;

      this.setZIndex();
    };

    MarkerLabel_.prototype.setZIndex = function () {
      var zAdjust = this.marker_.get("labelInBackground") ? -1 : +1;
      if (typeof this.marker_.getZIndex() === "undefined") {
        this.labelDiv_.style.zIndex =
          parseInt(this.labelDiv_.style.top, 10) + zAdjust;
        this.eventDiv_.style.zIndex = this.labelDiv_.style.zIndex;
      } else {
        this.labelDiv_.style.zIndex = this.marker_.getZIndex() + zAdjust;
        this.eventDiv_.style.zIndex = this.labelDiv_.style.zIndex;
      }
    };

    MarkerLabel_.prototype.setVisible = function () {
      if (this.marker_.get("labelVisible")) {
        this.labelDiv_.style.display = this.marker_.getVisible()
          ? "block"
          : "none";
      } else {
        this.labelDiv_.style.display = "none";
      }
      this.eventDiv_.style.display = this.labelDiv_.style.display;
    };

    function MarkerWithLabel(opt_options) {
      opt_options = opt_options || {};
      opt_options.labelContent = opt_options.labelContent || "";
      opt_options.labelAnchor =
        opt_options.labelAnchor || new google.maps.Point(0, 0);
      opt_options.labelClass = opt_options.labelClass || "markerLabels";
      opt_options.labelStyle = opt_options.labelStyle || {};
      opt_options.labelInBackground = opt_options.labelInBackground || false;
      if (typeof opt_options.labelVisible === "undefined") {
        opt_options.labelVisible = true;
      }
      if (typeof opt_options.raiseOnDrag === "undefined") {
        opt_options.raiseOnDrag = true;
      }
      if (typeof opt_options.clickable === "undefined") {
        opt_options.clickable = true;
      }
      if (typeof opt_options.draggable === "undefined") {
        opt_options.draggable = false;
      }
      if (typeof opt_options.optimized === "undefined") {
        opt_options.optimized = false;
      }
      opt_options.crossImage =
        opt_options.crossImage ||
        "http" +
          (document.location.protocol === "https:" ? "s" : "") +
          "://maps.gstatic.com/intl/en_us/mapfiles/drag_cross_67_16.png";
      opt_options.handCursor =
        opt_options.handCursor ||
        "http" +
          (document.location.protocol === "https:" ? "s" : "") +
          "://maps.gstatic.com/intl/en_us/mapfiles/closedhand_8_8.cur";
      opt_options.optimized = false; // Optimized rendering is not supported

      this.label = new MarkerLabel_(
        this,
        opt_options.crossImage,
        opt_options.handCursor
      ); // Bind the label to the marker

      google.maps.Marker.apply(this, arguments);
    }

    inherits(MarkerWithLabel, google.maps.Marker);

    MarkerWithLabel.prototype.setMap = function (theMap) {
      // Call the inherited function...
      google.maps.Marker.prototype.setMap.apply(this, arguments);

      // ... then deal with the label:
      this.label.setMap(theMap);
    };

    /* ======================================================
                Store Locatore 
        ========================================================= */

    var ApiUrl = $(".store-locator-info").attr("data-ApiUrl");
    var GetDirectionsText = $(".store-locator-info").attr(
      "data-getdirectionstext"
    );
    var DefaultSearchRadius = $(".store-locator-info").attr(
      "data-defaultsearchradius"
    );
    var BrandSetting = $(".store-locator-info").attr("data-brandsetting");
    var ProductIdSetting = $(".store-locator-info").attr(
      "data-productidsetting"
    );

    var markers = [];
    var map = null;
    var activeInfowindow = null;

    var initLat = 39.0558;
    var initLon = -95.6894;

    var resList = "";

    function getUrlVars() {
      var vars = [],
        hash;
      var hashes = window.location.href
        .slice(window.location.href.indexOf("?") + 1)
        .split("&");
      for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split("=");
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
      }
      return vars;
    }

    function getProductIdFromUrl() {
      return getUrlVars()["productId"];
    }

    function isValidZipCode(value) {
      if (value.match(/^\d{5}(?:[-\s]\d{4})?$/)) {
        return true;
      }
      return false;
    }

    function infowindowHtml(
      title,
      phone,
      street,
      street2,
      city,
      state,
      distance,
      mapUrl,
      directionsText,
      zip,
      website
    ) {
      var infoStr =
        '<div class="gm-style-iw"><b>' +
        title +
        "</b><p>" +
        street +
        "<br />" +
        city +
        ", " +
        state +
        " " +
        zip +
        "<br/>";
      if (phone) {
        var iw_phone_num = phone.replace(
          /\D/g,
          ""
        ); /* Replace any character that is NOT a number */
        if (iw_phone_num.length > 9) {
          infoStr +=
            '<a class="iw-phone" href="tel:' +
            iw_phone_num +
            '" >' +
            phone +
            "</a><br/>";
        }
      }
      if (website) {
        infoStr +=
          '<a href="' +
          website +
          '" target="_blank" class="iw-website">Website</a><br/>';
      }
      infoStr += "Distance: " + distance + " miles</p>";
      infoStr +=
        '<p><a href="' +
        mapUrl +
        '" target="_blank" class="directionsUrl">' +
        directionsText +
        "</a></p>";
      infoStr += "</div>";
      return infoStr;
    }

    function closeActiveInfowindows() {
      if (activeInfowindow != null) activeInfowindow.close();
    }

    function bindInfoWindow(marker, infowindow, strDescription) {
      google.maps.event.addListener(marker, "click", function () {
        closeActiveInfowindows();
        infowindow.setContent(strDescription);
        infowindow.open(map, marker);
        activeInfowindow = infowindow;
        map.setCenter(marker.getPosition());
      });
    }

    // Sets the map on all markers in the array.
    function setAllMap(mapObj) {
      for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(mapObj);
      }
    }

    function clearMarkers() {
      setAllMap(null);
    }

    function refreshMap() {
      map.setZoom(4);
      map.setCenter(new google.maps.LatLng(39.0558, -95.6894));
      clearMarkers();
    }

    function createPins(data, directionsText) {
      resList = "";
      var count = 0;
      var latlngbounds = new google.maps.LatLngBounds();
      var latlng = [];

      refreshMap();

      if (Object.keys(data).length === 0) {
        return;
      }

      $(data).each(function () {
        count++;
        var src =
          "https://chart.googleapis.com/chart?chst=d_map_spin&chld=0.60|0|e3e3e3|10|b|";
        var iconSrc = $("#marker-icon").find("img");
        if (iconSrc.length) src = iconSrc[0].src;

        // create list
        resList += '<div class="store-wrapper">';
        resList += '  <div class="store-marker">' + count + "</div>";

        resList += '  <div class="store-info">';
        resList += "    <h4>" + this.storeName + "</h4>";
        resList += "    <p>" + this.address1 + "<br/>";
        resList += this.city + ", " + this.state + " " + this.zip;
        if (this.phone) {
          var store_phone_num = this.phone.replace(
            /\D/g,
            ""
          ); /* Replace any character that is NOT a number */
          if (store_phone_num.length > 9) {
            resList +=
              '<br/><a class="store-phone" href="tel:' +
              store_phone_num +
              '" >' +
              this.phone +
              "</a>";
          }
        }
        resList += "</p>";
        if (this.website) {
          resList +=
            '<p class="store-website"><a class="store-website-text" href="' +
            this.website +
            '" target="_blank">Website</a></p>';
        }

        resList += '    <p class="distance">' + this.distance + " miles ";
        resList +=
          '<a href="' +
          this.mapUrl +
          '" target="_blank" class="directionsText">' +
          directionsText +
          "</a></p>";
        resList += "  </div>";
        resList += "</div>";

        // create pins
        var lat = this.latitude;
        var lng = this.longitude;
        if (lat && lng) {
          var location = new google.maps.LatLng(lat, lng);
          latlng.push(location);

          var marker = null;

          if (iconSrc.length) {
            var micon = {
              url: src, // url
              scaledSize: new google.maps.Size(35, 47), // scaled size
              origin: new google.maps.Point(0, 0), // origin
              anchor: new google.maps.Point(0, 0), // anchor
              // labelOrigin: new google.maps.Point(30, 30)
            };

            var labelposition = new google.maps.Point(-14, -11);
            if (count > 10 && count < 100) {
              labelposition = new google.maps.Point(-10, -11);
            } else if (count > 99) {
              labelposition = new google.maps.Point(-8, -11);
            }

            marker = new MarkerWithLabel({
              position: location,
              map: map,
              labelContent: "" + count,
              labelAnchor: labelposition,
              icon: micon,
              labelInBackground: false,
            });
          } else {
            var defaultIcon = {
              url:
                "https://chart.googleapis.com/chart?chst=d_map_spin&chld=0.60|0|e3e3e3|10|b|" +
                count,
            };
            marker = new google.maps.Marker({
              position: location,
              icon: defaultIcon,
              map: map,
            });
          }

          this.address2 = this.address2 ? this.address2 : "";
          this.phone = this.phone ? this.phone : "";
          this.website = this.website ? this.website : "";

          var contentString = infowindowHtml(
            this.storeName,
            this.phone,
            this.address1,
            this.address2,
            this.city,
            this.state,
            this.distance,
            this.mapUrl,
            directionsText,
            this.zip,
            this.website
          );

          var infowindow = new google.maps.InfoWindow({
            content: contentString,
            position: location,
          });

          bindInfoWindow(marker, infowindow, contentString);
          markers.push(marker);
        }
      });
      if (latlng.length) {
        for (var i = 0; i < latlng.length; i++) {
          latlngbounds.extend(latlng[i]);
        }
        map.fitBounds(latlngbounds);

        //limit zoom level if only 1 result on map.
        var maxZoom = 15;
        var currentZoomLevel = map.getZoom();
        if (currentZoomLevel > maxZoom) {
          map.setZoom(maxZoom);
        }
      }
      $("#search-result-list").html(resList);
    }

    function initMap() {
      var mapCanvas = document.getElementById("storeResultsMap");
      var mapOptions = {
        center: new google.maps.LatLng(initLat, initLon),
        zoom: 4,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
      };
      map = new google.maps.Map(mapCanvas, mapOptions);
    }

    function getStores(options) {
      var zipcodeVal = $("#zipcode").val();
      var radiusVal = $("#radius").val();

      if (typeof radiusVal === "undefined" || radiusVal === "") {
        radiusVal = options.defaultsearch;
      }

      //when open page directly, cancel search
      if (
        (typeof zipcodeVal === "undefined" || zipcodeVal === "") &&
        !getProductIdFromUrl()
      ) {
        refreshMap();
        return;
      }

      $.ajax({
        type: "GET",
        url: options.api,
        data: {
          zipcode: zipcodeVal,
          radius: radiusVal,
          brand: options.brand,
          prodID: options.prod,
        },
        dataType: "jsonp",
        // needed for CD
        beforeSend: function (xhr) {
          $(".no-locations-found").hide();
          if (xhr.overrideMimeType) {
            xhr.overrideMimeType("application/json");
          }
        },
        success: function (data, status, xhr) {
          if (data.length > 0) {
            createPins(data, options.dir);
          } else {
            $(".no-locations-found").show();
          }
        },
        crossDomain: true,
        error: function (jqXHR, textStatus, errorThrown) {
          console.log(textStatus, errorThrown);
        },
      });
    }

    function StoreLocator(
      apiUrl,
      directionsText,
      defaultSearchRadius,
      brandVal,
      prodIdVal
    ) {
      // get url zip and prefill input
      var startZip = parseInt(getUrlVars()["q"]).toString();
      if (isValidZipCode(startZip)) {
        $("#zipcode").val(startZip);
      }

      // use parameter productId from query string if specified
      var productId = getProductIdFromUrl();
      if (productId && productId.length > 0) {
        prodIdVal = productId;
      }

      $.when(initMap()).done(function () {
        $("#search-btn").click(function (e) {
          e.preventDefault();
          var zipcodeVal = $("#zipcode").val();
          if (isValidZipCode(zipcodeVal)) {
            $(".zip-error").hide();
            getStores({
              api: apiUrl,
              dir: directionsText,
              brand: brandVal,
              prod: prodIdVal,
              defaultsearch: defaultSearchRadius,
            });
          } else {
            $(".zip-error").show();
            $("input#zipcode").focus().select();
          }
        });

        getStores({
          api: apiUrl,
          dir: directionsText,
          brand: brandVal,
          prod: prodIdVal,
          defaultsearch: defaultSearchRadius,
        });
      });
    }

    //if (!ApiUrl) throw new Error("Cannot initialize StoreLocator without args.ApiUrl");

    StoreLocator(
      ApiUrl,
      GetDirectionsText,
      DefaultSearchRadius,
      BrandSetting,
      ProductIdSetting
    );
  }
})(jQuery);
