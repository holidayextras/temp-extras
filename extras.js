/**
**  Extras File
** New extras stage for all brands
**/

var arrivalDate = new Date( Date.parse( breakData.arrivalDate ) );
// store the attraction reply data
var attractionPrices = {};
var supplementPrices = {};
var ISOFormat = 'yyyy-MM-dd'
// day before arrival date for extra Night before
var extraNightFirstDate = arrivalDate.clone().add( -1 ).days();
// departure date for extra Night after
var extraNightLastDate = arrivalDate.clone().add( parseInt( breakData.nights ) ).days();
// extra night before and after dates in ISO format
var extraNightBefore = extraNightFirstDate.toString( ISOFormat );
var extraNightAfter = extraNightLastDate.toString( ISOFormat );


function formatDate( date ) {
	return $.datepicker.formatDate( 'D dd M y', new Date( date ) );
}

var basket = {
	config: {},
	items: {
		hotel: {},
		extras: []
	},
	init: function init( cfg ) {
		if( typeof cfg.targets === 'undefined' ) {
			console.error( 'basket targets were not defined' );
		}
		if( typeof cfg.templates === 'undefined' ) {
			console.error( 'basket templates were not defined' );
		}
		basket.config = cfg;
	},
	render: function render() {
		if(basket.config.length === 0) {
			console.error( 'no config present' );
		}
		// reset price
		var cumulativePrice = basket.items.hotel.price;
		// clear extras
		basket.config.targets.extras.$list.html( '' );
		// set hotel dates
		basket.config.targets.hotel.$checkIn.html( formatDate( basket.items.hotel.checkIn ) );
		basket.config.targets.hotel.$checkOut.html( formatDate( basket.items.hotel.checkOut ) );
		basket.config.targets.hotel.$nights.html( parseInt( basket.items.hotel.nights ) );

		// hide extras in basket if none are selected
		if( basket.items.extras.length === 0 ) {
			basket.config.targets.extras.$list.hide();
		} else {
			// if we have extras selected, loop through them
			$.each( basket.items.extras, function( index, extra ) {
				// add the extra price to the current running price
				cumulativePrice = parseFloat( cumulativePrice ) + parseFloat( extra.price );
				// add the extra on to the extras list in our basket
				basket.config.targets.extras.$list.append( basket.config.templates._extra( extra ) );
				// check if the extra is for an extra night
				if( extra.extraNight === true ) {
					// if we have an extra night, we need to add another night on to our stay
					basket.config.targets.hotel.$nights.html( parseInt( basket.items.hotel.nights + 1 ) );
					// do we add this night before or after our "base" stay?
					if( extra.date < basket.items.hotel.checkIn ) {
						basket.config.targets.hotel.$checkIn.html( formatDate( extra.date ) );
					} else {
						basket.config.targets.hotel.$checkOut.html( formatDate( new Date ( extra.date ).add( 1 ).days() ) );
					}
				}
			} );
			// ensure the extras portion is showing
			basket.config.targets.extras.$list.show();
		}
		basket.config.targets.$price.html( parseFloat( cumulativePrice ).toFixed( 2 ) );
	},
	add: function add( item ) {
		switch (item.type) {
			case 'hotel':
				basket.items.hotel = item;
				break;
			case 'extra':
				basket.items.extras.push( item );
				break;
		}
		basket.render();
	},
	remove: function remove( id ) {
		$.each( basket.items, function( key, items ){
			for(var i = 0; i < items.length; i++) {
				if(items[i].id == id ) {
					basket.items[key].splice(i, 1);
					break;
				}
			}
		} );
		basket.render();
	},
	update: function update( id, key, value ) {
		$.each( basket.items, function( index, items ){
			for(var i = 0; i < items.length; i++) {
				if(items[i].id == id ) {
					basket.items[index][i][key] = value;
					break;
				}
			}
		} );
		basket.render();
	}
};

