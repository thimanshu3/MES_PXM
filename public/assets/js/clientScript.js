const markStatusOrDelete = (uri,method,type,data) =>{
        if(data != undefined){
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
                    }).then(res => res.json())
                        .then(json => {
                            if (json.status === 200) {
                                iziToast.info({
                                    message: json.message
                                })
                                if(type === 'status'){
                                    $(`#changeStatus-${data.id}`).empty()
                                    $(`#changeStatus-${data.id}`).append(`<i class="fas ${json.active ? 'fa-toggle-on' : 'fa-toggle-off'}"></i>`)
                                    $(`#activeBadge-${data.id}`).text(json.active ? 'ACTIVE' : 'INACTIVE')
                                    document.querySelector(`#activeBadge-${data.id}`).classList.remove('badge-success')
                                    document.querySelector(`#activeBadge-${data.id}`).classList.remove('badge-danger')
                                    document.querySelector(`#activeBadge-${data.id}`).classList.add(json.active ? 'badge-success' : 'badge-danger')
                                    document.querySelector(`#activeBadge-${data.id}`).style.backgroundColor = (json.active ? '#088e0c' : "#d20e18")
                                }
                                else{
                                    
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

const addValue = (uri,method) =>{
    iziToast.info({
        timeout: 20000,
        overlay: true,
        displayMode: 'once',
        id: 'inputs',
        zindex: 999,
        title: 'Enter Value',
        position: 'center',
        drag: false,
        inputs: [
            ['<input type="text" required>', 'change', function (instance, toast, input, e) {
                label = input.value;
            }]
        ],
        buttons: [
            ['<button><b>Save</b></button>', function (instance, toast) {

                instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
                if (label != '') {
                    console.log(uri)
                    fetch(`${uri}`,{
                        method,
                        body: JSON.stringify({label}),
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                    .then(res => res.json())
                    .then(json => {
                        if (json.status === 200) {
                            iziToast.info({
                                message: json.message
                            })
                            location.reload();
                            // document.querySelector(`#activeBadge-${data.id}`).classList.remove('badge-success')
                            // document.querySelector(`#activeBadge-${data.id}`).classList.remove('badge-danger')
                            // document.querySelector(`#activeBadge-${data.id}`).classList.add(json.active ? 'badge-success' : 'badge-danger')
                            // document.querySelector(`#activeBadge-${data.id}`).style.backgroundColor = (json.active ? '#088e0c' : "#d20e18")
                        } else {
                            iziToast.error({
                                message: json.message
                            })
                        }
                    })
                    .catch(err => {
                        console.log(err)
                    })
                }

            }, true]],

    });
}

const getApiResponse = (uri,method,data,type) =>{

}
