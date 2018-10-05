(function($){
  $(document).ready(function(){
    $("p.notice").prepend('<span class="alert-inner--icon"><i class="ni ni-like-2"></i></span>');
    $("p.convention").prepend('<span class="alert-inner--icon"><i class="ni ni-ruler-pencil"></i></span>');
    $("p.warning").prepend('<span class="alert-inner--icon"><i class="ni ni-notification-70"></i></span>');
    $("div.highlight").before('<div class="ct-clipboard"><button class="btn-clipboard" title="" data-original-title="Copy to clipboard">Copy</button></div>');
  });
})(jQuery);