var hotel = {
	create: function create( hotel ) {
		if( typeof hotel.price === 'undefined' ) {
			console.error( 'passed in hotel has no "price" property' );
		}
		if( typeof hotel.checkIn === 'undefined' ) {
			console.error( 'passed in hotel has no "checkIn" property' );
		}
		if( typeof hotel.checkOut === 'undefined' ) {
			console.error( 'passed in hotel has no "checkOut" property' );
		}
		if( typeof hotel.nights === 'undefined' ) {
			console.error( 'passed in hotel has no "nights" property' );
		}
		return {
			id: hotel.id,
			price: hotel.price,
			checkIn: hotel.checkIn,
			checkOut: hotel.checkOut,
			nights: hotel.nights,
			type: 'hotel'
		}
	}
};

var extras = {
	create: function create( extra ) {
		if( typeof extra.id === 'undefined' ) {
			console.error( 'passed in extra has no "ID" property' );
		}
		if( typeof extra.name === 'undefined' ) {
			console.error( 'passed in extra has no "name" property' );
		}
		if( typeof extra.price === 'undefined' ) {
			console.error( 'passed in extra has no "price" property' );
		}
		if( typeof extra.date === 'undefined' ) {
			console.error( 'passed in extra has no "date" property' );
		}
		if( typeof extra.extraNight === 'undefined' ) {
			console.error( 'passed in extra has no "extraNight" property' );
		}
		return {
			id: extra.id,
			name: extra.name,
			price: extra.price,
			date: extra.date,
			extraNight: extra.extraNight,
			type: 'extra'
		}
	}
};

basket.init( {
	targets: {
		$basket: $( '.js-basket' ),
		hotel: {
			$nights: $( '.js-basket_hotel_nights' ),
			$checkIn: $( '.js-basket_hotel_checkIn' ),
			$checkOut: $( '.js-basket_hotel_checkOut' )
		},
		extras: {
			$container: $( '.js-basket_extras' ),
			$list: $( '.js-basket_extras_list' )
		},
		$price: $( '.js_totalPrice' )
	},
	templates: {
		_extra: function( extra ) {
			return '<p>'+extra.name+' <a class="js-removeExtra" data-id="'+extra.id+'"><small>- remove</a></span></p>'
		}
	}
} );

basket.add( 
	hotel.create( {
		price: parseFloat( breakData.jsonPackage.price ),
		checkIn: new Date( Date.parse( breakData.arrivalDate ) ),
		checkOut: new Date( Date.parse( breakData.attractionDate ).add( breakData.nights ).days() ),
		nights: parseInt( breakData.nights )
	} )
);

// hide extra attraction on load!!
$( '.loadHide' ).hide();

// show/hide all attractions
$( '.attractions-all' ).click( function() {
	$( '.loadHide' ).toggle();
} );

function getAttractionAvailabilityDates( context ) {
	// extra availability dates array
	var availableDates = [];
	var attractionId = context.closest( '.attraction-element' ).attr( 'id' );
	$( '#' + attractionId + '-date option' ).each( function() {
		var dateOption = $(this).val();
		// if we have a date push it into the availability
		if( $( this ).val() != '' ) {
			var availableDate = new Date( $( this ).val() );
			availableDates.push( availableDate.toString( ISOFormat ) );
		}
	} );
	return availableDates;
}

