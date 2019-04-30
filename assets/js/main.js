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
      $startButton,
      $pillarNav,
      pillarHeights = [],
      pillarScenes = [],
      breakpointIndicatorString,
      breakpoint_xl,
      breakpoint_nav,
      breakpoint_lg,
      breakpoint_md,
      breakpoint_sm,
      breakpoint_xs,
      resizeTimer,
      controller,
      transitionElements,
      isAnimating = false;

  function _init() {
    // Cache some common DOM queries
    $document = $(document);
    $window = $(window);
    $body = $('body');
    $flashBar = $('#flashbar');
    $startButton = $('#start-button');
    $pillarNav = $('#pillar-nav');

    // init scrollmagic controller
    controller = new ScrollMagic.Controller();

    // Init pillar scenes
    for (var p = 0; p < $('.pillar').length - 1; p++) {
      var $pillar = $('.pillar').eq(p);
      pillarScenes.push(new ScrollMagic.Scene({triggerElement: $pillar[0], triggerHook: 'onLeave'}));
    }

    // Set screen size vars
    _resize();

    // Transition elements to enable/disable on resize
    transitionElements = [];

    // Init functions
    _initFlashBar();
    _initStartButton();
    _backgroundGrid();
    _initExpandingPillars();
    // Pillar Heights
    _updatePillarScenes();
    _initPillarNav();
    _initScrollMagic();

    // Esc handlers
    $(document).keyup(function(e) {
      if (e.keyCode === 27) {
        if ($('.expandable-pillar.-active').length) {
          _collapsePillar($('.expandable-pillar.-active'));
        }
      }
    });

  } // end init()

  function _scrollBody(element, offset) {
    if (!breakpoint_md && typeof offset !== "undefined" && offset !== null) {
      offset = $('#pillar-nav').outerHeight();
    } else {
      offset = 0;
    }

    if (element.length) {
      isAnimating = true;
      element.velocity('scroll', {
        duration: 500,
        offset: -offset,
        complete: function(elements) {
          isAnimating = false;
        }
      }, "easeOutSine");
    }
  }

  function _initFlashBar() {
    setTimeout(function() {
      $flashBar.addClass('-active');
    }, 500);

    $('#flashbar-close').on('click', function() {
      $flashBar.removeClass('-active');
      $flashBar.addClass('-hidden');
    });
  }

  function _initStartButton() {
    $startButton.on('click', function() {
      _scrollBody($('#five-pillars'));
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

      $inner.html('<div class="grid-columns"></div><div class="grid-rows"></div>');

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

    $('.pillar-toggle').on('click', function(e) {
      var $pillar = $(this).closest('.pillar').find('.expandable-pillar');

      if ($(this).is('.pillar-expand')) {
        _expandPillar($pillar);
      } else {
        _collapsePillar($pillar);
      }
    });

    $('.pillar-close').on('click', function() {
      var targetPillar = $(this).attr('data-targetPillar');
      var $pillar = $('#'+targetPillar);

      _collapsePillar($pillar);
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
    $pillar.find('.pillar-close-container .-inner').velocity({
      translateY: '0',
      translateZ: '0'
    },{
      display: 'none',
      duration: 100,
      easing: 'easeOutQuart'
    });
    $pillar.find('.expandable-pillar-content > .sitewrapper').velocity({
      opacity: 0
      },{
      duration: 250,
      complete: function() {
        $pillar.find('.expandable-pillar-content').velocity('slideUp', {
          easing: 'easeOutQuart',
          duration: 250,
          complete: _updatePillarScenes
        });
      }
    });
  }

  function _expandPillar($pillar) {
    _activatePillar($pillar);
    $pillar.find('.expandable-pillar-content').velocity('slideDown', {
      easing: 'easeOutQuart',
      duration: 350,
      complete: function() {
        _updatePillarScenes();
        $pillar.find('.expandable-pillar-content > .sitewrapper').velocity({
          opacity: 1
        },{
          duration: 250
        });
        $pillar.find('.pillar-close-container .-inner').velocity({
          translateY: '-100%',
          translateZ: '0'
        },{
          display: 'block',
          duration: 250,
          easing: 'easeOutQuart'
        });
      }
    }).velocity({
      easing: 'easeOut',
      duration: 250
    });
  }

  function _hidePillars() {
    _deactivatePillar($('.expandable-pillar'));
    $('.expandable-pillar-content').hide();
  }

  function _updatePillarScenes() {
    pillarHeights = [$('#pillar-1').outerHeight(), $('#pillar-2').outerHeight(), $('#pillar-3').outerHeight(), $('#pillar-4').outerHeight()];
    for (var p = 0; p < pillarScenes.length; p++) {
      pillarScenes[p].duration(pillarHeights[p]);
    }
  }

  function _initPillarNav() {
    // Open/Close Secondary UL
    var $secondaryNavToggle = $('.secondary-nav-toggle');
    var $secondaryNav = $pillarNav.find('ul.secondary');

    // Open/close secondary nav
    $secondaryNavToggle.on('click', function() {
      $secondaryNav.toggleClass('-active');
    });

    // Close secondary nav when click on an item
    $secondaryNav.on('click', 'a', function() {
      $secondaryNav.removeClass('-active');
    });

    // Smooth scroll to section
    $pillarNav.on('click', 'ul a', function(e) {
      e.preventDefault();
      var $target = $($(this).attr('href'));
      _scrollBody($target, true);
    });

    // Stickify Pillar nav
    new ScrollMagic.Scene({triggerElement: '#pillar-1', triggerHook: 'onLeave'})
        .setClassToggle('#pillar-nav', '-stuck')
        .addTo(controller);

    // Set active states on pillar nav items
    new ScrollMagic.Scene({triggerElement: '#pillar-1', triggerHook: 'onLeave'})
        .setClassToggle('#pillar-nav li[data-pillar="1"]', '-active')
        .addTo(controller);
    new ScrollMagic.Scene({triggerElement: '#pillar-2', triggerHook: 'onLeave'})
        .setClassToggle('#pillar-nav li[data-pillar="2"]', '-active')
        .addTo(controller);
    new ScrollMagic.Scene({triggerElement: '#pillar-3', triggerHook: 'onLeave'})
        .setClassToggle('#pillar-nav li[data-pillar="3"]', '-active')
        .addTo(controller);
    new ScrollMagic.Scene({triggerElement: '#pillar-4', triggerHook: 'onLeave'})
        .setClassToggle('#pillar-nav li[data-pillar="4"]', '-active')
        .addTo(controller);
    new ScrollMagic.Scene({triggerElement: '#pillar-5', triggerHook: 'onLeave'})
        .setClassToggle('#pillar-nav li[data-pillar="5"]', '-active')
        .addTo(controller);
    new ScrollMagic.Scene({triggerElement: '#resources', triggerHook: 'onLeave'})
        .setClassToggle('#pillar-nav li[data-section="resources"]', '-active')
        .addTo(controller);
    new ScrollMagic.Scene({triggerElement: '#events', triggerHook: 'onLeave'})
        .setClassToggle('#pillar-nav li[data-section="events"]', '-active')
        .addTo(controller);

    function getPillarHeight(i) {
      return pillarHeights[i];
    }

    // Line progress
    for (var i = 0; i < $('#pillar-nav .primary li').length - 1; i++) {
      var $progressBar = $('#pillar-nav .primary li').eq(i).find('.pillar-progress');

      var tween = TweenMax.fromTo($progressBar, 1,
          {width: "0%"},
          {width: "25%"}
      );

      pillarScenes[i].duration(getPillarHeight(i)).setTween(tween).addTo(controller);
    }
  }

  function _pathPrepare($el) {
    var lineLength = $el[0].getTotalLength();
    $el.css("stroke-dasharray", lineLength);
    $el.css("stroke-dashoffset", lineLength);
  }

  function _initScrollMagic() {

    var $line = $("path#scroll-line");
    var $dot = $("circle#scroll-dot");

    // prepare SVG
    _pathPrepare($line);

    // build tween
    var tween = new TimelineMax()
      .add(TweenMax.to($dot, .1, {attr:{r:12}, ease:Linear.easeNone}))
      .add(TweenMax.to($line, .1, {strokeDashoffset: 0, ease:Linear.easeNone}));

    // build scene
    var introScene = new ScrollMagic.Scene({triggerElement: "#section-one-art", duration: $('#section-one-art').outerHeight(), tweenChanges: true})
            .setTween(tween)
            .addTo(controller);

    // Parallax Shapes
    var shapes = $('.shapes');
    for (var s = 0; s < shapes.length; s++) {
      var $section = shapes.eq(s).closest('section');
      // build tween
      var shapesTween = new TimelineMax ()
        .add([
          TweenMax.fromTo($section.find('.shapes svg.fast'), 1, {yPercent: 15}, {yPercent: -15, ease: Linear.easeNone}),
          TweenMax.fromTo($section.find('.shapes svg.slow'), 1, {yPercent: 35}, {yPercent: -35, ease: Linear.easeNone}),
          TweenMax.fromTo($section.find('.shapes svg.very-fast'), 1, {yPercent: 55}, {yPercent: -55, ease: Linear.easeNone})
        ]);

      console.log($section[0]);
      // build scene
      new ScrollMagic.Scene({triggerElement: $section[0], duration: $section.outerHeight() * 1.5})
          .setTween(shapesTween)
          .addTo(controller);
    }
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

      // background grids
      _backgroundGrid();

      // recalulate pillar sizes
      _updatePillarScenes();
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
