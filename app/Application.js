/**
 * @licence GNU GPL v3
 * @author snater.com < wikimedia@snater.com >
 */
define(
	[
		'jquery',
		'app/Navigation',
		'app/FrontPage',
		'app/Preview',
		'app/Questionnaire',
		'app/OptionContainer'
	],
	function( $, Navigation, FrontPage, Preview, Questionnaire, OptionContainer ) {
'use strict';

/**
 * Application renderer
 * @constructor
 *
 * @param {jQuery} $node
 * @param {Api} api
 * @param {Object} [options]
 *
 * @throws {Error} if a required parameter is not defined.
 */
var Application = function( $node, api, options ) {
	if( !$node || !api ) {
		throw new Error( 'Required parameters are nor properly defined' );
	}

	this._$node = $node;
	this._api = api;

	this._options = $.extend( {
		'imageSize': 500
	}, ( options || {} ) );
};

$.extend( Application.prototype, {
	/**
	 * @type {jQuery}
	 */
	_$node: null,

	/**
	 * @type {Api}
	 */
	_api: null,

	/**
	 * @type {Object}
	 */
	_options: null,

	/**
	 * @type {FrontPage|null}
	 */
	_frontPage: null,

	/**
	 * @type {Navigation|null}
	 */
	_navigation: null,

	/**
	 * @type {Preview|null}
	 */
	_preview: null,

	/**
	 * @type {Questionnaire|null}
	 */
	_questionnaire: null,

	/**
	 * @type {OptionContainer|null}
	 */
	_optionContainer: null,

	/**
	 * Starts the application.
	 */
	start: function() {
		var self = this;

		this._$node.empty();

		this._navigation = new Navigation( this._$node, this._api );
		this._$node.append( this._navigation.create( false ) );

		this._frontPage = new FrontPage( this._$node, this._api );

		$( this._frontPage )
		.on( 'asset', function( event, asset ) {
			self._renderApplicationPage( asset );
		} );

		this._frontPage.render();
	},

	/**
	 * Renders the application page.
	 *
	 * @param {Asset} asset
	 */
	_renderApplicationPage: function( asset ) {
		var self = this;

		var $preview = $( '<div/>' );
		this._preview = new Preview( $preview, asset );

		var $questionnaire = $( '<div/>' );
		this._questionnaire = new Questionnaire( $questionnaire, asset );
		this._addEventHandlers( this._questionnaire );

		var $optionContainer = $( '<div/>' ),
			licence = asset.getLicence(),
			renderRawText = !licence.isInGroup( 'pd') && !licence.isInGroup( 'cc0' );

		this._optionContainer = new OptionContainer( $optionContainer, asset );

		if( renderRawText ) {
			this._optionContainer.push( 'rawText' );
		}

		this._addEventHandlers( this._optionContainer );

		this._$node
		.empty()
		.append( this._navigation.create() )
		.append( $preview )
		.append( $questionnaire )
		.append( $optionContainer );

		this._questionnaire.start().done( function() {
			self._optionContainer.render();

			// Evaluate initial state to reflect the default attribution:
			self._preview.update(
				self._questionnaire.getAttributionGenerator(),
				self._questionnaire.generateSupplement(),
				self._getImageSize()
			).done( function() {
				self._optionContainer.setAttributionGenerator(
					self._questionnaire.getAttributionGenerator()
				);
			} );
		} );
	},

	/**
	 * Adds event handlers to the provided instance.
	 *
	 * @param {*} instance
	 */
	_addEventHandlers: function( instance ) {
		var self = this;

		$( instance )
		.on( 'update', function() {
			self._preview.update(
				self._questionnaire.getAttributionGenerator(),
				self._questionnaire.generateSupplement(),
				self._getImageSize()
			).done( function( $attributedImageFrame ) {
				if( instance instanceof Questionnaire ) {
					self._optionContainer.push( 'htmlCode' );
					self._optionContainer.setAttributionGenerator(
						self._questionnaire.getAttributionGenerator()
					);

				} else if ( instance instanceof OptionContainer ) {
					self._optionContainer.getOption( 'htmlCode' )
					.setImageHtml( $attributedImageFrame.clone() );
				}
			} );
		} );
	},

	/**
	 * @return {number}
	 */
	_getImageSize: function() {
		return this._optionContainer
			? this._optionContainer.getOption( 'imageSize' ).value()
			: this._options.imageSize;
	}

} );

return Application;

} );
