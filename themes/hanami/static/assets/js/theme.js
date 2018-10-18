(function($){
  $(document).ready(function(){
    // Search link
    $("#search-link").click(function(event) {
      event.preventDefault();
      $("#search-form").fadeToggle();
    });

    // Alerts
    $("p.notice").prepend('<span class="alert-inner--icon"><i class="ni ni-like-2"></i></span>');
    $("p.convention").prepend('<span class="alert-inner--icon"><i class="ni ni-ruler-pencil"></i></span>');
    $("p.warning").prepend('<span class="alert-inner--icon"><i class="ni ni-notification-70"></i></span>');

    // Sidebar menu
    var nonActiveMenuSections = $("ul.nav.ct-sidenav:not(:has(>.active))");
    nonActiveMenuSections.hide()

    $("span.ct-toc-link").click(function(event){
      event.preventDefault();
      var element = $(this);
      var submenu = element.next("ul.nav.ct-sidenav");

      nonActiveMenuSections.slideUp();
      submenu.slideDown();
    });

    // Copy & Paste snippets
    $("div.highlight").before('<div class="ct-clipboard"><button class="btn-clipboard" title="" data-original-title="Copy to clipboard">Copy</button></div>');

    new ClipboardJS(".btn-clipboard", {
      text: function(button) {
        var btn = $(button);
        var code = btn.parent().next("div.highlight");

        return code.text();
      }
    });
  });
})(jQuery);
