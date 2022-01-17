### Avoiding name duplications

If you have a controller name like <code>Main::Actions::Main</code> then some code across your app will break with errors about constants not being found, for example in views which <code>include Web::Layout</code>. This is because Ruby starts constant lookup with the current module, so a constant like <code>Web::Layout</code> referenced by code in the <code>Web::Controllers::Web</code> or <code>Web::Controllers::Web::MyAction</code> module will be converted to <code>Web::Controllers::Web::Layout</code>, which can't be found and causes a constant lookup error.

<p class="warning">
  If you absolutely must name a controller with the same name as your application, you'll need to explicitly set the namespace lookup for things which should be included from immediately under the app, not the controller by prefixing those names with <code>::</code>, e.g. change your views to include <code>::Web::Layout</code> instead of <code>include Web::Layout</code>, and using <code>include ::Web::Action</code> in your controllers.
</p>
