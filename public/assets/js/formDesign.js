
let order = 0;

var orderObject = {};

const addComponent = (type, where) => {

    if (type == 1) {
        order = order + 1;
        orderObject['sec-' + order.toString()] = 0;
        $(`#${where}`).append(`
            <div class="m-3" id="sec-${order}">
                <div class="card">
                    <div class="card-header">
                        <div class="form-group">
                            <label for="email2">Enter Section Name</label>
                            <input type="text" class="form-control" name="name" id="email2" placeholder="Name">
                        </div>
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
        orderObject['tab-' + order.toString()] = 0;
        $(`#${where}`).append(`
            <div class="m-3" id="tab-${order}">
                <div class="card">
                    <div class="card-header d-flex justify-content-between">
                        <div class="form-group">
                            <label for="email2">Enter Tab Name</label>
                            <input type="text" class="form-control" name="name" id="email2" placeholder="Name">
                        </div>
                        <button class="btn btn-link" onclick="addTab()">Add New Tab</button>
                    </div>
                    <div class="card-body">
                        <ul  class="nav nav-pills nav-secondary nav-pills-no-bd" id="ctab-${order}" role="tablist">
                            <li class="nav-item submenu">
                                <a class="nav-link" id="pills-home-tab-nobd" data-toggle="pill" href="#pills-home-nobd" role="tab" aria-controls="pills-home-nobd" aria-selected="false">Home</a>
                            </li>
                        </ul>
                        <div id="ctabc-${order} class="tab-content mt-2 mb-3" id="pills-without-border-tabContent">
                            <div class="tab-pane fade" id="pills-home-nobd" role="tabpanel" aria-labelledby="pills-home-tab-nobd">
                                <p>Default Tab</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `)



    }
    if (type == 3) {
        console.log(where);
        var str = where.split("-");
        str = str[1] + '-' + str[2];
        let count = ++orderObject[str];

        orderObject[str] = count;

        $(`#${where}`).append(`
            <div class="m-3" id="${str}-sec-${count}">
                <div class="card">
                    <div class="card-header">
                        <div class="form-group">
                            <label for="email2">Enter Section Name</label>
                            <input type="text" class="form-control" name="name" id="email2" placeholder="Name">
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
        let count = ++orderObject[str];

        orderObject[str] = count;

        str = 'ctabc-' + str + '-' + count;
        orderObject[str] = 0;

        $(`#${where}`).append(`
            <div class="m-3" id="${str}-tab-${count}">
                <div class="card">
                    <div class="card-header d-flex justify-content-between">
                        <div class="form-group">
                            <label for="email2">Enter Tab Name</label>
                            <input type="text" class="form-control" name="name" id="email2" placeholder="Name">
                        </div>
                        <button class="btn btn-link" onclick="addTab('ctab-${str}-${count}')">Add New Tab</button>
                    </div>
                    <div class="card-body">
                        <ul  class="nav nav-pills nav-secondary nav-pills-no-bd" id="ctab-${str}-${count}" role="tablist">
                            <li class="nav-item submenu">
                                <a class="nav-link" id="pills-home-tab-nobd" data-toggle="pill" href="#pills-home-nobd" role="tab" aria-controls="pills-home-nobd" aria-selected="false">Home</a>
                            </li>
                        </ul>
                        <div id="ctabc-${str}-${count}" class="tab-content mt-2 mb-3" id="pills-without-border-tabContent">
                            <div class="tab-pane fade" id="pills-home-nobd" role="tabpanel" aria-labelledby="pills-home-tab-nobd">
                                <p>Default Tab</p>
                            </div>
                            <div class="tab-pane fade" id="pills-home-nobd1" role="tabpanel" aria-labelledby="pills-home-tab-nobd">
                                <p>Default Tab</p>
                            </div>
                              
                        </div>
                    </div>
                </div>
            </div>
        `)
    }

    console.log(orderObject);

}

const addTab = (val) => {

    // var nextTab = $('#tabs li').size() + 1;
    val = val.split('-');
    val[0] += 'c';
    console.log(val);
    val = val[0] + '-' + val[1] + '-' + val[2] + '-' + val[3] + '-' + val[4] + '-' + val[5];//prroblem may be accure
    // str.replaceAll(',', '-');
    let count = orderObject[val]++;
    orderObject[val] = count;
    let id = val + '-' + orderObject[val];
    $(`#${val}`).append(`<li class="nav-item submenu"> <a class="nav-link" id="pills-home-tab-nobd" data-toggle="pill" href="#${id}" role = "tab" aria-controls="pills-home-nobd" aria-selected="false"> Home </a > </li >`);

    // // create the tab
    // $(`<li class="nav-item submenu">
    //         <a class="nav-link" id="pills-home-tab-nobd" data-toggle="pill" href="#tab-${nextTab}" role="tab" aria-controls="pills-home-nobd" aria-selected="false">Tab-${nextTab}</a>
    //         </li>`).appendTo('#tabs');

    // // create the tab content
    // $(`<div class="tab-pane fade" id="tab-${nextTab}" role="tabpanel" aria-labelledby="pills-home-tab-nobd"></div>`).appendTo('.tab-content');

    // // make the new tab active
    // $('#tabs a:last').tab('show');
}

var AllData = [];

$('#saveButton').on('click', () => {
    let allSec = document.getElementById('builder');
    for (let i = 0; i < allSec.childElementCount; i++) {

        let child = allSec.children[i];
        let id = child.getAttribute("id");

        id = id.split("-");



        let obj = {
            "type": "",
            "order": "",
            "name": "sec-tab",
            "child": []
        };
        obj.type = id[0];
        obj.order = id[1];

        var f = child.getElementsByClassName("card-body")[0].getElementsByClassName("m-3")[0];
        if (obj.type != "tab") {
            for (let j = 0; j < f.childElementCount; j++) {

                let id = f.children[j].getAttribute("id");
                id = id.split("-");

                let chilObj = {
                    "type": "",
                    "order": "",
                    "name": "",

                }
                chilObj.type = id[2];
                chilObj.order = id[3];

                obj.child.push(chilObj);


            }
        }

        AllData.push(obj);

    }
    console.log(AllData);
})