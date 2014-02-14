( function( define ) {
'use strict';

define( ['jquery'], function( $ ) {

/**
 * Generator for attribution texts.
 *
 * @option {string|null} editor
 *         Editor of the asset.
 *         Default: null
 *
 * @option {boolean} licenceOnly
 *         Whether to only display the licence without author, title and other attributions.
 *         Default: false
 *
 * @option {boolean} licenceLink
 *         Whether to show the link / link the licence to the licence's legal code.
 *         Default: true
 *
 * @option {string} useCase
 *         May either be "print" or "html".
 *         Default: 'print'
 *
 * @param {Asset} asset
 * @param {Object} [options]
 * @constructor
 */
var AttributionGenerator = function( asset, options ) {
	this._asset = asset;

	this._options = $.extend( {
		editor: null,
		licenceOnly: false,
		licenceLink: true,
		useCase: 'print'
	}, options );
};

$.extend( AttributionGenerator.prototype, {
	/**
	 * @type {Asset}
	 */
	_asset: null,

	/**
	 * @type {Object}
	 */
	_options: null,

	/**
	 * Generates an attribution tag line from the current set of answers.
	 *
	 * @return {jQuery}
	 */
	generate: function() {
		var $attribution = $( '<div/>' ).addClass( 'attribution' ),
			$licence = this._generateLicence();

		if( !this._options.licenceOnly ) {
			var $author = this._generateAuthor(),
				$title = this._generateTitle(),
				$editor = this._generateEditor();

			$attribution
			.append( $author )
			.append( document.createTextNode( ', ' ) )
			.append( $title );

			if( this._options.editor ) {
				$attribution
				.append( document.createTextNode( ' ' ) )
				.append( $editor );
			}

			$attribution.append( document.createTextNode( ', ' ) );
		}

		if( this._options.licenceLink === false ) {
			$attribution.append( document.createTextNode ( this._asset.getLicence() ) ) ;
		} else {
			$attribution.append( $licence );
		}

		return $attribution;
	},

	/**
	 * Generates the author(s) DOM to be used in the tag line.
	 *
	 * @return {jQuery}
	 */
	_generateAuthor: function() {
		var authors = this._asset.getAuthors(),
			$authors = $( '<span/>' ).addClass( 'author' );

		for( var i = 0; i < authors.length; i++ ) {
			var author = authors[i];

			if( i > 0 ) {
				$authors.append( document.createTextNode( ', ' ) );
			}

			if( !author.getUrl() ) {
				$authors.append( document.createTextNode( author.getName() ) );
				continue;
			}

			var authorUrl = author.getUrl();
			if( authorUrl.substr( 0, 2 ) === '//' ) {
				authorUrl = 'http:' + authorUrl;
			}

			if( this._options.useCase === 'html' ) {
				$authors.append( $( '<a/>' ).attr( 'href', authorUrl ).text( author.getName() ) );
			} else {
				$authors
					.append( document.createTextNode( author.getName() ) )
					.append( document.createTextNode( ' (' + authorUrl + ')' ) );
			}
		}

		return $authors;
	},

	/**
	 * Generates the licence DOM to be used in the tag line.
	 *
	 * @return {jQuery}
	 */
	_generateLicence: function() {
		var licence = this._asset.getLicence();

		return ( this._options.useCase === 'html' )
			? $( '<a/>' ).addClass( 'licence' )
				.attr( 'href', licence.getUrl() ).text( licence.getName() )
			: $( '<span/>' ).addClass( 'licence' ).text( licence.getUrl() );
	},

	/**
	 * Generates the asset title DOM to be used in the tag line.
	 *
	 * @return {jQuery}
	 */
	_generateTitle: function() {
		return $( '<span/>' ).addClass( 'title' ).text( '„' + this._asset.getTitle() + '“' );
	},

	/**
	 * Generates the editor DOM to be use in the tag line. If no editor is specified, an empty
	 * jQuery object will be returned.
	 *
	 * @return {jQuery}
	 */
	_generateEditor: function() {
		var editor = this._options.editor,
			$editor = $();

		if( editor ) {
			$editor = $( '<span/>' ).addClass( 'editor' ).text( editor );
		}

		return $editor;
	}

} );

return AttributionGenerator;

} );

}( define ) );