'use strict'

// Initialisation
let api = 'https://api.vexcited.ml/onetwotrie'
let geolocalised = false, consignesHasBeenLoaded = false
let longitude, latitude;
let lastDetected;

// Methods
const get = (el) => {
    return document.querySelector(el)
}

// Style functions
// Show the results if input is focused
const show = (el) => {
    if (el.value.trim() != "") {
        let box = get(".box")

        box.style.opacity = 0;
        box.style.display = "block";
        (function fade() {
            var val = parseFloat(box.style.opacity);
            if (!((val += .1) > 1)) {
                box.style.opacity = val;
                requestAnimationFrame(fade);
            }
        })()

        el.style.borderRadius = "4px 4px 0 0"
    }
}

// Hide the results if input is not focused
const hide = (el) => {
    if (el.value.trim() != "") {
        let box = get(".box")

        box.style.opacity = 1;
        (function fade() {
            if ((box.style.opacity -= .1) < 0) {
                box.style.display = "none";
            }
            else {
                requestAnimationFrame(fade);
            }
        })();

        el.style.borderRadius = "4px"
    }
}

// Démarrer QuaggaJS  pour #camera => div#livestream
const startQuagga = () => {
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
            console.error(err);
            return
        }
        Quagga.start();
    });
}

get('#scanner').addEventListener("input", function (el) {
    get('#filter-records').innerHTML = ""

    // Créer l'élément d'affichage
    let results = document.createElement('ul')
    results.className = "box"
    get('#filter-records').appendChild(results)

    if (this.value.trim() == "") {
        get('#scanner').style.borderRadius = "4px"
        return
    }
    else {
        fetch(`${api}/search/product/${this.value}`)
        .then(res => res.json())
        .then(data => {
            // Limiter l'affichage
            let count = 0

            // Check si le fetch est correct
            if (data.success) {
                data.results.forEach(val => {
                    count++

                    if (count <= 5) {
                        results.innerHTML += `
                            <li>
                                <a onclick="changeModal('${val.barcode}')" >
                                    ${val.brand} - ${val.name}
                                    <img class="image_search" src="${val.image}"></img>
                                </a>
                            </li>
                        `
                    } 
                })
            }
            else {
                results.innerHTML = `
                    <li>
                        <a>Une erreur est survenue côté serveur !</a>
                    </li>
                `
            }

            // Changement du style, body
            get('#scanner').style.borderRadius = "4px 4px 0 0"
            results.innerHTML += `<span style="height: 5px; display: block;"></span>`
        })
    }
})

get('#localisation').addEventListener("input", function (el) {
    get('#filter-ville').innerHTML = ""

    // Créer l'élément d'affichage
    let results = document.createElement('ul')
    results.className = "boxCity box"
    get('#filter-ville').appendChild(results)

    if (this.value.trim() == "") {
        get('#localisation').style.borderRadius = "4px"
        return
    }
    else {
        fetch(`${api}/search/city/${this.value}`)
        .then(res => res.json())
        .then(data => {
            // Limiter l'affichage
            let count = 0

            // Check si le fetch est correct
            if (data.success) {
                data.results.forEach(val => {
                    count++

                    if (count <= 8) {
                        results.innerHTML += `
                            <li>
                                <a onclick="geolocaliseInput('${val.name}')" >
                                    ${val.name}
                                </a>
                            </li>
                        `
                    } 
                })
            }
            else {
                results.innerHTML = `
                    <li>
                        <a>Une erreur est survenue côté serveur !</a>
                    </li>
                `
            }

            // Changement du style, body
            get('#localisation').style.borderRadius = "4px 4px 0 0"
            results.innerHTML += `<span style="height: 5px; display: block;"></span>`
        })
    }  
});

/**
 * Changer de modal vers
 * - la localisation si l'utilisateur n'est pas déjà localisé
 * - le produit si l'utilisateur est déjà localisé
 * @param {Number} barcode 
 */
const changeModal = (barcode) => {
    fetch(`${api}/product/${barcode}`)
    .then(res => res.json())
    .then(data => {
        let val = data.object
        let title = `${val.brand} - ${val.name} - ${val.barcode}`

        if (document.body.contains(get('#image_generated'))){
            let href = get('#image_generated').getAttribute("src")
            if (href != val.image){
                get('#image_generated').setAttribute('src', val.image)
                get('#image_generated').setAttribute('title', title)
            }
        }
        else {
            get('#product_image_span').innerHTML = `
                <img id="image_generated" class="product_img" style="width: auto;" 
                    title="${title}" src="${val.image}"
                />
            `
        }

        let informations = `
            <b>Marque</b> - ${val.brand} <br>
            <b>Code-barres</b> - ${val.barcode} <br> <br>
            <h2>Recyclage</h2><p id="recycleItem"></p>
            ${checkAlternatives(val.name, val.options)}
        `
                
        $('#product_image_span').css('background-color', '#fff0');
        $('#product_name').html(val.name);
        $('#product_informations').html(informations);

        // Réinitialisation dès l'initialisation pour avoid errors
        // dès qu'un nouveau produit est demandé
        get("#geoStatus").innerHTML = "Géolocaliser votre appareil"  
        checkGeolocalisation(val.type);
    });
}

