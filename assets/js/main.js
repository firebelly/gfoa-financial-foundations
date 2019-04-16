/*jshint latedef:false*/

//=include "../bower_components/jquery/dist/jquery.js"
//=include "../bower_components/velocity/velocity.js"
//=include "../bower_components/scrollmagic/scrollmagic/minified/ScrollMagic.min.js"
//=include "../bower_components/scrollmagic/scrollmagic/minified/plugins/animation.gsap.min.js"
//=include "../../node_modules/gsap/src/minified/TweenMax.min.js"

var Main = (function($) {

  var $document,
      $window,
      $body,
      $flashBar,
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
    $flashBar = $('#flashbar');

    // Set screen size vars
    _resize();

    // Transition elements to enable/disable on resize
    transitionElements = [];

    // Init functions
    _initFlashBar();
    _backgroundGrid();
    _initExpandingPillars();
    _initScrollMagic();

    // Esc handlers
    $(document).keyup(function(e) {
      if (e.keyCode === 27) {

      }
    });

  } // end init()

  function _initFlashBar() {
    setTimeout(function() {
      $flashBar.addClass('-active');
    }, 500);

    $('#flashbar-close').on('click', function() {
      $flashBar.removeClass('-active');
    });
  }

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

      for (var c = 0; c <= columns; c++) {
        if (stagger === true) {
          (function(c) {
            setTimeout(function () {
              layColumns(c);
            }, 0.25 * c * 100);
          })(c);
        } else {
          layColumns(c);
        }
      }

      for (var r = 0; r <= rows; r++) {
        if (stagger === true) {
          (function(r) {
            setTimeout(function () {
              layRows(r);
            }, 0.25 * r * 100);
          })(r);
        } else {
          layRows(r);
        }
      }
    });
  }

  function _initExpandingPillars() {
    _hidePillars();

    $('.pillar-expand').on('click', function() {
        var targetPillar = $(this).attr('data-targetPillar');
        var $pillar = $('#'+targetPillar);

        if ($pillar.is('.-active')) {
          $(this).removeClass('-active');
          _collapsePillar($pillar);
        } else {
          $(this).addClass('-active');
          _expandPillar($pillar);
        }
    });
  }

  function _deactivatePillar($pillar) {
    $pillar.removeClass('-active');
  }

  function _activatePillar($pillar) {
    $pillar.addClass('-active');
  }

  function _collapsePillar($pillar) {
    _deactivatePillar($pillar);
    $pillar.find('.expandable-pillar-content').velocity({
      opacity: 0,
      easing: 'easeout',
      duration: 250
    }).velocity('slideUp', {
      easing: 'easeOutQuart',
      duration: 250
    });
  }

  function _expandPillar($pillar) {
    _activatePillar($pillar);
    $pillar.find('.expandable-pillar-content').velocity('slideDown', {
      easing: 'easeOutQuart',
      duration: 250
    }).velocity({
      opacity: 1,
      easing: 'easeOut',
      duration: 250
    });
  }

  function _hidePillars() {
    _deactivatePillar($('.expandable-pillar'));
    $('.expandable-pillar-content').hide();
  }

  function _initScrollMagic() {
    function pathPrepare ($el) {
      var lineLength = $el[0].getTotalLength();
      $el.css("stroke-dasharray", lineLength);
      $el.css("stroke-dashoffset", lineLength);
    }

    var $line = $("path#scroll-line");
    var $dot = $("circle#scroll-dot");

    // prepare SVG
    pathPrepare($line);

    // init controller
    var controller = new ScrollMagic.Controller();

    // build tween
    var tween = new TimelineMax()
      .add(TweenMax.to($dot, 0.005, {attr:{r:12}, ease:Linear.easeNone}))
      .add(TweenMax.to($line, 0.01, {strokeDashoffset: 0, ease:Linear.easeNone}));

    // build scene
    var scene = new ScrollMagic.Scene({triggerElement: "#section-one-art", duration: 200, tweenChanges: true})
            .setTween(tween)
            .addTo(controller);
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
