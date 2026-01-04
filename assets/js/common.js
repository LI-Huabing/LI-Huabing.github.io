// aHR0cHM6Ly9naXRodWIuY29tL2x1b3N0MjYvYWNhZGVtaWMtaG9tZXBhZ2U=
$(function () {
    $('.lazy').Lazy({
        scrollDirection: 'vertical',
        effect: 'fadeIn',
        effectTime: 300,
        visibleOnly: true,
        placeholder: "",
        onError: function(element) {
            console.log('[lazyload] Error loading ' + element.data('src'));
        }
    })
    $('[data-toggle="tooltip"]').tooltip()
    
    // News year toggle - simple show/hide
    $('.news-year-toggle').on('click', function() {
        var $toggle = $(this);
        var $content = $toggle.next('.news-year-content');
        var $icon = $toggle.find('i');
        
        if ($content.is(':visible')) {
            $content.slideUp(200);
            $icon.removeClass('fa-chevron-down').addClass('fa-chevron-right');
        } else {
            $content.slideDown(200);
            $icon.removeClass('fa-chevron-right').addClass('fa-chevron-down');
        }
    });
})
