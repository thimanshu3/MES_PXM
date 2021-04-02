/*! Backstretch - v2.0.4 - 2013-06-19
* http://srobbin.com/jquery-plugins/backstretch/
* Copyright (c) 2013 Scott Robbin; Licensed MIT */

; (function ($, window, undefined) {
  'use strict';

  /* PLUGIN DEFINITION
   * ========================= */

  $.fn.backstretch = function (images, options) {
    // We need at least one image or method name
    if (images === undefined || images.length === 0) {
      $.error("No images were supplied for Backstretch");
    }

    /*
     * Scroll the page one pixel to get the right window height on iOS
     * Pretty harmless for everyone else
    */
    if ($(window).scrollTop() === 0) {
      window.scrollTo(0, 0);
    }

    return this.each(function () {
      var $this = $(this)
        , obj = $this.data('backstretch');

      // Do we already have an instance attached to this element?
      if (obj) {

        // Is this a method they're trying to execute?
        if (typeof images == 'string' && typeof obj[images] == 'function') {
          // Call the method
          obj[images](options);

          // No need to do anything further
          return;
        }

        // Merge the old options with the new
        options = $.extend(obj.options, options);

        // Remove the old instance
        obj.destroy(true);
      }

      obj = new Backstretch(this, images, options);
      $this.data('backstretch', obj);
    });
  };

  // If no element is supplied, we'll attach to body
  $.backstretch = function (images, options) {
    // Return the instance
    return $('body')
      .backstretch(images, options)
      .data('backstretch');
  };

  // Custom selector
  $.expr[':'].backstretch = function (elem) {
    return $(elem).data('backstretch') !== undefined;
  };

  /* DEFAULTS
   * ========================= */

  $.fn.backstretch.defaults = {
    centeredX: true   // Should we center the image on the X axis?
    , centeredY: true   // Should we center the image on the Y axis?
    , duration: 5000    // Amount of time in between slides (if slideshow)
    , fade: 0           // Speed of fade transition between slides
  };

  /* STYLES
   * 
   * Baked-in styles that we'll apply to our elements.
   * In an effort to keep the plugin simple, these are not exposed as options.
   * That said, anyone can override these in their own stylesheet.
   * ========================= */
  var styles = {
    wrap: {
      left: 0
      , top: 0
      , overflow: 'hidden'
      , margin: 0
      , padding: 0
      , height: '100%'
      , width: '100%'
      , zIndex: -999999
    }
    , img: {
      position: 'absolute'
      , display: 'none'
      , margin: 0
      , padding: 0
      , border: 'none'
      , width: 'auto'
      , height: 'auto'
      , maxHeight: 'none'
      , maxWidth: 'none'
      , zIndex: -999999
    }
  };

  /* CLASS DEFINITION
   * ========================= */
  var Backstretch = function (container, images, options) {
    this.options = $.extend({}, $.fn.backstretch.defaults, options || {});

    /* In its simplest form, we allow Backstretch to be called on an image path.
     * e.g. $.backstretch('/path/to/image.jpg')
     * So, we need to turn this back into an array.
     */
    this.images = $.isArray(images) ? images : [images];

    // Preload images
    $.each(this.images, function () {
      $('<img />')[0].src = this;
    });

    // Convenience reference to know if the container is body.
    this.isBody = container === document.body;

    /* We're keeping track of a few different elements
     *
     * Container: the element that Backstretch was called on.
     * Wrap: a DIV that we place the image into, so we can hide the overflow.
     * Root: Convenience reference to help calculate the correct height.
     */
    this.$container = $(container);
    this.$root = this.isBody ? supportsFixedPosition ? $(window) : $(document) : this.$container;

    // Don't create a new wrap if one already exists (from a previous instance of Backstretch)
    var $existing = this.$container.children(".backstretch").first();
    this.$wrap = $existing.length ? $existing : $('<div class="backstretch"></div>').css(styles.wrap).appendTo(this.$container);

    // Non-body elements need some style adjustments
    if (!this.isBody) {
      // If the container is statically positioned, we need to make it relative,
      // and if no zIndex is defined, we should set it to zero.
      var position = this.$container.css('position')
        , zIndex = this.$container.css('zIndex');

      this.$container.css({
        position: position === 'static' ? 'relative' : position
        , zIndex: zIndex === 'auto' ? 0 : zIndex
        , background: 'none'
      });

      // Needs a higher z-index
      this.$wrap.css({ zIndex: -999998 });
    }

    // Fixed or absolute positioning?
    this.$wrap.css({
      position: this.isBody && supportsFixedPosition ? 'fixed' : 'absolute'
    });

    // Set the first image
    this.index = 0;
    this.show(this.index);

    // Listen for resize
    $(window).on('resize.backstretch', $.proxy(this.resize, this))
      .on('orientationchange.backstretch', $.proxy(function () {
        // Need to do this in order to get the right window height
        if (this.isBody && window.pageYOffset === 0) {
          window.scrollTo(0, 1);
          this.resize();
        }
      }, this));
  };

  /* PUBLIC METHODS
   * ========================= */
  Backstretch.prototype = {
    resize: function () {
      try {
        var bgCSS = { left: 0, top: 0 }
          , rootWidth = this.isBody ? this.$root.width() : this.$root.innerWidth()
          , bgWidth = rootWidth
          , rootHeight = this.isBody ? (window.innerHeight ? window.innerHeight : this.$root.height()) : this.$root.innerHeight()
          , bgHeight = bgWidth / this.$img.data('ratio')
          , bgOffset;

        // Make adjustments based on image ratio
        if (bgHeight >= rootHeight) {
          bgOffset = (bgHeight - rootHeight) / 2;
          if (this.options.centeredY) {
            bgCSS.top = '-' + bgOffset + 'px';
          }
        } else {
          bgHeight = rootHeight;
          bgWidth = bgHeight * this.$img.data('ratio');
          bgOffset = (bgWidth - rootWidth) / 2;
          if (this.options.centeredX) {
            bgCSS.left = '-' + bgOffset + 'px';
          }
        }

        this.$wrap.css({ width: rootWidth, height: rootHeight })
          .find('img:not(.deleteable)').css({ width: bgWidth, height: bgHeight }).css(bgCSS);
      } catch (err) {
        // IE7 seems to trigger resize before the image is loaded.
        // This try/catch block is a hack to let it fail gracefully.
      }

      return this;
    }

    // Show the slide at a certain position
    , show: function (newIndex) {

      // Validate index
      if (Math.abs(newIndex) > this.images.length - 1) {
        return;
      }

      // Vars
      var self = this
        , oldImage = self.$wrap.find('img').addClass('deleteable')
        , evtOptions = { relatedTarget: self.$container[0] };

      // Trigger the "before" event
      self.$container.trigger($.Event('backstretch.before', evtOptions), [self, newIndex]);

      // Set the new index
      this.index = newIndex;

      // Pause the slideshow
      clearInterval(self.interval);

      // New image
      self.$img = $('<img />')
        .css(styles.img)
        .bind('load', function (e) {
          var imgWidth = this.width || $(e.target).width()
            , imgHeight = this.height || $(e.target).height();

          // Save the ratio
          $(this).data('ratio', imgWidth / imgHeight);

          // Show the image, then delete the old one
          // "speed" option has been deprecated, but we want backwards compatibilty
          $(this).fadeIn(self.options.speed || self.options.fade, function () {
            oldImage.remove();

            // Resume the slideshow
            if (!self.paused) {
              self.cycle();
            }

            // Trigger the "after" and "show" events
            // "show" is being deprecated
            $(['after', 'show']).each(function () {
              self.$container.trigger($.Event('backstretch.' + this, evtOptions), [self, newIndex]);
            });
          });

          // Resize
          self.resize();
        })
        .appendTo(self.$wrap);

      // Hack for IE img onload event
      self.$img.attr('src', self.images[newIndex]);
      return self;
    }

    , next: function () {
      // Next slide
      return this.show(this.index < this.images.length - 1 ? this.index + 1 : 0);
    }

    , prev: function () {
      // Previous slide
      return this.show(this.index === 0 ? this.images.length - 1 : this.index - 1);
    }

    , pause: function () {
      // Pause the slideshow
      this.paused = true;
      return this;
    }

    , resume: function () {
      // Resume the slideshow
      this.paused = false;
      this.next();
      return this;
    }

    , cycle: function () {
      // Start/resume the slideshow
      if (this.images.length > 1) {
        // Clear the interval, just in case
        clearInterval(this.interval);

        this.interval = setInterval($.proxy(function () {
          // Check for paused slideshow
          if (!this.paused) {
            this.next();
          }
        }, this), this.options.duration);
      }
      return this;
    }

    , destroy: function (preserveBackground) {
      // Stop the resize events
      $(window).off('resize.backstretch orientationchange.backstretch');

      // Clear the interval
      clearInterval(this.interval);

      // Remove Backstretch
      if (!preserveBackground) {
        this.$wrap.remove();
      }
      this.$container.removeData('backstretch');
    }
  };

  /* SUPPORTS FIXED POSITION?
   *
   * Based on code from jQuery Mobile 1.1.0
   * http://jquerymobile.com/
   *
   * In a nutshell, we need to figure out if fixed positioning is supported.
   * Unfortunately, this is very difficult to do on iOS, and usually involves
   * injecting content, scrolling the page, etc.. It's ugly.
   * jQuery Mobile uses this workaround. It's not ideal, but works.
   *
   * Modified to detect IE6
   * ========================= */

  var supportsFixedPosition = (function () {
    var ua = navigator.userAgent
      , platform = navigator.platform
      // Rendering engine is Webkit, and capture major version
      , wkmatch = ua.match(/AppleWebKit\/([0-9]+)/)
      , wkversion = !!wkmatch && wkmatch[1]
      , ffmatch = ua.match(/Fennec\/([0-9]+)/)
      , ffversion = !!ffmatch && ffmatch[1]
      , operammobilematch = ua.match(/Opera Mobi\/([0-9]+)/)
      , omversion = !!operammobilematch && operammobilematch[1]
      , iematch = ua.match(/MSIE ([0-9]+)/)
      , ieversion = !!iematch && iematch[1];

    return !(
      // iOS 4.3 and older : Platform is iPhone/Pad/Touch and Webkit version is less than 534 (ios5)
      ((platform.indexOf("iPhone") > -1 || platform.indexOf("iPad") > -1 || platform.indexOf("iPod") > -1) && wkversion && wkversion < 534) ||

      // Opera Mini
      (window.operamini && ({}).toString.call(window.operamini) === "[object OperaMini]") ||
      (operammobilematch && omversion < 7458) ||

      //Android lte 2.1: Platform is Android and Webkit version is less than 533 (Android 2.2)
      (ua.indexOf("Android") > -1 && wkversion && wkversion < 533) ||

      // Firefox Mobile before 6.0 -
      (ffversion && ffversion < 6) ||

      // WebOS less than 3
      ("palmGetResource" in window && wkversion && wkversion < 534) ||

      // MeeGo
      (ua.indexOf("MeeGo") > -1 && ua.indexOf("NokiaBrowser/8.5.0") > -1) ||

      // IE6
      (ieversion && ieversion <= 6)
    );
  }());

}(jQuery, window));















