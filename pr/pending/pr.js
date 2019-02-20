/* global done:false */
/* global error:false */
/* global PaymentRequest:false */

/**
 * Updates the price based on the selected shipping option.
 * @param {object} details - The current details to update.
 * @param {string} shippingOption - The shipping option selected by user.
 * @return {object} The updated details.
 */
function updateDetails(details, shippingOption) {
  var selectedShippingOption;
  var otherShippingOption;
  var promoItem = {
      label: '',
      amount: {currency: 'USD', value: '0.00'}
    };
  
  if (shippingOption === 'standard') {
    selectedShippingOption = details.shippingOptions[0];
    otherShippingOption = details.shippingOptions[1];
    details.total.amount.value = '64.00';
    
    promoItem.label = 'standard shipping special discount.';
    promoItem.amount.value = '-1.00';
  } else {
    selectedShippingOption = details.shippingOptions[1];
    otherShippingOption = details.shippingOptions[0];
    details.total.amount.value = '74.00';
    
    promoItem.label = 'express shipping special discount.';
    promoItem.amount.value = '-3.00';
  }
  if (details.displayItems.length === 2) {
    details.displayItems.splice(1, 1, promoItem, selectedShippingOption);
  } else {
    details.displayItems.splice(1, 2, promoItem, selectedShippingOption);
  }
  
  selectedShippingOption.selected = true;
  otherShippingOption.selected = false;
  return details;
}

/**
 * Launches payment request that provides multiple shipping options worldwide,
 * regardless of the shipping address.
 */
function onBuyClicked() {  // eslint-disable-line no-unused-vars
  var supportedInstruments = [
    {
      supportedMethods: 'basic-card',
    }
  ];

  var details = {
    total: {label: 'Donation', amount: {currency: 'USD', value: '65.00'}},
    displayItems: [
      {
        label: 'Original donation amount',
        amount: {currency: 'USD', value: '65.00'}
      },
      {
          label: 'Pending shipping price',
          amount: {currency: 'USD', value: '0.00'},
          pending: true
      }
    ],
    shippingOptions: [
      {
        id: 'standard',
        label: 'Standard shipping',
        amount: {currency: 'USD', value: '0.00'},
      },
      {
        id: 'express',
        label: 'Express shipping',
        amount: {currency: 'USD', value: '12.00'}
      }
    ]
  };

  var options = {requestShipping: true};

  if (!window.PaymentRequest) {
    error('PaymentRequest API is not supported.');
    return;
  }

  try {
    var request = new PaymentRequest(supportedInstruments, details, options);

    request.addEventListener('shippingaddresschange', function(e) {
      e.updateWith(new Promise(function(resolve) {
        window.setTimeout(function() {
          // No changes in price based on shipping address change.
          resolve(details);
        }, 2000);
      }));
    });

    request.addEventListener('shippingoptionchange', function(e) {
      e.updateWith(new Promise(function(resolve) {
        resolve(updateDetails(details, request.shippingOption));
      }));
    });

    request.show()
        .then(function(instrumentResponse) {
          window.setTimeout(function() {
            instrumentResponse.complete('success')
                .then(function() {
                  done('Thank you!', instrumentResponse);
                })
                .catch(function(err) {
                  error(err);
                });
          }, 2000);
        })
        .catch(function(err) {
          error(err);
        });
  } catch (e) {
    error('Developer mistake: \'' + e.message + '\'');
  }
}
