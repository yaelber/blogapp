$('#search_title').on('keydown', function(){
  var name = $('#search_title').val();
  $('#search_form').attr('action','/posts/search' + name);
});


