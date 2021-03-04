let count = 0
const addComponent = (type, where) => {
    count = count + 1
    if (type == 1) {

        $(`#${where}`).append(`
            <div class="m-3" id="cmp-${count}">
                <div class="card">
                    <div class="card-header">
                        <div class="form-group">
                            <label for="email2">Enter Section Name</label>
                            <input type="text" class="form-control" name="name" id="email2" placeholder="Name">
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="d-flex justify-content-center border">
                            <button class="btn btn-link btn-shadow" onclick="addComponent('3', 'sec-${count}')">Add Sub-Section</button>
                            <button class="btn btn-link btn-shadow" onclick="addComponent('4' , 'sec-${count}')">Add Sub-Tab</button>
                        </div>
                        <div class="m-3" id="sec-${count}">

                        </div>
                    </div>
                </div>
            </div>
        `)
    }
    if (type == 2) {

    }
    if (type == 3) {
        $(`#${where}`).append(`
            <div class="m-3" id="cmp-${count}">
                <div class="card">
                    <div class="card-header">
                        <div class="form-group">
                            <label for="email2">Enter Section Name</label>
                            <input type="text" class="form-control" name="name" id="email2" placeholder="Name">
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="m-3" id="sec-${count}">

                        </div>
                    </div>
                </div>
            </div>
        `)
    }
    if (type == 4) {

        $(`#${where}`).append(`
            <div class="m-3" id="cmp-${count}">
                <div class="card">
                    <div class="card-header d-flex justify-content-between">
                        <div class="form-group">
                            <label for="email2">Enter Tab Name</label>
                            <input type="text" class="form-control" name="name" id="email2" placeholder="Name">
                        </div>
                        <button class="btn btn-link" onclick="addTab()">Add New Tab</button>
                    </div>
                    <div class="card-body">
                        <ul  class="nav nav-pills nav-secondary nav-pills-no-bd" id="ctab-${count}" role="tablist">
                            <li class="nav-item submenu">
                                <a class="nav-link" id="pills-home-tab-nobd" data-toggle="pill" href="#pills-home-nobd" role="tab" aria-controls="pills-home-nobd" aria-selected="false">Home</a>
                            </li>
                        </ul>
                        <div id="ctabc-${count} class="tab-content mt-2 mb-3" id="pills-without-border-tabContent">
                            <div class="tab-pane fade" id="pills-home-nobd" role="tabpanel" aria-labelledby="pills-home-tab-nobd">
                                <p>Default Tab</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `)
    }

    console.log(count);

}

const addTab = () => {
    var nextTab = $('#tabs li').size() + 1;

    // create the tab
    $(`<li class="nav-item submenu">
            <a class="nav-link" id="pills-home-tab-nobd" data-toggle="pill" href="#tab-${nextTab}" role="tab" aria-controls="pills-home-nobd" aria-selected="false">Tab-${nextTab}</a>
            </li>`).appendTo('#tabs');

    // create the tab content
    $(`<div class="tab-pane fade" id="tab-${nextTab}" role="tabpanel" aria-labelledby="pills-home-tab-nobd"></div>`).appendTo('.tab-content');

    // make the new tab active
    $('#tabs a:last').tab('show');
}

