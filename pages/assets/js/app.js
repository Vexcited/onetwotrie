if('serviceWorker' in navigator){
    navigator.serviceWorker.register('/onetwotrie/pages/assets/js/serviceWorker.js')
      .then(reg => console.log('Service Worker registered'))
      .catch(err => console.log('Service Worker not registered', err));
}