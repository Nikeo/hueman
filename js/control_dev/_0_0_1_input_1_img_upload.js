var CZRInputMths = CZRInputMths || {};
$.extend( CZRInputMths , {
    setupImageUploader : function() {

         var input  = this;

         //do we have an html template and a input container?
         if ( ! input.container )
           return this;

         if ( ! input.renderImageUploaderTemplate() )
           return;

         //Bind events
         // Shortcut so that we don't have to use _.bind every time we add a callback.
         _.bindAll( input, 'czrImgUploadRestoreDefault', 'czrImgUploadRemoveFile', 'czrImgUploadOpenFrame', 'czrImgUploadSelect');

         // Bind events, with delegation to facilitate re-rendering.
         input.container.on( 'click keydown', '.upload-button', input.czrImgUploadOpenFrame );
         input.container.on( 'click keydown', '.thumbnail-image img', input.czrImgUploadOpenFrame );
         input.container.on( 'click keydown', '.remove-button', input.czrImgUploadRemoveFile );
         input.container.on( 'click keydown', '.default-button', input.czrImgUploadRestoreDefault );

         input.bind( input.id + ':changed', function( to, from ){
            input.renderImageUploaderTemplate();
         });

         // control.setting.bind( function( value, old_val, something ) {
         //   //TODO, scope to the actual background image input as at the moment it reacts to watever value changes in the setting

         //   //Is the following needed?
         //   // Send attachment information to the preview for possible use in `postMessage` transport.
         //   wp.media.attachment( value ).fetch().done( function() {
         //     wp.customize.previewer.send( control.setting.id + '-attachment-data', this.attributes );
         //   } );

         //   //re-render the template
         //   control.renderImageUploaderTemplate();
         // });
  },

  /**
  * Open the media modal.
  */
  czrImgUploadOpenFrame: function( event ) {
        if ( api.utils.isKeydownButNotEnterEvent( event ) ) {
          return;
        }

        event.preventDefault();

        if ( ! this.frame ) {
          this.czrImgUploadInitFrame();
        }

        this.frame.open();
  },

  /**
  * Create a media modal select frame, and store it so the instance can be reused when needed.
  */
  czrImgUploadInitFrame: function() {
      var input = this,
          element = input.element;
      
      var button_labels = this.getUploaderLabels();
          
       input.frame = wp.media({
         button: {
             text: button_labels.frame_button
         },
         states: [
             new wp.media.controller.Library({
               title:     button_labels.frame_title,
               library:   wp.media.query({ type: 'image' }),
               multiple:  false,
               date:      false
             })
         ]
       });
       // When a file is selected, run a callback.
       input.frame.on( 'select', input.czrImgUploadSelect );
  },

  /**
  * Reset the setting to the default value.
  */
  czrImgUploadRestoreDefault: function( event ) {
        var input = this,
          element = input.element;

        if ( api.utils.isKeydownButNotEnterEvent( event ) ) {
          return;
        }
        event.preventDefault();

        //element.params.attachment = element.params.defaultAttachment;

        // Set the input; the callback takes care of rendering.
        input.container.find('input').val( element.params.defaultAttachment.url ).trigger('change');
  },

  /**
  * Called when the "Remove" link is clicked. Empties the setting.
  *
  * @param {object} event jQuery Event object
  */
  czrImgUploadRemoveFile: function( event ) {
        var input = this,
          element = input.element;

        if ( api.utils.isKeydownButNotEnterEvent( event ) ) {
          return;
        }
        event.preventDefault();

        input.attachment = {};

        input.container.find('input').val( '' ).trigger('change');
  },


  /**
  * Callback handler for when an attachment is selected in the media modal.
  * Gets the selected image information, and sets it within the input.
  */
  czrImgUploadSelect: function() {
        var node,
            input = this,
            element = input.element,
            attachment   = input.frame.state().get( 'selection' ).first().toJSON(),  // Get the attachment from the modal frame.
            mejsSettings = window._wpmejsSettings || {};

        input.attachment = attachment;

        //input.container.find('input').val( attachment.id ).trigger('change');
        input.set(attachment.id);
  },




  //////////////////////////////////////////////////
  /// HELPERS
  //////////////////////////////////////////////////
  renderImageUploaderTemplate: function() {
       var input  = this;
        console.log( input.attachment );
        //do we have view template script?
       if ( 0 === $( '#tmpl-czr-input-img-uploader-view-content' ).length )
         return;

       var view_template = wp.template('czr-input-img-uploader-view-content');

       //  //do we have an html template and a element container?
       if ( ! view_template  || ! input.container )
        return;

       var $_view_el    = input.container.find('.' + input.element.control.css_attr.img_upload_container );

       if ( ! $_view_el.length )
         return;
       //console.log( input.element.params );
       var _model = {};
       $.extend( _model , {
          button_labels : this.getUploaderLabels(),
          settings      : { default: 'ID' },
          attachment    : input.attachment || {}
       }); 

       console.log( _model );
       $_view_el.html( view_template( _model ) );

       return true;
  },
  getUploaderLabels : function() {
    //get from the server control parmas or jsonize somwhere?
    //image related properties
    return {
          'select'       : 'Select Image' ,
           'change'       : 'Change Image' ,
           'remove'       : 'Remove' ,
           'default'      : 'Default',
           'placeholder'  : 'No image selected' ,
           'frame_title'  : 'Select Image' ,
           'frame_button' : 'Choose Image'
    };
  }
});//$.extend