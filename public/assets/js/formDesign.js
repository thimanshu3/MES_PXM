

let order = 0;
var extName;

var orderObject = {};

const addComponent = (type, where) => {

    if (type == 1) {
        order = order + 1;
        orderObject['sec-' + order.toString()] = 0;
        $(`#${where}`).append(`
            <div  class="m-3" id="sec-${order}">
                <div class="card">
                    <div class="card-header d-flex justify-content-between">
                        <div class="form-group w-75">
                            <label for="email2">Enter Section ${order} Name</label>
                            <input type="text" class="form-control" id="sec-${order}-inp" placeholder="Name">
                        </div>
                        <button onclick="deleteComponent('sec-${order}')" class="btn btn-link"><i style="color:red" class="fas fa-trash"></i></button>
                    </div>
                    <div class="card-body">
                        <div class="d-flex justify-content-center border">
                            <button class="btn btn-link btn-shadow" onclick="addComponent('3', 'cmp-sec-${order}')">Add Sub-Section</button>
                            <button class="btn btn-link btn-shadow" onclick="addComponent('4' , 'cmp-sec-${order}')">Add Sub-Tab</button>
                        </div>
                        <div class="m-3" id="cmp-sec-${order}">

                        </div>
                    </div>
                </div>
            </div>
        `)
    }
    if (type == 2) {
        order += 1;
        orderObject[`ctabc-${order}-list`] = 1;
        $(`#${where}`).append(`
            <div class="m-3" id="tab-${order}">
                <div class="card">
                    <div class="card-header d-flex justify-content-between">
                        <div class="form-group">
                            <label for="email2">Enter Tab ${order} Name</label>
                            <input type="text" class="form-control" name="name" id="tab-${order}-inp" placeholder="Name">
                        </div>
                        <div
                        class="d-flex justify-content-between">
                            <button class="btn btn-link" onclick="addTab('ctabc-${order}')">Add New Tab</button>
                            <button onclick="deleteComponent('tab-${order}')" class="btn btn-link"><i style="color:red" class="fas fa-trash"></i></button>
                        </div>
                    </div>
                    <div class="card-body">
                        <ul  class="nav nav-pills nav-secondary nav-pills-no-bd" id="ctabc-${order}-list" role="tablist">
                            <li class="nav-item submenu" id="ctabc-${order}-1-item">
                                <a class="nav-link"  data-toggle="pill" href="#ctabc-${order}-1-content_item" role="tab" aria-controls="pills-home-nobd" aria-selected="false">Home</a>
                            </li>
                        </ul>
                        <div id="ctabc-${order}" class="tab-content mt-2 mb-3" id="pills-without-border-tabContent">
                            <div class="tab-pane fade" id="ctabc-${order}-1-content_item" role="tabpanel" aria-labelledby="pills-home-tab-nobd">
                                <p>Default Tab</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `)



    }
    if (type == 3) {
        var str = where.split("-");
        str = str[1] + '-' + str[2];
        let count = ++orderObject[str];

        orderObject[str] = count;

        $(`#${where}`).append(`
            <div  class="m-3" id="${str}-sec-${count}">
                <div class="card">
                    <div class="card-header d-flex justify-content-between">
                        <div class="form-group w-50">
                            <label for="email2">Enter Section  Name</label>
                            <input type="text" class="form-control" name="name" id="${str}-sec-${count}-inp" placeholder="Name">
                        </div>

                    </div>
                    <div class="card-body">
                        <div class="m-3" id="sec-${str}-${count}">

                        </div>
                    </div>
                </div>
            </div>
        `)
    }
    if (type == 4) {
        var str = where.split("-");
        str = str[1] + '-' + str[2];


        orderObject[str] = orderObject[str] + 1;
        let count = orderObject[str];

        orderObject[`ctabc-${str}-${count}-list`] = 1;


        $(`#${where}`).append(`
            <div class="m-3" id="${str}-tab-${count}">
                <div class="card">
                    <div class="card-header d-flex justify-content-between">
                        <div class="form-group w-50">
                            <label for="email2">Enter Tab Name</label>
                            <input type="text" class="form-control" name="name" id="${str}-tab-${count}-inp" placeholder="Name">
                        </div>
                        <button class="btn btn-link" onclick="addTab('ctabc-${str}-${count}')">Add New Tab</button>
                    </div>
                    <div class="card-body">
                        <ul  class="nav nav-pills nav-secondary nav-pills-no-bd" id="ctabc-${str}-${count}-list" role="tablist">
                            <li class="nav-item submenu" id="ctabc-${str}-${count}-1-item">
                                <a class="nav-link"  data-toggle="pill" href="#ctabc-${str}-${count}-1-content_item" role="tab" aria-controls="pills-home-nobd" aria-selected="false">Home</a>
                            </li>
                        </ul>
                        <div id="ctabc-${str}-${count}" class="tab-content mt-2 mb-3" id="pills-without-border-tabContent">
                            <div class="tab-pane fade" id="ctabc-${str}-${count}-1-content_item" role="tabpanel" aria-labelledby="pills-home-tab-nobd">
                                <p>Default Tab</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `)
    }


}