/*! Backstretch - v2.0.4 - 2013-06-19
* http://srobbin.com/jquery-plugins/backstretch/
* Copyright (c) 2013 Scott Robbin; Licensed MIT */
(function (a, d, p) { a.fn.backstretch = function (c, b) { (c === p || 0 === c.length) && a.error("No images were supplied for Backstretch"); 0 === a(d).scrollTop() && d.scrollTo(0, 0); return this.each(function () { var d = a(this), g = d.data("backstretch"); if (g) { if ("string" == typeof c && "function" == typeof g[c]) { g[c](b); return } b = a.extend(g.options, b); g.destroy(!0) } g = new q(this, c, b); d.data("backstretch", g) }) }; a.backstretch = function (c, b) { return a("body").backstretch(c, b).data("backstretch") }; a.expr[":"].backstretch = function (c) { return a(c).data("backstretch") !== p }; a.fn.backstretch.defaults = { centeredX: !0, centeredY: !0, duration: 5E3, fade: 0 }; var r = { left: 0, top: 0, overflow: "hidden", margin: 0, padding: 0, height: "100%", width: "100%", zIndex: -999999 }, s = { position: "absolute", display: "none", margin: 0, padding: 0, border: "none", width: "auto", height: "auto", maxHeight: "none", maxWidth: "none", zIndex: -999999 }, q = function (c, b, e) { this.options = a.extend({}, a.fn.backstretch.defaults, e || {}); this.images = a.isArray(b) ? b : [b]; a.each(this.images, function () { a("<img />")[0].src = this }); this.isBody = c === document.body; this.$container = a(c); this.$root = this.isBody ? l ? a(d) : a(document) : this.$container; c = this.$container.children(".backstretch").first(); this.$wrap = c.length ? c : a('<div class="backstretch"></div>').css(r).appendTo(this.$container); this.isBody || (c = this.$container.css("position"), b = this.$container.css("zIndex"), this.$container.css({ position: "static" === c ? "relative" : c, zIndex: "auto" === b ? 0 : b, background: "none" }), this.$wrap.css({ zIndex: -999998 })); this.$wrap.css({ position: this.isBody && l ? "fixed" : "absolute" }); this.index = 0; this.show(this.index); a(d).on("resize.backstretch", a.proxy(this.resize, this)).on("orientationchange.backstretch", a.proxy(function () { this.isBody && 0 === d.pageYOffset && (d.scrollTo(0, 1), this.resize()) }, this)) }; q.prototype = { resize: function () { try { var a = { left: 0, top: 0 }, b = this.isBody ? this.$root.width() : this.$root.innerWidth(), e = b, g = this.isBody ? d.innerHeight ? d.innerHeight : this.$root.height() : this.$root.innerHeight(), j = e / this.$img.data("ratio"), f; j >= g ? (f = (j - g) / 2, this.options.centeredY && (a.top = "-" + f + "px")) : (j = g, e = j * this.$img.data("ratio"), f = (e - b) / 2, this.options.centeredX && (a.left = "-" + f + "px")); this.$wrap.css({ width: b, height: g }).find("img:not(.deleteable)").css({ width: e, height: j }).css(a) } catch (h) { } return this }, show: function (c) { if (!(Math.abs(c) > this.images.length - 1)) { var b = this, e = b.$wrap.find("img").addClass("deleteable"), d = { relatedTarget: b.$container[0] }; b.$container.trigger(a.Event("backstretch.before", d), [b, c]); this.index = c; clearInterval(b.interval); b.$img = a("<img />").css(s).bind("load", function (f) { var h = this.width || a(f.target).width(); f = this.height || a(f.target).height(); a(this).data("ratio", h / f); a(this).fadeIn(b.options.speed || b.options.fade, function () { e.remove(); b.paused || b.cycle(); a(["after", "show"]).each(function () { b.$container.trigger(a.Event("backstretch." + this, d), [b, c]) }) }); b.resize() }).appendTo(b.$wrap); b.$img.attr("src", b.images[c]); return b } }, next: function () { return this.show(this.index < this.images.length - 1 ? this.index + 1 : 0) }, prev: function () { return this.show(0 === this.index ? this.images.length - 1 : this.index - 1) }, pause: function () { this.paused = !0; return this }, resume: function () { this.paused = !1; this.next(); return this }, cycle: function () { 1 < this.images.length && (clearInterval(this.interval), this.interval = setInterval(a.proxy(function () { this.paused || this.next() }, this), this.options.duration)); return this }, destroy: function (c) { a(d).off("resize.backstretch orientationchange.backstretch"); clearInterval(this.interval); c || this.$wrap.remove(); this.$container.removeData("backstretch") } }; var l, f = navigator.userAgent, m = navigator.platform, e = f.match(/AppleWebKit\/([0-9]+)/), e = !!e && e[1], h = f.match(/Fennec\/([0-9]+)/), h = !!h && h[1], n = f.match(/Opera Mobi\/([0-9]+)/), t = !!n && n[1], k = f.match(/MSIE ([0-9]+)/), k = !!k && k[1]; l = !((-1 < m.indexOf("iPhone") || -1 < m.indexOf("iPad") || -1 < m.indexOf("iPod")) && e && 534 > e || d.operamini && "[object OperaMini]" === {}.toString.call(d.operamini) || n && 7458 > t || -1 < f.indexOf("Android") && e && 533 > e || h && 6 > h || "palmGetResource" in d && e && 534 > e || -1 < f.indexOf("MeeGo") && -1 < f.indexOf("NokiaBrowser/8.5.0") || k && 6 >= k) })(jQuery, window);











































