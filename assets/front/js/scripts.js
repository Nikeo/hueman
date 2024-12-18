/*! addEventListener Polyfill ie9- http://stackoverflow.com/a/27790212*/
window.addEventListener = window.addEventListener || function (e, f) { window.attachEvent('on' + e, f); };


/*!  Datenow Polyfill ie9- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/now */
if (!Date.now) {
  Date.now = function now() {
    return new Date().getTime();
  };
}


/*! Object.create monkey patch ie8 http://stackoverflow.com/a/18020326 */
if ( ! Object.create ) {
  Object.create = function(proto, props) {
    if (typeof props !== "undefined") {
      throw "The multiple-argument version of Object.create is not provided by this browser and cannot be shimmed.";
    }
    function ctor() { }

    ctor.prototype = proto;
    return new ctor();
  };
}


/*! https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter */
if ( ! Array.prototype.filter ) {
  Array.prototype.filter = function(fun/*, thisArg*/) {
    'use strict';

    if (this === void 0 || this === null) {
      throw new TypeError();
    }

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== 'function') {
      throw new TypeError();
    }

    var res = [];
    var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
    for (var i = 0; i < len; i++) {
      if (i in t) {
        var val = t[i];
        if (fun.call(thisArg, val, i, t)) {
          res.push(val);
        }
      }
    }

    return res;
  };
}



/*! map was added to the ECMA-262 standard in the 5th edition */
if (!Array.prototype.map) {

  Array.prototype.map = function(callback, thisArg) {

    var T, A, k;

    if (this === null) {
      throw new TypeError(' this is null or not defined');
    }
    var O = Object(this);
    var len = O.length >>> 0;
    if (typeof callback !== 'function') {
      throw new TypeError(callback + ' is not a function');
    }
    if (arguments.length > 1) {
      T = thisArg;
    }
    A = new Array(len);
    k = 0;
    while (k < len) {

      var kValue, mappedValue;
      if (k in O) {
        kValue = O[k];
        mappedValue = callback.call(T, kValue, k, O);
        A[k] = mappedValue;
      }
      k++;
    }
    return A;
  };
}
/*! Array.from was added to the ECMA-262 standard in the 6th edition (ES2015) */
if (!Array.from) {
  Array.from = (function () {
    var toStr = Object.prototype.toString;
    var isCallable = function (fn) {
      return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
    };
    var toInteger = function (value) {
      var number = Number(value);
      if (isNaN(number)) { return 0; }
      if (number === 0 || !isFinite(number)) { return number; }
      return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
    };
    var maxSafeInteger = Math.pow(2, 53) - 1;
    var toLength = function (value) {
      var len = toInteger(value);
      return Math.min(Math.max(len, 0), maxSafeInteger);
    };
    return function from(arrayLike/*, mapFn, thisArg */) {
      var C = this;
      var items = Object(arrayLike);
      if (arrayLike == null) {
        throw new TypeError('Array.from requires an array-like object - not null or undefined');
      }
      var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
      var T;
      if (typeof mapFn !== 'undefined') {
        if (!isCallable(mapFn)) {
          throw new TypeError('Array.from: when provided, the second argument must be a function');
        }
        if (arguments.length > 2) {
          T = arguments[2];
        }
      }
      var len = toLength(items.length);
      var A = isCallable(C) ? Object(new C(len)) : new Array(len);
      var k = 0;
      var kValue;
      while (k < len) {
        kValue = items[k];
        if (mapFn) {
          A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
        } else {
          A[k] = kValue;
        }
        k += 1;
      }
      A.length = len;
      return A;
    };
  }());
}
(function ( $ ) {

  var pluginPrefix = 'original',
      _props       = ['Width', 'Height'];

  _props.map( function(_prop) {
    var _lprop = _prop.toLowerCase();
    $.fn[ pluginPrefix + _prop ] = ('natural' + _prop in new Image()) ?
      function () {
        return this[0][ 'natural' + _prop ];
      } :
      function () {
        var _size = _getAttr( this, _lprop );

        if ( _size )
          return _size;

        var _node = this[0],
            _img;

        if (_node.tagName.toLowerCase() === 'img') {
          _img = new Image();
          _img.src = _node.src;
          _size = _img[ _lprop ];
        }
        return _size;
      };
  } );//map()

  function _getAttr( _el, prop ){
    var _img_size = $(_el).attr( prop );
    return ( typeof _img_size === undefined ) ? false : _img_size;
  }

})( jQuery );
(function ( $, window ) {
      var pluginName = 'imgSmartLoad',
          defaults = {
                load_all_images_on_first_scroll : false,
                attribute : [ 'data-src', 'data-srcset', 'data-sizes' ],
                excludeImg : [],
                threshold : 200,
                fadeIn_options : { duration : 400 },
                delaySmartLoadEvent : 0,

          },
          skipImgClass = 'tc-smart-loaded';


      function Plugin( element, options ) {
            this.element = element;
            this.options = $.extend( {}, defaults, options);
            if ( _.isArray( this.options.excludeImg ) ) {
                  this.options.excludeImg.push( '.'+skipImgClass );
            } else {
                  this.options.excludeImg = [ '.'+skipImgClass ];
            }
            this.options.excludeImg = _.uniq( this.options.excludeImg );
            this.imgSelectors = 'img[' + this.options.attribute[0] + ']:not('+ this.options.excludeImg.join() +')';

            this._defaults = defaults;
            this._name = pluginName;
            this.init();

            var self = this;
            $(this.element).on('trigger-smartload', function() {
                  self._maybe_trigger_load( 'trigger-smartload' );
            });
      }

      Plugin.prototype._getImgs = function() {
            return $( this.imgSelectors, this.element );
      };
      Plugin.prototype.init = function() {
            var self        = this;

            this.increment  = 1;//used to wait a little bit after the first user scroll actions to trigger the timer
            this.timer      = 0;
            $('body').on( 'load_img', self.imgSelectors , function() {
                    if ( true === $(this).data('czr-smart-loaded' ) )
                      return;
                    self._load_img(this);
            });
            $(window).on('scroll', function( _evt ) { self._better_scroll_event_handler( _evt ); } );
            $(window).on('resize', _.debounce( function( _evt ) { self._maybe_trigger_load( _evt ); }, 100 ) );
            this._maybe_trigger_load( 'dom-ready');
            $(this.element).data('smartLoadDone', true );
      };
      Plugin.prototype._better_scroll_event_handler = function( _evt ) {
            var self = this;
            if ( ! this.doingAnimation ) {
                  this.doingAnimation = true;
                  window.requestAnimationFrame(function() {
                        self._maybe_trigger_load( _evt );
                        self.doingAnimation = false;
                  });
            }
      };
      Plugin.prototype._maybe_trigger_load = function(_evt ) {
            var self = this,
                $_imgs = self._getImgs(),
                _visible_list;

            if ( !_.isObject( $_imgs) || _.isEmpty( $_imgs ) )
              return;
            _visible_list = $_imgs.filter( function( ind, _img ) { return self._is_visible( _img ,  _evt ); } );
            _visible_list.map( function( ind, _img ) {
                  if ( true !== $(_img).data( 'czr-smart-loaded' ) ) {
                        $(_img).trigger('load_img');
                  }
            });
      };
      Plugin.prototype._is_visible = function( _img, _evt ) {
            var $_img       = $(_img),
                wt = $(window).scrollTop(),
                wb = wt + $(window).height(),
                it  = $_img.offset().top,
                ib  = it + $_img.height(),
                th = this.options.threshold;
            if ( _evt && 'scroll' == _evt.type && this.options.load_all_images_on_first_scroll )
              return true;

            return ib >= wt - th && it <= wb + th;
      };
      Plugin.prototype._load_img = function( _img ) {
            var $_img    = $(_img),
                _src     = $_img.attr( this.options.attribute[0] ),
                _src_set = $_img.attr( this.options.attribute[1] ),
                _sizes   = $_img.attr( this.options.attribute[2] ),
                self = this;

            if ( $_img.parent().hasClass('smart-loading') )
              return;

            $_img.parent().addClass('smart-loading');

            $_img.off('load_img')
                  .removeAttr( this.options.attribute.join(' ') )
                  .attr( 'sizes' , _sizes )
                  .attr( 'srcset' , _src_set )
                  .attr( 'src', _src )
                  .on('load', function () {
                        if ( !$_img.hasClass(skipImgClass) ) {
                              $_img.fadeIn(self.options.fadeIn_options).addClass(skipImgClass);
                        }
                        if ( ( 'undefined' !== typeof $_img.attr('data-tcjp-recalc-dims')  ) && ( false !== $_img.attr('data-tcjp-recalc-dims') ) ) {
                              var _width  = $_img.originalWidth(),
                                  _height = $_img.originalHeight();

                              if ( 2 != _.size( _.filter( [ _width, _height ], function(num){ return _.isNumber( parseInt(num, 10) ) && num > 1; } ) ) )
                                return;
                              $_img.removeAttr( 'data-tcjp-recalc-dims scale' );

                              $_img.attr( 'width', _width );
                              $_img.attr( 'height', _height );
                        }

                        $_img.trigger('smartload');
                        $_img.data('czr-smart-loaded', true );
                  });//<= create a load() fn
            if ( $_img[0].complete ) {
                  $_img.trigger('load');
            }
            $_img.parent().removeClass('smart-loading');
      };
      $.fn[pluginName] = function ( options ) {
            return this.each(function () {
                  if (!$.data(this, 'plugin_' + pluginName)) {
                        $.data(this, 'plugin_' + pluginName,
                        new Plugin( this, options ));
                  }
            });
      };
})( jQuery, window );
(function ( $ ) {
      var plugname = [];
    var pluginName = 'extLinks',
        defaults = {
          addIcon : true,
          iconClassName : 'tc-external',
          newTab: true,
          skipSelectors : { //defines the selector to skip when parsing the wrapper
            classes : [],
            ids : []
          },
          skipChildTags : ['IMG']//skip those tags if they are direct children of the current link element
        };


    function Plugin( element, options ) {
        this.$_el     = $(element);
        this.options  = $.extend( {}, defaults, options) ;
        this._href    = ( 'string' == typeof( this.$_el.attr( 'href' ) ) ) ? this.$_el.attr( 'href' ).trim() : '';
        this.init();
    }


    Plugin.prototype.init = function() {
      var self = this,
          $_external_icon = this.$_el.next( '.' + self.options.iconClassName );
      if ( ! this._is_eligible() ) {
        if ( $_external_icon.length )
          $_external_icon.remove();
        return;
      }
      if ( this.options.addIcon && 0 === $_external_icon.length ) {
        this.$_el.append('<span class="' + self.options.iconClassName + '">');
      }
      if ( this.options.newTab && '_blank' != this.$_el.attr('target') )
        this.$_el.attr('target' , '_blank');
    };
    Plugin.prototype._is_eligible = function() {
      var self = this;
      if ( ! this._is_external( this._href ) )
        return;
      if ( ! this._is_first_child_tag_allowed () )
        return;
      if ( 2 != ( ['ids', 'classes'].filter( function( sel_type) { return self._is_selector_allowed(sel_type); } ) ).length )
        return;

      var _is_eligible = true;
      $.each( this.$_el.parents(), function() {
        if ( 'underline' == $(this).css('textDecoration') ){
          _is_eligible = false;
          return false;
        }
      });

      return true && _is_eligible;
    };
    Plugin.prototype._is_selector_allowed = function( requested_sel_type ) {
      if ( czrapp && czrapp.userXP && czrapp.userXP.isSelectorAllowed )
        return czrapp.userXP.isSelectorAllowed( this.$_el, this.options.skipSelectors, requested_sel_type);

      var sel_type = 'ids' == requested_sel_type ? 'id' : 'class',
          _selsToSkip   = this.options.skipSelectors[requested_sel_type];
      if ( 'object' != typeof(this.options.skipSelectors) || ! this.options.skipSelectors[requested_sel_type] || ! Array.isArray( this.options.skipSelectors[requested_sel_type] ) || 0 === this.options.skipSelectors[requested_sel_type].length )
        return true;
      if ( this.$_el.parents( _selsToSkip.map( function( _sel ){ return 'id' == sel_type ? '#' + _sel : '.' + _sel; } ).join(',') ).length > 0 )
        return false;
      if ( ! this.$_el.attr( sel_type ) )
        return true;

      var _elSels       = this.$_el.attr( sel_type ).split(' '),
          _filtered     = _elSels.filter( function(classe) { return -1 != $.inArray( classe , _selsToSkip ) ;});
      return 0 === _filtered.length;
    };
    Plugin.prototype._is_first_child_tag_allowed = function() {
      if ( 0 === this.$_el.children().length )
        return true;

      var tagName     = this.$_el.children().first()[0].tagName,
          _tagToSkip  = this.options.skipChildTags;
      if ( ! Array.isArray( _tagToSkip ) )
        return true;
      _tagToSkip = _tagToSkip.map( function( _tag ) { return _tag.toUpperCase(); });
      return -1 == $.inArray( tagName , _tagToSkip );
    };
    Plugin.prototype._is_external = function( _href  ) {
      var _main_domain = (location.host).split('.').slice(-2).join('.'),
          _reg = new RegExp( _main_domain );

      if ( 'string' != typeof( _href ) )
        return;

      _href = _href.trim();

      if ( _href !== '' && _href != '#' && this._isValidURL( _href ) )
        return ! _reg.test( _href );
      return;
    };
    Plugin.prototype._isValidURL = function( _url ){
      var _pattern = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
      return _pattern.test( _url );
    };
    $.fn[pluginName] = function ( options ) {			
      return this.each(function (index) {
            try{
                  var chkplugname = 'plugin_' + pluginName;
                  if (!$.data(this, 'plugin_' + pluginName)) {
                        if($.inArray(chkplugname, plugname) == -1){
                              plugname[index] = 'plugin_' + pluginName;
                              $.data(this, 'plugin_' + pluginName,
                              new Plugin( this, options ));
                        }
                  }
            }
            catch(err){
              console.log("error:" + err);
            }
      });
};

})( jQuery );
(function ( $, window ) {
      var pluginName = 'centerImages',
          defaults = {
                enableCentering : true,
                onresize : true,
                onInit : true,//<= shall we smartload on init or wait for a custom event, typically smartload ?
                oncustom : [],//list of event here
                $containerToListen : null,//<= we might want to listen to custom event trigger to a parent container.Should be a jQuery obj
                imgSel : 'img',
                defaultCSSVal : { width : 'auto' , height : 'auto' },
                leftAdjust : 0,
                zeroLeftAdjust : 0,
                topAdjust : 0,
                zeroTopAdjust : -2,//<= top ajustement for h-centered
                enableGoldenRatio : false,
                goldenRatioLimitHeightTo : 350,
                goldenRatioVal : 1.618,
                skipGoldenRatioClasses : ['no-gold-ratio'],
                disableGRUnder : 767,//in pixels
                useImgAttr:false,//uses the img height and width attributes if not visible (typically used for the customizr slider hidden images)
                setOpacityWhenCentered : false,//this can be used to hide the image during the time it is centered
                addCenteredClassWithDelay : 0,//<= a small delay can be required when we rely on the v-centered or h-centered css classes to set the opacity for example
                opacity : 1
          };

      function Plugin( element, options ) {
            var self = this;
            this.container  = element;
            this.options    = $.extend( {}, defaults, options) ;
            this._defaults  = defaults;
            this._name      = pluginName;
            this._customEvt = _.isArray(self.options.oncustom) ? self.options.oncustom : self.options.oncustom.split(' ');
            this.init();
      }
      Plugin.prototype.init = function () {
            var self = this,
                _do = function( _event_ ) {
                    _event_ = _event_ || 'init';
                    self._maybe_apply_golden_r();
                    var $_imgs = $( self.options.imgSel , self.container );
                    if ( self.options.enableGoldenRatio ) {
                          $(window).on(
                                'resize',
                                {},
                                _.debounce( function( evt ) { self._maybe_apply_golden_r( evt ); }, 200 )
                          );
                    }
                    if ( 1 <= $_imgs.length && self.options.enableCentering ) {
                          self._parse_imgs( $_imgs, _event_ );
                    }
                };
            if ( self.options.onInit ) {
                  _do();
            }
            if ( _.isArray( self._customEvt ) ) {
                  self._customEvt.map( function( evt ) {
                        var $_containerToListen = ( self.options.$containerToListen instanceof $ && 1 < self.options.$containerToListen.length ) ? self.options.$containerToListen : $( self.container );
                        $_containerToListen.on( evt, {} , function() {
                              _do( evt );
                        });
                  } );
            }
      };
      Plugin.prototype._maybe_apply_golden_r = function() {
            if ( ! this.options.enableGoldenRatio || ! this.options.goldenRatioVal || 0 === this.options.goldenRatioVal )
              return;
            if ( ! this._is_selector_allowed() )
              return;
            if ( ! this._is_window_width_allowed() ) {
                  $(this.container).attr('style' , '');
                  return;
            }

            var new_height = Math.round( $(this.container).width() / this.options.goldenRatioVal );
            new_height = new_height > this.options.goldenRatioLimitHeightTo ? this.options.goldenRatioLimitHeightTo : new_height;
            $(this.container)
                  .css({
                        'line-height' : new_height + 'px',
                        height : new_height + 'px'
                  })
                  .trigger('golden-ratio-applied');
      };
      Plugin.prototype._is_window_width_allowed = function() {
            return $(window).width() > this.options.disableGRUnder - 15;
      };
      Plugin.prototype._parse_imgs = function( $_imgs, _event_ ) {
            var self = this;
            $_imgs.each(function ( ind, img ) {
                  var $_img = $(img);
                  self._pre_img_cent( $_img, _event_ );
                  if ( self.options.onresize && ! $_img.data('resize-react-bound' ) ) {
                        $_img.data('resize-react-bound', true );
                        $(window).on('resize', _.debounce( function() {
                              self._pre_img_cent( $_img, 'resize');
                        }, 100 ) );
                  }

            });//$_imgs.each()
            if ( $(self.container).attr('data-img-centered-in-container') ) {
                  var _n = parseInt( $(self.container).attr('data-img-centered-in-container'), 10 ) + 1;
                  $(self.container).attr('data-img-centered-in-container', _n );
            } else {
                  $(self.container).attr('data-img-centered-in-container', 1 );
            }
      };
      Plugin.prototype._pre_img_cent = function( $_img ) {

            var _state = this._get_current_state( $_img ),
                self = this,
                _case  = _state.current,
                _p     = _state.prop[_case],
                _not_p = _state.prop[ 'h' == _case ? 'v' : 'h'],
                _not_p_dir_val = 'h' == _case ? ( this.options.zeroTopAdjust || 0 ) : ( this.options.zeroLeftAdjust || 0 );

            var _centerImg = function( $_img ) {
                  $_img
                      .css( _p.dim.name , _p.dim.val )
                      .css( _not_p.dim.name , self.options.defaultCSSVal[ _not_p.dim.name ] || 'auto' )
                      .css( _p.dir.name, _p.dir.val ).css( _not_p.dir.name, _not_p_dir_val );

                  if ( 0 !== self.options.addCenteredClassWithDelay && _.isNumber( self.options.addCenteredClassWithDelay ) ) {
                        _.delay( function() {
                              $_img.addClass( _p._class ).removeClass( _not_p._class );
                        }, self.options.addCenteredClassWithDelay );
                  } else {
                        $_img.addClass( _p._class ).removeClass( _not_p._class );
                  }
                  if ( $_img.attr('data-img-centered') ) {
                        var _n = parseInt( $_img.attr('data-img-centered'), 10 ) + 1;
                        $_img.attr('data-img-centered', _n );
                  } else {
                        $_img.attr('data-img-centered', 1 );
                  }
                  return $_img;
            };
            if ( this.options.setOpacityWhenCentered ) {
                  $.when( _centerImg( $_img ) ).done( function( $_img ) {
                        $_img.css( 'opacity', self.options.opacity );
                  });
            } else {
                  _.delay(function() { _centerImg( $_img ); }, 0 );
            }
      };
      Plugin.prototype._get_current_state = function( $_img ) {
            var c_x     = $_img.closest(this.container).outerWidth(),
                c_y     = $(this.container).outerHeight(),
                i_x     = this._get_img_dim( $_img , 'x'),
                i_y     = this._get_img_dim( $_img , 'y'),
                up_i_x  = i_y * c_y !== 0 ? Math.round( i_x / i_y * c_y ) : c_x,
                up_i_y  = i_x * c_x !== 0 ? Math.round( i_y / i_x * c_x ) : c_y,
                current = 'h';
            if ( 0 !== c_x * i_x ) {
                  current = ( c_y / c_x ) >= ( i_y / i_x ) ? 'h' : 'v';
            }

            var prop    = {
                  h : {
                        dim : { name : 'height', val : c_y },
                        dir : { name : 'left', val : ( c_x - up_i_x ) / 2 + ( this.options.leftAdjust || 0 ) },
                        _class : 'h-centered'
                  },
                  v : {
                        dim : { name : 'width', val : c_x },
                        dir : { name : 'top', val : ( c_y - up_i_y ) / 2 + ( this.options.topAdjust || 0 ) },
                        _class : 'v-centered'
                  }
            };

            return { current : current , prop : prop };
      };
      Plugin.prototype._get_img_dim = function( $_img, _dim ) {
            if ( ! this.options.useImgAttr )
              return 'x' == _dim ? $_img.outerWidth() : $_img.outerHeight();

            if ( $_img.is(":visible") ) {
                  return 'x' == _dim ? $_img.outerWidth() : $_img.outerHeight();
            } else {
                  if ( 'x' == _dim ){
                        var _width = $_img.originalWidth();
                        return typeof _width === undefined ? 0 : _width;
                  }
                  if ( 'y' == _dim ){
                        var _height = $_img.originalHeight();
                        return typeof _height === undefined ? 0 : _height;
                  }
            }
      };
      Plugin.prototype._is_selector_allowed = function() {
            if ( ! $(this.container).attr( 'class' ) )
              return true;
            if ( ! this.options.skipGoldenRatioClasses || ! _.isArray( this.options.skipGoldenRatioClasses )  )
              return true;

            var _elSels       = $(this.container).attr( 'class' ).split(' '),
                _selsToSkip   = this.options.skipGoldenRatioClasses,
                _filtered     = _elSels.filter( function(classe) { return -1 != $.inArray( classe , _selsToSkip ) ;});
            return 0 === _filtered.length;
      };
      $.fn[pluginName] = function ( options ) {
            return this.each(function () {
                if (!$.data(this, 'plugin_' + pluginName)) {
                    $.data(this, 'plugin_' + pluginName,
                    new Plugin( this, options ));
                }
            });
      };

})( jQuery, window );
(function ( $, window, _ ) {
        var pluginName = 'czrParallax',
            defaults = {
                  parallaxRatio : 0.5,
                  parallaxDirection : 1,
                  parallaxOverflowHidden : true,
                  oncustom : [],//list of event here
                  backgroundClass : 'image',
                  matchMedia : 'only screen and (max-width: 768px)'
            };

        function Plugin( element, options ) {
              this.element         = $(element);
              this.element_wrapper = this.element.closest( '.parallax-wrapper' );
              this.options         = $.extend( {}, defaults, options, this.parseElementDataOptions() ) ;
              this._defaults       = defaults;
              this._name           = pluginName;
              this.init();
        }

        Plugin.prototype.parseElementDataOptions = function () {
              return this.element.data();
        };
        Plugin.prototype.init = function () {
              this.$_document   = $(document);
              this.$_window     = czrapp ? czrapp.$_window : $(window);
              this.doingAnimation = false;

              this.initWaypoints();
              this.stageParallaxElements();
              this._bind_evt();
        };
        Plugin.prototype._bind_evt = function() {

            _.bindAll( this, 'maybeParallaxMe', 'parallaxMe' );
        };

        Plugin.prototype.stageParallaxElements = function() {

              this.element.css({
                    'position': this.element.hasClass( this.options.backgroundClass ) ? 'absolute' : 'relative',
                    'will-change': 'transform'
              });

              if ( this.options.parallaxOverflowHidden ){
                    var $_wrapper = this.element_wrapper;
                    if ( $_wrapper.length )
                      $_wrapper.css( 'overflow', 'hidden' );
              }
        };

        Plugin.prototype.initWaypoints = function() {
              var self = this;

              this.way_start = new Waypoint({
                    element: self.element_wrapper.length ? self.element_wrapper : self.element,
                    handler: function() {
                          self.maybeParallaxMe();
                          if ( ! self.element.hasClass('parallaxing') ){
                                self.$_window.on('scroll', self.maybeParallaxMe );
                                self.element.addClass('parallaxing');
                          } else{
                                self.element.removeClass('parallaxing');
                                self.$_window.off('scroll', self.maybeParallaxMe );
                                self.doingAnimation = false;
                                self.element.css('top', 0 );
                          }
                    }
              });

              this.way_stop = new Waypoint({
                    element: self.element_wrapper.length ? self.element_wrapper : self.element,
                    handler: function() {
                          self.maybeParallaxMe();
                          if ( ! self.element.hasClass('parallaxing') ) {
                                self.$_window.on('scroll', self.maybeParallaxMe );
                                self.element.addClass('parallaxing');
                          }else {
                                self.element.removeClass('parallaxing');
                                self.$_window.off('scroll', self.maybeParallaxMe );
                                self.doingAnimation = false;
                          }
                    },
                    offset: function(){
                          return - this.adapter.outerHeight();
                    }
              });
        };
        Plugin.prototype.maybeParallaxMe = function() {
              var self = this;
              if ( _.isFunction( window.matchMedia ) && matchMedia( self.options.matchMedia ).matches )
                return this.setTopPosition();

              if ( ! this.doingAnimation ) {
                    this.doingAnimation = true;
                    window.requestAnimationFrame(function() {
                          self.parallaxMe();
                          self.doingAnimation = false;
                    });
              }
        };
        Plugin.prototype.setTopPosition = function( _top_ ) {
              _top_ = _top_ || 0;
              this.element.css({
                    'transform' : 'translate3d(0px, ' + _top_  + 'px, .01px)',
                    '-webkit-transform' : 'translate3d(0px, ' + _top_  + 'px, .01px)'
              });
        };

        Plugin.prototype.parallaxMe = function() {

              var ratio = this.options.parallaxRatio,
                  parallaxDirection = this.options.parallaxDirection,
                  value = ratio * parallaxDirection * ( this.$_document.scrollTop() - this.way_start.triggerPoint );
              this.setTopPosition( parallaxDirection * value < 0 ? 0 : value );
        };
        $.fn[pluginName] = function ( options ) {
            return this.each(function () {
                if (!$.data(this, 'plugin_' + pluginName)) {
                    $.data(this, 'plugin_' + pluginName,
                    new Plugin( this, options ));
                }
            });
        };
})( jQuery, window, _ );// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            lastTime = currTime + timeToCall;
            return window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());/*! matchMedia() polyfill - Test a CSS media type/query in JS. Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas, David Knight. Dual MIT/BSD license */