$( '.datepicker' ).datepicker( {
	isRTL: true, // added to force the datepicker to be pop up in the right edge of the input
	dateFormat: 'D dd M, yy',
	beforeShowDay: function( date ) {
		var availability = [];
		var currentElement = $( this );
		if( currentElement.hasClass( 'attraction-extranight-date' ) ) {
			availability = [];
			$.each( extraNightDetail, function( key, value) {
				// check if there is availability for the extra night and add the dates to the array
				if( key === 'after' ) {
					availability.push( extraNightAfter );
				} else {
					availability.push( extraNightBefore );
				}					
			} );
		} else {
			availability = getAttractionAvailabilityDates( currentElement );
		}
		if( $.inArray( $.datepicker.formatDate( 'yy-mm-dd', date ), availability ) > -1 ) {
			return [true,'','Available'];
		} else {
			return [false,'','No availability'];
		}
	},
	onSelect: function( dateText, inst ) {
		var currentElement = $( this );
		// selected date in ISO format
		var isoDate = currentElement.datepicker( 'getDate' );
		if( currentElement.hasClass( 'attraction-extranight-date' ) ) {
			// update the duplicate mobile extra night input
			$( 'select' ).filter( '.attraction-extranight-date' ).val( isoDate );
			currentElement.attr( 'data-date', isoDate );
			currentElement.closest( '.attraction-info' ).attr( 'data-date', isoDate );
			currentElement.closest( '.attraction-info' ).find( '.attraction-extranight-add' ).attr( 'data-date', isoDate );

			// update the extra night details for selected date
			changeExtraNight( isoDate );
		} else{
			// update the duplicate mobile extra night input
			currentElement.siblings( '.attraction-date' ).val( isoDate );
			currentElement.attr( 'data-date', isoDate );
			currentElement.closest( '.attraction-info' ).attr( 'data-date', isoDate );
			currentElement.closest( '.attraction-info' ).find( '.attraction-add' ).attr( 'data-date', isoDate );

			// trigger the attraction date change
			currentElement.change();
		}
		// check if this is already added to the basket, and if so, update the date
		basket.update( currentElement.attr( 'data-label' ), 'date', isoDate );
	}
} );

// toggle the datepicker display
$( '.datepicker' ).mousedown( function() {
   $( '#ui-datepicker-div' ).toggle();
} );

// extra night date input for smaller devices
$( '.attraction-extranight-date' ).change( function() {
	var extraNightElement = $( this );
	// update duplicate extra night datepicker input
	extraNightElement.siblings( '.datepicker' ).datepicker( 'setDate', new Date( Date.parse( extraNightElement.val() ) ) );
	// update the extra night details for selected date
	changeExtraNight( extraNightElement.val() );
} );

// Change the extra night date
function changeExtraNight( extraNightDate ) {
	var extraNightDateInTime = new Date( extraNightDate ).getTime();
	var arrivalDateInTime = arrivalDate.getTime();
	// make sure the extra night date is not the current arrival date
	if( arrivalDateInTime !== extraNightDateInTime ) {
		var extraNightLocation = ( arrivalDateInTime < extraNightDateInTime ) ? 'after' : 'before';
		handleExtraNightReply( extraNightDetail[extraNightLocation], 'update' );
	}
}

$( '#attraction' ).on( 'click', '.checkbox-input', function() {
	var checkbox = $( this );
	// ensure the checkbox's date is accurate
	checkbox.data( 'date', checkbox.closest( '.attraction-info' ).data( 'date' ) );
	if( checkbox.is( ':checked' ) ) {
		// check there's a date
		var date = new Date( checkbox.closest( '.attraction-info' ).find( '.attraction-date, .attraction-extranight-date' ).attr( 'data-date' ) ) ;
		// update the date of our checkbox
		checkbox.data( 'date', date );
		// add the extra to our basket
		basket.add(
			extras.create( {
				id: checkbox.data( 'id' ),
				name: checkbox.data( 'name' ),
				price: parseFloat( checkbox.data( 'price' ) ).toFixed( 2 ),
				date: new Date( checkbox.data( 'date' ) ),
				composition: checkbox.data( 'comp' ),
				extraNight: (checkbox.attr( 'data-extra-night' ) === "true")
			} )
		);
	} else {
		// remove the extra from our basket
		basket.remove( checkbox.data( 'id' ) );
	}
});

// trigger a basket removal when clicking on an extras "remove" link, instead of the checkbox
$( '#basketExtras' ).on( 'click', '.js-removeExtra', function() {
	var id = $( this ).data( 'id' );
	// uncheck the checkbox
	$( '.checkbox-input[data-label='+id+']' ).prop( 'checked', false );
	// remove from the basket
	basket.remove( id );
});

function toggleSkipAttractionsButton() {
	// If attractions have been selected hide the skip button and show the book button
	if( $( '.checkbox-input' ).hasClass( 'checked') ) {
		$( '.attraction-book' ).show();
		$( '.attraction-skip' ).hide();
	} else {
	// Or hide the book button
		$( '.attraction-book' ).hide();
		$( '.attraction-skip' ).show();
	}
}