function scroll_to_class(element_class, removed_height) {
  var scroll_to = $(element_class).offset().top - removed_height;
  if ($(window).scrollTop() != scroll_to) {
    $('html, body').stop().animate({ scrollTop: scroll_to }, 0);
  }
}

function bar_progress(progress_line_object, direction) {
  var number_of_steps = progress_line_object.data('number-of-steps');
  var now_value = progress_line_object.data('now-value');
  var new_value = 0;
  if (direction == 'right') {
    new_value = now_value + (100 / number_of_steps);
  }
  else if (direction == 'left') {
    new_value = now_value - (100 / number_of_steps);
  }
  progress_line_object.attr('style', 'width: ' + new_value + '%;').data('now-value', new_value);
}

jQuery(document).ready(function () {

  /*
      Fullscreen background
  */
  $.backstretch("assets/img/backgrounds/1.jpg");

  $('#top-navbar-1').on('shown.bs.collapse', function () {
    $.backstretch("resize");
  });
  $('#top-navbar-1').on('hidden.bs.collapse', function () {
    $.backstretch("resize");
  });

  /*
      Form
  */
  $('.f1 fieldset:first').fadeIn('slow');

  $('.f1 input[type="text"], .f1 input[type="password"], .f1 textarea').on('focus', function () {
    $(this).removeClass('input-error');
  });

  // next step
  $('.f1 .btn-next').on('click', function () {
    var parent_fieldset = $(this).parents('fieldset');
    var next_step = true;
    // navigation steps / progress steps
    var current_active_step = $(this).parents('.f1').find('.f1-step.active');
    var progress_line = $(this).parents('.f1').find('.f1-progress-line');
    let error;
    // fields validation
    parent_fieldset.find('input[type="text"], input[type="radio"], textarea, input[type="file"]').each(function () {
      if ($(this).val() == "") {
        $(this).addClass('input-error');
        error = true;
        next_step = false;
      }
      else {
        previewTheData();
        $(this).removeClass('input-error');
      }
    });
    // fields validation
    if(error){ sendErrorMessage(); error = false}
    if (next_step) {
      parent_fieldset.fadeOut(400, function () {
        // change icons
        current_active_step.removeClass('active').addClass('activated').next().addClass('active');
        // progress bar
        bar_progress(progress_line, 'right');
        // show next step
        $(this).next().fadeIn();
        // scroll window to beginning of the form
        scroll_to_class($('.f1'), 20);
      });
    }

  });

  // previous step
  $('.f1 .btn-previous').on('click', function () {
    // navigation steps / progress steps
    var current_active_step = $(this).parents('.f1').find('.f1-step.active');
    var progress_line = $(this).parents('.f1').find('.f1-progress-line');

    $(this).parents('fieldset').fadeOut(400, function () {
      // change icons
      current_active_step.removeClass('active').prev().removeClass('activated').addClass('active');
      // progress bar
      bar_progress(progress_line, 'left');
      // show previous step
      $(this).prev().fadeIn();
      // scroll window to beginning of the form
      scroll_to_class($('.f1'), 20);
    });
  });

  // submit
  $('.f1').on('submit', function (e) {

    // fields validation
    $(this).find('input[type="text"], input[type="password"], textarea').each(function () {
      if ($(this).val() == "") {
        e.preventDefault();
        $(this).addClass('input-error');
      }
      else {
        $(this).removeClass('input-error');
      }
    });
    // fields validation

  });


});

