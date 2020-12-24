// Settings
var times_i_form = 0,
    geolocalised = false,
    searchProductUrl = 'https://api.vexcited.ml/onetwotrie/search/product/',
    searchCityUrl = 'https://api.vexcited.ml/onetwotrie/search/city/',
    request = new XMLHttpRequest(),
    searchField = villeField = '',
    longitude, latitude,
    recyalgeJsonHasBeenLoaded = false;

// Start QuaggaJS for #camera
startQuagga = () => {
  Quagga.init({
    inputStream : {
      name : "Live",
      type : "LiveStream",
      target: document.querySelector('#livestream')
    },
    numOfWorkers: 8,
    decoder: {
      readers: [
        {"format":"ean_8_reader", "config":{"supplements":[]}},
        {"format":"ean_reader", "config":{"supplements":[]}},
        {"format":"ean_reader", "config":{"supplements":['ean_5_reader', 'ean_2_reader']}}
        ],
    }
  }, (err) => {
    if (err) {
      console.log(err);
      return
    }
    Quagga.start();
  });
}

// Search a product in #scanner's input
$('#scanner').keyup(function(){  
	if($(this).val() === '') {
    $('#filter-records').html('');
    $('#scanner').css('border-radius', '4px');
		return;
  }

  $.get(searchProductUrl + $(this).val(), function(products){
    var output = '',
        count = 0;

    if (products['status'] == true) {
      $.each(products['results'], function(key, val){
        count++;
        
        if (count < 5){
          output += '<li> \
          <a href="javascript:void(0)" onclick="changeModal(' + val.barcode + ')">' +
          val.brand + ' - ' + val.name 
          + '<img class="image_search" src="' + val.image + '"></img></a></li>';
        }
      });
    }
    else if (products['status'] == false) {
      output += '<li><a href="javascript:void(0)">Erreur serveur</a></li>';
      output += '<li><a href="javascript:void(0)">Veuillez réesayer</a></li>';
    }

    $('#scanner').css('border-radius', '4px 4px 0 0');
    $('#filter-records').html('<ul class="box">' + output + '<span style="height: 5px; display: block;"></span></ul>');
  });
});

// Search a city in #localisation's input
$('#localisation').keyup(function(){
  if($(this).val() === '') {
    $('#filter-ville').html('');
    $('#localisation').css('border-radius', '4px');
    return;
  }

  $.get(searchCityUrl + $(this).val(), function(cities){
    var citiesOut = '',
        cityNums = 0;
  
    if (cities['status'] == true) {
      $.each(cities['results'], function(key, val){
        cityNums++;
        
        if (cityNums < 8){
          citiesOut += '<li><a href="javascript:void(0)" onclick="startInputGeo(\''+val['name']+'\', $(\'#geoTypeBefore\').val());">' + val['name'] + '</a></li>';
        }
      });
    }
    else if (cities['status'] == false) {
      citiesOut += '<li><a href="javascript:void(0)">Erreur serveur</a></li>';
      citiesOut += '<li><a href="javascript:void(0)">Veuillez réesayer</a></li>';
    }
  
    $('#localisation').css('border-radius', '4px 4px 0 0');
    $('#filter-ville').html('<ul class="boxCity box">' + citiesOut + '<span style="height: 5px; display: block;"></span></ul>');
  });    
});

/****** - Functions -  ******/

function startInputGeo (city, type){
  $('#cityGeo').val(city);
  geolocalised = true;

  GetCity(type);
}

// Show the results if input is focused
function show(id){
    $(".box").fadeIn();
    $('.box').css('display', 'block');

    if($('#' + id).val() != '') {
      $('#' + id).css('border-radius', '4px 4px 0 0');
    }
}

// Hide the results if input is not focused
function hide(id){
  $(".box").fadeOut();
    setTimeout(
        function(){
            $('.box').css('display', 'none');
            $('#' + id).css('border-radius', '4px');
        }, 250
    );
}

function geolocalise () {
  var type = $('#geoTypeBefore').val();
  navigator.geolocation.getCurrentPosition(function(position) {
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;
    geolocalised = true;
    GetCity(type);
  });
}

function finalizeProduct (type, city){
  var cityRules = JSON.parse($('#consignesCity').val());

  if(type != 'autre'){
    var consignes = cityRules[type];
  }
  else{
    var consignes = 'déchetterie';
  }
  
  $('#recycleItem').html('Vous recyclez à <strong>' + city + '</strong><br>Ce produit se met (dans le/à la) <strong>' + consignes + '</strong>.');

  // Hide the loader (anyway)
  $("#geoStatus").html('Géolocaliser votre appareil');

  // Go to product page
  location.hash = 'product';
}

function consignes (city, type){
  if($('#consignesCity').val() === ''){
    $.getJSON(searchCityUrl + city, function(recyclage){
      $('#consignesCity').val(JSON.stringify(recyclage['results'][0]['consignes']));
      finalizeProduct(type, city);
    });
  }
  else{
      finalizeProduct(type, city);
  }    
}

function GetCity (type){
  // Show a loader while getJSON
  $("#geoStatus").html('Chargement...');

  if($('#cityGeo').val() === ''){
    $.getJSON("https://api-adresse.data.gouv.fr/reverse/?lon=" + longitude + "&lat=" + latitude, function(data){
      var item = data.features[0].properties.city;
      $('#cityGeo').val(item);
      consignes(item, type);
    });
  }
  else{
    consignes($('#cityGeo').val(), type);
  }
}