// Push through to payment
$( '.js_addToBasket' ).click( function() {
	// reset the attractions to stop duplicates if we hit a cached page
	breakData.jsonAttractions = [];
	$( '.checkbox .checked' ).not( '.checkbox-mobile' ).each( function() {
		var extrasJson = $( this ).data( 'json-package' );
		if( $( this ).hasClass( 'attraction-extranight-add' ) ) {
			breakData.jsonPackage = extrasJson;
			breakData.nights = extrasJson.data.hotel.nights;
			breakData.Nights = extrasJson.data.hotel.nights;
			breakData.arrivalDate = extrasJson.data.hotel.arrivalDate;
			breakData.ArrivalDate = new Date( Date.parse( breakData.arrivalDate ) ).toString( 'ddMMMyy' );
		} else if( $( this ).hasClass( 'supplement' ) ) {
			extrasJson.date = ( $( '.attraction-extranight-add' ).prop('checked') ) ? $( '.attraction-extranight-add' ).data( 'json-package' ).data.hotel.arrivalDate : breakData.arrivalDate;
			breakData.jsonSupplements.push( extrasJson );
		} else {
			// Must be an attraction then
			breakData.jsonAttractions.push( extrasJson );
		}
	} );
	breakData.totals = { price: $( '.js_totalPrice' ).html() };
	breakData.stage = 'payment';
	changePage( 'payment' );
} );

// Steppers for who wants to go to that attraction!
$( '#attraction' ).on( 'click', '.stepper_button', function() {
	var $stepperButton = $( this );
	var $stepperButtonParent = $stepperButton.parent();

	//set the maximum and minimum values allowed for the stepper
	var stepperMaximum = $stepperButtonParent.data( 'maximum-value' );
	var stepperMinimum = $stepperButtonParent.data( 'minimum-value' );

	var stepperInput = $stepperButtonParent.find( 'input' );
	var stepperValue = stepperInput.val();
	var stepperError;
	if( $stepperButton.hasClass( 'stepper_button-plus' ) ) {
		// allow stepper increment if within stepperMaximum( number of adults/children in the booking );
		if( stepperValue < stepperMaximum ) {
			stepperValue = parseFloat( stepperValue ) + 1;
		} else {
			// We can't go up higher
			stepperError = true;
		}
	} else {
		// allow stepper increment if not less than stepperMinimum
		if( stepperValue > stepperMinimum ) {
			stepperValue = parseFloat( stepperValue ) - 1;
		} else {
			// We can't go down
			stepperError = true;
		}
	}

	// If we can't go higher or lower than the current value, tell the user
	if( stepperError === true ) {
		$stepperButtonParent.addClass( 'text-danger' );
	} else {
		$stepperButtonParent.removeClass( 'text-danger' );
	}

	// For some reason we currently have multiple versions of the HTML. So we need to find each version and update the input value for both mobile and desktop
	// Check if the stepper is for parking, adults or children
	var stepperClass = 'attractionChildren';
	if( $stepperButtonParent.hasClass( 'attractionParking' ) ) {
		stepperClass = 'attractionParking';
	} else if( $stepperButtonParent.hasClass( 'attractionAdults' ) ) {
		stepperClass = 'attractionAdults';
	}
	// Get the ID of the parent attraction container
	var attrCode = $( this ).closest( '.attraction-element' ).attr( 'id' );
	
	// We have two of everything, so lets get the group together so we can do lots of updating
	var $stepperOutter = $( '#' + attrCode + ' .' + stepperClass );
	$( '.attraction-input', $stepperOutter ).val( stepperValue );
	$( '.js-updateNumberic', $stepperOutter ).html( stepperValue );
	$( stepperInput ).trigger( 'modifyAttraction' );
} );

