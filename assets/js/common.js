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
    
    // News year collapse toggle - update icons
    $('.news-year-header').each(function() {
        var $header = $(this);
        var targetId = $header.data('target');
        var $target = $(targetId);
        
        $target.on('show.bs.collapse', function() {
            $header.find('i').removeClass('fa-chevron-right').addClass('fa-chevron-down');
            $header.attr('aria-expanded', 'true');
        });
        
        $target.on('hide.bs.collapse', function() {
            $header.find('i').removeClass('fa-chevron-down').addClass('fa-chevron-right');
            $header.attr('aria-expanded', 'false');
        });
    });
})
