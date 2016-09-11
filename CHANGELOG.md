#Changelog

This changelog only includes breaking change information.

#0.7.0
    * Use `rb.parseDataAttrs(element)` instead of `component.parseHTMLOptions(element)` (`parseHTMLOptions` is only for the markup options for the component element itself).
    * Use `data-itemscroller-center-mode="true"` instead of `data-center-mode="true"`. Alternatively use `data-itemscroller-options='{"centerMode": true}'`

#0.4.2
    * rename js-autofocus to js-rb-autofocus

#0.4.0
    * renamed nearly all uses of `life` to `live`
    * renamed `js-click` to `js-rb-click`

#0.3.0
    * renamed `rbfocusenter`/`rbfocusleave` to `rb_focusenter`/`rb_focusleave`