// Change attraction details
function changeAttractionDetails() {
	var attContext = $( this ).closest( '.attraction-element' );
	var attDate = new Date( $( '.attraction-date', attContext ).val() );
	if ( $( this ).hasClass( 'venueDate' ) ) {
		$( this ).siblings( '.datepicker').datepicker( 'setDate', new Date( Date.parse( $( this ).val() ) ) );
	}
	var attChild = 0;
	var attAdult = 0;

	// Look for type i.e dated att, supp, etc etc
	var attractionType = $( '.attraction-add' ).data( 'type' );

	var productType = $( attractionType, attContext ).html();

	// Don't request anything if there is no date
	if( attDate ) {
		if ( window.hxBits && hxBits.sb_web4522 ) {
			// We already have a nicely styled holding page, might as well make use of it. Clone it into the attraction container and a few small tweaks to make it stay inside.
			$( '#holdingPage' ).clone().attr( 'id', '' ).addClass( 'attractionLoad' ).css( 'position', 'absolute' ).removeClass( 'fade' ).appendTo( attContext );
		}
		//get the attraction code
		var attractionCode = $( attContext ).attr( 'id' );

		if( $( this ).hasClass( 'multiAttraction' ) ) {
			$( '#' + attractionCode + ' .multiAttraction').val( $( this ).val() )
		}

		// Party comp
		attAdult = $( '.attraction-adults', attContext ).val() || $( '.attraction-parking', attContext ).val();
		attChild = $( '.attraction-children', attContext ).val();

		// If it doesn't have a date
		if( attDate.length === 0 ) {
			var attractionDateNew = '';
		} else {
			// Work out the revolver date
			var attDateNew = attDate;
			var attractionDateNew = attDateNew.toString( ISOFormat );
		}

		// request the attractions for the new date / party comp
		getAttractions( attractionDateNew, attAdult, attChild, attractionCode ); // revolver date , adults, children, attractionCode
	}
}

if ( window.hxBits && hxBits.sb_web4522 ) {
	var getSupplements = function( arrivalDate, supplementAdults, supplementChildren, isOperaHotel, nightBefore ) {
	
		var nightBefore = ( nightBefore === undefined ) ? false : nightBefore;

		if( !supplementPrices[arrivalDate] ) {
			supplementPrices[arrivalDate] = {};
		}

		if( !supplementAdults ) {
			supplementAdults = 0;
		}

		if( !supplementChildren ) {
			supplementChildren = 0;
		}

		// create the party comp to make up our array key
		var party = supplementAdults + supplementChildren + '';

		if( !supplementPrices[arrivalDate][party] ) {

			var baseUrlEnd = document.URL.indexOf( '/p/' );
			if ( !( baseUrlEnd > 0 ) ) {
				baseUrlEnd = document.URL.indexOf( '/r/' );
			}
			var baseUrl = document.URL.substr( 0, baseUrlEnd );
			var endUrl = "/r/json";
			if( !nightBefore ) {
				endUrl = "/r/fragment,supplementElement";
			}
			var supplementHotelRoom = JSON.parse( JSON.stringify( breakData.jsonPackage.data.hotel.room ) );

			if( isOperaHotel == true ) {
				// the supplement takes the allocation from the hotel jsonPackage,
				// as we don't know which rooms have infants, we are deducting the infants from the
				// total number of children and shoving the remaining children in the first room.
				// thus all the other rooms have no children
				// NOT changing the jsonPackage so rooms are fine for booking.
				// it would help to know the age of the children/infants when doing this request!!

				supplementHotelRoom[0]['children'] = supplementChildren;

				if( supplementHotelRoom[1] ) {
					supplementHotelRoom[1]['children'] = 0;
				}

				if( supplementHotelRoom[2] ) {
					supplementHotelRoom[2]['children'] = 0;
				}
			}

			// where possible, pull the information required from the json package
			$.get( baseUrl + endUrl, {
				product: 'hotel',
				revolverAction: 'supplement',
				method: 'get',
				ticket: breakData.productCode,
				code: breakData.chipsHotelCode,
				provider:breakData.jsonPackage.data.hotel.provider,
				arrivalDate: arrivalDate,
				nights: 1, // hard coded to one night/first night!!
				room: supplementHotelRoom,
				agent: breakData.ABTANumber,
				errortpl: "supplements",
				adults: supplementAdults,
				children: supplementChildren,
				stage: 'extras',
				profile: breakData.profile,
				nojQuery: 'true'
			},

			// once the data has been collated, show it
			function( data ) {
				supplementPrices[arrivalDate][party] = {};
				if( !nightBefore ) {
					$( '.attraction-supplements-container' ).append( data );					
				} else {
					if ( isOperaHotel ) {
						var availabilityResponse = data.reply.API_Reply.response.availability;
						 $.each( availabilityResponse, function( key, availability ) {
							var supplementAvailability =  JSON.parse( availability.json );
							var supplementCode = availability.data.supplement.code;
							supplementAvailability.date = arrivalDate;
							supplementPrices[arrivalDate][party][supplementCode] = supplementAvailability;
						 } );
					}
				}

			} );
		}
	};
}

