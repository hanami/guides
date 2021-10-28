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
    var nonActiveMenuSections = $("ul.nav.ct-sidenav:not(:has(.active))");
    nonActiveMenuSections.hide()

    $("span.ct-toc-link").click(function(event){
      event.preventDefault();
      var element = $(this);

      // Custom styles for currently opened link
      $("span.ct-toc-link").removeClass('visible');
      element.addClass('visible');

      var submenu = element.next("ul.nav.ct-sidenav");

      $("ul.nav.ct-sidenav:not(:has(.active))").not(submenu).slideUp();
      submenu.slideDown();
    });

    $("li.ct-section-nav span").click(function(event){
      event.preventDefault();
      var element = $(this).closest("li");

      // Custom styles for currently opened link
      $("li.ct-section-nav").removeClass('visible');
      element.addClass('visible');

      var submenu = element.children("ul.nav.ct-sidenav");

      // close all other menus at the same deep-level
      element.closest("ul").find("li ul.nav.ct-sidenav:not(:has(.active))").not(submenu).slideUp();

      // slide-down the currently opened subsection
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
