/*jshint latedef:false*/

//=include "../bower_components/jquery/dist/jquery.js"

var Main = (function($) {

  var $document,
      $window,
      $body,
      breakpointIndicatorString,
      breakpoint_xl,
      breakpoint_nav,
      breakpoint_lg,
      breakpoint_md,
      breakpoint_sm,
      breakpoint_xs,
      resizeTimer,
      transitionElements,
      isAnimating = false;

  function _init() {
    // Cache some common DOM queries
    $document = $(document);
    $window = $(window);
    $body = $('body');

    // Set screen size vars
    _resize();

    // Transition elements to enable/disable on resize
    transitionElements = [];

    // Init functions
    _backgroundGrid();

    // Esc handlers
    $(document).keyup(function(e) {
      if (e.keyCode === 27) {

      }
    });

  } // end init()

  function _backgroundGrid() {
    var beat = 24;
    var stagger = false;

    $('.background-grid').each(function() {
      var $inner = $(this).find('.-inner');
      var columns = Math.floor($inner.outerWidth() / beat);
      var rows = Math.floor($inner.outerHeight() / beat);

      function layColumns(c) {
        $inner.find('.grid-columns').append('<div class="grid-column" style="left:'+ beat*c +'px;"></div>');
      }

      function layRows(r) {
        $inner.find('.grid-rows').append('<div class="grid-row" style="top: '+ beat*r +'px;"></div>');
      }

      $inner.append('<div class="grid-columns"></div><div class="grid-rows"></div>');

      if (stagger === true) {
        for (var c = 0; c <= columns; c++) {
          (function (c) {
            setTimeout(function () {
              layColumns(c);
            }, .25 * c * 100);
          })(c);
        }
        for (var r = 0; r <= rows; r++) {
          (function (r) {
            setTimeout(function () {
              layRows(r);
            }, .25 * r * 100);
          })(r);
        }
      } else {
        for (var c = 0; c <= columns; c++) {
          layColumns(c);
        }
        for (var r = 0; r <= rows; r++) {
          layRows(r);
        }
      }
    });
  }

  // Disabling transitions on certain elements on resize
  function _disableTransitions() {
    $.each(transitionElements, function() {
      $(this).css('transition', 'none');
    });
  }

  function _enableTransitions() {
    $.each(transitionElements, function() {
      $(this).attr('style', '');
    });
  }

  /**
   * Called in quick succession as window is resized
   */
  function _resize() {
    // Check breakpoint indicator in DOM ( :after { content } is controlled by CSS media queries )
    breakpointIndicatorString = window.getComputedStyle(
      document.querySelector('#breakpoint-indicator'), ':after'
    ).getPropertyValue('content')
    .replace(/['"]+/g, '');

    // Determine current breakpoint
    breakpoint_xl = breakpointIndicatorString === 'xl';
    breakpoint_nav = breakpointIndicatorString === 'nav' || breakpoint_xl;
    breakpoint_lg = breakpointIndicatorString === 'lg' || breakpoint_nav;
    breakpoint_md = breakpointIndicatorString === 'md' || breakpoint_lg;
    breakpoint_sm = breakpointIndicatorString === 'sm' || breakpoint_md;
    breakpoint_xs = breakpointIndicatorString === 'xs' || breakpoint_sm;

    // Disable transitions when resizing
    _disableTransitions();

    // Functions to run on resize end
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      // Re-enable transitions
      _enableTransitions();
    }, 250);
  }

  // Public functions
  return {
    init: _init,
    resize: _resize
  };

})(jQuery);

// Fire up the mothership
jQuery(document).ready(Main.init);

// Zig-zag the mothership
jQuery(window).resize(Main.resize);
