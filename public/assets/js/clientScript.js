const markStatusOrDelete = (uri,method,type,data) =>{
        if(data != undefined){
            console.log("present");
            data = JSON.parse(data)
        }
        iziToast.question({
            overlay: true,
            toastOnce: true,
            id: 'question',
            title: 'Hey',
            message: 'Are you sure?',
            position: 'center',
            buttons: [
                ['<button><b>YES</b></button>', function (instance, toast) {
                    fetch(`${uri}`, {
                        method
                    })
                        .then(res => res.json())
                        .then(json => {
                            if (json.status === 200) {
                                iziToast.info({
                                    message: json.message
                                })
                                if(type === 'status'){

                                    $(`#activeBadge-${data.id}`).text(json.active ? 'ACTIVE' : 'INACTIVE')
                            document.querySelector(`#activeBadge-${data.id}`).classList.remove('badge-success')
                            document.querySelector(`#activeBadge-${data.id}`).classList.remove('badge-danger')
                            document.querySelector(`#activeBadge-${data.id}`).classList.add(json.active ? 'badge-success' : 'badge-danger')
                            $(`#changeFieldStatus-${data.id}`).empty()
                            $(`#changeFieldStatus-${data.id}`).append(`
                            <i class="fas ${json.active ? 'fa-toggle-on' : 'fa-toggle-off'}"></i>
                        `)
                                }else{
                                    location.reload();
                                }
                            } else {
                                iziToast.error({
                                    message: json.message
                                })
                            }
                        })
                        .catch(err => {
                            console.log(err)
                        })
                    instance.hide({ transitionOut: 'fadeOut' }, toast)
                }, true],
                ['<button>NO</button>', function (instance, toast) {
                    instance.hide({ transitionOut: 'fadeOut' }, toast);
                }]
            ]
        });
}

const getApiResponse = (uri,method,data,type) =>{

}