window.matchMedia || (window.matchMedia = function() {
    "use strict";
    var styleMedia = (window.styleMedia || window.media);
    if (!styleMedia) {
        var style       = document.createElement('style'),
            script      = document.getElementsByTagName('script')[0],
            info        = null;

        style.type  = 'text/css';
        style.id    = 'matchmediajs-test';

        if (!script) {
          document.head.appendChild(style);
        } else {
          script.parentNode.insertBefore(style, script);
        }
        info = ('getComputedStyle' in window) && window.getComputedStyle(style, null) || style.currentStyle;

        styleMedia = {
            matchMedium: function(media) {
                var text = '@media ' + media + '{ #matchmediajs-test { width: 1px; } }';
                if (style.styleSheet) {
                    style.styleSheet.cssText = text;
                } else {
                    style.textContent = text;
                }
                return info.width === '1px';
            }
        };
    }

    return function(media) {
        return {
            matches: styleMedia.matchMedium(media || 'all'),
            media: media || 'all'
        };
    };
}());// modified version of
var tcOutline;
(function(d){
  tcOutline = function() {
	var style_element = d.createElement('STYLE'),
	    dom_events = 'addEventListener' in d,
	    add_event_listener = function(type, callback){
			if(dom_events){
				d.addEventListener(type, callback);
			}else{
				d.attachEvent('on' + type, callback);
			}
		},
	    set_css = function(css_text){
			if ( !!style_element.styleSheet )
                style_element.styleSheet.cssText = css_text; 
            else 
                style_element.innerHTML = css_text;
		}
	;

	d.getElementsByTagName('HEAD')[0].appendChild(style_element);
	add_event_listener('mousedown', function(){
		set_css('input[type=file]:focus,input[type=radio]:focus,input[type=checkbox]:focus,select:focus,a:focus{outline:0}input[type=file]::-moz-focus-inner,input[type=radio]::-moz-focus-inner,input[type=checkbox]::-moz-focus-inner,select::-moz-focus-inner,a::-moz-focus-inner{border:0;}');
	});

	add_event_listener('keydown', function(){
		set_css('');
	});
  }
})(document);
/*!
Waypoints - 4.0.0
Copyright © 2011-2015 Caleb Troughton
Licensed under the MIT license.
https://github.com/imakewebthings/waypoints/blob/master/licenses.txt
*/
(function() {
  'use strict'

  var keyCounter = 0
  var allWaypoints = {}
  function Waypoint(options) {
    if (!options) {
      throw new Error('No options passed to Waypoint constructor')
    }
    if (!options.element) {
      throw new Error('No element option passed to Waypoint constructor')
    }
    if (!options.handler) {
      throw new Error('No handler option passed to Waypoint constructor')
    }

    this.key = 'waypoint-' + keyCounter
    this.options = Waypoint.Adapter.extend({}, Waypoint.defaults, options)
    this.element = this.options.element
    this.adapter = new Waypoint.Adapter(this.element)
    this.callback = options.handler
    this.axis = this.options.horizontal ? 'horizontal' : 'vertical'
    this.enabled = this.options.enabled
    this.triggerPoint = null
    this.group = Waypoint.Group.findOrCreate({
      name: this.options.group,
      axis: this.axis
    })
    this.context = Waypoint.Context.findOrCreateByElement(this.options.context)

    if (Waypoint.offsetAliases[this.options.offset]) {
      this.options.offset = Waypoint.offsetAliases[this.options.offset]
    }
    this.group.add(this)
    this.context.add(this)
    allWaypoints[this.key] = this
    keyCounter += 1
  }
  Waypoint.prototype.queueTrigger = function(direction) {
    this.group.queueTrigger(this, direction)
  }
  Waypoint.prototype.trigger = function(args) {
    if (!this.enabled) {
      return
    }
    if (this.callback) {
      this.callback.apply(this, args)
    }
  }
  Waypoint.prototype.destroy = function() {
    this.context.remove(this)
    this.group.remove(this)
    delete allWaypoints[this.key]
  }
  Waypoint.prototype.disable = function() {
    this.enabled = false
    return this
  }
  Waypoint.prototype.enable = function() {
    this.context.refresh()
    this.enabled = true
    return this
  }
  Waypoint.prototype.next = function() {
    return this.group.next(this)
  }
  Waypoint.prototype.previous = function() {
    return this.group.previous(this)
  }
  Waypoint.invokeAll = function(method) {
    var allWaypointsArray = []
    for (var waypointKey in allWaypoints) {
      allWaypointsArray.push(allWaypoints[waypointKey])
    }
    for (var i = 0, end = allWaypointsArray.length; i < end; i++) {
      allWaypointsArray[i][method]()
    }
  }
  Waypoint.destroyAll = function() {
    Waypoint.invokeAll('destroy')
  }
  Waypoint.disableAll = function() {
    Waypoint.invokeAll('disable')
  }
  Waypoint.enableAll = function() {
    Waypoint.invokeAll('enable')
  }
  Waypoint.refreshAll = function() {
    Waypoint.Context.refreshAll()
  }
  Waypoint.viewportHeight = function() {
    return window.innerHeight || document.documentElement.clientHeight
  }
  Waypoint.viewportWidth = function() {
    return document.documentElement.clientWidth
  }

  Waypoint.adapters = []

  Waypoint.defaults = {
    context: window,
    continuous: true,
    enabled: true,
    group: 'default',
    horizontal: false,
    offset: 0
  }

  Waypoint.offsetAliases = {
    'bottom-in-view': function() {
      return this.context.innerHeight() - this.adapter.outerHeight()
    },
    'right-in-view': function() {
      return this.context.innerWidth() - this.adapter.outerWidth()
    }
  }

  window.Waypoint = Waypoint
}())
;(function() {
  'use strict'

  function requestAnimationFrameShim(callback) {
    window.setTimeout(callback, 1000 / 60)
  }

  var keyCounter = 0
  var contexts = {}
  var Waypoint = window.Waypoint
  var oldWindowLoad = window.onload
  function Context(element) {
    this.element = element
    this.Adapter = Waypoint.Adapter
    this.adapter = new this.Adapter(element)
    this.key = 'waypoint-context-' + keyCounter
    this.didScroll = false
    this.didResize = false
    this.oldScroll = {
      x: this.adapter.scrollLeft(),
      y: this.adapter.scrollTop()
    }
    this.waypoints = {
      vertical: {},
      horizontal: {}
    }

    element.waypointContextKey = this.key
    contexts[element.waypointContextKey] = this
    keyCounter += 1

    this.createThrottledScrollHandler()
    this.createThrottledResizeHandler()
  }
  Context.prototype.add = function(waypoint) {
    var axis = waypoint.options.horizontal ? 'horizontal' : 'vertical'
    this.waypoints[axis][waypoint.key] = waypoint
    this.refresh()
  }
  Context.prototype.checkEmpty = function() {
    var horizontalEmpty = this.Adapter.isEmptyObject(this.waypoints.horizontal)
    var verticalEmpty = this.Adapter.isEmptyObject(this.waypoints.vertical)
    if (horizontalEmpty && verticalEmpty) {
      this.adapter.off('.waypoints')
      delete contexts[this.key]
    }
  }
  Context.prototype.createThrottledResizeHandler = function() {
    var self = this

    function resizeHandler() {
      self.handleResize()
      self.didResize = false
    }

    this.adapter.on('resize.waypoints', function() {
      if (!self.didResize) {
        self.didResize = true
        Waypoint.requestAnimationFrame(resizeHandler)
      }
    })
  }
  Context.prototype.createThrottledScrollHandler = function() {
    var self = this
    function scrollHandler() {
      self.handleScroll()
      self.didScroll = false
    }

    this.adapter.on('scroll.waypoints', function() {
      if (!self.didScroll || Waypoint.isTouch) {
        self.didScroll = true
        Waypoint.requestAnimationFrame(scrollHandler)
      }
    })
  }
  Context.prototype.handleResize = function() {
    Waypoint.Context.refreshAll()
  }
  Context.prototype.handleScroll = function() {
    var triggeredGroups = {}
    var axes = {
      horizontal: {
        newScroll: this.adapter.scrollLeft(),
        oldScroll: this.oldScroll.x,
        forward: 'right',
        backward: 'left'
      },
      vertical: {
        newScroll: this.adapter.scrollTop(),
        oldScroll: this.oldScroll.y,
        forward: 'down',
        backward: 'up'
      }
    }

    for (var axisKey in axes) {
      var axis = axes[axisKey]
      var isForward = axis.newScroll > axis.oldScroll
      var direction = isForward ? axis.forward : axis.backward

      for (var waypointKey in this.waypoints[axisKey]) {
        var waypoint = this.waypoints[axisKey][waypointKey]
        var wasBeforeTriggerPoint = axis.oldScroll < waypoint.triggerPoint
        var nowAfterTriggerPoint = axis.newScroll >= waypoint.triggerPoint
        var crossedForward = wasBeforeTriggerPoint && nowAfterTriggerPoint
        var crossedBackward = !wasBeforeTriggerPoint && !nowAfterTriggerPoint
        if (crossedForward || crossedBackward) {
          waypoint.queueTrigger(direction)
          triggeredGroups[waypoint.group.id] = waypoint.group
        }
      }
    }

    for (var groupKey in triggeredGroups) {
      triggeredGroups[groupKey].flushTriggers()
    }

    this.oldScroll = {
      x: axes.horizontal.newScroll,
      y: axes.vertical.newScroll
    }
  }
  Context.prototype.innerHeight = function() {
    if (this.element == this.element.window) {
      return Waypoint.viewportHeight()
    }
    return this.adapter.innerHeight()
  }
  Context.prototype.remove = function(waypoint) {
    delete this.waypoints[waypoint.axis][waypoint.key]
    this.checkEmpty()
  }
  Context.prototype.innerWidth = function() {
    if (this.element == this.element.window) {
      return Waypoint.viewportWidth()
    }
    return this.adapter.innerWidth()
  }
  Context.prototype.destroy = function() {
    var allWaypoints = []
    for (var axis in this.waypoints) {
      for (var waypointKey in this.waypoints[axis]) {
        allWaypoints.push(this.waypoints[axis][waypointKey])
      }
    }
    for (var i = 0, end = allWaypoints.length; i < end; i++) {
      allWaypoints[i].destroy()
    }
  }
  Context.prototype.refresh = function() {
    var isWindow = this.element == this.element.window
    var contextOffset = isWindow ? undefined : this.adapter.offset()
    var triggeredGroups = {}
    var axes

    this.handleScroll()
    axes = {
      horizontal: {
        contextOffset: isWindow ? 0 : contextOffset.left,
        contextScroll: isWindow ? 0 : this.oldScroll.x,
        contextDimension: this.innerWidth(),
        oldScroll: this.oldScroll.x,
        forward: 'right',
        backward: 'left',
        offsetProp: 'left'
      },
      vertical: {
        contextOffset: isWindow ? 0 : contextOffset.top,
        contextScroll: isWindow ? 0 : this.oldScroll.y,
        contextDimension: this.innerHeight(),
        oldScroll: this.oldScroll.y,
        forward: 'down',
        backward: 'up',
        offsetProp: 'top'
      }
    }

    for (var axisKey in axes) {
      var axis = axes[axisKey]
      for (var waypointKey in this.waypoints[axisKey]) {
        var waypoint = this.waypoints[axisKey][waypointKey]
        var adjustment = waypoint.options.offset
        var oldTriggerPoint = waypoint.triggerPoint
        var elementOffset = 0
        var freshWaypoint = oldTriggerPoint == null
        var contextModifier, wasBeforeScroll, nowAfterScroll
        var triggeredBackward, triggeredForward

        if (waypoint.element !== waypoint.element.window) {
          elementOffset = waypoint.adapter.offset()[axis.offsetProp]
        }

        if (typeof adjustment === 'function') {
          adjustment = adjustment.apply(waypoint)
        }
        else if (typeof adjustment === 'string') {
          adjustment = parseFloat(adjustment)
          if (waypoint.options.offset.indexOf('%') > - 1) {
            adjustment = Math.ceil(axis.contextDimension * adjustment / 100)
          }
        }

        contextModifier = axis.contextScroll - axis.contextOffset
        waypoint.triggerPoint = elementOffset + contextModifier - adjustment
        wasBeforeScroll = oldTriggerPoint < axis.oldScroll
        nowAfterScroll = waypoint.triggerPoint >= axis.oldScroll
        triggeredBackward = wasBeforeScroll && nowAfterScroll
        triggeredForward = !wasBeforeScroll && !nowAfterScroll

        if (!freshWaypoint && triggeredBackward) {
          waypoint.queueTrigger(axis.backward)
          triggeredGroups[waypoint.group.id] = waypoint.group
        }
        else if (!freshWaypoint && triggeredForward) {
          waypoint.queueTrigger(axis.forward)
          triggeredGroups[waypoint.group.id] = waypoint.group
        }
        else if (freshWaypoint && axis.oldScroll >= waypoint.triggerPoint) {
          waypoint.queueTrigger(axis.forward)
          triggeredGroups[waypoint.group.id] = waypoint.group
        }
      }
    }

    Waypoint.requestAnimationFrame(function() {
      for (var groupKey in triggeredGroups) {
        triggeredGroups[groupKey].flushTriggers()
      }
    })

    return this
  }
  Context.findOrCreateByElement = function(element) {
    return Context.findByElement(element) || new Context(element)
  }
  Context.refreshAll = function() {
    for (var contextId in contexts) {
      contexts[contextId].refresh()
    }
  }
  Context.findByElement = function(element) {
    return contexts[element.waypointContextKey]
  }

  window.onload = function() {
    if (oldWindowLoad) {
      oldWindowLoad()
    }
    Context.refreshAll()
  }

  Waypoint.requestAnimationFrame = function(callback) {
    var requestFn = window.requestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      requestAnimationFrameShim
    requestFn.call(window, callback)
  }
  Waypoint.Context = Context
}())
;(function() {
  'use strict'

  function byTriggerPoint(a, b) {
    return a.triggerPoint - b.triggerPoint
  }

  function byReverseTriggerPoint(a, b) {
    return b.triggerPoint - a.triggerPoint
  }

  var groups = {
    vertical: {},
    horizontal: {}
  }
  var Waypoint = window.Waypoint
  function Group(options) {
    this.name = options.name
    this.axis = options.axis
    this.id = this.name + '-' + this.axis
    this.waypoints = []
    this.clearTriggerQueues()
    groups[this.axis][this.name] = this
  }
  Group.prototype.add = function(waypoint) {
    this.waypoints.push(waypoint)
  }
  Group.prototype.clearTriggerQueues = function() {
    this.triggerQueues = {
      up: [],
      down: [],
      left: [],
      right: []
    }
  }
  Group.prototype.flushTriggers = function() {
    for (var direction in this.triggerQueues) {
      var waypoints = this.triggerQueues[direction]
      var reverse = direction === 'up' || direction === 'left'
      waypoints.sort(reverse ? byReverseTriggerPoint : byTriggerPoint)
      for (var i = 0, end = waypoints.length; i < end; i += 1) {
        var waypoint = waypoints[i]
        if (waypoint.options.continuous || i === waypoints.length - 1) {
          waypoint.trigger([direction])
        }
      }
    }
    this.clearTriggerQueues()
  }
  Group.prototype.next = function(waypoint) {
    this.waypoints.sort(byTriggerPoint)
    var index = Waypoint.Adapter.inArray(waypoint, this.waypoints)
    var isLast = index === this.waypoints.length - 1
    return isLast ? null : this.waypoints[index + 1]
  }
  Group.prototype.previous = function(waypoint) {
    this.waypoints.sort(byTriggerPoint)
    var index = Waypoint.Adapter.inArray(waypoint, this.waypoints)
    return index ? this.waypoints[index - 1] : null
  }
  Group.prototype.queueTrigger = function(waypoint, direction) {
    this.triggerQueues[direction].push(waypoint)
  }
  Group.prototype.remove = function(waypoint) {
    var index = Waypoint.Adapter.inArray(waypoint, this.waypoints)
    if (index > -1) {
      this.waypoints.splice(index, 1)
    }
  }
  Group.prototype.first = function() {
    return this.waypoints[0]
  }
  Group.prototype.last = function() {
    return this.waypoints[this.waypoints.length - 1]
  }
  Group.findOrCreate = function(options) {
    return groups[options.axis][options.name] || new Group(options)
  }

  Waypoint.Group = Group
}())
;(function() {
  'use strict'

  var $ = window.jQuery
  var Waypoint = window.Waypoint

  function JQueryAdapter(element) {
    this.$element = $(element)
  }

  $.each([
    'innerHeight',
    'innerWidth',
    'off',
    'offset',
    'on',
    'outerHeight',
    'outerWidth',
    'scrollLeft',
    'scrollTop'
  ], function(i, method) {
    JQueryAdapter.prototype[method] = function() {
      var args = Array.prototype.slice.call(arguments)
      return this.$element[method].apply(this.$element, args)
    }
  })

  $.each([
    'extend',
    'inArray',
    'isEmptyObject'
  ], function(i, method) {
    JQueryAdapter[method] = $[method]
  })

  Waypoint.adapters.push({
    name: 'jquery',
    Adapter: JQueryAdapter
  })
  Waypoint.Adapter = JQueryAdapter
}())
;(function() {
  'use strict'

  var Waypoint = window.Waypoint

  function createExtension(framework) {
    return function() {
      var waypoints = []
      var overrides = arguments[0]

      if (framework.isFunction(arguments[0])) {
        overrides = framework.extend({}, arguments[1])
        overrides.handler = arguments[0]
      }

      this.each(function() {
        var options = framework.extend({}, overrides, {
          element: this
        })
        if (typeof options.context === 'string') {
          options.context = framework(this).closest(options.context)[0]
        }
        waypoints.push(new Waypoint(options))
      })

      return waypoints
    }
  }

  if (window.jQuery) {
    window.jQuery.fn.waypoint = createExtension(window.jQuery)
  }
  if (window.Zepto) {
    window.Zepto.fn.waypoint = createExtension(window.Zepto)
  }
}())
;/*global jQuery */
/*!
* FitText.js 1.2
*
* Copyright 2011, Dave Rupert http://daverupert.com
* Released under the WTFPL license
* http://sam.zoy.org/wtfpl/
*
* Date: Thu May 05 14:23:00 2011 -0600
*/

