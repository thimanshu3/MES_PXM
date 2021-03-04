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
    document.getElementById('thisWantMe').click()
    var url = window.location.pathname
    urlRegExp = new RegExp(url.replace(/\/$/, '') + "$")
    let parent
    $('.nav-primary a').each(function () {
        if (urlRegExp.test(this.href.replace(/\/$/, ''))) {
            parent = $(this).parent('li')
            parent.addClass('active')
            parent.parents('li').addClass('active')
            parent.parents('li').click() 
        }
    })
})

// $('body').removeAttr('data-background-color');
// $('body').attr('data-background-color', 'dark');
// $('.sidebar').attr('data-background-color', 'dark2');
// $('.logo-header').attr('data-background-color', 'blue');
// $('.main-header .navbar-header').attr('data-background-color', 'dark');