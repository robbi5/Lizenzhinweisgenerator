'use strict';

var Handlebars = require( 'hbsfy/runtime' ),
	Messages = require( './app/Messages' );

Handlebars.registerHelper( 'translate', function( s ) {
	return Messages.t( s );
} );

Handlebars.registerHelper( 'removeTarget', function( s ) {
	return s.replace( /\s+target="_blank"/g, '' );
} );

Handlebars.registerPartial( 'dialogueBubble', require( './app/templates/Dialogue.handlebars' ) );
Handlebars.registerPartial( 'questionMark', require( './app/templates/QuestionMark.handlebars' ) );