(function( $ ){

  $.fn.fitText = function( kompressor, options ) {
    var compressor = kompressor || 1,
        settings = $.extend({
          'minFontSize' : Number.NEGATIVE_INFINITY,
          'maxFontSize' : Number.POSITIVE_INFINITY
        }, options);

    return this.each(function(){
      var $this = $(this);
      var resizer = function () {
        $this.css('font-size', Math.max(Math.min($this.width() / (compressor*10), parseFloat(settings.maxFontSize)), parseFloat(settings.minFontSize))  + 'px');
      };
      resizer();
      $(window).on('resize.fittext orientationchange.fittext', resizer);

    });

  };

})( jQuery );var czrapp = czrapp || {};
(function($, czrapp) {
      czrapp._printLog = function( log ) {
            var _render = function() {
                  return $.Deferred( function() {
                        var dfd = this;
                        $.when( $('#footer').before( $('<div/>', { id : "bulklog" }) ) ).done( function() {
                              $('#bulklog').css({
                                    position: 'fixed',
                                    'z-index': '99999',
                                    'font-size': '0.8em',
                                    color: '#000',
                                    padding: '5%',
                                    width: '90%',
                                    height: '20%',
                                    overflow: 'hidden',
                                    bottom: '0',
                                    left: '0',
                                    background: 'yellow'
                              });

                              dfd.resolve();
                        });
                  }).promise();
                },
                _print = function() {
                      $('#bulklog').prepend('<p>' + czrapp._prettyfy( { consoleArguments : [ log ], prettyfy : false } ) + '</p>');
                };

            if ( 1 != $('#bulk-log').length ) {
                _render().done( _print );
            } else {
                _print();
            }
      };


      czrapp._truncate = function( string , length ){
            length = length || 150;
            if ( ! _.isString( string ) )
              return '';
            return string.length > length ? string.substr( 0, length - 1 ) : string;
      };
      var _prettyPrintLog = function( args ) {
            var _defaults = {
                  bgCol : '#5ed1f5',
                  textCol : '#000',
                  consoleArguments : []
            };
            args = _.extend( _defaults, args );

            var _toArr = Array.from( args.consoleArguments ),
                _truncate = function( string ){
                      if ( ! _.isString( string ) )
                        return '';
                      return string.length > 300 ? string.substr( 0, 299 ) + '...' : string;
                };
            if ( ! _.isEmpty( _.filter( _toArr, function( it ) { return ! _.isString( it ); } ) ) ) {
                  _toArr =  JSON.stringify( _toArr.join(' ') );
            } else {
                  _toArr = _toArr.join(' ');
            }
            return [
                  '%c ' + _truncate( _toArr ),
                  [ 'background:' + args.bgCol, 'color:' + args.textCol, 'display: block;' ].join(';')
            ];
      };

      var _wrapLogInsideTags = function( title, msg, bgColor ) {
            if ( ( _.isUndefined( console ) && typeof window.console.log != 'function' ) )
              return;
            if ( czrapp.localized.isDevMode ) {
                  if ( _.isUndefined( msg ) ) {
                        console.log.apply( console, _prettyPrintLog( { bgCol : bgColor, textCol : '#000', consoleArguments : [ '<' + title + '>' ] } ) );
                  } else {
                        console.log.apply( console, _prettyPrintLog( { bgCol : bgColor, textCol : '#000', consoleArguments : [ '<' + title + '>' ] } ) );
                        console.log( msg );
                        console.log.apply( console, _prettyPrintLog( { bgCol : bgColor, textCol : '#000', consoleArguments : [ '</' + title + '>' ] } ) );
                  }
            } else {
                  console.log.apply( console, _prettyPrintLog( { bgCol : bgColor, textCol : '#000', consoleArguments : [ title ] } ) );
            }
      };
      czrapp.consoleLog = function() {
            if ( ! czrapp.localized.isDevMode )
              return;
            if ( ( _.isUndefined( console ) && typeof window.console.log != 'function' ) )
              return;
            console.log.apply( console, _prettyPrintLog( { consoleArguments : arguments } ) );
            console.log( 'Unstyled console message : ', arguments );
      };

      czrapp.errorLog = function() {
            if ( ( _.isUndefined( console ) && typeof window.console.log != 'function' ) )
              return;

            console.log.apply( console, _prettyPrintLog( { bgCol : '#ffd5a0', textCol : '#000', consoleArguments : arguments } ) );
      };


      czrapp.errare = function( title, msg ) { _wrapLogInsideTags( title, msg, '#ffd5a0' ); };
      czrapp.infoLog = function( title, msg ) { _wrapLogInsideTags( title, msg, '#5ed1f5' ); };
      czrapp.doAjax = function( queryParams ) {
            queryParams = queryParams || ( _.isObject( queryParams ) ? queryParams : {} );

            var ajaxUrl = queryParams.ajaxUrl || czrapp.localized.ajaxUrl,//the ajaxUrl can be specified when invoking doAjax
                nonce = czrapp.localized.frontNonce,//{ 'id' => 'HuFrontNonce', 'handle' => wp_create_nonce( 'hu-front-nonce' ) },
                dfd = $.Deferred(),
                _query_ = _.extend( {
                            action : '',
                            withNonce : false
                      },
                      queryParams
                );
            if ( "https:" == document.location.protocol ) {
                  ajaxUrl = ajaxUrl.replace( "http://", "https://" );
            }
            if ( _.isEmpty( _query_.action ) || ! _.isString( _query_.action ) ) {
                  czrapp.errorLog( 'czrapp.doAjax : unproper action provided' );
                  return dfd.resolve().promise();
            }
            _query_[ nonce.id ] = nonce.handle;
            if ( ! _.isObject( nonce ) || _.isUndefined( nonce.id ) || _.isUndefined( nonce.handle ) ) {
                  czrapp.errorLog( 'czrapp.doAjax : unproper nonce' );
                  return dfd.resolve().promise();
            }

            $.post( ajaxUrl, _query_ )
                  .done( function( _r ) {
                        if ( '0' === _r ||  '-1' === _r || false === _r.success ) {
                              czrapp.errare( 'czrapp.doAjax : done ajax error for action : ' + _query_.action , _r );
                              dfd.reject( _r );
                        }
                        dfd.resolve( _r );
                  })
                  .fail( function( _r ) {
                        czrapp.errare( 'czrapp.doAjax : failed ajax error for : ' + _query_.action, _r );
                        dfd.reject( _r );
                  });
            return dfd.promise();
      };
})(jQuery, czrapp);
(function($, czrapp) {
      czrapp.isKeydownButNotEnterEvent = function ( event ) {
        return ( 'keydown' === event.type && 13 !== event.which );
      };
      czrapp.setupDOMListeners = function( event_map , args, instance ) {
              var _defaultArgs = {
                        model : {},
                        dom_el : {}
                  };

              if ( _.isUndefined( instance ) || ! _.isObject( instance ) ) {
                    czrapp.errorLog( 'setupDomListeners : instance should be an object', args );
                    return;
              }
              if ( ! _.isArray( event_map ) ) {
                    czrapp.errorLog( 'setupDomListeners : event_map should be an array', args );
                    return;
              }
              if ( ! _.isObject( args ) ) {
                    czrapp.errorLog( 'setupDomListeners : args should be an object', event_map );
                    return;
              }

              args = _.extend( _defaultArgs, args );
              if ( ! ( args.dom_el instanceof jQuery ) || 1 != args.dom_el.length ) {
                    czrapp.errorLog( 'setupDomListeners : dom element should be an existing dom element', args );
                    return;
              }
              _.map( event_map , function( _event ) {
                    if ( ! _.isString( _event.selector ) || _.isEmpty( _event.selector ) ) {
                          czrapp.errorLog( 'setupDOMListeners : selector must be a string not empty. Aborting setup of action(s) : ' + _event.actions.join(',') );
                          return;
                    }
                    if ( ! _.isString( _event.selector ) || _.isEmpty( _event.selector ) ) {
                          czrapp.errorLog( 'setupDOMListeners : selector must be a string not empty. Aborting setup of action(s) : ' + _event.actions.join(',') );
                          return;
                    }
                    var once = _event.once ? _event.once : false;
                    args.dom_el[ once ? 'one' : 'on' ]( _event.trigger , _event.selector, function( e, event_params ) {
                          e.stopPropagation();
                          if ( czrapp.isKeydownButNotEnterEvent( e ) ) {
                            return;
                          }
                          e.preventDefault(); // Keep this AFTER the key filter above
                          var actionsParams = $.extend( true, {}, args );
                          if ( _.has( actionsParams, 'model') && _.has( actionsParams.model, 'id') ) {
                                if ( _.has( instance, 'get' ) )
                                  actionsParams.model = instance();
                                else
                                  actionsParams.model = instance.getModel( actionsParams.model.id );
                          }
                          $.extend( actionsParams, { event : _event, dom_event : e } );
                          $.extend( actionsParams, event_params );
                          if ( ! _.has( actionsParams, 'event' ) || ! _.has( actionsParams.event, 'actions' ) ) {
                                czrapp.errorLog( 'executeEventActionChain : missing obj.event or obj.event.actions' );
                                return;
                          }
                          try { czrapp.executeEventActionChain( actionsParams, instance ); } catch( er ) {
                                czrapp.errorLog( 'In setupDOMListeners : problem when trying to fire actions : ' + actionsParams.event.actions );
                                czrapp.errorLog( 'Error : ' + er );
                          }
                    });//.on()
              });//_.map()
      };//setupDomListeners
      czrapp.executeEventActionChain = function( args, instance ) {
              if ( 'function' === typeof( args.event.actions ) )
                return args.event.actions.call( instance, args );
              if ( ! _.isArray( args.event.actions ) )
                args.event.actions = [ args.event.actions ];
              var _break = false;
              _.map( args.event.actions, function( _cb ) {
                    if ( _break )
                      return;

                    if ( 'function' != typeof( instance[ _cb ] ) ) {
                          throw new Error( 'executeEventActionChain : the action : ' + _cb + ' has not been found when firing event : ' + args.event.selector );
                    }
                    var $_dom_el = ( _.has(args, 'dom_el') && -1 != args.dom_el.length ) ? args.dom_el : false;
                    if ( ! $_dom_el ) {
                          czrapp.errorLog( 'missing dom element');
                          return;
                    }
                    $_dom_el.trigger( 'before_' + _cb, _.omit( args, 'event' ) );
                    var _cb_return = instance[ _cb ].call( instance, args );
                    if ( false === _cb_return )
                      _break = true;
                    $_dom_el.trigger( 'after_' + _cb, _.omit( args, 'event' ) );
              });//_.map
      };
})(jQuery, czrapp);var czrapp = czrapp || {};
czrapp.methods = {};

