//global themeServerControlParams
// DOM READY ACTIONS
(function (wp, $) {
    $( function($) {
        var api = wp.customize || api;

        /* WIDGET PANEL ICON */
        if ( $('.control-panel-widgets').find('.accordion-section-title').first().length ) {
              $('.control-panel-widgets').find('.accordion-section-title button')
                    .first()
                    .prepend( $('<span/>', {class:'fas fa-magic'} ) );
        }
    });
}) ( wp, jQuery );

// DEPENDENCIES
(function (api, $, _) {
      //@return boolean
      var _is_checked = function( to ) {
              return 0 !== to && '0' !== to && false !== to && 'off' !== to;
      };
      //when a dominus object define both visibility and action callbacks, the visibility can return 'unchanged' for non relevant servi
      //=> when getting the visibility result, the 'unchanged' value will always be checked and resumed to the servus control current active() state
      api.CZR_ctrlDependencies.prototype.dominiDeps = _.extend(
            api.CZR_ctrlDependencies.prototype.dominiDeps,
            [
                  {
                      dominus : 'disable_google_fonts',
                      servi   : ['font'],
                      visibility : function( to, servusShortId ){
                            if( to ){
                                $('.wp-customizer').addClass('remove_google_fonts');
                                api( api.CZR_Helpers.build_setId( servusShortId ) ).set('arial');
                                var font_title = $('select[data-customize-setting-link="hu_theme_options[font]"] option:selected').text();
                                $('select[data-customize-setting-link="hu_theme_options[font]"]').next('.selecter').find('.selecter-selected').html( font_title );
                            }else{
                                $('.wp-customizer').removeClass('remove_google_fonts');
                            }
                      },
                  },
                {
                        dominus : 'show_on_front',
                        servi : ['show_on_front', 'page_for_posts' ],
                        visibility : function( to, servusShortId ) {
                              if ( 'show_on_front' == servusShortId )
                                return 'unchanged';
                              return 'page' == to;
                        },
                        actions : function( to, servusShortId ) {
                              var wpServusId = api.CZR_Helpers.build_setId( servusShortId ),
                                    _class = 'hu-front-posts-notice',
                                    _maybe_print_html = function() {
                                        if ( $( '.' + _class , api.control(wpServusId).container ).length )
                                          return;
                                        var _html = '<span class="description customize-control-description ' + _class +'">' + themeServerControlParams.frontPageContentNotice + '</span>';
                                        api.control(wpServusId).container.find('.customize-control-title').after( $.parseHTML( _html ) );
                                    };

                              if ( 'show_on_front' == servusShortId ) {
                                    if ( 'posts' != to && $( '.' + _class , api.control(wpServusId).container ).length ) {
                                          $('.' + _class, api.control(wpServusId).container ).remove();
                                    } else if ( 'posts' == to ) {
                                          _maybe_print_html();
                                    }
                              } else if ( 'page_for_posts' == servusShortId ) {
                                    if ( 'page' != to && $( '.' + _class , api.control(wpServusId).container ).length ) {
                                          $('.' + _class, api.control(wpServusId).container ).remove();
                                    } else if ( 'page' == to ) {
                                          _maybe_print_html();
                                    }
                              }
                        }
                },
                {
                        dominus : 'display-header-logo',
                        servi : ['logo-max-height', 'custom_logo', 'custom-logo', 'mobile-header-logo', 'display-header-title' ],//depending on the WP version, the custom logo option is different.
                        visibility : function( to, servusShortId ) {
                              if ( 'display-header-title' == servusShortId )
                                return ! _is_checked(to);
                              return _is_checked(to);
                        }
                },
                {
                        dominus : 'use-header-image',
                        onSectionExpand : false,
                        servi : [ 'header_image', 'logo-title-on-header-image' ] ,
                        visibility : function( to, servusShortId ) {
                              return _is_checked(to);
                        }
                  },
                  {
                        dominus : 'blog-heading-enabled',
                        servi : [ 'blog-heading', 'blog-subheading' ],
                        visibility : function ( to ) {
                              return _is_checked(to);
                        }
                  },
                  {
                        dominus : 'featured-posts-enabled',
                        servi : [
                              'featured-category',
                              'featured-posts-count',
                              'featured-posts-full-content',
                              'featured-slideshow',
                              'featured-slideshow-speed',
                              'featured-posts-include'
                        ],
                        visibility : function ( to ) {
                              return _is_checked(to);
                        }
                  },
                  {
                        dominus : 'featured-slideshow',
                        servi : [ 'featured-slideshow-speed' ],
                        visibility : function ( to ) {
                              return _is_checked(to);
                        }
                  },
                  {
                        dominus : 'about-page',
                        servi : [ 'help-button' ],
                        visibility : function ( to ) {
                              return _is_checked( to );
                        }
                  },
                  {
                        dominus : 'header-ads',
                        servi : [
                              'header-ads-desktop',
                              'header-ads-mobile'
                        ],
                        visibility : function ( to ) {
                              return _is_checked(to);
                        }
                  },
                  {
                        dominus : 'header_mobile_menu_layout',
                        servi : [
                              'mobile-search',
                              'header-mobile-sticky',
                              'color-mobile-menu',
                              'transparent-fixed-topnav'
                        ],
                        visibility : function( to, servusShortId ) {
                              return 'both_menus' != to;
                        }
                  },
                  {
                        dominus : 'nav_menu_locations[topbar]',
                        servi : [ 'default-menu-header'],
                        visibility : function( to ) { return 0 === to; }
                  },
                  {
                        dominus : 'nav_menu_locations[mobile]',
                        servi : [ 'header_mobile_menu_layout'],
                        visibility : function( to ) { return true; },
                        actions : function( to, servusShortId ) {
                              if ( 0 === to )
                                return;
                              var wpServusId = api.CZR_Helpers.build_setId( servusShortId ),
                                  $_select = api.control( wpServusId ).container.find("select");
                                  //$_select.find( 'option[value="pull-menu-center"]' )[ is_header_centered ? 'removeAttr': 'attr']('disabled', 'disabled');
                                  $_select.selecter( 'destroy' );
                                  _.delay( function() {
                                      api( wpServusId )( 'mobile_menu' );
                                      $_select.selecter();
                                  }, 200 );

                        }
                  },
                  {
                        dominus : 'mobile-sidebar-hide',
                        servi : [ 'mobile-sidebar-primary-first' ],
                        visibility : function( to ) {
                              if ( _.contains( [ 's1', 's1-s2' ], to ) ) {
                                    return false;
                              }
                              return true;
                        }
                  },
                  {
                        dominus : 'sidebar-top',
                        servi : [ 'primary-sb-text', 'secondary-sb-text' ],
                        visibility : function( to ) {
                              return _is_checked(to);
                        }
                  },
                  {
                        dominus : 'singular-post-featured-image',
                        servi : [
                              'singular-post-cropped-feat-img'
                        ],
                        visibility : function ( to ) {
                              return _is_checked(to);
                        }
                  },
                  {
                        dominus : 'singular-page-featured-image',
                        servi : [
                              'singular-page-cropped-feat-img'
                        ],
                        visibility : function ( to ) {
                              return _is_checked(to);
                        }
                  },
                  {
                        dominus : 'blog-standard',
                        servi : [
                              'blog-standard-full-content'
                        ],
                        visibility : function ( to ) {
                              return _is_checked(to);
                        }
                  },
            ]//dominiDeps {}
      );//_.extend()


      //add a notice in the Menus panel to easily disable the default page menu in the header
      if ( themeServerControlParams.isMultisite ) { //no default menu for multisite installs ?>
            api.when('nav_menu_locations[header]', function( header_menu_loc_settting ) {
                  //bail for old version of WP
                  if ( ! _.has( api, 'section' ) || ! _.has( api, 'panel') )
                    return;

                  var _notice_selector = 'hu-menu-notice',
                      _toggle_menu_notice = function( show ) {
                        var $menu_panel_content = api.panel('nav_menus').container.find('.control-panel-content'),
                            notice_rendered = 0 !== $menu_panel_content.find( '.' + _notice_selector ).length,
                            _html = '<p class="description customize-control-description ' + _notice_selector +'">' + themeServerControlParams.headerMenuNotice +'</p>',
                            _render_notice = function() {
                                  //defer the rendering when all sections of this panel have been embedded
                                  $.when.apply(
                                        null,
                                        ( function() {
                                              var _promises = [];
                                              //build the promises array
                                              api.section.each( function( _sec ){
                                                    if ( 'nav_menus' == _sec.panel() ) {
                                                          _promises.push( _sec.deferred.embedded );
                                                    }
                                              });
                                              return _promises;
                                        })
                                        )
                                  .then( function() {
                                        $menu_panel_content.append( $.parseHTML( _html ) );
                                  });
                            },
                            _toggle_notice = function() {
                                  if ( ! notice_rendered ) {
                                    _render_notice();
                                  }
                                  $('.' + _notice_selector, $menu_panel_content).toggle( show );
                            };

                        //bail if the menu panel is still not yet rendered
                        if ( ! $menu_panel_content.length )
                          return;

                        if ( api.topics && api.topics.ready && api.topics.ready.fired() ) {
                              _toggle_notice();
                        } else {
                              api.bind('ready', _toggle_notice );
                        }
                  };//_toggle_menu_notice

                  //API based toggling : maybe toggle the notice when nav_menu panel has been registered AND embedded
                  api.panel.when('nav_menus', function( panel_instance ){
                        panel_instance.deferred.embedded.then( function() {
                              _toggle_menu_notice( 0 === header_menu_loc_settting() );
                        });
                  });

                  //User action based toggling : Maybe toggle the notice when user changes the related settings
                  api.bind('ready', function() {
                        //bail if the [default-menu-header] has been removed
                        if ( ! api.has('hu_theme_options[default-menu-header]') )
                          return;

                        //react to header menu location changes
                        header_menu_loc_settting.bind( function( to, from ) {
                              _toggle_menu_notice( 0 === to && _is_checked( api('hu_theme_options[default-menu-header]')() ) );
                        } );
                        //react to hu_theme_options[default-menu-header]
                        api('hu_theme_options[default-menu-header]').bind( function( to ) {
                              _toggle_menu_notice( _is_checked( to ) && 0 === header_menu_loc_settting() );
                        });
                  });

            });
      }//if ( themeServerControlParams.isMultisite )

}) ( wp.customize, jQuery, _);