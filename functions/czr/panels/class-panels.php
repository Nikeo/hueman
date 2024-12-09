<?php
/***************************************************
* AUGMENTS WP CUSTOMIZE PANELS
***************************************************/
if ( ! class_exists( 'HU_Customize_Panels') ) :
  class HU_Customize_Panels extends WP_Customize_Panel {
    public $czr_subtitle = '';

    // function __construct( $manager, $id, $args = array() ) {
    //   $keys = array_keys( get_object_vars( $this ) );
    //   foreach ( $keys as $key ) {
    //     if ( isset( $args[ $key ] ) ) {
    //       $this->$key = $args[ $key ];
    //     }
    //   }
    //   parent::__construct( $manager, $id, $args );


    // }

    public function json() {
      $array = parent::json();
      $array['czr_subtitle'] = html_entity_decode( $this->czr_subtitle, ENT_QUOTES, get_bloginfo( 'charset' ) );
      return $array;
    }


     /**
     * Render the panel's JS templates.
     *
     * This function is only run for panel types that have been registered with
     * WP_Customize_Manager::register_panel_type().
     *
     * @since 4.3.0
     *
     * @see WP_Customize_Manager::register_panel_type()
     */
    public function print_template() {
      ?>
      <script type="text/html" id="tmpl-customize-panel-hu_panel">
        <?php $this->hu_render_template(); ?>
      </script>
          <?php
    }

    /**
     * An Underscore (JS) template for rendering this panel's container.
     *
     * Class variables for this panel class are available in the `data` JS object;
     * export custom variables by overriding WP_Customize_Panel::json().
     *
     * @see WP_Customize_Panel::print_template()
     *
     * @since 4.3.0
     * @access protected
     */
    protected function hu_render_template() {
      ?>
      <li id="accordion-panel-{{ data.id }}" class="accordion-section control-section control-panel control-panel-{{ data.type }}">
        <h3 class="accordion-section-title" tabindex="0">
        <button type="button" class="accordion-trigger" aria-expanded="false" aria-controls="static_front_page-content">
        {{ data.title }}
        <span class="czr-panel-subtitle">{{ data.czr_subtitle }}</span>
				</button>          
          <span class="screen-reader-text"><?php _e( 'Press return or enter to open this panel', 'hueman' ); ?></span>
        </h3>
        <ul class="accordion-sub-container control-panel-content"></ul>
      </li>
      <?php
    }
  }
endif;