/**
 * Vérifie les alternatives et les affiches
 * @param {String} name - Nom du produit pour les recettes
 * @param {Array} options - Options du produit pour les alternatives
 */
const checkAlternatives = (name, options) => {
    let count = 0, results = '';
    options.forEach (val => {
        count++
        switch (val) {
            case "show_recipes":
                results += `
                    <a href="https://www.marmiton.org/recettes/recherche.aspx?type=all&aqt=${name}">Voir des recettes (Marmitton)</a>
                `
                break
        }
    })
  
    if (count > 0){
        return `<h2>Alternatives</h2> ${results}`
    }
    else {
        return '<h4>Aucune alternatives à été trouvé pour ce produit.</h4>';
    }
}

/**
 * Étape de vérification aprés avoir charger un modal produit.
 * Si l'utilisateur est déjà géolocalisé, redirection vers
 * la partie de récupération
 * Si il ne l'est pas, redirection vers modal geolocalisation
 * et le type de produit à récupérer sera stocké temporairement
 * @param {String} type - Type du produit qui sera stocké 
 */
const checkGeolocalisation = (type) => {
    if(!document.body.contains(get('#comingFromType'))) {
        let input = document.createElement('input')
            input.setAttribute('id', "comingFromType")
            input.setAttribute('value', type);
            input.setAttribute('hidden', true);
        document.body.appendChild(input)
    }

    if (geolocalised) {
        fetchConsignes (type)
    }
    else {
        location.hash = 'geolocalisation';
    }
}

/**
 * Géolocalise l'utilisateur depuis la search bar
 * dans modal => #geolocalise 
 * @param {String} city - Nom de la ville choisie
 */
const geolocaliseInput = (city) => {
    // Change les informations initiées
    geolocalised = true;

    // Récupération du type
    if (document.body.contains(get('#comingFromType'))) {
        let input = get('#comingFromType')
        let type = input.value
    
        // Stockage du nom de la ville
        input = document.createElement('input')
        input.setAttribute('id', "cityName")
        input.setAttribute('value', city);
        input.setAttribute('hidden', true);
    
        document.body.appendChild(input)
      
        fetchConsignes(type);
    }
    else {
        get("#geoStatus").innerHTML = "Erreur, re-scannez le produit"
    }
}

/**
 * Géolocalise l'utilisateur depuis le button `Géolocaliser`
 * dans modal => #geolocalise
 * Redirige vers la partie de récupération du nom de la ville.
 */
const geolocaliseButton = () => {
    navigator.geolocation.getCurrentPosition(function(position) {
        // Change les informations initiées
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;

        // Récupération du type
        // Si le type, existe, ajouter geolocalised (avoid errors)
        if (document.body.contains(get('#comingFromType'))) {
            geolocalised = true

            let input = get('#comingFromType')
            let type = input.value

            // Récupération des consignes de la ville
            fetchCityName(type)
        }
        else {
            get("#geoStatus").innerHTML = "Erreur, re-scannez le produit"
        }
    });
}

/**
 * Récupére le nom de la ville lors de la géolocalisation avec le button
 * @param {String} type - Type du produit stocké précedemment
 */
const fetchCityName = (type) => {
    // Afficher un loader pendant le chargement
    get("#geoStatus").innerHTML = "Chargement..."

    if (document.body.contains(get("#cityName"))) {
        fetchConsignes(type)
    }
    else {
        fetch(`https://api-adresse.data.gouv.fr/reverse/?lon=${longitude}&lat=${latitude}`)
        .then(res => res.json())
        .then(data => {
            // Récupération du nom de la ville
            let city = data.features[0].properties.city

            // Stockage du nom de la ville
            let input = document.createElement('input')
            input.setAttribute('id', "cityName")
            input.setAttribute('value', city);
            input.setAttribute('hidden', true);

            document.body.appendChild(input)

            fetchConsignes(type)
        })
    }
}

/**
 * Récupére les consignes de la ville dans l'input #cityName
 * @param {String} type - Type de produit à rechercher
 */
