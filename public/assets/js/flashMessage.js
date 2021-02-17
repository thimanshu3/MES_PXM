if ($('.flash-success-message').text().trim())
    iziToast.success({
        message: $('.flash-success-message').text().trim(),
        position: 'bottomCenter'
    })

if ($('.flash-error-message').text().trim())
    iziToast.error({
        title: 'Error',
        message: $('.flash-error-message').text().trim(),
        position: 'topRight',
        timeout: 30000
    })

//show curruent active
$(function () {
    var url = window.location.pathname
    urlRegExp = new RegExp(url.replace(/\/$/, '') + "$")
    $('.vertical-nav-menu a').each(function () {
        if (urlRegExp.test(this.href.replace(/\/$/, ''))) {
            $(this).addClass('mm-active')
        }
    })
})