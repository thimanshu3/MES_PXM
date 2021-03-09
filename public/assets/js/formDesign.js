let order = 0;
var extName;

var orderObject = {};

const addComponent = (type, where) => {

    if (type == 1) {
        order = order + 1;
        orderObject['sec-' + order.toString()] = 0;
        orderObject[`cmp-sec-${order}`] = 0;
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
                            <button class="btn btn-link btn-shadow shadow" onclick="addComponent('3', 'cmp-sec-${order}')">Add Sub-Section</button>
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
        orderObject[`tab-${order}`] = 1;
        orderObject[`ctabc-${order}-list`] = 1;
        $(`#${where}`).append(`
            <div class="m-3" id="tab-${order}">
                <div class="card">
                    <div class="card-header d-flex justify-content-between">
                        <div class="form-group w-50">
                            <label for="email2">Enter Tab ${order} Name</label>
                            <input type="text" class="form-control" name="name" id="tab-${order}-inp" placeholder="Name">
                        </div>
                        <div
                        class="d-flex justify-content-between">
                            <button class="btn btn-link" onclick="getName('ctabc-${order}')">Add New Tab</button>
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
                                <p>Default Tab  <button class="btn btn-primary">Add Sub Section</button></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `)



    }
    if (type == 3) {

        let str = where.split('-');
        let str1 = str[1] + '-' + str[2];

        let count = ++orderObject[where];




        orderObject[where] = count;

        $(`#${where}`).append(`
            <div  class="m-3" id="${str1}-sec-${count}">
                <div class="card">
                    <div class="card-header d-flex justify-content-between">
                        <div class="form-group w-50">
                            <label for="email2">Enter Section  Name</label>
                            <input type="text" class="form-control" name="name" id="${str1}-sec-${count}-inp" placeholder="Name">
                        </div>
                    
                     <div
                        class="d-flex justify-content-between">
                           
                            <button onclick="deleteComponent('${str1}-sec-${count}')" class="btn btn-link"><i style="color:red" class="fas fa-trash"></i></button>
                        </div>

                    </div>
                    <div class="card-body">
                        <div class="m-3" id="sec-${str1}-${count}">

                        </div>
                    </div>
                </div>
            </div>
        `)
    }
    if (type == 4) {

        let str = where.split('-');
        let str1 = str[1] + '-' + str[2];
        orderObject[where] = ++orderObject[where];
        orderObject[`ctabc-${str1}-${orderObject[where]}-list`] = 1;
        console.log(orderObject[where]);
        // console.log(`-> ctabc-${str1}-${orderObject[where]}`);
        $(`#${where}`).append(`
            <div class="m-3" id="${str1}-tab-${orderObject[where]}">
                <div class="card">
                    <div class="card-header d-flex justify-content-between">
                        <div class="form-group w-50">
                            <label for="email2">Enter Tab Name</label>
                            <input type="text" class="form-control" name="name" id="${str1}-tab-${orderObject[where]}-inp" placeholder="Name">
                        </div>
                        <button class="btn btn-link" onclick="getName('ctabc-${str1}-${orderObject[where]}')">Add New Tab</button>
                        <div
                        class="d-flex justify-content-between">

                            <button onclick="deleteComponent('${str1}-tab-${orderObject[where]}')" class="btn btn-link"><i style="color:red" class="fas fa-trash"></i></button>
                        </div>

                    </div>
                    <div class="card-body">
                        <ul  class="nav nav-pills nav-secondary nav-pills-no-bd" id="ctabc-${str1}-${orderObject[where]}-list" role="tablist">
                            <li class="nav-item submenu" id="ctabc-${str1}-${orderObject[where]}-1-item">
                                <a class="nav-link"  data-toggle="pill" href="#ctabc-${str1}-${orderObject[where]}-1-content_item" role="tab" aria-controls="pills-home-nobd" aria-selected="false">Home</a>
                            </li>
                        </ul>
                        <div id="ctabc-${str1}-${orderObject[where]}" class="tab-content mt-2 mb-3" id="pills-without-border-tabContent">
                            <div class="tab-pane fade" id="ctabc-${str1}-${orderObject[where]}-1-content_item" role="tabpanel" aria-labelledby="pills-home-tab-nobd">
                                <p>Default Tab <button class="btn btn-primary" style="background-color: white;margin-left: 600px;color: blue;border: 1px solid;padding: 10px;box-shadow: 5px 10px 18px grey;border-style:hidden;">Add Sub-Section</button></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).animate({
            left: '100%'  // for instance
        }, 2000);
    }
    scrollDown()

}

const addTab = (val) => {
    if (extName != '' || extName != undefined) {
        let path = val;
        path += '-list';
        console.log(orderObject[path]);
        orderObject[path] = ++orderObject[path];


        $(`#${path}`).append(`<li class="nav-item submenu" id="${val}-${orderObject[path]}-item"> <a class="nav-link"  data-toggle="pill" href="#${val}-${orderObject[path]}-content_item" role= "tab" aria-controls="pills-home-nobd" aria-selected="false"> ${extName} </a > </li >`);
        $(`#${val}`).append(` <div class="tab-pane fade" id='${val}-${orderObject[path]}-content_item' role="tabpanel" aria-labelledby="pills-home-tab-nobd"><p>Default Tab ${val}-${orderObject[path]}</p></div>`);
        extName = ''
    }
}

var AllData = [];

//fire event on save button click
document.getElementById("saveButton").addEventListener("click", function () {
    AllData = [];
    let main = document.getElementById('builder');
    let allComponent = Array.from(main.children);

    allComponent.forEach(component => {

        let id = component.getAttribute("id");
        let name = component.querySelectorAll("input")[0].value
        let obj = { subComponents: [] };
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
                let childObj = { tabComponents: [] }
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
                        tab.name = b.innerText || b.nodeValue
                        childObj.tabComponents.push(tab)
                    })
                }

                obj.subComponents.push(childObj);

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
                childObj.name = b.innerText || b.nodeValue
                obj.subComponents.push(childObj)
            })
        }
        AllData.push(obj);
    })

    fetch('/admin/customform/layout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            content: AllData,
            formId
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

    delete orderObject[id];

}


const getName = (id) => {
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
                if (extName != '') {
                    addTab(id)
                }

            }, true]],

    });


}

function scrollDown() {
    $('html, body').animate({
        scrollTop: $(document).height()
    }, 'slow');
}