function getAttractions( date, adults, children, attractionCode ) {
	// only get attractions if a date is set
	if( date ) {
		// add in the date if its not already there
		if( !attractionPrices[date] ) {
			attractionPrices[date] = {};
		}
		if( !adults ) {
			adults = 0;
		}
		if( !children ) {
			children = 0;
		}

		var attractionCodes = [];
		( typeof attractionCode === 'object' ) ? attractionCodes = attractionCode : attractionCodes.push( attractionCode );

		// create the party comp to make up our array key
		var party = adults.toString() + children.toString();
		// if its not in the array ( haven't done the search before ) request the data
		if( !attractionPrices[date][party] ) {
			var params = {
				"agent": breakData.agent,
				"location": breakData.location,
				"product": breakData.product,
				"customerCode": breakData.customerCode,
				"operator": 'rev',
				"attractionDate":  date,
				"ticketDays": breakData.ticketDays,
				"adults": adults,
				"children": children,
				"infants": breakData.infants,
				"errortpl": "reply19",
				"method": "GET",
				"IsOnSite": ( breakData.jsonPackage.data.hotel.onSite ) ? 1 : 0,
				"is_callcentre": $( 'input[name="is_callcentre"]' ).val()
			};

			$.getJSON( getBaseUrl() + '/r/json', params, function( data ) {

				var apiReply = data.reply.API_Reply.response;
				// we get data back
				if (
					$( apiReply.availability ).length > 0
					|| $( apiReply.attractionMulti ).length > 0
					|| $( apiReply.parking ).length > 0
				) {
					attractionPrices[date][party] = {};

					// for each attraction add it into the array
					$( apiReply.availability ).each( function( key, availability ) {
						attractionPrices[date][party][$( '#location' ).val() + availability.data.attraction.code] = JSON.parse( availability.json );
					} )

					// the the name of the key (AMLMQB)
					for( var attractionMultiParent in apiReply.attractionMulti ) {
						// each for QB1 QB2
						$( apiReply.attractionMulti[attractionMultiParent].multi ).each( function( attractionkey, attractionMultiCode ) {
							attractionPrices[date][party][$( '#location' ).val() + attractionMultiCode.data.attraction.code] = JSON.parse( attractionMultiCode.json );
						} );
					}

					// loop over the parking node and add each of parking attractions to the attractionsPrices array
					for( var parkingParent in apiReply.parking ) {
						$( apiReply.parking[parkingParent].multi ).each( function( attractionkey, parkingCode ) {
							attractionPrices[date][party][$( '#location' ).val() + parkingCode.data.attraction.code] = JSON.parse( parkingCode.json );
						} );
					}

					// new part comp and date are now in attraction so can update elements
					$( attractionCodes ).each( function( index, code ) {
						updateAttractions( date, party, code );
					} );

					if( $( apiReply.parking ).length > 0 ) {
						$( '#attractionParkingContainer' ).show();
					}

				} else {
					// no attraction data returned, but functionality /  designs doesn't cover attractions not being returned
					// on specific dates so just remove the json for now then if won't be booked even if it is added to the basket
					$( attractionCodes ).each( function( index, code ) {
							updateAttractions( date, party, code );
					} );
				}
				if ( window.hxBits && hxBits.sb_web4522 ) {
					$( '.attractionLoad' ).remove();
				}
			} );

		} else {
			//date and party comp already in the array, no need to redo request
			$( attractionCodes ).each( function( index, code ) {
				updateAttractions( date, party, code );
			} );
			if ( window.hxBits && hxBits.sb_web4522 ) {
				$( '.attractionLoad' ).remove();
			}
		}
	}
}

