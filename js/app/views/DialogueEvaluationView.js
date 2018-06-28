'use strict';

var $ = require( 'jquery' ),
	doneTemplate = require( '../templates/Done.handlebars' ),
	dosAndDontsTemplate = require( '../templates/DosAndDonts.handlebars' ),
	attributionTemplate = require( '../templates/Attribution.handlebars' ),
	Clipboard = require( 'clipboard' ),
	Messages = require( '../Messages' ),
	Tracking = require( '../../tracking.js' ),
	BackToTopButton = require( '../BackToTopButton' ),
	moreInformationTemplate = require( '../templates/MoreInformation.handlebars' );

/**
 * @param {DialogueEvaluation} evaluation
 * @constructor
 */
var DialogueEvaluationView = function( evaluation ) {
	this._evaluation = evaluation;
	this._tracking = new Tracking();
};

$.extend( DialogueEvaluationView.prototype, {
	/**
	 * @type {DialogueEvaluation}
	 */
	_evaluation: null,

	_showDont: function( e ) {
		$( this ).parent().siblings( '.dont-text' ).slideToggle();

		e.preventDefault();
	},

	_showAttribution: function( e ) {
		$( '.final-attribution .attribution-box div' ).hide();
		$( $( this ).data( 'target' ) ).show();
		$( '.final-attribution .show-attribution' ).removeClass( 'active' );
		$( this ).addClass( 'active' );

		e.preventDefault();
	},

	_attributionText: function() {
		return $( '.attribution-box > div:visible' ).text().trim();
	},

	_copyAttribution: function( event, $button ) {
		event.clipboardData.setData( 'text/plain', this._attributionText() );
		this._blinkCopyButton( $button );
	},

	_blinkCopyButton: function( $button ) {
		$button.addClass( 'flash' );
		window.setTimeout( function() {
			$button.removeClass( 'flash' );
		}, 800 );
	},

	_initIECopy: function( $button ) {
		var self = this;

		$button.click( function( e ) {
			window.clipboardData.setData( 'Text', self._attributionText() );
			self._blinkCopyButton( $button );

			e.preventDefault();
			self._tracking.trackEvent( 'Button', 'CopyAttribution' );
		} );
	},

	_initJSCopy: function( $button ) {
		var self = this,
			clipboard = new Clipboard( '#' + $button.attr( 'id' ), {
				target: function() {
					self._tracking.trackEvent( 'Button', 'CopyAttribution' );
					return $( '.attribution-box > div:visible' )[ 0 ];
				}
			} );

		clipboard.on( 'error', function() {
			$button
				.tooltip( {
					title: Messages.t( 'evaluation.copy-hint' ),
					trigger: 'manual'
				} )
				.tooltip( 'show' );

			setTimeout( function() {
				$button.tooltip( 'hide' );
			}, 3000 );
		} );
		clipboard.on( 'success', function( e ) {
			self._blinkCopyButton( $button );
			e.clearSelection();
		} );
	},

	_initCopyButton: function( $button ) {
		if( window.clipboardData ) { // IE
			this._initIECopy( $button );
		} else { // JS with hint when copying fails
			this._initJSCopy( $button );
		}
	},

	render: function() {
		var $html = $( '<div/>' ),
			dosAndDonts = this._evaluation.getDosAndDonts(),
			isPd = this._evaluation.getAttributionLicence().isPublicDomain(),
			licenceGroups = this._evaluation.getAttributionLicence().getGroups(),
			doneText,
			title;

		if( isPd ) {
			doneText = Messages.t( 'evaluation.done-text-legal-notice' );
		} else {
			doneText = Messages.t( 'evaluation.done-text' );
		}

		$html.append( doneTemplate( {
			text: doneText
		} ) );
		if( isPd ) {
			title = Messages.t( 'evaluation.your-legal-notice' );
		} else {
			title = Messages.t( 'evaluation.your-attribution' );
		}

		$html.append( attributionTemplate( {
			title: title,
			attribution: this._evaluation.getAttribution(),
			plainTextAttribution: this._evaluation.getPlainTextAttribution(),
			isPrint: this._evaluation.isPrint()
		} ) );

		if( !isPd ) {
			$html.append( dosAndDontsTemplate( {
				dos: dosAndDonts.dos.map( function( d ) {
					return 'evaluation.do-' + d + '-text';
				} ),
				donts: dosAndDonts.donts.map( function( dont ) {
					return {
						headline: 'evaluation.dont-' + dont + '-headline',
						text: 'evaluation.dont-' + dont + '-text'
					};
				} )
			} ) );
		}
		$html.append( '<div class="clearfix has-bottom-seperator"/>' );

		var isZero = typeof licenceGroups.includes !== 'undefined' &&
			licenceGroups.includes( 'cc-zero' );
		var $licenseLink = '';
		if( !isPd || isZero ) {
			var licenceText;
			if( isZero ) {
				licenceText = Messages.t( 'evaluation.show-cc-zero-text' );
			} else {
				licenceText = Messages.t( 'evaluation.show-licence-text' );
			}
			$licenseLink = moreInformationTemplate( {
				target: this._evaluation.getAttributionLicence().getUrl(),
				content: licenceText
				+ ' (' + this._evaluation.getAttributionLicence().getName() + ')'
			} );
		}

		$html.append( $( '<div class="licence-bottom-bar" />' )
			.append( $licenseLink )
			.append( new BackToTopButton().render() )
		);
		$html.append( '<div class="clearfix"/>' );

		$html.find( '.show-attribution' ).click( this._showAttribution );
		$html.find( '.show-dont' ).click( this._showDont );

		this._initCopyButton( $html.find( '#copy-attribution' ) );

		return $html.contents();
	}
} );

module.exports = DialogueEvaluationView;