const addTab = (val) => {
    if(extName != '' || extName != undefined){
        let path = val;
        path += '-list';
        orderObject[path] = orderObject[path] + 1;

        $(`#${path}`).append(`<li class="nav-item submenu" id="${val}-${orderObject[path]}-item"> <a class="nav-link"  data-toggle="pill" href="#${val}-${orderObject[path]}-content_item" role= "tab" aria-controls="pills-home-nobd" aria-selected="false"> ${extName} </a > </li >`);
        $(`#${val}`).append(` <div class="tab-pane fade" id='${val}-${orderObject[path]}-content_item' role="tabpanel" aria-labelledby="pills-home-tab-nobd"><p>Default Tab ${val}-${orderObject[path]}</p></div>`);
    }
}

var AllData = [];

//fire event on save button click
document.getElementById("saveButton").addEventListener("click", function () {
    let main = document.getElementById('builder');
    let allComponent = Array.from(main.children);

    allComponent.forEach(component => {

        let id = component.getAttribute("id");
        let name = component.querySelectorAll("input")[0].value
        let obj = { components: [] };
        id = id.split('-')
        obj.type = id[0];
        obj.order = id[1];
        obj.name = name

        if (obj.type != "tab") {
            var child = component.getElementsByClassName("card-body")[0].getElementsByClassName("m-3")[0];
            let allChild = Array.from(child.children);

            allChild.forEach(b => {
                let id = b.getAttribute('id')
                let name = b.querySelectorAll("input")[0].value
                let childObj = { tabs: [] }
                id = id.split("-");

                childObj.order = id[3];
                childObj.type = id[2];
                childObj.name = name;

                if (id.includes('tab')) {
                    let child = b.getElementsByTagName('ul')[0].getElementsByTagName("li");
                    let allTabs = Array.from(child)
                    allTabs.forEach(b => {
                        let tab = {}
                        let id = b.getAttribute('id');
                        id = id.split('-');
                        tab.type = "tablist";
                        tab.order = id[4];
                        childObj.tabs.push(tab)
                    })
                }

                obj.components.push(childObj);

            })

        }
        else {
            let child = component.getElementsByClassName("card-body")[0].getElementsByTagName('ul')[0].getElementsByTagName("li");
            let allChild = Array.from(child)
            allChild.forEach(b => {
                let childObj = {};
                let id = b.getAttribute('id');
                id = id.split('-');
                childObj.type = "tab";
                childObj.order = id[2];
                obj.components.push(childObj)
            })
        }
        AllData.push(obj);
    })
   
            fetch('/admin/customform/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    AllData
                })
            })
                .then(function (res) {
                    return res.json()
                })
                .then(function (json) {
                    if (json.status == 200)
                        iziToast.success({
                            message: json.message
                        })
                    else if (json.status == 400)
                        iziToast.error({
                            title: json.message,
                            message: json.error
                        })
                    else
                        iziToast.error({
                            message: json.message
                        })
                })
                .catch(err => console.log(err))
    
})


const deleteComponent = (id) => {
    $(`#${id}`).remove()
    order = order - 2;
}


const getName = () => {
    iziToast.info({
        timeout: 20000,
        overlay: true,
        displayMode: 'once',
        id: 'inputs',
        zindex: 999,
        title: 'Enter Tab name',
        position: 'center',
        drag: false,
        inputs: [
            ['<input type="textl">', 'change', function (instance, toast, input, e) {
                extName = input.value;
            }]
        ],
        buttons: [
            ['<button><b>Save</b></button>', function (instance, toast) {

                instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
                

            }, true]],

    });


}