function updateAttractions( date, party, attractionCode ) {
	if ( window.hxBits && hxBits.sb_web4522 ) {
		var parentObject = attractionCode;
		attractionCode = $( '#' + attractionCode + ' .multiAttraction').val() || attractionCode;

		// refill it with the new json if it exists
		// The attractionCode no longer matches the container as it is using the parent code.
		// Maybe we should update the parent container id on update of the select?
		if( ( attractionPrices[date] ) && ( attractionPrices[date][party] ) && ( attractionPrices[date][party][attractionCode] ) ) {
			$( '#' + parentObject + ' .attraction-add' ).data( 'json-package', attractionPrices[date][party][attractionCode] );
			$( '#' + parentObject + ' .attraction-price' ).html( attractionPrices[date][party][attractionCode]['price'] );
			basket.update( attractionCode, 'price', attractionPrices[date][party][attractionCode]['price'] );
		}
	} else {
		if( attractionPrices[date] ) {
			if( attractionPrices[date][party] ) {
				if( attractionPrices[date][party][attractionCode] ) {
					$( '#' + attractionCode + ' .attraction-add' ).data( 'json-package', attractionPrices[date][party][attractionCode] );
					$( '#' + attractionCode + ' .attraction-price' ).html( attractionPrices[date][party][attractionCode]['price'] );
					basket.update( attractionCode, 'price', attractionPrices[date][party][attractionCode]['price'] );
				}
			}
		}
	}
}

if ( window.hxBits && hxBits.sb_web4522 ) {
	if ( !breakData.jsonPackage.data.hotel.onSite ) {
		getAttractions( breakData.ticketDate, 1, 0, $( '.attraction-element-parkattraction' ).attr( 'id' ) );
	}
}

// change the attraction details when adult/child changes
$( '.attractionStepper' ).on( 'modifyAttraction', changeAttractionDetails );

// change the attraction details when date changes
if ( window.hxBits && hxBits.sb_web4522 ) {
	$( '.attraction-date, .attraction-parkdate' ).on(  'change', changeAttractionDetails );
} else {
	$( '.attraction-date' ).on(  'change', changeAttractionDetails );
}

$( document ).ready( function() {
	// make sure the checkboxes  and composition inputs are cleared when the back button is clicked from the payment
	// and the page is not served from cache
	if ( window.hxBits && hxBits.sb_web4438 ) {
		$( '.attraction-composition' ).each( function() {
			var composition = $( this );
			composition.val( composition.parent().data( 'default-value' ) );
		} );
	}
	$( '.checkbox-input' ).prop( 'checked', false );
	$( '.stepper_button, .attraction-date, .attraction-extranight-date' ).prop( 'disabled', false );
	// Set up empty array in breakData for extras selected
	breakData.jsonAttractions = breakData.jsonAttractions || [];

	if ( window.hxBits && hxBits.sb_web4522 ) {
		// Set up empty array for supps
		breakData.jsonSupplements = breakData.jsonSupplements || [];

		var isOperaHotel = breakData.jsonPackage.data.hotel.provider === 'operaWebServices';

		getSupplements( breakData.arrivalDate, breakData.hotelAdults, breakData.hotelChildren, isOperaHotel , false );
	}
	// What is the running total?
	$( '.js_totalPrice' ).html( breakData.jsonPackage.price );
	// Need those ajax requests for extra night!!!
	$( '.attraction-extranight' ).hide();
	helpers.loading(true);
	if ( parseInt( breakData.Nights ) < 5 ) {
		// get extraNight before arrival date and after departure date
		extraNight( 'before', extraNightBefore );
		extraNight( 'after', extraNightAfter );
	}
	// hide the attraction book button on page load
	$( '.attraction-book' ).hide();
	
} );