var column;
$(document).ready(function () {

  $('input[type="text"], input[type="password"], textarea').each(function () {
    $(this).val($(this).attr('placeholder'));
  });
 
});


var headers;
let selectedFile;
document.getElementById('et_pb_contact_brand_file_request_0').addEventListener("change", (event) => {
    selectedFile = event.target.files[0];
  
})

const previewTheData = () => {
  if (selectedFile ) {
    let fileReader = new FileReader();
    fileReader.readAsBinaryString(selectedFile);
    fileReader.onload = (event) => {
      let data = event.target.result;
      let workbook = XLSX.read(data, { type: "binary" });
      const sheet_name_list = workbook.SheetNames;
      let jsonPagesArray = [];
      sheet_name_list.forEach(function (sheet) {
        const jsonPage = {
          name: sheet,
          content: XLSX.utils.sheet_to_json(workbook.Sheets[sheet], { defval: null })
        };
        jsonPagesArray.push(jsonPage);
      });
      if (jsonPagesArray.length) {
        jsonPagesArray.forEach(pages => {
          if (pages.content.length) {
            
            createHeader(pages.content[0])
            addDataTobody(pages.content)
            
          }
        })
      }
    }
  }

}
const sendFileToProcess = () => {
  if(column == undefined){
    iziToast.warning({message: "Please select one column to proceed..."})
    return;
  }
  fetch(`/admin/importrawdata`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
     column,
     
    })
  })
    .then(function (res) {
      return res.json()
    })
    .then(function (json) {
      if (json.status == 200)
        iziToast.success({
          message: json.message
        })
      else if (json.status == 400)
        iziToast.error({
          title: json.message,
          message: json.error
        })
      else
        iziToast.error({
          message: json.message
        })
    })
    .catch(err => console.log(err))
}