const fetchConsignes = (type) => {
    // Récupération du nom de la ville
    if (document.body.contains(get('#cityName'))) {
        var city = get('#cityName').value
    }
    else {
        geolocalised = false
        checkGeolocalisation(type)
        return
    }

    // Vérification si les consignes ont déjà été récupérés
    if (document.body.contains(get('#cityFetchedConsignes'))) {
        editConsignesInModal(type, city)
    }
    else {
        fetch(`${api}/city/${city}`)
        .then(res => res.json())
        .then(data => {
            // Récupération du nom de la ville
            if (data.object !== null) {
                var consignes = JSON.stringify(data.object.consignes)

                // Stockage des consignes
                let input = document.createElement('input')
                input.setAttribute('id', 'cityFetchedConsignes');
                input.setAttribute('value', consignes);
                input.setAttribute('hidden', true);

                document.body.appendChild(input)

                // Suppression du type temporaire
                if (document.body.contains(get('#comingFromType'))) {
                    get('#comingFromType').remove()
                }

                editConsignesInModal(type, city)     
            }
            else {
                if (document.body.contains(get('#cityName'))) get('#cityName').remove();
                get("#geoStatus").innerHTML = "Votre ville n'est pas répertoriée !"
                checkGeolocalisation(type)
            }                
        })
    }
}

function editConsignesInModal (type, city) {
    let emplacement;

    if (document.body.contains(get('#cityFetchedConsignes'))) {
        var consignes = JSON.parse(get('#cityFetchedConsignes').value)
    }
    else {
        checkGeolocalisation(type)
        return
    }

    // Récupération de l'emplacement
    if (type == "autre") {
        emplacement = "déchetterie"
    }
    else {
        emplacement = consignes[type]
    }

    // Changement des valeurs dans le modal
    let message = `
        Vous recyclez à <strong>${city}</strong><br>Ce produit se met (dans le/à la) <strong>${emplacement}</strong>.
    `    
    get('#recycleItem').innerHTML = message;
  
    // Réinitialiser le loader du modal `geolocalise`
    get("#geoStatus").innerHTML = 'Géolocaliser votre appareil';
  
    // Redirection vers la page du produit
    location.hash = 'product';
}

////////////////
// Caméra
Quagga.onDetected( function (result) {
    let detected = result.codeResult.code

    // Changement des status
    get('#last_scanned').innerHTML = detected
    let message = `
        Ce code-barres n'est pas dans la base de données, désolé !
    `.trim()
                
    get('#last_scanned').style.color = "red"
    get('#status_scan').innerHTML = message


    // Vérifie si le code-bares est le meme que le dernier détécté ou pas
    // (pour avoir des centaines de requêtes à l'API)
    if (detected != lastDetected) {
        lastDetected = detected
        fetch (`${api}/product/${detected}`)
        .then(res => res.json())
        .then(data => {
            if (data.object !== null) {
                Quagga.stop()
                changeModal(detected)

                get('#last_scanned').innerHTML =
                get('#status_scan').innerHTML = ""
            }
        })
    }
})

////////////////
// Formulaire
fetch(`${api}/allTypes`)
.then(res => res.json())
.then(data => {
    let select = get('#type_add')

    data.forEach(val => {
        let option = document.createElement('option')
        option.innerHTML = val
        select.appendChild(option)
    })
})

function getAll (selector) {
    var parent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;
    return Array.prototype.slice.call(parent.querySelectorAll(selector), 0);
}

let form = get('#formAdd')
form.addEventListener("submit", function (e) {
    e.preventDefault()
    get("#load_add").innerHTML = 'Chargement...'

    let name = get('#nom_add').value
    let brand = get('#marque_add').value
    let barcode = get('#codebarres_add').value
    let type = get('#type_add').value
    let options = []

    getAll('.isAlt').forEach(el => {
        let val = el.id.replace('checkbox_', '')
        options.push(val)
    })

    // Données à passer dans le fetch
    let data = { name, brand, barcode, type, options }
    let headers = {
        "Content-Type": "application/json"
    }

    fetch(`${api}/suggestProduct`, {
        method: "POST",
        headers,
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(data => {
        get("#load_add").innerHTML = 'Envoyer la demande !'
        if (data.success) {
            get('#formAdd').reset()
            get('#status_add').innerHTML = `<h3 style="color: green;">Demande envoyée avec succées !</h3>`
        }
        else {
            get('#status_add').innerHTML = `<h3 style="color: red;">${data.message}</h3> ${data.err ? "<p style=\"word-break: break-all;\">Message d'erreur: " + JSON.stringify(data.err) + "</p>" : ""}`
        }
    })
})