(function( $ ){
      var ctor, inherits, slice = Array.prototype.slice;
      ctor = function() {};
      inherits = function( parent, protoProps, staticProps ) {
        var child;
        if ( protoProps && protoProps.hasOwnProperty( 'constructor' ) ) {
          child = protoProps.constructor;
        } else {
          child = function() {
            var result = parent.apply( this, arguments );
            return result;
          };
        }
        $.extend( child, parent );
        ctor.prototype  = parent.prototype;
        child.prototype = new ctor();
        if ( protoProps )
          $.extend( child.prototype, protoProps );
        if ( staticProps )
          $.extend( child, staticProps );
        child.prototype.constructor = child;
        child.__super__ = parent.prototype;

        return child;
      };
      czrapp.Class = function( applicator, argsArray, options ) {
        var magic, args = arguments;

        if ( applicator && argsArray && czrapp.Class.applicator === applicator ) {
          args = argsArray;
          $.extend( this, options || {} );
        }

        magic = this;
        if ( this.instance ) {
          magic = function() {
            return magic.instance.apply( magic, arguments );
          };

          $.extend( magic, this );
        }

        magic.initialize.apply( magic, args );
        return magic;
      };
      czrapp.Class.extend = function( protoProps, classProps ) {
        var child = inherits( this, protoProps, classProps );
        child.extend = this.extend;
        return child;
      };

      czrapp.Class.applicator = {};
      czrapp.Class.prototype.initialize = function() {};
      czrapp.Class.prototype.extended = function( constructor ) {
        var proto = this;

        while ( typeof proto.constructor !== 'undefined' ) {
          if ( proto.constructor === constructor )
            return true;
          if ( typeof proto.constructor.__super__ === 'undefined' )
            return false;
          proto = proto.constructor.__super__;
        }
        return false;
      };
      czrapp.Events = {
        trigger: function( id ) {
          if ( this.topics && this.topics[ id ] )
            this.topics[ id ].fireWith( this, slice.call( arguments, 1 ) );
          return this;
        },

        bind: function( id ) {
          this.topics = this.topics || {};
          this.topics[ id ] = this.topics[ id ] || $.Callbacks();
          this.topics[ id ].add.apply( this.topics[ id ], slice.call( arguments, 1 ) );
          return this;
        },

        unbind: function( id ) {
          if ( this.topics && this.topics[ id ] )
            this.topics[ id ].remove.apply( this.topics[ id ], slice.call( arguments, 1 ) );
          return this;
        }
      };
      czrapp.Value = czrapp.Class.extend({
        initialize: function( initial, options ) {
          this._value = initial; // @todo: potentially change this to a this.set() call.
          this.callbacks = $.Callbacks();
          this._dirty = false;

          $.extend( this, options || {} );

          this.set = $.proxy( this.set, this );
        },
        instance: function() {
          return arguments.length ? this.set.apply( this, arguments ) : this.get();
        },
        get: function() {
          return this._value;
        },
        set: function( to, o ) {
              var from = this._value, dfd = $.Deferred(), self = this, _promises = [];

              to = this._setter.apply( this, arguments );
              to = this.validate( to );
              var args = _.extend( { silent : false }, _.isObject( o ) ? o : {} );
              if ( null === to || _.isEqual( from, to ) ) {
                    return dfd.resolveWith( self, [ to, from, o ] ).promise();
              }

              this._value = to;
              this._dirty = true;
              if ( true === args.silent ) {
                    return dfd.resolveWith( self, [ to, from, o ] ).promise();
              }

              if ( this._deferreds ) {
                    _.each( self._deferreds, function( _prom ) {
                          _promises.push( _prom.apply( null, [ to, from, o ] ) );
                    });

                    $.when.apply( null, _promises )
                          .fail( function() { czrapp.errorLog( 'A deferred callback failed in api.Value::set()'); })
                          .then( function() {
                                self.callbacks.fireWith( self, [ to, from, o ] );
                                dfd.resolveWith( self, [ to, from, o ] );
                          });
              } else {
                    this.callbacks.fireWith( this, [ to, from, o ] );
                    return dfd.resolveWith( self, [ to, from, o ] ).promise( self );
              }
              return dfd.promise( self );
        },
        silent_set : function( to, dirtyness ) {
              var from = this._value;

              to = this._setter.apply( this, arguments );
              to = this.validate( to );
              if ( null === to || _.isEqual( from, to ) ) {
                return this;
              }

              this._value = to;
              this._dirty = ( _.isUndefined( dirtyness ) || ! _.isBoolean( dirtyness ) ) ? this._dirty : dirtyness;

              this.callbacks.fireWith( this, [ to, from, { silent : true } ] );

              return this;
        },

        _setter: function( to ) {
          return to;
        },

        setter: function( callback ) {
          var from = this.get();
          this._setter = callback;
          this._value = null;
          this.set( from );
          return this;
        },

        resetSetter: function() {
          this._setter = this.constructor.prototype._setter;
          this.set( this.get() );
          return this;
        },

        validate: function( value ) {
          return value;
        },
        bind: function() {
            var self = this,
                _isDeferred = false,
                _cbs = [];

            $.each( arguments, function( _key, _arg ) {
                  if ( ! _isDeferred )
                    _isDeferred = _.isObject( _arg  ) && _arg.deferred;
                  if ( _.isFunction( _arg ) )
                    _cbs.push( _arg );
            });

            if ( _isDeferred ) {
                  self._deferreds = self._deferreds || [];
                  _.each( _cbs, function( _cb ) {
                        if ( ! _.contains( _cb, self._deferreds ) )
                          self._deferreds.push( _cb );
                  });
            } else {
                  self.callbacks.add.apply( self.callbacks, arguments );
            }
            return this;
        },
        unbind: function() {
          this.callbacks.remove.apply( this.callbacks, arguments );
          return this;
        },
      });
      czrapp.Values = czrapp.Class.extend({
        defaultConstructor: czrapp.Value,

        initialize: function( options ) {
          $.extend( this, options || {} );

          this._value = {};
          this._deferreds = {};
        },
        instance: function( id ) {
          if ( arguments.length === 1 )
            return this.value( id );

          return this.when.apply( this, arguments );
        },
        value: function( id ) {
          return this._value[ id ];
        },
        has: function( id ) {
          return typeof this._value[ id ] !== 'undefined';
        },
        add: function( id, value ) {
          if ( this.has( id ) )
            return this.value( id );

          this._value[ id ] = value;
          value.parent = this;
          if ( value.extended( czrapp.Value ) )
            value.bind( this._change );

          this.trigger( 'add', value );
          if ( this._deferreds[ id ] )
            this._deferreds[ id ].resolve();

          return this._value[ id ];
        },
        create: function( id ) {
          return this.add( id, new this.defaultConstructor( czrapp.Class.applicator, slice.call( arguments, 1 ) ) );
        },
        each: function( callback, context ) {
          context = typeof context === 'undefined' ? this : context;

          $.each( this._value, function( key, obj ) {
            callback.call( context, obj, key );
          });
        },
        remove: function( id ) {
          var value;

          if ( this.has( id ) ) {
            value = this.value( id );
            this.trigger( 'remove', value );
            if ( value.extended( czrapp.Value ) )
              value.unbind( this._change );
            delete value.parent;
          }

          delete this._value[ id ];
          delete this._deferreds[ id ];
        },
        when: function() {
          var self = this,
            ids  = slice.call( arguments ),
            dfd  = $.Deferred();
          if ( $.isFunction( ids[ ids.length - 1 ] ) )
            dfd.done( ids.pop() );
          $.when.apply( $, $.map( ids, function( id ) {
            if ( self.has( id ) )
              return;
            return self._deferreds[ id ] || $.Deferred();
          })).done( function() {
            var values = $.map( ids, function( id ) {
                return self( id );
              });
            if ( values.length !== ids.length ) {
              self.when.apply( self, ids ).done( function() {
                dfd.resolveWith( self, values );
              });
              return;
            }

            dfd.resolveWith( self, values );
          });

          return dfd.promise();
        },
        _change: function() {
          this.parent.trigger( 'change', this );
        }
      });
      $.extend( czrapp.Values.prototype, czrapp.Events );

})( jQuery );//@global HUParams
var czrapp = czrapp || {};
(function($, czrapp) {
      czrapp.localized = HUParams || {};

      var _methods = {
            cacheProp : function() {
                  var self = this;
                  $.extend( czrapp, {
                        $_window         : $(window),
                        $_html           : $('html'),
                        $_body           : $('body'),
                        $_header         : $('#header'),
                        $_wpadminbar     : $('#wpadminbar'),
                        $_mainWrapper    : $('.main', '#wrapper'),
                        $_mainContent    : $('.main', '#wrapper').find('.content'),
                        is_responsive    : self.isResponsive(),//store the initial responsive state of the window
                        current_device   : self.getDevice()//store the initial device
                  });
            },
            isResponsive : function() {
                  return this.matchMedia(979);
            },
            getDevice : function() {
                  var _devices = {
                        desktop : 979,
                        tablet : 767,
                        smartphone : 480
                      },
                      _current_device = 'desktop',
                      that = this;


                  _.map( _devices, function( max_width, _dev ){
                        if ( that.matchMedia( max_width ) )
                          _current_device = _dev;
                  } );

                  return _current_device;
            },

            matchMedia : function( _maxWidth ) {
                  if ( window.matchMedia )
                    return ( window.matchMedia("(max-width: "+_maxWidth+"px)").matches );
                  $_window = czrapp.$_window || $(window);
                  return $_window.width() <= ( _maxWidth - 15 );
            },

            emit : function( cbs, args ) {
                  cbs = _.isArray(cbs) ? cbs : [cbs];
                  var self = this;
                  _.map( cbs, function(cb) {
                        if ( 'function' == typeof(self[cb]) ) {
                              args = 'undefined' == typeof( args ) ? Array() : args ;
                              self[cb].apply(self, args );
                              czrapp.trigger( cb, _.object( _.keys(args), args ) );
                        }
                  });//_.map
            },

            triggerSimpleLoad : function( $_imgs ) {
                  if ( 0 === $_imgs.length )
                    return;

                  $_imgs.map( function( _ind, _img ) {
                    $(_img).on('load', function () {
                      $(_img).trigger('simple_load');
                    });//end load
                    if ( $(_img)[0] && $(_img)[0].complete )
                      $(_img).trigger('load');
                  } );//end map
            },//end of fn

            isUserLogged     : function() {
                  return czrapp.$_body.hasClass('logged-in') || 0 !== czrapp.$_wpadminbar.length;
            },

            isSelectorAllowed : function( $_el, skip_selectors, requested_sel_type ) {
                  var sel_type = 'ids' == requested_sel_type ? 'id' : 'class',
                  _selsToSkip   = skip_selectors[requested_sel_type];
                  if ( 'object' != typeof(skip_selectors) || ! skip_selectors[requested_sel_type] || ! $.isArray( skip_selectors[requested_sel_type] ) || 0 === skip_selectors[requested_sel_type].length )
                    return true;
                  if ( $_el.parents( _selsToSkip.map( function( _sel ){ return 'id' == sel_type ? '#' + _sel : '.' + _sel; } ).join(',') ).length > 0 )
                    return false;
                  if ( ! $_el.attr( sel_type ) )
                    return true;

                  var _elSels       = $_el.attr( sel_type ).split(' '),
                      _filtered     = _elSels.filter( function(classe) { return -1 != $.inArray( classe , _selsToSkip ) ;});
                  return 0 === _filtered.length;
            },
            _isMobileScreenSize : function() {
                  return ( _.isFunction( window.matchMedia ) && matchMedia( 'only screen and (max-width: 720px)' ).matches ) || ( this._isCustomizing() && 'desktop' != this.previewDevice() );
            },
            _isCustomizing : function() {
                  return czrapp.$_body.hasClass('is-customizing') || ( 'undefined' !== typeof wp && 'undefined' !== typeof wp.customize );
            },
            _has_iframe : function ( $_elements ) {
                  var that = this,
                      to_return = [];
                  _.each( $_elements, function( $_el, container ){
                        if ( $_el.length > 0 && $_el.find('IFRAME').length > 0 )
                          to_return.push(container);
                  });
                  return to_return;
            },
            observeAddedNodesOnDom : function(containerSelector, elementSelector, callback) {
                var onMutationsObserved = function(mutations) {
                        mutations.forEach(function(mutation) {
                            if (mutation.addedNodes.length) {
                                var elements = $(mutation.addedNodes).find(elementSelector);
                                for (var i = 0, len = elements.length; i < len; i++) {
                                    callback(elements[i]);
                                }
                            }
                        });
                    },
                    target = $(containerSelector)[0],
                    config = { childList: true, subtree: true },
                    MutationObserver = window.MutationObserver || window.WebKitMutationObserver,
                    observer = new MutationObserver(onMutationsObserved);

                observer.observe(target, config);
          }
      };//_methods{}

      czrapp.methods.Base = czrapp.methods.Base || {};
      $.extend( czrapp.methods.Base , _methods );//$.extend

})(jQuery, czrapp);/***************************
* ADD BROWSER DETECT METHODS
****************************/
(function($, czrapp) {
  var _methods =  {
    addBrowserClassToBody : function() {
          if ( !$.browser )
            return;
          if ( $.browser.chrome )
              czrapp.$_body.addClass("chrome");
          else if ( $.browser.webkit )
              czrapp.$_body.addClass("safari");
          if ( $.browser.mozilla )
              czrapp.$_body.addClass("mozilla");
          else if ( $.browser.msie || '8.0' === $.browser.version || '9.0' === $.browser.version || '10.0' === $.browser.version || '11.0' === $.browser.version )
              czrapp.$_body.addClass("ie").addClass("ie" + $.browser.version.replace(/[.0]/g, ''));
          if ( czrapp.$_body.hasClass("ie") )
              czrapp.$_body.addClass($.browser.version);
    }
  };//_methods{}
  czrapp.methods.BrowserDetect = czrapp.methods.BrowserDetect || {};
  $.extend( czrapp.methods.BrowserDetect , _methods );

})(jQuery, czrapp);
var czrapp = czrapp || {};
(function( $, czrapp ) {
  var _methods = {
    imgSmartLoad : function() {
          var smartLoadEnabled = 1 == HUParams.imgSmartLoadEnabled,
              _where           = HUParams.imgSmartLoadOpts.parentSelectors.join();
              _params = _.size( HUParams.imgSmartLoadOpts.opts ) > 0 ? HUParams.imgSmartLoadOpts.opts : {};
          var _doLazyLoad = function() {
                if ( !smartLoadEnabled )
                  return;

                $(_where).each( function() {
                      if ( !$(this).data('smartLoadDone') ) {
                            $(this).imgSmartLoad(_params);
                      } else {
                            $(this).trigger('trigger-smartload');
                      }
                });
          };
          _doLazyLoad();
          this.observeAddedNodesOnDom('body', 'img', _.debounce( function(element) {
                _doLazyLoad();
          }, 50 ));
          if ( 1 == HUParams.centerAllImg ) {
                var self                   = this,
                    $_to_center            = smartLoadEnabled ?
                       $( _.filter( $( _where ).find('img'), function( img ) {
                          return $(img).is(HUParams.imgSmartLoadOpts.opts.excludeImg.join());
                        }) ): //filter
                        $( _where ).find('img');
                    $_to_center_with_delay = $( _.filter( $_to_center, function( img ) {
                        return $(img).hasClass('tc-holder-img');
                    }) );
                setTimeout( function(){
                      self.triggerSimpleLoad( $_to_center_with_delay );
                }, 300 );
                self.triggerSimpleLoad( $_to_center );
          }
    },
    extLinks : function() {
          if ( ! HUParams.extLinksStyle && ! HUParams.extLinksTargetExt )
            return;
          $('a' , '.post-inner .entry p, .post-inner .entry li, .type-page .entry p, .type-page .entry li').extLinks({
                addIcon : HUParams.extLinksStyle,
                iconClassName : 'hu-external',
                newTab : HUParams.extLinksTargetExt,
                skipSelectors : _.isObject(HUParams.extLinksSkipSelectors) ? HUParams.extLinksSkipSelectors : {}
          });
    },

    parallax : function() {
          $( '.parallax-item' ).czrParallax();
    },
  };//_methods{}

  czrapp.methods.JQPlugins = czrapp.methods.JQPlugins || {};
  $.extend( czrapp.methods.JQPlugins = {} , _methods );

})(jQuery, czrapp);
var czrapp = czrapp || {};
(function($, czrapp) {
  var _methods =  {
      setupUIListeners : function() {
            var self = this;
            this.windowWidth            = new czrapp.Value( czrapp.$_window.width() );
            this.isScrolling            = new czrapp.Value( false );
            this.isResizing             = new czrapp.Value( false );
            this.scrollPosition         = new czrapp.Value( czrapp.$_window.scrollTop() );
            this.scrollDirection        = new czrapp.Value('down');
            self.previewDevice          = new czrapp.Value( 'desktop' );
            if ( self._isCustomizing() ) {
                  var _setPreviewedDevice = function() {
                        wp.customize.preview.bind( 'previewed-device', function( device ) {
                              self.previewDevice( device );
                        });
                  };
                  if ( wp.customize.preview ) {
                      _setPreviewedDevice();
                  } else {
                        wp.customize.bind( 'preview-ready', function() {
                              _setPreviewedDevice();
                        });
                  }
            }
            self.windowWidth.bind( function( to, from ) {
                  self.isResizing( self._isMobileScreenSize ? Math.abs( from - to ) > 2 : Math.abs( from - to ) > 0 );
                  clearTimeout( $.data( this, 'resizeTimer') );
                  $.data( this, 'resizeTimer', setTimeout(function() {
                        self.isResizing( false );
                  }, 50 ) );
            });
            self.isResizing.bind( function( is_resizing ) {
                  czrapp.$_body.toggleClass( 'is-resizing', is_resizing );
            });
            this.isScrolling.bind( function( to, from ) {
                  czrapp.$_body.toggleClass( 'is-scrolling', to );
                  if ( ! to ) {
                        czrapp.trigger( 'scrolling-finished' );
                  }
            });
            this.scrollPosition.bind( function( to, from ) {
                  czrapp.$_body.toggleClass( 'is-scrolled', to > 100 );
                  if ( to <= 50 ) {
                        czrapp.trigger( 'page-scrolled-top', {} );
                  }
                  self.scrollDirection( to >= from ? 'down' : 'up' );
            });
            czrapp.$_window.on('resize', _.throttle( function( ev ) { self.windowWidth( czrapp.$_window.width() ); }, 10 ) );
            czrapp.$_window.on('scroll', _.throttle( function() {
                  self.isScrolling( true );
                  self.scrollPosition( czrapp.$_window.scrollTop() );
                  clearTimeout( $.data( this, 'scrollTimer') );
                  $.data( this, 'scrollTimer', setTimeout(function() {
                        self.isScrolling( false );
                  }, 100 ) );
            }, 10 ) );

      },
      onSlidingCompleteResetCSS : function( $_el ) {
            $_el   = $_el ? $_el : $(this);
            $_el.css({
                  'display'    : '',
                  'paddingTop' : '',
                  'marginTop' : '',
                  'paddingBottom' : '',
                  'marginBottom' : '',
                  'height' : ''
            });
      },
  };//_methods{}

  czrapp.methods.UserXP = czrapp.methods.UserXP || {};
  $.extend( czrapp.methods.UserXP , _methods );

})(jQuery, czrapp);var czrapp = czrapp || {};
(function($, czrapp) {
  var _methods =  {

        mobileMenu : function() {
              var self = this;
              self.mobileMenu = new czrapp.Values();
              $('.nav-container').each( function( _index ) {
                    if ( ! _.isString( $(this).attr( 'data-menu-id' ) ) )
                      return;

                    var $container      = $(this),
                        is_scrollable   = _.isString( $(this).attr( 'data-menu-scrollable' ) ) && "false" == $(this).attr( 'data-menu-scrollable' ) ? false : true,
                        _candidateId    = $container.attr( 'data-menu-id' ),
                        ctor;

                    if ( self.mobileMenu.has( _candidateId ) )
                      return;

                    var $navWrap = $container.find( '.nav-wrap' );
                    var button_selectors = '.nav-toggle, .ham__navbar-toggler, .ham__navbar-toggler-two',
                        $button = $container.find( button_selectors );
                    if ( 1 == $navWrap.length && 1 == $button.length ) {
                          ctor = czrapp.Value.extend( self.MobileCTOR );
                          self.mobileMenu.add( _candidateId, new ctor( _candidateId, {
                                container : $container,
                                menu_wrapper : $navWrap,
                                button : $button,
                                button_selectors : button_selectors,
                                is_scrollable : is_scrollable
                          }));
                    }
              });
        },
        MobileCTOR : {
              initialize: function( mobile_id, constructor_options ) {
                    var mobMenu = this;
                    czrapp.Value.prototype.initialize.call( mobMenu, null, constructor_options );
                    $.extend( mobMenu, constructor_options || {} );
                    mobMenu( 'collapsed' ).button
                        .toggleClass( 'collapsed', true )
                        .toggleClass( 'active', false )
                        .attr('aria-expanded', false );
                    mobMenu.bind( function( state ) {
                          return $.Deferred( function() {
                                var dfd = this;
                                czrapp.userXP.headerSearchExpanded( false ).done( function() {
                                      mobMenu._toggleMobileMenu()
                                            .done( function( state ){
                                                  mobMenu.button.toggleClass( 'hovering', 'expanded' == state ).toggleClass( 'focusing', 'expanded' == state );
                                                  dfd.resolve();
                                            });
                                });
                          }).promise();
                    }, { deferred : true } );
                    czrapp.setupDOMListeners(
                          [
                                {
                                      trigger   : 'mousedown focusin keydown',
                                      selector  : mobMenu.button_selectors,
                                      actions   : function() {
                                            var mobMenu = this;
                                            mobMenu( 'collapsed' == mobMenu() ? 'expanded' : 'collapsed' );
                                      }
                                },
                                {
                                      trigger   : 'mouseenter',
                                      selector  : mobMenu.button_selectors,
                                      actions   : function() {
                                            this.button.addClass( 'hovering' );
                                      }

                                },
                                {
                                      trigger   : 'mouseleave',
                                      selector  : mobMenu.button_selectors,
                                      actions   : function() {
                                            this.button.removeClass( 'hovering' );
                                      }

                                }
                          ],//actions to execute
                          { dom_el: mobMenu.container },//dom scope
                          mobMenu //instance where to look for the cb methods
                    );
                    if ( czrapp.localized.mobileSubmenuExpandOnClick ) {
                          mobMenu.menu_wrapper.addClass( 'submenu-click-expand' );
                          czrapp.setupDOMListeners(
                                [
                                      {
                                            trigger   : 'mousedown focusin keydown',
                                            selector  : mobMenu.button_selectors,
                                            actions   : function() {
                                                  var mobMenu = this;
                                                  mobMenu._collapsibleSubmenu();
                                            },
                                            once      : true
                                      }
                                ],//actions to execute
                                { dom_el: mobMenu.container },//dom scope
                                mobMenu //instance where to look for the cb methods
                          );
                    }
                    czrapp.userXP.isResizing.bind( function( is_resizing ) {
                          if ( ! is_resizing )
                            return;
                          mobMenu( 'collapsed' );
                    });
                    $(  mobMenu.container )
                          .on( 'mouseup', '.menu-item a', function(evt) {
                                if ( ! czrapp.userXP._isMobileScreenSize() )
                                  return;
                                if ( '#' === $(this).attr('href') )
                                  return;
                                evt.preventDefault();
                                evt.stopPropagation();
                                mobMenu( 'collapsed');
                          });

              },
              _toggleMobileMenu : function()  {
                    var mobMenu = this,
                        expand = 'expanded' == mobMenu(),
                        dfd = $.Deferred();
                    mobMenu.button
                        .toggleClass( 'collapsed', ! expand )
                        .toggleClass( 'active', expand )
                        .attr('aria-expanded', expand );

                    $.when( mobMenu.menu_wrapper.toggleClass( 'expanded', expand ) ).done( function() {
                          var $navWrap = $(this);
                          $navWrap.find('.nav').stop()[ ! expand ? 'slideUp' : 'slideDown' ]( {
                                duration : 300,
                                complete : function() {
                                      if ( mobMenu.is_scrollable ) {
                                            var _winHeight = 'undefined' === typeof window.innerHeight ? window.innerHeight : czrapp.$_window.height(),
                                                _visibleHeight = _winHeight - $navWrap.offset().top + czrapp.$_window.scrollTop();
                                            $navWrap.css( {
                                                  'max-height' : expand ? _visibleHeight : '',
                                                  'overflow' : 'auto'
                                            });
                                      }
                                      czrapp.userXP.onSlidingCompleteResetCSS($(this).toggleClass( 'expanded', expand ));

                                      dfd.resolve( expand );
                                }
                          } );
                    });
                    return dfd.promise();
              },
              _collapsibleSubmenu : function() {
                    var mobMenu     = this;

                    var EVENT_KEY   = '.hu.submenu',
                        Event       = {
                          SHOW     : 'show' + EVENT_KEY,
                          HIDE     : 'hide' + EVENT_KEY,
                          CLICK    : 'mousedown' + EVENT_KEY,
                          FOCUSIN  : 'focusin' + EVENT_KEY,
                          FOCUSOUT : 'focusout' + EVENT_KEY
                        },
                        Classname   = {
                          DD_TOGGLE_ON_CLICK    : 'submenu-click-expand',
                          SHOWN                 : 'expanded',
                          DD_TOGGLE             : 'hu-dropdown-toggle',
                          DD_TOGGLE_WRAPPER     : 'hu-dropdown-toggle-wrapper',
                          SCREEN_READER         : 'screen-reader-text',

                        },
                        Selector    = {
                          DD_TOGGLE_PARENT      : '.menu-item-has-children, .page_item_has_children',
                          CURRENT_ITEM_ANCESTOR : '.current-menu-ancestor',
                          SUBMENU               : '.sub-menu'
                        },
                        dropdownToggle        = $( '<button />', { 'class': Classname.DD_TOGGLE, 'aria-expanded': false })
                                                .append( czrapp.localized.submenuTogglerIcon )
                                                .append( $( '<span />', { 'class': Classname.SCREEN_READER, text: czrapp.localized.i18n.collapsibleExpand } ) ),
                        dropdownToggleWrapper = $( '<span />', { 'class': Classname.DD_TOGGLE_WRAPPER })
                                                .append( dropdownToggle );
                    mobMenu.menu_wrapper.find( Selector.DD_TOGGLE_PARENT ).children('a').after( dropdownToggleWrapper );
                    mobMenu.menu_wrapper.find( Selector.CURRENT_ITEM_ANCESTOR +'>.'+ Classname.DD_TOGGLE_WRAPPER +' .'+ Classname.DD_TOGGLE )
                      .addClass( Classname.SHOWN )
                      .attr( 'aria-expanded', 'true' )
                      .find( '.'+Classname.SCREEN_READER )
                        .text( czrapp.localized.i18n.collapsibleCollapse );
                    mobMenu.menu_wrapper.find( Selector.CURRENT_ITEM_ANCESTOR +'>'+ Selector.SUBMENU ).addClass( Classname.SHOWN );
                    mobMenu.menu_wrapper.find( Selector.CURRENT_ITEM_ANCESTOR ).addClass( Classname.SHOWN );

                    $(  mobMenu.menu_wrapper )
                        .on( Event.CLICK, 'a[href="#"]', function(evt) {
                              if ( ! czrapp.userXP._isMobileScreenSize() )
                                return;

                              evt.preventDefault();
                              evt.stopPropagation();
                              $(this).next('.'+Classname.DD_TOGGLE_WRAPPER).find('.'+Classname.DD_TOGGLE).trigger( Event.CLICK );
                        })
                        .on( Event.CLICK, '.'+Classname.DD_TOGGLE, function( e ) {
                              e.preventDefault();

                              var $_this = $( this );
                              $_this.trigger( $_this.closest( Selector.DD_TOGGLE_PARENT ).hasClass( Classname.SHOWN ) ? Event.HIDE: Event.SHOW  );
                              _clearMenus( mobMenu, $_this );
                        })
                        .on( Event.SHOW+' '+Event.HIDE, '.'+Classname.DD_TOGGLE, function( e ) {
                              var $_this = $( this );

                              $_this.closest( Selector.DD_TOGGLE_PARENT ).toggleClass( Classname.SHOWN );

                              $_this.closest('.'+Classname.DD_TOGGLE_WRAPPER).next( Selector.SUBMENU )
                                .stop()[Event.SHOW == e.type + '.' + e.namespace  ? 'slideDown' : 'slideUp']( {
                                    duration: 300,
                                    complete: function() {
                                      var _to_expand =  'false' === $_this.attr( 'aria-expanded' );
                                          $submenu   = $(this);

                                      $_this.attr( 'aria-expanded', _to_expand )
                                            .find( '.'+Classname.SCREEN_READER )
                                                .text( _to_expand ? czrapp.localized.i18n.collapsibleCollapse : czrapp.localized.i18n.collapsibleExpand );

                                      $submenu.toggleClass( Classname.SHOWN );
                                      czrapp.userXP.onSlidingCompleteResetCSS($submenu);
                                    }
                                });
                        })
                        .on( Event.FOCUSIN, 'a[href="#"]', function(evt) {
                              if ( ! czrapp.userXP._isMobileScreenSize() )
                                    return;

                              evt.preventDefault();
                              evt.stopPropagation();
                              $(this).next('.'+Classname.DD_TOGGLE_WRAPPER).find('.'+Classname.DD_TOGGLE).trigger( Event.FOCUSIN );
                        })
                        .on( Event.FOCUSOUT, 'a[href="#"]', function(evt) {
                              if ( ! czrapp.userXP._isMobileScreenSize() )
                                    return;
                              evt.preventDefault();
                              evt.stopPropagation();
                              _.delay( function() {
                                    $(this).next('.'+Classname.DD_TOGGLE_WRAPPER).find('.'+Classname.DD_TOGGLE).trigger( Event.FOCUSOUT );
                              }, 250 );
                        })
                        .on( Event.FOCUSIN, '.'+Classname.DD_TOGGLE, function( e ) {
                              e.preventDefault();

                              var $_this = $( this );
                              $_this.trigger( Event.SHOW );
                        })
                        .on( Event.FOCUSIN, function( evt ) {
                              evt.preventDefault();
                              if ( $(evt.target).length > 0 ) {
                                    $(evt.target).addClass( 'hu-mm-focused');
                              }
                        })
                        .on( Event.FOCUSOUT,function( evt ) {
                              evt.preventDefault();

                              var $_this = $( this );
                              _.delay( function() {
                                    if ( $(evt.target).length > 0 ) {
                                          $(evt.target).removeClass( 'hu-mm-focused');
                                    }
                                    if ( mobMenu.container.find('.hu-mm-focused').length < 1 ) {
                                          mobMenu( 'collapsed');
                                    }
                              }, 200 );

                        });
                    var _clearMenus = function( mobMenu, $_toggle ) {
                      var _parentsToNotClear = $.makeArray( $_toggle.parents( Selector.DD_TOGGLE_PARENT ) ),
                          _toggles           = $.makeArray( $( '.'+Classname.DD_TOGGLE, mobMenu.menu_wrapper ) );

                      for (var i = 0; i < _toggles.length; i++) {
                           var _parent = $(_toggles[i]).closest( Selector.DD_TOGGLE_PARENT )[0];

                           if (!$(_parent).hasClass( Classname.SHOWN ) || $.inArray(_parent, _parentsToNotClear ) > -1 ){
                              continue;
                           }

                          $(_toggles[i]).trigger( Event.HIDE );
                      }
                    };

              }
        }//MobileCTOR

  };//_methods{}

  czrapp.methods.UserXP = czrapp.methods.UserXP || {};
  $.extend( czrapp.methods.UserXP , _methods );

})(jQuery, czrapp);var czrapp = czrapp || {};
(function($, czrapp) {
  var _methods =  {
        stickify : function() {
              var self = this;
              this.stickyCandidatesMap = {
                    mobile : {
                          mediaRule : 'only screen and (max-width: 719px)',
                          selector : 'mobile-sticky'
                    },
                    desktop : {
                          mediaRule : 'only screen and (min-width: 720px)',
                          selector : 'desktop-sticky'
                    }
              };
              this.stickyMenuWrapper      = false;
              this.stickyMenuDown         = new czrapp.Value( '_not_set_' );
              this.stickyHeaderThreshold  = 50;
              this.currentStickySelector  = new czrapp.Value( '' );//<= will be set on init and on resize
              this.hasStickyCandidate     = new czrapp.Value( false );
              this.stickyHeaderAnimating  = new czrapp.Value( false );
              this.userStickyOpt          = new czrapp.Value( self._setUserStickyOpt() );//set on init and on resize : stick_always, no_stick, stick_up
              this.currentStickySelector.bind( function( to, from ) {
                    var _reset = function() {
                          czrapp.$_header.css( { 'height' : '' }).removeClass( 'fixed-header-on' );
                          self.stickyMenuDown( false );
                          self.stickyMenuWrapper = false;
                          self.hasStickyCandidate( false );
                    };
                    if ( ! _.isEmpty( to ) ) {
                          self.hasStickyCandidate( 1 == czrapp.$_header.find( to ).length );
                          if ( ! self.hasStickyCandidate() ) {
                                _reset();
                          } else {
                                self.stickyMenuWrapper = czrapp.$_header.find( to );
                                var $_header_image = $('#header-image-wrap').find('img');
                                if ( 0 < $_header_image.length ) {
                                      var _observeMutationOnHeaderImg = function(elementSelector, callback) {
                                            var onMutationsObserved = function(mutations) {
                                                    mutations.forEach(function(mutation) {
                                                        if ('attributes' === mutation.type ) {
                                                            callback();
                                                        }
                                                    });
                                                },
                                                target = $(elementSelector)[0],
                                                config = { attributes:true },
                                                MutationObserver = window.MutationObserver || window.WebKitMutationObserver,
                                                observer = new MutationObserver(onMutationsObserved);

                                            observer.observe(target, config);
                                      };
                                      _observeMutationOnHeaderImg('#header-image-wrap img', _.debounce( function(element) {
                                            czrapp.$_header.css( 'height' , '' );
                                            czrapp.$_header.css( 'height' , czrapp.$_header.height() ).addClass( 'fixed-header-on' );
                                      }, 100 ) );
                                } else {
                                      czrapp.$_header.css( { 'height' : czrapp.$_header.height() }).addClass( 'fixed-header-on' );
                                }
                          }
                    } else {//we don't have a candidate
                          _reset();
                    }
              });
              this.scrollPosition.bind( function( to, from ) {
                    if ( ! self.hasStickyCandidate() )
                      return;
                    if ( Math.abs( to - from ) <= 5 )
                      return;
                    self.stickyMenuDown( to < from );
              });
              var _maybeResetTop = function() {
                    if ( 'up' == self.scrollDirection() ) {
                        self._mayBeresetTopPosition();
                    }
              };
              czrapp.bind( 'scrolling-finished', _maybeResetTop );//react on scrolling finished <=> after the timer
              czrapp.bind( 'topbar-collapsed', _maybeResetTop );//react on topbar collapsed, @see topNavToLife
              self.stickyMenuDown.validate = function( value ) {
                    if ( ! self.hasStickyCandidate() )
                      return false;
                    if ( 'stick_up' != self.userStickyOpt() )
                      return true;
                    if ( self.scrollPosition() < self.stickyHeaderThreshold && ! value ) {
                          if ( ! self.isScrolling() ) {
                                czrapp.errorLog('Menu too close from top to be moved up');
                          }
                          return self.stickyMenuDown();
                    } else {
                          return value;
                    }
              };

              self.stickyMenuDown.bind( function( to, from, args ){
                    if ( ! _.isBoolean( to ) || ! self.hasStickyCandidate() ) {
                          return $.Deferred( function() { return this.resolve().promise(); } );
                    }

                    args = _.extend(
                          {
                                direction : to ? 'down' : 'up',
                                force : false,
                                menu_wrapper : self.stickyMenuWrapper,
                                fast : false
                          },
                          args || {}
                    );
                    return self._animate( { direction : args.direction, force : args.force, menu_wrapper : args.menu_wrapper, fast : args.fast } );
              }, { deferred : true } );
              self.isResizing.bind( function( is_resizing ) {
                    self.userStickyOpt( self._setUserStickyOpt() );
                    self._setStickySelector();

                    if ( self.hasStickyCandidate() ) {
                          self.stickyMenuDown( self.scrollPosition() < self.stickyHeaderThreshold ,  { fast : true } ).done( function() {
                                czrapp.$_header.css( 'height' , '' ).removeClass( 'fixed-header-on' );
                                if ( self.hasStickyCandidate() ) {
                                      czrapp.$_header.css( 'height' , czrapp.$_header.height() ).addClass( 'fixed-header-on' );
                                }
                          });
                    } else {
                          self.stickyMenuDown( false ).done( function() {
                                $('#header').css( 'padding-top', '' );
                          });
                    }
                    if ( ! self._isMobileScreenSize() ) {
                          self._adjustDesktopTopNavPaddingTop();
                    } else {
                          $('.full-width.topbar-enabled #header').css( 'padding-top', '' );
                          self._mayBeresetTopPosition();
                    }
              } );//resize();
              self._setStickySelector();
              if ( ! self._isMobileScreenSize() && self.hasStickyCandidate() ) {
                    self._adjustDesktopTopNavPaddingTop();
              }

        },//stickify
        _setStickySelector : function() {
              var self = this,
                  _match_ = false;
              _.each( self.stickyCandidatesMap, function( _params, _device ) {
                    if ( _.isFunction( window.matchMedia ) && matchMedia( _params.mediaRule ).matches && 'no_stick' != self.userStickyOpt() ) {
                          _match_ = [ '.nav-container', _params.selector ].join('.');
                    }
              });
              self.currentStickySelector( _match_ );
        },
        _setUserStickyOpt : function( device ) {
              var self = this;
              if ( _.isUndefined( device ) ) {
                    _.each( self.stickyCandidatesMap, function( _params, _device ) {
                          if ( _.isFunction( window.matchMedia ) && matchMedia( _params.mediaRule ).matches ) {
                                device = _device;
                          }
                    });
              }
              device = device || 'desktop';

              return ( HUParams.menuStickyUserSettings && HUParams.menuStickyUserSettings[ device ] ) ? HUParams.menuStickyUserSettings[ device ] : 'no_stick';
        },
        _adjustDesktopTopNavPaddingTop : function() {
              var self = this;
              if ( ! self._isMobileScreenSize() && self.hasStickyCandidate() ) {
                    $('.full-width.topbar-enabled #header').css( 'padding-top', czrapp.$_header.find( self.currentStickySelector() ).outerHeight() );
              } else {
                    $('#header').css( 'padding-top', '' );
              }
        },
        _mayBeresetTopPosition : function() {
              var  self = this, $menu_wrapper = self.stickyMenuWrapper;
              if ( 'up' != self.scrollDirection() )
                return;
              if ( ! $menu_wrapper.length )
                return;

              if ( self.scrollPosition() >= self.stickyHeaderThreshold )
                return;

              if ( ! self._isMobileScreenSize() ) {
                  self._adjustDesktopTopNavPaddingTop();
              }
              self.stickyMenuDown( true, { force : true, fast : true } ).done( function() {
                    self.stickyHeaderAnimating( true );
                    ( function() {
                          return $.Deferred( function() {
                              var dfd = this;
                              _.delay( function() {
                                    if ( 'up' == self.scrollDirection() && self.scrollPosition() < 10) {
                                          $menu_wrapper.css({
                                                '-webkit-transform': '',   /* Safari and Chrome */
                                                '-moz-transform': '',       /* Firefox */
                                                '-ms-transform': '',        /* IE 9 */
                                                '-o-transform': '',         /* Opera */
                                                transform: ''
                                          });
                                    }
                                    self.stickyHeaderAnimating( false );
                                    dfd.resolve();
                              }, 10 );
                          }).promise();
                    } )().done( function() { });
              });
        },
        _animate : function( args ) {
              args = _.extend(
                    {
                          direction : 'down',
                          force : false,
                          menu_wrapper : {},
                          fast : false
                    },
                    args || {}
              );
              var dfd = $.Deferred(),
                  self = this,
                  $menu_wrapper = ! args.menu_wrapper.length ? czrapp.$_header.find( self.currentStickySelector() ) : args.menu_wrapper,
                  _startPosition = self.scrollPosition(),
                  _endPosition = _startPosition;
              if ( ! $menu_wrapper.length )
                return dfd.resolve().promise();

              if ( ! czrapp.$_header.hasClass( 'fixed-header-on' ) ) {
                    czrapp.$_header.addClass( 'fixed-header-on' );
              }
              var _do = function() {
                    var translateYUp = $menu_wrapper.outerHeight(),
                        translateYDown = 0,
                        _translate;

                    if ( args.fast ) {
                          $menu_wrapper.addClass('fast');
                    }
                    if ( _.isFunction( window.matchMedia ) && matchMedia( 'screen and (max-width: 600px)' ).matches && 1 == czrapp.$_wpadminbar.length ) {
                          translateYDown = translateYDown - $menu_wrapper.outerHeight();
                    }
                    _translate = 'up' == args.direction ? 'translate(0px, -' + translateYUp + 'px)' : 'translate(0px, -' + translateYDown + 'px)';
                    self.stickyHeaderAnimating( true );
                    self.stickyHeaderAnimationDirection = args.direction;
                    $menu_wrapper.toggleClass( 'sticky-visible', 'down' == args.direction );

                    $menu_wrapper.css({
                          '-webkit-transform': _translate,   /* Safari and Chrome */
                          '-moz-transform': _translate,       /* Firefox */
                          '-ms-transform': _translate,        /* IE 9 */
                          '-o-transform': _translate,         /* Opera */
                          transform: _translate
                    });

                    _.delay( function() {
                          self.stickyHeaderAnimating( false );
                          if ( args.fast ) {
                                $menu_wrapper.removeClass('fast');
                          }
                          dfd.resolve();
                    }, args.fast ? 100 : 350 );
              };//_do

              _.delay( function() {
                    var sticky_menu_id = _.isString( $menu_wrapper.attr('data-menu-id') ) ? $menu_wrapper.attr('data-menu-id') : '';
                    if ( czrapp.userXP.mobileMenu.has( sticky_menu_id ) ) {
                          czrapp.userXP.mobileMenu( sticky_menu_id )( 'collapsed' ).done( function() {
                                _do();
                          });
                    } else {
                          _do();
                    }
              }, 50 );
              return dfd.promise();
        }
  };//_methods{}

  czrapp.methods.UserXP = czrapp.methods.UserXP || {};
  $.extend( czrapp.methods.UserXP , _methods );

})(jQuery, czrapp);var czrapp = czrapp || {};
(function($, czrapp) {
  var _methods =  {
        sidebarToLife : function() {
              var self = this;
              self.sidebars = new czrapp.Values();
              self.maxColumnHeight = new czrapp.Value( self._getMaxColumnHeight() );
              self.maxColumnHeight.bind( function(to) {
                    self.sidebars.each( function( _sb_ ) {
                          if ( _sb_.isStickyfiable() ) {
                                _sb_._setStickyness();
                          }
                    });
              });
              czrapp.isMobileUserAgent = new czrapp.Value( '1' == HUParams.isWPMobile );

              if ( ! _.isUndefined( window.MobileDetect ) && _.isFunction( window.MobileDetect ) ) { // <= is js-mobile-detect option checked ?
                    var _md = new MobileDetect(window.navigator.userAgent);
                    czrapp.isMobileUserAgent( ! _.isNull( _md.mobile() ) );
              }


              self.sidebars.stickyness = new czrapp.Value( {} );
              self.sidebars.stickyness.bind( function( state ) {
                    var _isAfterTop = true;
                    self.sidebars.each( function( _sb_ ) {
                          _isAfterTop = 'top' != _sb_.stickyness() && _isAfterTop;
                    });
                    czrapp.$_mainWrapper.css({ overflow : _isAfterTop ? 'hidden' : '' });
              });
              czrapp.ready.then( function() {
                    czrapp.userXP.stickyHeaderAnimating.bind( function( animating ) {
                          if ( ! self._isStickyOptionOn() )
                              return;
                          self.sidebars.each( function( _sb_ ) {
                                _sb_._translateSbContent( czrapp.userXP.stickyMenuDown() );
                          });
                    });
              });
              czrapp.$_window.on('scroll', _.throttle( function() {
                    if ( ! self._isStickyOptionOn() )
                      return;

                    self.sidebars.each( function( _sb_ ) {
                          if ( _sb_.isStickyfiable() ) {
                                _sb_._setStickyness();
                          }
                    });
              }, 10 ) );//window.scroll() throttled
              czrapp.$_window.on('scroll', _.throttle( function() {
                    czrapp.userXP.maxColumnHeight( czrapp.userXP._getMaxColumnHeight() );
                    self.sidebars.each( function( _sb_ ) {
                          if ( _sb_.isStickyfiable() && 'expanded' == _sb_() ) {
                                _sb_._stickify();
                          }
                    });
              }, 300 ) );//window.scroll() throttled
              czrapp.userXP.windowWidth.bind( function( width ) {
                    czrapp.userXP.maxColumnHeight( czrapp.userXP._getMaxColumnHeight() );
                    self.sidebars.each( function( _sb_ ) {
                          _sb_.isStickyfiable( _sb_._isStickyfiable() );
                          _sb_( 'collapsed' ).done( function() {
                                _sb_._stickify();
                          });
                    });
              });
              $( '.s1, .s2', '#wrapper .main' ).each( function( index ) {
                    if ( ! _.isString( $(this).attr( 'data-sb-id') ) || _.isEmpty( $(this).attr( 'data-sb-id') ) )
                      return;

                    var $container = $(this),
                        _id = $container.attr( 'data-sb-id'),
                        _position = $container.attr( 'data-position'),
                        _userLayout = $container.attr( 'data-layout'),
                        ctor;

                    if ( ! _.isString( _position ) || ! _.isString( _userLayout ) || ! _.isString( _id ) ) {
                          throw new Error( 'Missing id, position or layout for sidebar ' + _id );
                    }

                    if ( 1 != $container.find('.sidebar-content').length || 1 != $container.find('.sidebar-toggle').length ) {
                          throw new Error( 'Missing content or toggle button for sidebar ' + _id );
                    }
                    ctor = czrapp.Value.extend( self.SidebarCTOR );
                    self.sidebars.add( _id, new ctor( _id, {
                          container : $container,
                          position : _position,//can take left, middle-left, middle-right, right
                          layout : _userLayout,//can take : col-2cr, co-2cl, col-3cr, col-3cm, col-3cl
                          extended_width : 's1' == _id ? HUParams.sidebarOneWidth : HUParams.sidebarTwoWidth//<= hard coded in the base CSS, could be made dynamic in the future
                    }));
              });//$( '.s1, .s2', '#wrapper' ).each()

        },
        _isUserStickyOnMobiles : function() {
            if ( HUParams.sbStickyUserSettings && _.isObject( HUParams.sbStickyUserSettings ) ) {
                var _dbOpt = _.extend( { mobile : false }, HUParams.sbStickyUserSettings );
                return _dbOpt.mobile || false;
            } else {
              return false;
            }
        },
        _isUserStickyOnDesktops : function() {
            if ( HUParams.sbStickyUserSettings && _.isObject( HUParams.sbStickyUserSettings ) ) {
                var _dbOpt = _.extend( { desktop : false }, HUParams.sbStickyUserSettings );
                return _dbOpt.desktop || false;
            } else {
              return false;
            }
        },
        _isStickyOptionOn : function() {
              var _isMobileScreenSize = false, self = this;
              if ( self._isUserStickyOnMobiles() || self._isUserStickyOnDesktops() ) {
                    _isMobileScreenSize = czrapp.isMobileUserAgent() ? true : czrapp.userXP._isMobileScreenSize();
                    return _isMobileScreenSize ? self._isUserStickyOnMobiles() : self._isUserStickyOnDesktops();
              } else {
                    return false;
              }
        },
        _getMaxColumnHeight : function() {
              var _hs = [];
              czrapp.userXP.sidebars.each( function( _sb_ ) {
                    _hs.push( _sb_._getVisibleHeight() );
              });
              $('.content', '#wrapper .main').each( function() {
                    if ( 1 == $(this).length )
                      _hs.push( $(this).outerHeight() );
              });
              return Math.max.apply(null, _hs );
        },
        SidebarCTOR : {
              initialize : function( id, options ) {
                    if ( ! $.isReady ) {
                          throw new Error( 'Sidebars must be instantiated on DOM ready' );
                    }
                    var sb = this;
                    sb.id = id;
                    $.extend( sb, options || {} );

                    sb.button_selectors = '.sidebar-toggle';
                    sb.button = sb.container.find( sb.button_selectors );

                    czrapp.Value.prototype.initialize.call( sb, null, options );
                    sb.stickyness = new czrapp.Value();//<= will be set to a string on scroll : 'top', 'between', 'bottom'
                    sb.animating = new czrapp.Value( false );
                    sb.isStickyfiable = new czrapp.Value( sb._isStickyfiable() );
                    czrapp.setupDOMListeners(
                          [
                                {
                                      trigger   : 'focusin mousedown keydown',
                                      selector  : sb.button_selectors,
                                      actions   : function() {
                                            var sb = this;
                                            czrapp.userXP.sidebars.each( function( _sb_ ) {
                                                _sb_( _sb_.id == sb.id ? _sb_() : 'collapsed' );
                                            });
                                            sb( 'collapsed' == sb() ? 'expanded' : 'collapsed' ).done( function() {
                                                sb._stickify();
                                            });
                                      }
                                },
                                {
                                      trigger   : 'mouseenter',
                                      selector  : sb.button_selectors,
                                      actions   : function() {
                                            this.button.addClass( 'hovering' );
                                      }

                                },
                                {
                                      trigger   : 'mouseleave',
                                      selector  : sb.button_selectors,
                                      actions   : function() {
                                            this.button.removeClass( 'hovering' );
                                      }

                                }
                          ],//actions to execute
                          { dom_el: sb.container },//dom scope
                          sb //instance where to look for the cb methods
                    );
                    sb( 'collapsed' );
                    sb.container.css({
                          '-webkit-transform': 'translateZ(0)',    //Safari and Chrome
                          '-moz-transform': 'translateZ(0)',       /* Firefox */
                          '-ms-transform': 'translateZ(0)',        /* IE 9 */
                          '-o-transform': 'translateZ(0)',         /* Opera */
                          transform: 'translateZ(0)'
                    });
                    sb.bind( function( state ) {
                          return $.Deferred( function() {
                                var dfd = this;
                                sb._toggleSidebar()
                                      .done( function( state ){
                                            sb.button.toggleClass( 'hovering', 'expanded' == state );
                                            dfd.resolve();
                                      });
                          }).promise();
                    }, { deferred : true } );
                    sb.validate = function( value ) {
                          return this._isExpandable() ? value : 'collapsed';
                    };
                    sb.stickyness.bind( function( to, from ) {
                          _stckness = $.extend( {}, true, _.isObject( czrapp.userXP.sidebars.stickyness() ) ? czrapp.userXP.sidebars.stickyness() : {} );
                          _stckness[ sb.id ] = to;
                          czrapp.userXP.sidebars.stickyness( _stckness );
                          var _state = to;
                          if ( sb._isHighestColumn() && 'between' == _state ) {
                                switch( from ) {
                                      case 'top' :
                                          _state = 'bottom';
                                      break;
                                      case 'bottom' :
                                          _state = 'top';
                                      break;
                                }
                          }
                          sb._stickify( _state );
                    });
                    sb.isStickyfiable.bind( function( isStickyfiable ) {
                          if ( ! isStickyfiable )
                            sb._resetStickyness();
                    });
              },//initialize
              _setStickyness : function() {
                    var sb = this;
                    if ( ! sb.isStickyfiable() )
                      return;
                    var startStickingY      = czrapp.$_mainWrapper.offset().top,
                        contentBottomToTop  = startStickingY + czrapp.userXP.maxColumnHeight(),//czrapp.userXP._getMaxColumnHeight()
                        topSpacing          = 0,//_setTopSpacing();
                        scrollTop           = czrapp.$_window.scrollTop(),
                        stopStickingY       = contentBottomToTop - ( sb.container.outerHeight() + topSpacing );


                    if ( stopStickingY < 0 )
                      return;
                    sb.stickyness( ( function() {
                          if ( scrollTop >= stopStickingY ) {
                                return 'bottom';
                          } else if ( scrollTop >= startStickingY ) {
                                return 'between';
                          } else if( scrollTop < startStickingY ) {
                                return 'top';
                          }
                    })() );
              },
              _stickify : function( stickyness ) {
                    var sb = this;
                    if ( ! sb.isStickyfiable() )
                      return;
                    stickyness = stickyness ||  sb.stickyness();
                    czrapp.userXP.maxColumnHeight( czrapp.userXP._getMaxColumnHeight(), { silent : true } );//<= we update it silently here to avoid infinite looping => the maxColumnHeight always triggers a _stickify action in other contexts
                    var contentBottomToTop  = czrapp.$_mainWrapper.offset().top + czrapp.userXP.maxColumnHeight(),
                        expanded            = 'expanded' == sb();

                    switch( stickyness ) {
                          case 'top' :
                                sb._resetStickyness();//remove sticky class and dynamic style
                          break;

                          case 'between' :
                                sb.container.addClass( 'sticky' );
                                sb._translateSbContent();

                                if ( ! expanded ) {
                                    sb.container.css({
                                          position : 'fixed',
                                          top : '0px',
                                          height : expanded ? Math.max( sb._getInnerHeight(), czrapp.$_window.height() ) + 'px' : '',
                                          left : sb._getStickyXOffset(),//<= depdendant of the sidebar position : left, middle-left, middle-right, right
                                          'padding-bottom' : expanded ? 0 : '',
                                    });
                                } else {
                                    sb._resetStickyness();
                                }
                          break;

                          case 'bottom' :
                                sb._resetStickyness();//remove sticky class and dynamic style
                                if ( ! sb._isHighestColumn() ) {
                                      sb.container.offset( { top: contentBottomToTop - sb.container.outerHeight() } );
                                }
                          break;
                    }//switch()
              },//stickify
              _toggleSidebar : function() {
                    var sb = this,
                        expanded = 'expanded' == sb();

                    return $.Deferred( function() {
                          var _dfd_ = this;

                          var _transX,
                              _marginRight,
                              _marginLeft,
                              _translate;
                          ( function() {
                                return $.Deferred( function() {
                                      var _dfd = this;

                                      sb.animating( true );
                                      czrapp.$_body
                                          .toggleClass('sidebar-expanded', expanded )
                                          .toggleClass('sidebar-expanding', expanded )
                                          .toggleClass('sidebar-collapsing', ! expanded );
                                      sb.container
                                          .toggleClass( 'expanding', expanded )
                                          .toggleClass( 'collapsing', ! expanded );
                                      switch( sb.position ) {
                                            case 'right' :
                                                _transX = - ( sb.extended_width - 50 );
                                                if ( 'col-3cl' == sb.layout ) {
                                                    _marginRight = expanded ? - sb.extended_width - 50 : -100;
                                                } else {
                                                    _marginRight = expanded ? - sb.extended_width : -50;
                                                }
                                            break;
                                            case 'middle-right' :
                                                _transX = - ( sb.extended_width - 50 );
                                                _marginRight = expanded ? - sb.extended_width  : -50;
                                            break;
                                            case 'middle-left' :
                                                _transX = sb.extended_width - 50;
                                                _marginLeft = expanded ? - sb.extended_width : -50;
                                            break;
                                            case 'left' :
                                                _transX = sb.extended_width - 50;
                                                if ( 'col-3cr' == sb.layout ) {
                                                    _marginLeft = expanded ? - sb.extended_width - 50 : -100;
                                                } else {
                                                    _marginLeft = expanded ? - sb.extended_width : -50;
                                                }
                                            break;
                                      }

                                      _transX = expanded ? _transX : 0;
                                      _translate = 'translate3d(' + _transX + 'px,0px,0px)';
                                      sb.container.css({
                                            width : expanded ? sb.extended_width + 'px' : '50px',
                                            'margin-right' : _.isEmpty( _marginRight + '' ) ? '' : _marginRight + 'px',
                                            'margin-left' : _.isEmpty( _marginLeft + '' ) ? '' : _marginLeft + 'px',
                                            height : expanded ? sb._getExpandedHeight() + 'px' : sb.container.height() + 'px',
                                            '-webkit-transform': _translate,   /* Safari and Chrome */
                                            '-moz-transform': _translate,       /* Firefox */
                                            '-ms-transform': _translate,        /* IE 9 */
                                            '-o-transform': _translate,         /* Opera */
                                            transform: _translate
                                      });

                                      czrapp.$_mainContent.css({
                                            '-webkit-transform': _translate,   /* Safari and Chrome */
                                            '-moz-transform': _translate,       /* Firefox */
                                            '-ms-transform': _translate,        /* IE 9 */
                                            '-o-transform': _translate,         /* Opera */
                                            transform: _translate,
                                      });
                                      sb.container.find('.sidebar-content').css('opacity', expanded ? 0 : 1 );
                                      sb.container.find('.sidebar-toggle-arrows').css('opacity', 0);
                                      _.delay( function() {
                                            _dfd.resolve();
                                      }, 350 );//transition: width .35s ease-in-out;
                                }).promise();
                          })().done( function() {

                                sb.container.toggleClass( 'expanded', expanded ).toggleClass('collapsed', ! expanded );

                                sb.container
                                      .removeClass( 'expanding')
                                      .removeClass( 'collapsing')
                                      .css({
                                            width : expanded ? sb.extended_width + 'px' : '',
                                            'margin-right' : '',
                                            'margin-left' : '',
                                            height : expanded ? sb._getExpandedHeight() + 'px' : '',
                                      });
                                sb.container.find('.sidebar-toggle-arrows').css('opacity', 1);
                                sb.container.find('.sidebar-content')
                                    .css({
                                          opacity : '',
                                    });
                                sb.animating( false );
                                czrapp.$_body.removeClass('sidebar-expanding').removeClass('sidebar-collapsing');
                                czrapp.userXP.maxColumnHeight( czrapp.userXP._getMaxColumnHeight() );
                                if ( sb.isStickyfiable() ) {
                                      sb._setStickyness();
                                }

                                if ( expanded ) {
                                      var $_scrollTopEl = 1 == $('#ha-large-header').length ? $('#ha-large-header') : czrapp.$_header;
                                      $('html, body').animate({
                                              scrollTop: $_scrollTopEl.height()
                                        }, {
                                            duration: 'slow',
                                            complete : function() {
                                                _dfd_.resolve();
                                            }
                                        });
                                } else {
                                  _dfd_.resolve();
                                }
                          });
                    }).promise();
              },//toggleSidebar
              _resetStickyness : function() {
                    var sb = this;
                    sb.container.removeClass('sticky');
                    sb.container
                        .css({
                              position : '',
                              top : '',
                              left : '',
                              right : '',
                              'margin-left' : '',
                              'margin-right' : '',
                              'padding-bottom' : '',
                              'min-height' : ''
                        });
                        if ( 'expanded' != sb() ) {
                              sb.container.css( 'height' , '' );
                        }
                    sb._translateSbContent();
              },
              _translateSbContent : function( stickyMenuDown ) {
                    if ( this._isHighestColumn() )
                      return;
                    stickyMenuDown = stickyMenuDown || czrapp.userXP.stickyMenuDown();
                    var sb = this,
                        translateYUp = 0,
                        translateYDown = 0,
                        _translate = '',
                        _stickyMenuWrapper = czrapp.userXP.stickyMenuWrapper,//@stored dynamically in userXP stickify
                        _stickyMenuHeight = 1 == _stickyMenuWrapper.length ? _stickyMenuWrapper.height() : 50;
                    if ( 'between' == sb.stickyness() ) {
                          if ( 1 == czrapp.$_wpadminbar.length && czrapp.userXP.hasStickyCandidate() ) {
                                translateYUp = translateYUp + czrapp.$_wpadminbar.outerHeight();
                                translateYDown = translateYDown + czrapp.$_wpadminbar.outerHeight();
                          }
                          if ( stickyMenuDown && czrapp.userXP.hasStickyCandidate() ) {
                                translateYUp = translateYUp + _stickyMenuHeight;
                          }
                    }

                    _translate = ( stickyMenuDown && 'between' == sb.stickyness() ) ? 'translate(0px, ' + translateYUp + 'px)' : 'translate(0px, ' + translateYDown + 'px)';

                    sb.container.find('.sidebar-content, .sidebar-toggle').css({
                          '-webkit-transform': _translate,   /* Safari and Chrome */
                          '-moz-transform': _translate,       /* Firefox */
                          '-ms-transform': _translate,        /* IE 9 */
                          '-o-transform': _translate,         /* Opera */
                          transform: _translate
                    });
              },
              _getStickyXOffset : function() {
                    var sb = this,
                        expanded = 'expanded' == sb(),
                        $mainWrapper = $('.main', '#wrapper'),
                        $mainContent = $mainWrapper.find('.content'),
                        xFixedOffset = '';

                    if ( 'between' != sb.stickyness() )
                      return '';
                    switch( sb.position ) {
                          case 'left' :
                              if ( expanded ) {
                                    xFixedOffset = $mainWrapper.offset().left + 50;
                              } else {
                                    xFixedOffset = $mainWrapper.offset().left + sb.container.width();
                              }
                              if ( 'col-3cr' == sb.layout ) {
                                    if ( expanded ) {
                                          xFixedOffset = $mainWrapper.offset().left + czrapp.userXP.sidebars('s2').container.width() + 50;
                                    } else {
                                          xFixedOffset = '';
                                    }
                              }
                          break;
                          case 'middle-left' :
                              xFixedOffset = czrapp.userXP.sidebars('s1').container.width() + $mainWrapper.offset().left + 50;
                              if ( 'col-3cr' == sb.layout ) {
                                    if ( expanded ) {
                                    } else {
                                          xFixedOffset = '';
                                    }
                              }
                          break;
                          case 'middle-right' :
                              xFixedOffset = $mainWrapper.offset().left + $mainContent.outerWidth();
                          break;
                          case 'right' :
                              if ( expanded ) {
                                    xFixedOffset = $mainWrapper.offset().left + $mainWrapper.outerWidth() - 50;
                              } else {
                                    xFixedOffset = $mainWrapper.offset().left + $mainWrapper.outerWidth() - sb.container.width();
                              }
                          break;
                    }
                    return _.isEmpty( xFixedOffset ) ? xFixedOffset : xFixedOffset + 'px';
              },
              _getExpandedHeight : function() {
                    var sb = this,
                        _winHeight = czrapp.$_window.height(),
                        _contentBottomToTop = czrapp.$_mainWrapper.offset().top + czrapp.$_mainWrapper.find('.content').outerHeight() - sb.container.offset().top,
                        _maxColHeight = czrapp.userXP.maxColumnHeight();
                    return Math.max( _winHeight, sb._getInnerHeight() );


              },
              _isExpandable : function() {
                    return _.isFunction( window.matchMedia ) && matchMedia( 'only screen and (min-width: 480px) and (max-width: 1200px)' ).matches;
              },
              _isStickyfiable : function() {
                    return czrapp.userXP._isStickyOptionOn() &&
                    1 == czrapp.$_mainWrapper.length &&
                    1 == czrapp.$_mainContent.length &&
                    _.isFunction( window.matchMedia ) && matchMedia( 'only screen and (min-width: 480px)' ).matches;
              },
              _isHighestColumn : function() {
                    return czrapp.userXP.maxColumnHeight() == this._getInnerHeight();
              },
              _getInnerHeight : function() {
                    return this.container.find('.sidebar-content').height() + this.container.find('.sidebar-toggle').height();
              },
              _getVisibleHeight : function() {
                    return 'expanded' == this() ? this._getInnerHeight() : this.container.height();
              }
        }//SidebarCTOR
  };//_methods{}

  czrapp.methods.UserXP = czrapp.methods.UserXP || {};
  $.extend( czrapp.methods.UserXP , _methods );

})(jQuery, czrapp);var czrapp = czrapp || {};
(function($, czrapp) {
  var _methods =  {
        fittext : function() {
            if ( ! _.isObject( HUParams.fitTextMap ) )
              return;

            var _userBodyFontSize = _.isNumber( HUParams.userFontSize ) && HUParams.userFontSize * 1 > 0 ? HUParams.userFontSize : 16,
                _fitTextMap = HUParams.fitTextMap,
                _fitTextCompression = HUParams.fitTextCompression;

            if (_.size( _fitTextMap ) < 1 ) {
                czrapp.errorLog( 'Unable to apply fittext params, wrong HUParams.fitTextMap.');
                return;
            }
            _.each( _fitTextMap, function( data, key ) {
                  if ( ! _.isObject( data ) )
                    return;
                  data = _.extend( {
                        selectors : '',
                        minEm : 1,
                        maxEm : 1
                  }, data );
                  if ( 1 > $( data.selectors ).length )
                    return;
                  var _compressionRatio = ( data.compression && _.isNumber( data.compression ) ) ? data.compression : _.isNumber( _fitTextCompression ) ? _fitTextCompression : 1.5;
                  $( data.selectors ).fitText( _compressionRatio, {
                      minFontSize : ( Math.round( data.minEm * _userBodyFontSize * 100) / 100 ) + 'px',
                      maxFontSize : ( Math.round( data.maxEm * _userBodyFontSize * 100) / 100 ) + 'px'
                  } ).addClass( 'fittexted_for_' + key );
            });
        },
        outline: function() {
              if ( czrapp.$_body.hasClass( 'mozilla' ) && 'function' == typeof( tcOutline ) )
              tcOutline();
        },
        topNavToLife : function() {
              var self = this,
                  _sel = '.topbar-toggle-down',
                  $topbar = $('#nav-topbar.desktop-sticky'),
                  $topbarNavWrap = $topbar.find('.nav-wrap');

              self.topNavExpanded = new czrapp.Value( false );
              if ( 1 != $('#nav-topbar.desktop-sticky').length || 1 != $('#nav-topbar.desktop-sticky').find('.nav-wrap').length )
                return;
              var _mayBeToggleArrow = function( force ) {
                    $( _sel, $topbar ).css( {
                          display : ( ( $topbarNavWrap.height() > 60 || force ) && ! czrapp.userXP._isMobileScreenSize() ) ? 'inline-block' : ''
                    } );
              };
              var _updateMaxWidth = function() {
                    $topbar.css( { 'max-width' : czrapp.$_window.width() } );
              };
              _.delay( _mayBeToggleArrow, 100 );
              _updateMaxWidth();
              czrapp.userXP.windowWidth.bind( function() {
                    _updateMaxWidth();
                    _mayBeToggleArrow();
                    czrapp.userXP.topNavExpanded( false );
              });
              self.topNavExpanded.bind( function( exp, from, params ) {
                    params = _.extend( { height : 0 }, params || {} );
                    return $.Deferred( function() {
                          var _dfd = this,
                              _expandHeight = Math.max( $topbarNavWrap.height(), params.height );
                          _mayBeToggleArrow( exp );
                          czrapp.userXP.headerSearchExpanded( false ).done( function() {
                                $.when( $( '#header' ).toggleClass( 'topbar-expanded', exp ) ).done( function() {
                                      $( _sel, $topbar ).find('i[data-toggle="' + ( exp ? 'down' : 'up' ) + '"]').css( { opacity : 0 });

                                      $topbar.css({
                                            height : exp ? _expandHeight + 'px' : '50px',
                                            overflow : exp ? 'visible' : ''
                                      });
                                      _.delay( function() {
                                            $( _sel, $topbar ).find('i[data-toggle="' + ( exp ? 'down' : 'up' ) + '"]').css( { display :'none' });
                                            $( _sel, $topbar ).find('i[data-toggle="' + ( exp ? 'up' : 'down' ) + '"]').css({ display :'inline-block' , opacity : exp ? 1 : '' });
                                            _dfd.resolve();
                                            if ( ! exp ) {
                                                  _mayBeToggleArrow();
                                                  czrapp.trigger('topbar-collapsed');//<= will be listened to by the sticky menu to maybe adjust the top padding
                                            }
                                      }, 250 );//transition: height 0.35s ease-in-out;
                                });
                          });
                    }).promise();
              }, { deferred : true } );
              czrapp.setupDOMListeners(
                    [
                          {
                                trigger   : 'click keydown',
                                selector  : _sel,
                                actions   : function() {
                                      czrapp.userXP.topNavExpanded( ! czrapp.userXP.topNavExpanded() );
                                }
                          },
                    ],//actions to execute
                    { dom_el: $('#header') },//dom scope
                    czrapp.userXP //instance where to look for the cb methods
              );
              if ( czrapp.userXP.stickyHeaderAnimating ) {
                    czrapp.userXP.stickyHeaderAnimating.bind( function( animating ) {
                          czrapp.userXP.topNavExpanded( false );
                    });
              }
        },
        headerSearchToLife : function() {
              var self = this,
                  _sel = '.toggle-search',
                  $topbar = $('#nav-topbar.desktop-sticky');

              self.headerSearchExpanded = new czrapp.Value( false );
              self.headerSearchExpanded.bind( function( exp ) {
                    return $.Deferred( function() {
                          var _dfd = this;
                          $.when( $( _sel, '#header' ).toggleClass( 'active', exp ) ).done( function() {
                                if ( exp ) {
                                      $topbar.css( {
                                            overflow : ! exp ? '' : 'visible',
                                            height : czrapp.userXP.topNavExpanded() ? ( 1 == $topbar.find('.nav-wrap').length ? $topbar.find('.nav-wrap').height() : 'auto' ) : ''
                                      });
                                }

                                $('.search-expand', '#header').stop()[ ! exp ? 'slideUp' : 'slideDown' ]( {
                                      duration : 250,
                                      complete : function() {
                                            if ( exp ) {
                                                  $('.search-expand input', '#header').trigger('focus');
                                            } else {
                                                  $topbar.css( { overflow : '' } );
                                                  if ( ! czrapp.userXP.topNavExpanded() ) {
                                                       $topbar.css( { height : '' });
                                                  }
                                            }
                                            _dfd.resolve();
                                      }
                                } );
                          });
                    }).promise();
              }, { deferred : true } );
              czrapp.setupDOMListeners(
                    [
                          {
                                trigger   : 'mousedown keydown',
                                selector  : _sel,
                                actions   : function() {
                                      czrapp.userXP.headerSearchExpanded( ! czrapp.userXP.headerSearchExpanded() );
                                }
                          },
                    ],//actions to execute
                    { dom_el: $('#header') },//dom scope
                    czrapp.userXP //instance where to look for the cb methods
              );
              czrapp.userXP.windowWidth.bind( function() {
                    self.headerSearchExpanded( false );
              });
              if ( czrapp.userXP.stickyHeaderAnimating ) {
                    czrapp.userXP.stickyHeaderAnimating.bind( function( animating ) {
                          self.headerSearchExpanded( false );
                    });
              }
              $( _sel, '#header' ).on('focusin', function( evt ) {
                    self.headerSearchExpanded( true );
              });
        },//toggleHeaderSearch
        scrollToTop : function() {
              $('a#back-to-top').on('click', function() {
                    $('html, body').animate({scrollTop:0},'slow');
                    return false;
              });
        },
        widgetTabs : function() {
            var $tabsNav       = $('.alx-tabs-nav'),
              $tabsNavLis    = $tabsNav.children('li'),
              $tabsContainer = $('.alx-tabs-container');

            $tabsNav.each(function() {
                  var $_el = $(this);
                  $_el
                      .next()
                      .children('.alx-tab')
                      .stop(true,true)
                      .hide()
                      .siblings( $_el.find('a').attr('href') ).show();

                  $_el.children('li').first().addClass('active').stop(true,true).show();
            });

            $tabsNavLis.on('click', function(e) {
                  var $this = $(this);

                  $this.siblings().removeClass('active').end()
                  .addClass('active');

                  $this.parent().next().children('.alx-tab').stop(true,true).hide()
                  .siblings( $this.find('a').attr('href') ).fadeIn();
                  e.preventDefault();
            }).children( window.location.hash ? 'a[href="' + window.location.hash + '"]' : 'a:first' ).trigger('click');
        },
        commentTabs : function() {
            $(".comment-tabs li").on('click', function() {
                $(".comment-tabs li").removeClass('active');
                $(this).addClass("active");
                $(".comment-tab").hide();
                var selected_tab = $(this).find("a").attr("href");
                $(selected_tab).fadeIn();
                return false;
            });
        },
        tableStyle : function() {
              $('table tr:odd').addClass('alt');
        },
        dropdownMenu : function() {
              var self = this,
                  $topbar = $('#nav-topbar.desktop-sticky'),
                  _isHoveringInTopBar = false;
              $topbar.on('mouseenter', function() {
                          if ( czrapp.userXP.topNavExpanded() || czrapp.userXP._isMobileScreenSize() )
                            return;
                          _isHoveringInTopBar = true;
                          $topbar.css( {
                                overflow : 'visible',
                                height : 1 == $topbar.find('.nav-wrap').length ? $topbar.find('.nav-wrap').height() : 'auto'
                          });
                    }).on('mouseleave', function() {
                          if ( czrapp.userXP.topNavExpanded() || czrapp.userXP._isMobileScreenSize() )
                            return;
                          _isHoveringInTopBar = false;
                          _.delay( function() {
                                if ( _isHoveringInTopBar )
                                  return;
                                if ( ! czrapp.userXP.topNavExpanded() && ! czrapp.userXP.headerSearchExpanded() ) {
                                      $topbar.css( { overflow : '', height : '' } );
                                      _.delay( function() {
                                            czrapp.trigger('topbar-collapsed');
                                      }, 400 );
                                }
                          }, 1000 );
                    });
                  czrapp.$_body.on('touchstart', function() {
                        if ( !$(this).hasClass('is-touch-device') ) {
                              $(this).addClass('is-touch-device');
                        }
                  });
                  var isTouchDeviceWithHorizontalMenu = function() {
                         return !czrapp.userXP._isMobileScreenSize() && czrapp.$_body.hasClass('is-touch-device');
                  };
                  $('.nav li').on('click', 'a', function( evt ) {
                        if ( czrapp.userXP._isMobileScreenSize() || !isTouchDeviceWithHorizontalMenu() )
                              return;

                        var $menu_item = $(this).closest('.menu-item');
                        $('.nav li').not($menu_item).removeClass('hu-children-item-opened');

                        $menu_item.children('ul.sub-menu').css( 'opacity', 1 );
                        if ( $menu_item.hasClass('menu-item-has-children') && !$menu_item.hasClass('hu-children-item-opened') ) {
                              evt.preventDefault();
                              $menu_item.addClass('hu-children-item-opened');
                              $menu_item.children('ul.sub-menu').hide().stop().slideDown({
                                    duration : 'fast',
                                    complete : czrapp.userXP.onSlidingCompleteResetCSS
                              });
                        }
                  });
                  $('.nav li').on('mouseenter', function() {
                        if ( czrapp.userXP._isMobileScreenSize() || isTouchDeviceWithHorizontalMenu() )
                              return;
                        $(this).children('ul.sub-menu').hide().stop().slideDown({
                              duration : 'fast',
                              complete : czrapp.userXP.onSlidingCompleteResetCSS
                        })
                        .css( 'opacity', 1 );
                  }).on('mouseleave', function() {
                        if ( czrapp.userXP._isMobileScreenSize() || isTouchDeviceWithHorizontalMenu() )
                              return;
                        $(this).children('ul.sub-menu').stop().css( 'opacity', '' ).slideUp( {
                              duration : 'fast',
                              complete : czrapp.userXP.onSlidingCompleteResetCSS
                        });
                  });
              $('.nav li').on('focusin', 'a', function() {
                    if ( czrapp.userXP._isMobileScreenSize() || isTouchDeviceWithHorizontalMenu() )
                      return;
                    $(this).addClass('hu-focused');
                    $(this).closest('.nav li').children('ul.sub-menu').hide().stop().slideDown({
                            duration : 'fast'
                    })
                    .css( 'opacity', 1 );

              });
              $('.nav li').on('focusout', 'a', function() {
                    var $el = $(this);
                    _.delay( function() {
                        $el.removeClass('hu-focused');
                        if ( czrapp.userXP._isMobileScreenSize() || isTouchDeviceWithHorizontalMenu() )
                          return;
                        if ( $('.nav li').find('.hu-focused').length < 1 ) {
                              $('.nav li').each( function() {
                                    $(this).children('ul.sub-menu').stop().css( 'opacity', '' ).slideUp( {
                                            duration : 'fast'
                                    });
                              });
                        }
                        if( $el.closest('.nav li').children('ul.sub-menu').find('.hu-focused').length < 1 ) {
                              $el.closest('.nav li').children('ul.sub-menu').stop().css( 'opacity', '' ).slideUp( {
                                      duration : 'fast'
                              });
                        }
                    }, 250 );
              });
        },
        gutenbergAlignfull : function() {
              var _isPage                        = czrapp.$_body.hasClass( 'page' ),
                  _isSingle                      = czrapp.$_body.hasClass( 'single' ),
                  _coverImageSelector            = '.full-width.col-1c .alignfull[class*=wp-block-cover]',
                  _alignFullSelector             = '.full-width.col-1c .alignfull[class*=wp-block-]',
                  _alignTableSelector            = [
                                        '.boxed .themeform .wp-block-table.alignfull',
                                        '.boxed .themeform .wp-block-table.alignwide',
                                        '.full-width.col-1c .themeform .wp-block-table.alignwide'
                                      ],
                  _coverWParallaxImageSelector   = _coverImageSelector + '.has-parallax',
                  _classParallaxTreatmentApplied = 'hu-alignfull-p',
                  _styleId                       = 'hu-gutenberg-alignfull',
                  $_refWidthElement              = czrapp.$_body,
                  $_refContainedWidthElement     = $( 'section.content', $_refWidthElement );
              if ( ! ( _isPage || _isSingle ) ) {
                    return;
              }

              if ( _isSingle ) {
                    _coverImageSelector = '.single' + _coverImageSelector;
                    _alignFullSelector  = '.single' + _alignFullSelector;
                    _alignTableSelector = '.single' + _alignTableSelector.join(',.single');
              } else {
                    _coverImageSelector = '.page' + _coverImageSelector;
                    _alignFullSelector  = '.page' + _alignFullSelector;
                    _alignTableSelector = '.page' + _alignTableSelector.join(',.page');
              }

              if ( $( _alignFullSelector ).length > 0 ) {
                    _add_alignelement_style( $_refWidthElement, _alignFullSelector, 'hu-gb-alignfull' );
                    if ( $(_coverWParallaxImageSelector).length > 0 ) {
                          _add_parallax_treatment_style();
                    }
                    czrapp.userXP.windowWidth.bind( function() {
                          _add_alignelement_style( $_refWidthElement, _alignFullSelector, 'hu-gb-alignfull' );
                          _add_parallax_treatment_style();
                    });
              }
              if ( $( _alignTableSelector ).length > 0 ) {
                    _add_alignelement_style( $_refContainedWidthElement, _alignTableSelector, 'hu-gb-aligntable' );
                    czrapp.userXP.windowWidth.bind( function() {
                          _add_alignelement_style( $_refContainedWidthElement, _alignTableSelector, 'hu-gb-aligntable' );
                    });
              }
              function _add_parallax_treatment_style() {
                    $( _coverWParallaxImageSelector ).each(function() {
                          $(this)
                                .css( 'left', '' )
                                .css( 'left', -1 * $(this).offset().left )
                                .addClass(_classParallaxTreatmentApplied);
                    });
              }
              function _add_alignelement_style( $_refElement, _selector, _styleId ) {
                    var newElementWidth = $_refElement[0].getBoundingClientRect().width,
                        $_style         = $( 'head #' + _styleId );

                    if ( 1 > $_style.length ) {
                          $_style = $('<style />', { 'id' : _styleId });
                          $( 'head' ).append( $_style );
                          $_style = $( 'head #' + _styleId );
                    }
                    $_style.html( _selector + '{width:'+ newElementWidth +'px}' );
              }
        },
        triggerResizeEventsToAjustHeaderHeightOnInit : function() {
              var $logoImg = $('.site-title').find('img');
              if ( $logoImg.length > 0 ) {
                    if ( $logoImg[0].complete ) {
                          czrapp.$_window.trigger('resize');
                    } else {
                      $logoImg.on('load', function( img ) {
                            czrapp.$_window.trigger('resize');
                      });
                    }
              }
              var _triggerResize = function( n ) {
                    n = n || 1;
                    if ( n > 3 )
                      return;

                    _.delay( function() {
                          n++;
                          czrapp.$_window.trigger('resize');
                          _triggerResize(n);
                    }, 3000 );
              };
              _triggerResize();
        },
        mayBeLoadFontAwesome : function() {
              jQuery( function() {
                    if ( !HUParams.deferFontAwesome ) {
                        $('body').removeClass('hu-fa-not-loaded');
                        return;
                    }

                    var $candidates = $('[class*=fa-]');
                    if ( $candidates.length < 1 )
                      return;
                    var hasPreloadSupport = function( browser ) {
                        var link = document.createElement('link');
                        var relList = link.relList;
                        if (!relList || !relList.supports)
                          return false;
                        return relList.supports('preload');
                    };
                    if ( $('head').find( '[href*="font-awesome.min.css"]' ).length < 1 ) {
                        var link = document.createElement('link');

                        link.onload = function() {
                            this.onload=null;
                            _.delay( function() {
                                link.setAttribute('rel', 'stylesheet');
                                $('body').removeClass('hu-fa-not-loaded');
                            }, 500 );
                        };
                        link.setAttribute('href', HUParams.fontAwesomeUrl );
                        link.setAttribute('id', 'hu-font-awesome');
                        link.setAttribute('rel', hasPreloadSupport() ? 'preload' : 'stylesheet' );
                        link.setAttribute('as', 'style');
                        link.setAttribute('type', 'text/css');
                        link.setAttribute('media', 'all');
                        document.getElementsByTagName('head')[0].appendChild(link);
                    } else {
                        $('body').removeClass('hu-fa-not-loaded');
                    }
                    _.delay( function() {
                        $('body').removeClass('hu-fa-not-loaded');
                    }, 1000 );
              });
        },
        maybeFireFlexSlider : function() {
              if ( !HUParams.flexSliderNeeded )
                return;
              var _fireWhenFlexReady = function() {
                    var $flexForFeaturedPosts = $('#flexslider-featured');
                    if ( $flexForFeaturedPosts.length > 0 ) {
                          var $_firstImage = $flexForFeaturedPosts.find('img').filter(':first'),
                          checkforloaded = setInterval(function() {
                                if ( $_firstImage.length < 1 )
                                  return;
                                var image = $_firstImage.get(0);
                                if ( image ) {
                                      clearInterval(checkforloaded);
                                      $.when( $flexForFeaturedPosts.flexslider({
                                            animation: "slide",
                                            useCSS: true,
                                            controlNav: true,
                                            pauseOnHover: true,
                                            animationSpeed: 400,
                                            smoothHeight: true,
                                            rtl: HUParams.flexSliderOptions.is_rtl,
                                            touch: HUParams.flexSliderOptions.has_touch_support,
                                            slideshow: HUParams.flexSliderOptions.is_slideshow,
                                            slideshowSpeed: HUParams.flexSliderOptions.slideshow_speed
                                      }) ).done( function() {
                                            var $_self = $(this);
                                                _trigger = function( $_self ) {
                                              $_self.trigger('featured-slider-ready');
                                            };
                                            _trigger = _.debounce( _trigger, 100 );
                                            _trigger( $_self );
                                      });
                                }
                          }, 20);
                    }
                    var $flexForGalleryPostFormat = $('[id*="flexslider-for-gallery-post-format-"]');
                    var $firstImage = $flexForGalleryPostFormat.find('img').filter(':first'),
                        _checkforloaded = setInterval(function() {
                              if ( $firstImage.length < 1 )
                                return;

                              var image = $firstImage.get(0);
                              if ( image ) {
                                clearInterval(_checkforloaded);
                                $flexForGalleryPostFormat.flexslider({
                                      animation: HUParams.isWPMobile ? 'slide' : 'fade',
                                      rtl: HUParams.flexSliderOptions.is_rtl,
                                      slideshow: true,
                                      directionNav: true,
                                      controlNav: true,
                                      pauseOnHover: true,
                                      slideshowSpeed: 7000,
                                      animationSpeed: 600,
                                      smoothHeight: true,
                                      touch: HUParams.flexSliderOptions.has_touch_support
                                });
                              }
                    }, 20);

              };//_fireWhenFlexReady
              jQuery(function($){
                    if ( 'function' === typeof $.fn.flexslider ) {
                          _fireWhenFlexReady();
                    } else {
                          czrapp.$_window.on('hu-flexslider-parsed', _fireWhenFlexReady );
                    }
              });//jQuery(function($){})
        }

  };//_methods{}

  czrapp.methods.UserXP = czrapp.methods.UserXP || {};
  $.extend( czrapp.methods.UserXP , _methods );

})(jQuery, czrapp);var czrapp = czrapp || {};
(function($, czrapp) {
  var _methods =  {
        mayBePrintWelcomeNote : function() {
              if ( ! HUParams.isWelcomeNoteOn )
                return;
              var self = this;
              czrapp.welcomeNoteVisible = new czrapp.Value( false );
              czrapp.welcomeNoteVisible.bind( function( visible ) {
                      return self._toggleWelcNote( visible );//returns a promise()
              }, { deferred : true } );

              czrapp.welcomeNoteVisible( true );
        },//mayBePrintWelcomeNote()


        _toggleWelcNote : function( visible ) {
              var self = this,
                  dfd = $.Deferred();

              var _hideAndDestroy = function() {
                    return $.Deferred( function() {
                          var _dfd_ = this,
                              $welcWrap = $('#bottom-welcome-note', '#footer');
                          if ( 1 == $welcWrap.length ) {
                                $welcWrap.css( { bottom : '-100%' } );
                                _.delay( function() {
                                      $welcWrap.remove();
                                      _dfd_.resolve();
                                }, 450 );// consistent with css transition: all 0.45s ease-in-out;
                          } else {
                              _dfd_.resolve();
                          }
                    });
              };

              var _renderAndSetup = function() {
                    var _dfd_ = $.Deferred(),
                        $footer = $('#footer', '#wrapper');
                    $.Deferred( function() {
                          var dfd = this,
                              _html = HUParams.welcomeContent;
                          if ( 1 == $footer.length ) {
                                $footer.append( _html );
                                _.delay( function() {
                                      $('#bottom-welcome-note', '#footer').css( { bottom : 0 } );
                                      dfd.resolve();
                                }, 500 );
                          } else {
                                dfd.resolve();
                          }
                    }).done( function() {
                          czrapp.setupDOMListeners(
                                [
                                      {
                                            trigger   : 'click keydown',
                                            selector  : '.close-note',
                                            actions   : function() {
                                                  czrapp.welcomeNoteVisible( false ).done( function() {
                                                        czrapp.doAjax( { action: "dismiss_welcome_front", withNonce : true } );
                                                  });
                                            }
                                      }
                                ],//actions to execute
                                { dom_el: $footer },//dom scope
                                self //instance where to look for the cb methods
                          );
                          _dfd_.resolve();
                    });
                    return _dfd_.promise();
              };//renderAndSetup

              if ( visible ) {
                    _.delay( function() {
                          _renderAndSetup().always( function() {
                                dfd.resolve();
                          });
                    }, 3000 );
              } else {
                    _hideAndDestroy().done( function() {
                          czrapp.welcomeNoteVisible( false );//should be already false
                          dfd.resolve();
                    });
              }
              _.delay( function() {
                          czrapp.welcomeNoteVisible( false );
                    },
                    45000
              );
              return dfd.promise();
        }//_toggleWelcNote
  };//_methods{}

  czrapp.methods.UserXP = czrapp.methods.UserXP || {};
  $.extend( czrapp.methods.UserXP , _methods );

})(jQuery, czrapp);var czrapp = czrapp || {};

