$('form').on('submit', function (e) {
    var submit = $(this).find('[clicked=true]')[0];

    if (!submit.hasAttribute('disabled')) {
        submit.setAttribute('disabled', true);
        submit.children[0].classList.add('fa', 'fa-spinner', 'fa-spin')
        setTimeout(function () {
            submit.removeAttribute('disabled');
        }, 5000);
    }
    submit.removeAttribute('clicked');
});
$('[type=submit]').on('click touchstart', function () {
    this.setAttribute('clicked', true);
});