const GetTable = () => {
  var table = $('#dytable').DataTable({
    scrollX: true,
    scrollY: '60vh'
  });
  $('#preloader').hide()
  $('#tableField').append('<div class="f1-buttons mt-5"><button type="button" class="btn btn-previous" > Previous</button ><button id="sendFileToProcessBtn" onclick="sendFileToProcess()" class="btn ml-3 btn-submit">Submit</button></div>')
}

var executedH = false;
var executedB = false;

const createHeader = (fields) => {
  try {
    if (!executedH) {
      executedH = true;
      Object.keys(fields).forEach(field => {
        $('#exampleFormControlSelect1').append(`<option value="${field}">${field}</option>`)
        $('#headers').append(`<th scope="col">${field.toUpperCase()}</th>`)
      })
    }
  }
  catch (err) {
    console.log(err.toString())
  }
}
const addDataTobody = (content) => {
  try {
    if (!executedB) {
      executedB = true;
      content.forEach(row => {
        var tr = document.createElement('tr');
        for (var key in row) {
          if (row.hasOwnProperty(key) && key != '__EMPTY') {
            let td = document.createElement('td');
            td.innerHTML = row[key] != null ? row[key] : '-'
            tr.appendChild(td);
          }
        }
        $('#rowarea').append(tr)
      })
      setTimeout(function () { GetTable() }, 10000);
    }
  }
  catch (err) {
    console.log(err)
  }
}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// To import Catalogue
const buildQueryData = (data) => {
  var querydata = []
  var parentId = ''
  var lastKeyOrder = ''
  var idArray = []
  var cnt = 0
  var flag=false
  var flag2 = false
  data.forEach(object => {
    temp={}
    if (object.Name != null){
      temp.id = uuidv4()
      temp.parentId='1'
      temp.catalogueHierarchy = 'bc77c4b6-8a0d-4150-b8ec-22af5a8e2172'
      temp.text=object.Name
      temp.createdBy='admin'
      querydata.push(temp)

      cnt=0
      lastKeyOrder = 'e'
      idArray[cnt]=temp.id
      flag=true
      //parentId=temp.id
    }
    else{
        let count = -1
        
        Object.keys(object).forEach((key) => {
        count += 1
        if(object[key] != null){
          //Do not touch
          // let index = Object.keys(object).indexOf(key)++
          // while(object(Object.keys(index))!=null){
          //   object[key] = object[key] + object(Object.keys(index))
          //   index+=1
          // }

          temp.id = uuidv4()
          if(flag){
            cnt+=1
            flag=false //came from root to inner
            flag2 = true //in inner loop
          }
          if (lastKeyOrder == key.slice(-1)) {
            idArray[cnt] = temp.id
          }
          else {
            if(!flag2){
              cnt+=1
              //flag=3
            }
            if(cnt==count){

              idArray[cnt] = temp.id
            }
            else{
              idArray[count] = temp.id
              cnt=count

            }
            flag = false
            flag2=false
          }
          lastKeyOrder = key.slice(-1)
          //idArray[count] = temp.id
          //parentId = (lastKeyOrder != key.slice(-1) ? idArray[cnt] : parentId)
          parentId = (idArray[cnt-1]==undefined ? idArray[cnt-2]:idArray[cnt-1])
          
          temp.parentId=parentId
          temp.text=object[key]
          temp.createdBy = 'admin'
          temp.catalogueHierarchy = 'bc77c4b6-8a0d-4150-b8ec-22af5a8e2172'
          querydata.push(temp)

          
          return
        }
        
        });
      
    }
    
  })
  // console.log(getDuplicates(querydata, 'id'))
  return querydata
}

// const getDuplicates = (arr, key) => {
//   const keys = arr.map(item => item[key]);
//   return keys.filter(key => keys.indexOf(key) !== keys.lastIndexOf(key))
// }

const sendErrorMessage = () =>{ 
  iziToast.error({
    message: 'Please Fill All Required Fields'
  })
}




$('#exampleFormControlSelect1').on('change', (e) =>{
   column = $("option:selected").val()

})