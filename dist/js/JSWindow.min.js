;(function($, JSWindow) {
    if($.isEmptyObject(JSWindow) === false) {
        return ;
    }

    var defaultProp = {
        id: null,
        title: null,
        name: null,
        width: 200,
        height: 200,
        minWidth: 200,
        maxWidth: 200,
        minable: true,
        maxable: true,
        closeable: true,
        // icon: 'icon',
        footerable: true,
        headerable: true,
        method: 'get',
        queryParames: null,
        href: null,
        content: 'content'
    }

    window.JSWindow = JSWindow;

})(jQuery, window.JSWindow || function() {});