function checkGeolocalisation (type){
  if(geolocalised === false){
    $('#geoTypeBefore').val(type);
    location.hash = 'geolocalisation';
  }
  else if(geolocalised === true){
    GetCity(type);
  }
}


function checkAlternatives (name, alimentaire){
  var alt_count = 0,
      infos = '';

  if(alimentaire === 'yes'){
    alt_count++;
    infos += '<a href="https://www.marmiton.org/recettes/recherche.aspx?type=all&aqt='+ name +'">Voir des recettes (Marmitton)</a>';
  }

  if(alt_count === 0){
    return '<h4>Aucune alternatives à été trouvé pour ce produit.</h4>';
  }
  else{
    return '<h2>Alternatives</h2>' + infos;
  }
}

// Change page to #product when a product is clicked in `Rechercher un produit`
function changeModal ($barcode) {
  $.get(searchProductUrl, function(products){
    $.each(products['results'], function(key, val){
      if(val.barcode == $barcode){
        if($('#image_generated').length){
          var hrefImage = $('#image_generated').attr('href');
          if(hrefImage === val.image){
            var newTitle = val.brand + ' - ' + val.name + ' - ' + val.barcode;
            $('#image_generated').attr('title', newTitle);
          }
        }
        else{
          $('#product_image_span').html('<img id="image_generated" class="product_img" style="width: auto;" title="' + val.brand + ' - ' + val.name + ' - ' + val.barcode + '" src="' + val.image + '" />');
        }
        

        var informations = '<b>Marque</b> - ' + val.brand;

        informations += '<br><b>Code-barres</b> - ' + val.barcode;
        informations += '<br><br><h2>Recyclage</h2><p id="recycleItem"></p>';

        informations += checkAlternatives(val.name, val.alimentaire);

              
        $('#product_image_span').css('background-color', '#fff0');

        $('#product_name').html(val.name);
        $('#product_informations').html(informations);

        checkGeolocalisation(val.type);
        
      }
    });
  });
}


// Open the #product article when a product is detected
Quagga.onDetected(function(result) {
  var $code = result.codeResult.code,
      $quagga = 'started';

  $.get(searchProductUrl + $code, function(products){
    $.each(products['results'], function(key, val) {
      if(val.barcode == $code && $quagga != 'stopped'){
        Quagga.stop();
        $quagga = 'stopped';
  
        if($('#image_generated').length){
          var hrefImage = $('#image_generated').attr('href');
          if(hrefImage === val.image){
            var newTitle = val.brand + ' - ' + val.name + ' - ' + val.barcode;
            $('#image_generated').attr('title', newTitle);
          }
        }
        else{
          $('#product_image_span').html('<img id="image_generated" class="product_img" style="width: auto;" title="' + val.brand + ' - ' + val.name + ' - ' + val.barcode + '" src="' + val.image + '" />');
        }
        var informations = '<b>Marque</b> - ' + val.brand;
  
        informations += '<br><b>Code-barres</b> - ' + val.barcode;
        informations += '<br><br><h2>Recyclage</h2><p id="recycleItem"></p>';
  
        informations += checkAlternatives(val.name, val.alimentaire);
  
        $('#product_name').html(val.name);
        $('#product_informations').html(informations);
  
        checkGeolocalisation(val.type);
  
        $('#last_scanned').css('color', 'white');
        $('#last_scanned').html('');
        $('#status_scan').html('');
      }
      else{
        if($quagga != 'stopped'){
          $('#last_scanned').css('color', 'red');
          $('#last_scanned').html($code);
          $('#status_scan').html('Aucun produit n\'est attribué à ce code-barres. Veuillez réesayez.');
        }
      }
    });
  });
});

// Toggle text if checkbox is toggled in #add
function toggleText (checkboxId, textId) {
  var checkbox = document.getElementById(checkboxId);
  if (checkbox.checked == true){
    $('#' + textId).css('display', 'block');
  }
  else{
    $('#' + textId).css('display', 'none');
    $('#' + textId).val('');
  }
}

// Form validation #add
$('#formAdd').on('submit', function (e) {
  times_i_form++;
  e.preventDefault();

  if(document.getElementById('checkbox_alimentaire').checked) {
    alimentaire_check = 'yes';
  }
  else{
    alimentaire_check = 'no';
  }

  if(times_i_form <= 5){
    $.ajax({
      type: 'POST',
      url: 'https://www.vexcited.ml/api/onetwotrie/suggestProduct.php',
      data: {
        name:  $('#nom_add').val(),
        brand:  $('#marque_add').val(),
        barcode:  $('#codebarres_add').val(),
        type: $('#type_add').val(),
        alimentaire: alimentaire_check,
        submit: 'submitted'
      },
      beforeSend: function() {
        $("#load_add").html('Chargement...');
      },
      success: function (callback) {
        // Reset all the form
        $('#formAdd').trigger("reset");

        // Hide the loader GIF
        $("#load_add").html('Envoyer la demande !');

        // Show the result
        $('#status_add').html(callback);
      }
    });
  }
  else{
    $('#status_add').html('<h4 style="color: red">Demande non envoyée car vous avez dépassé votre quota de session (5)</h4>');
  }
});