( function ( czrapp, $, _ ) {
      $.extend( czrapp, czrapp.Events );
      czrapp.Root           = czrapp.Class.extend( {
            initialize : function( options ) {
                  $.extend( this, options || {} );
                  this.isReady = $.Deferred();
            },
            ready : function() {
                  var self = this;
                  if ( self.dom_ready && _.isArray( self.dom_ready ) ) {
                        czrapp.status = czrapp.status || [];
                        _.each( self.dom_ready , function( _m_ ) {
                              if ( ! _.isFunction( _m_ ) && ! _.isFunction( self[_m_]) ) {
                                    czrapp.status.push( 'Method ' + _m_ + ' was not found and could not be fired on DOM ready.');
                                    return;
                              }
                              try { ( _.isFunction( _m_ ) ? _m_ : self[_m_] ).call( self ); } catch( er ){
                                    czrapp.status.push( [ 'NOK', self.id + '::' + _m_, _.isString( er ) ? czrapp._truncate( er ) : er ].join( ' => ') );
                                    return;
                              }
                        });
                  }
                  this.isReady.resolve();
            }
      });

      czrapp.Base           = czrapp.Root.extend( czrapp.methods.Base );
      czrapp.ready          = $.Deferred();
      czrapp.bind( 'czrapp-ready', function() {
            var _evt = document.createEvent('Event');
            _evt.initEvent('czrapp-is-ready', true, true); //can bubble, and is cancellable
            document.dispatchEvent(_evt);
            czrapp.ready.resolve();
      });
      var _instantianteAndFireOnDomReady = function( newMap, previousMap, isInitial ) {
            if ( ! _.isObject( newMap ) )
              return;
            _.each( newMap, function( params, name ) {
                  if ( czrapp[ name ] || ! _.isObject( params ) )
                    return;

                  params = _.extend(
                        {
                              ctor : {},//should extend czrapp.Base with custom methods
                              ready : [],//a list of method to execute on dom ready,
                              options : {}//can be used to pass a set of initial params to set to the constructors
                        },
                        params
                  );
                  var ctorOptions = _.extend(
                      {
                          id : name,
                          dom_ready : params.ready || []
                      },
                      params.options
                  );

                  try { czrapp[ name ] = new params.ctor( ctorOptions ); }
                  catch( er ) {
                        czrapp.errorLog( 'Error when loading ' + name + ' | ' + er );
                  }
            });
            $(function () {
                  _.each( newMap, function( params, name ) {
                        if ( czrapp[ name ] && czrapp[ name ].isReady && 'resolved' == czrapp[ name ].isReady.state() )
                          return;
                        if ( _.isObject( czrapp[ name ] ) && _.isFunction( czrapp[ name ].ready ) ) {
                              czrapp[ name ].ready();
                        }
                  });
                  czrapp.status = czrapp.status || 'OK';
                  if ( _.isArray( czrapp.status ) ) {
                        _.each( czrapp.status, function( error ) {
                              czrapp.errorLog( error );
                        });
                  }
                  czrapp.trigger( isInitial ? 'czrapp-ready' : 'czrapp-updated' );
            });
      };//_instantianteAndFireOnDomReady()
      czrapp.appMap = new czrapp.Value( {} );
      czrapp.appMap.bind( _instantianteAndFireOnDomReady );//<=THE MAP IS LISTENED TO HERE
      czrapp.customMap = new czrapp.Value( {} );
      czrapp.customMap.bind( _instantianteAndFireOnDomReady );//<=THE CUSTOM MAP IS LISTENED TO HERE

})( czrapp, jQuery, _ );var czrapp = czrapp || {};
( function ( czrapp, $, _ ) {
      czrapp.localized = HUParams || {};
      var appMap = {
                base : {
                      ctor : czrapp.Base,
                      ready : [
                            'cacheProp'
                      ]
                },
                browserDetect : {
                      ctor : czrapp.Base.extend( czrapp.methods.BrowserDetect ),
                      ready : [ 'addBrowserClassToBody' ]
                },
                jqPlugins : {
                      ctor : czrapp.Base.extend( czrapp.methods.JQPlugins ),
                      ready : [
                            'imgSmartLoad',
                            'extLinks',
                            'parallax'
                      ]
                },
                userXP : {
                      ctor : czrapp.Base.extend( czrapp.methods.UserXP ),
                      ready : [
                            'setupUIListeners',//<=setup observables values used in various UX modules
                            'fittext',
                            'stickify',
                            'outline',
                            'headerSearchToLife',
                            'scrollToTop',
                            'widgetTabs',
                            'commentTabs',
                            'tableStyle',
                            'sidebarToLife',
                            'dropdownMenu',
                            'mobileMenu',
                            'topNavToLife',
                            'gutenbergAlignfull',
                            'mayBePrintWelcomeNote',
                            'triggerResizeEventsToAjustHeaderHeightOnInit', // for https://github.com/presscustomizr/hueman/issues/839
                            'mayBeLoadFontAwesome',
                            'maybeFireFlexSlider'//<= for featured posts on home and for gallery post formats
                      ]
                }
      };//map
      czrapp.appMap( appMap , true );//true for isInitial map

})( czrapp, jQuery, _ );