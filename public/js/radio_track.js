(function worker() {
  $.get('https://radio.monoko.chat/api/current.json', function(data) {
    setTimeout(worker, 5000);
    // Now that we've completed the request schedule the next one.
    $('#radio_track').html(data['current']);
 });
})();
