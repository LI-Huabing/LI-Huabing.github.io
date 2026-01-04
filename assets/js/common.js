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
    $('.news-year-toggle').click(function() {
        $(this).next('.news-year-content').toggle();
        $(this).find('i').toggleClass('fa-chevron-down fa-chevron-right');
    });
})
