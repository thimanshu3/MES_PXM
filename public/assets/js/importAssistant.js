
let alreadyMappedFields = []
let required;
$('#importOptionBtn').on('click', function () {
    $('.nav a[href="#' + 'field-mapping' + '"]').tab('show');
    $('html, body').animate({ scrollTop: '0px' }, 10);
})



var executedH = false;
const createHeader = (fields) => {
    try {
        if (!executedH) {
            executedH = true;
            alreadyMappedFields = fieldsData.filter(o => Object.keys(fields).some(i => o.label.toLowerCase() == i.toLocaleLowerCase()));
            const notMapped = fieldsData.filter(o => !(Object.keys(fields).some(i => o.label.toLowerCase() == i.toLocaleLowerCase())))
            console.log(notMapped)
            required = fieldsData.filter(function ({ req }) { return req == true })
            if (alreadyMappedFields.length > 0) {
                counter = alreadyMappedFields.length + 1
                $('#nofield').hide();
                alreadyMappedFields.forEach((field, index) => {
                    index++
                    $('#fieldLinkPreview').append(`<li field-id="${field.id}" id="preview-${index}" class="kkay_field_map_link"> <a id="a-${index}" onclick="showModal('${field.id}','${field.inputType}','${field.label}')" class="btn btn-sm btn-light" style="z-index:999"><i class="fas fa-edit"></i></a>
                    <div class="k_field" id='left-${index}'> ${field.label} </div>
                     <i id='arrow-${index}' class="fas fa-arrows-alt-h"></i>
                     <div id='right-${index}' class="k_field">${field.label} </div>
                    <a href="javascript:void(0)" class="closebtn" onclick="closeNav('preview-${index}')" style="z-index:999"><i class="fas fa-times-circle"></i></a></li>`)
                })
            }
            Object.keys(fields).forEach(field => {
                $('#excelFields').append(`<li class="" id="" field-type='excelField'>
                ${field.trim()}</li>`)
            })
            $('.nav a[href="#' + 'import-option' + '"]').tab('show');
            $('html, body').animate({ scrollTop: '0px' }, 10);
        }
    }
    catch (err) {
        iziToast.error({ message: err })
        console.log(err.toString())
    }
}

let headers;
let selectedFile;
document.getElementById('et_pb_contact_brand_file_request_0').addEventListener("change", (event) => {
    selectedFile = event.target.files[0];

})

const previewTheData = () => {
    if (selectedFile) {
        let fileReader = new FileReader();
        fileReader.readAsBinaryString(selectedFile);
        fileReader.onload = (event) => {
            let data = event.target.result;
            let workbook = XLSX.read(data, { type: "binary" });
            const sheet_name_list = workbook.SheetNames;
            let jsonPagesArray = [];
            sheet_name_list.forEach(function (sheet) {
                const jsonPage = {
                    name: sheet,
                    content: XLSX.utils.sheet_to_json(workbook.Sheets[sheet], { defval: null })
                };
                jsonPagesArray.push(jsonPage);
            });
            if (jsonPagesArray.length) {
                jsonPagesArray.forEach(pages => {
                    if (pages.content.length) {

                        createHeader(pages.content[0])
                    }
                })
            }
        }
    } else {
        iziToast.warning({ message: 'Please Upload excel file' })
    }

}
$(document).ready(function () {
    const allowedExtensions = /(\.xlsx|\.xls)$/i;
    $('input[type="file"]').on('click', function () {
        $(".file_names").html("");
    })
    if ($('input[type="file"]')[0]) {
        var fileInput = document.querySelector('label[for="et_pb_contact_brand_file_request_0"]');
        fileInput.ondragover = function () {
            this.className = "et_pb_contact_form_label changed";
            return false;
        }
        fileInput.ondragleave = function () {
            this.className = "et_pb_contact_form_label";
            return false;
        }
        fileInput.ondrop = function (e) {
            e.preventDefault();
            var fileNames = e.dataTransfer.files;
            for (var x = 0; x < fileNames.length; x++) {

                $ = jQuery.noConflict();
                $('label[for="et_pb_contact_brand_file_request_0"]').append("<div class='file_names'>" + fileNames[x].name + "</div>");
            }
        }
        $('#et_pb_contact_brand_file_request_0').change(function () {
            var fileNames = $('#et_pb_contact_brand_file_request_0')[0].files[0].name;
            var filePath = $('#et_pb_contact_brand_file_request_0').val();
            if (!allowedExtensions.exec(filePath)) {
                iziToast.error({ message: 'Only xls or xlsx files are allowed' })
                selectedFile = false;
                $('#et_pb_contact_brand_file_request_0').val('')
                return false;
            }
            $('label[for="et_pb_contact_brand_file_request_0"]').append("<div class='file_names'>" + fileNames + "</div>");
            $('label[for="et_pb_contact_brand_file_request_0"]').css('background-color', '##eee9ff');
        });
    }
});




let counter = 0;
var current = null;
$(function () {
    // right
    $("#system-fields").selectable({
        selected: function (event, ui) {
            previewMapped(ui, 'right')
        }
    });

    // left
    $("#excelFields").selectable({
        selected: function (event, ui) {
            previewMapped(ui, 'left')
        }
    });



    $("#fieldLinkPreview").selectable({
        selected: function (event, ui) {
            current = ui.selected.getAttribute('id')
            counter = parseInt(current.split('-')[1])
            $('#fieldLinkPreview li').each(function (i) {
                $(this).removeClass('current-active');
            });
            $(`#${current}`).addClass('current-active')

        }
    })
});

$(document).ready(function () {
    if ($('#fieldLinkPreview').children().length == 0) {
        $('#fieldLinkPreview').append(`
                     <div id="nofield" class="mx-auto Kk_no_assigned">
                        <img class="img-responsive"
                            src="/assets/img/no_field_assigned.png">
                        <h4>No Fields Mapped</h4>
                        <h6>Please Map some fields to continue</h6>
                    </div>
                `)
    }

    var action = '<td> <div class="form-button-action"> <button type="button" data-toggle="tooltip" title="" class="btn btn-link btn-primary btn-lg" data-original-title="Edit Task"> <i class="fa fa-edit"></i> </button> <button type="button" data-toggle="tooltip" title="" class="btn btn-link btn-danger" data-original-title="Remove"> <i class="fa fa-times"></i> </button> </div> </td>';

    $('#addRowButton').click(function () {
        $('#add-row').dataTable().fnAddData([
            $("#addName").val(),
            $("#addPosition").val(),
            $("#addOffice").val(),
            action
        ]);
        $('#addRowModal').modal('hide');

    });
});


var flag = true;
// var left = false;
// var right = true;
// var prev;

function closeNav(id, type) {
    alert("do you really want to delete this ?")
    type = (typeof type !== 'undefined') ? type : null
    if (type != null) {
        alert('hi')
        $(`[name='${type}']`).remove()
    }
    else {
        $(`#${id}`).remove()
    }
    if ($('#fieldLinkPreview').children().length == 1) {
        $('#fieldLinkPreview').append(`
                     <div id="nofield" class="mx-auto Kk_no_assigned">
                        <img class="img-responsive"
                            src="/assets/img/no_field_assigned.png">
                        <h4>No Fields Mapped</h4>
                        <h6>Please Map some fields to continue</h6>
                    </div>
                `)
    }
}


const previewMapped = (li, type) => {
    var list = li
    $('#nofield').hide();

    if (current === null) {
        //send id . field-type and field-name in show modal function
        // set this to previewMapped li 
        // field-id="${list.selected.getAttribute('id')}"
        if (type == 'left') {
            $('#fieldLinkPreview').append(`<li  id="preview-${counter.toString()}" class="kkay_field_map_link">  
                        
                <div class="k_field" id='left-${counter.toString()}'> ${li.selected.innerText || li.selected.innerHTML}</div>
                 <i class="fas fa-arrows-alt-h"></i>
                 <div id='right-${counter.toString()}' class="k_field"> </div>
                <a href="javascript:void(0)" class="closebtn" onclick="closeNav('preview-${counter.toString()}')" style="z-index:999"><i class="fas fa-times-circle"></i></a>
               
                 </li>`)
        }
        else if (type == 'right') {
            $('#fieldLinkPreview').append(`<li field-id="${list.selected.getAttribute('id')}" id="preview-${counter.toString()}" class="kkay_field_map_link">
                          <a id="a-${counter.toString()}" onclick="showModal('${list.selected.getAttribute('id')}','${list.selected.getAttribute('field-type')}','${list.selected.innerText}')" class="btn btn-sm btn-light" style="z-index:999"><i class="fas fa-edit"></i></a>
                <div class="k_field" id='left-${counter.toString()}'> </div>
                 <i id='arrow-${counter.toString()}' style="color:green" class="fas fa-arrows-alt-h"></i>
                 <div id='right-${counter.toString()}' class="k_field">${li.selected.innerText || li.selected.innerHTML} </div>
                <a href="javascript:void(0)" class="closebtn" onclick="closeNav('preview-${counter.toString()}')" style="z-index:999"><i class="fas fa-times-circle"></i></a>
                               

                 </li>`)
        }
        counter = parseInt(counter) + 1
        $('#fieldLinkPreview').append(`<li id="preview-${counter.toString()}" class="kkay_field_map_link">
                         
                <div class="k_field" id='left-${counter.toString()}'> </div>
                 <i id='arrow-${counter.toString()}' class="fas fa-arrows-alt-h"></i>
                 <div id='right-${counter.toString()}' class="k_field"> </div>
                 </li>`)

        $(`#preview-${counter.toString()}`).addClass('ui-selectee ui-selected').siblings().removeClass('ui-selectee ui-selected')
        current = "preview-" + counter.toString()
        $('#fieldLinkPreview li').each(function (i) {
            $(this).removeClass('current-active');
        });
        $(`#preview-${counter.toString()}`).addClass('current-active')

    }
    else {

        let n = current.split('-')[1]
        counter = parseInt(n)
        let leftElement = document.getElementById(`left-${n}`)
        let rightElement = document.getElementById(`right-${n}`)
        $('#fieldLinkPreview li').each(function (i) {
            $(this).removeClass('current-active');
        });
        $(`#preview-${n}`).addClass('current-active')
        let isEmptyRow = ((leftElement.innerText == '' && rightElement.innerText == '') ? true : false)
        if (type == 'right') {
            $(`#preview-${n}`).attr('field-id', list.selected.getAttribute('id'))
            rightElement.innerText = li.selected.innerText;
            if ($(`#preview-${n}`).find("i.fa-edit").length == 0) {
                $(`#preview-${n}`).prepend(`<a id="a-${n}" onclick="showModal('${list.selected.getAttribute('id')}','${list.selected.getAttribute('field-type')}','${list.selected.innerText}')" class="btn btn-sm btn-light" style="z-index: 999;"><i class="fas fa-edit"></i></a>`);
            }
            else {
                $(`#a-${n}`).attr("onclick", `showModal('${list.selected.getAttribute('id')}','${list.selected.getAttribute('field-type')}','${list.selected.innerText}')`)
                $(`#preview-${n}`).attr('default-value', '')
            }

        }
        else if (type == 'left') {
            leftElement.innerText = li.selected.innerText;
        }
        if ($(`#preview-${n}`).find("i.fa-times-circle").length == 0)
            $(`#preview-${n}`).append(`<a href="javascript:void(0)" class="closebtn mr-3" onclick="closeNav('preview-${n}')" style="z-index:999"><i class="fas fa-times-circle"></i></a>`);
        if (isEmptyRow) {
            counter = parseInt(counter) + 1
            $('#fieldLinkPreview').append(`<li id="preview-${counter.toString()}" class="kkay_field_map_link">
                    
                <div class="k_field" id='left-${counter.toString()}'> </div>
                <i id='arrow-${counter.toString()}' class="fas fa-arrows-alt-h"></i>
                <div id='right-${counter.toString()}' class="k_field"> </div>
                </li>`)
            $('#fieldLinkPreview li').each(function (i) {
                $(this).removeClass('current-active');
            });
            $(`#preview-${counter.toString()}`).addClass('current-active')
            $(`#preview-${counter.toString()}`).addClass('ui-selectee ui-selected').siblings().removeClass('ui-selectee ui-selected')
            current = "preview-" + counter.toString()

        }

    }
}


$('#addVendorBtn').on('click', function () {
    const el = $('#vendor-1').clone()
    const vid = `vendor-${$('#addVendor').children().length + 1}`
    el.attr('id', vid)
    $('#addVendor').append(`
        <div class="card">
            <div class="card-header d-flex justify-content-between" id="headingOne" data-toggle="collapse"
                data-target="#collapseOne.2-v${$('#addVendor').children().length + 1}" aria-expanded="false" aria-controls="collapseOne">
                <div class="span-mode"></div>
                <div class="span-title">
                    Item Vendor ${$('#addVendor').children().length + 1}
                </div>
            </div>
            <div id="collapseOne.2-v${$('#addVendor').children().length + 1}" class="collapse" aria-labelledby="headingOne" data-parent="#accordion">
                <div class="card-body">
                <ul id="${vid}" onclick="addAll(this)" name="vendor" class="ht_logic kK_accordian_list">
                ${el[0].innerHTML}
                </ul>
                </div>
            </div>
        </div>
        `)
})

const addAll = (content) => {
    let child = Array.from(content.children)
    $('#nofield').hide();
    $('#fieldLinkPreview li:last-child').remove();
    counter = parseInt(counter) + 1
    if (parseInt(counter)) {
        counter = parseInt(counter) - 1

        if ($('#fieldLinkPreview').children().length != counter) {
            counter = $('#fieldLinkPreview').children().length
            current = "preview-" + counter.toString()
        }
    }
    child.forEach((item, i) => {
        $('#fieldLinkPreview').append(`<li name="__${content.id}" field-id="${item.getAttribute('id')}" id="preview-${counter.toString()}" class="kkay_field_map_link">
                <div class="k_field" id='left-${counter.toString()}'> </div>
                 <i id='arrow-${counter.toString()}' class="fas fa-arrows-alt-h"></i>
                 <div id='right-${counter.toString()}' name="${item.getAttribute('id')}" class="k_field">Item ${content.id} : ${item.innerText}</div>
                <a href="javascript:void(0)" class="closebtn" onclick="closeNav('preview-${counter.toString()}','__${content.id}')" style="z-index:999"><i class="fas fa-times-circle"></i></a>
                 </li>`)
        if ($(`#preview-${counter.toString()}`).find("i.fa-edit").length == 0)
            $(`#preview-${counter.toString()}`).prepend(`<a id="a-${counter.toString()}" onclick="showModal('${item.getAttribute('id')}','${item.getAttribute('field-type')}','${item.innerText}')" class="btn btn-sm btn-light" style="z-index: 999;"><i class="fas fa-edit"></i></a>`);
        else
            $(`#a-${counter.toString()}`).attr("onclick", `showModal('${item.getAttribute('id')}','${item.getAttribute('field-type')}','${item.innerText}')`)
        counter = parseInt(counter) + 1
    });
    if (current == null) {
        current = 'preview-' + '4'
        $('#fieldLinkPreview li').each(function (i) {
            $(this).removeClass('current-active');
        });
        $(`#${current}`).addClass('current-active')
    }
    else
        current = 'preview-' + counter.toString()

    $('#fieldLinkPreview').append(`<li id="preview-${counter.toString()}" class="kkay_field_map_link">
                <div class="k_field" id='left-${counter.toString()}'> </div>
                 <i id='arrow-${counter.toString()}' class="fas fa-arrows-alt-h"></i>
                 <div id='right-${counter.toString()}' class="k_field"> </div>
                 </li>`)
    $('#fieldLinkPreview li').each(function (i) {
        $(this).removeClass('current-active');
    });
    $(`#${current}`).addClass('current-active')
}


// Javascript to enable link to tab
if (!selectedFile) {
    $('.nav a[href="#' + 'upload-file' + '"]').tab('show');
    window.location.hash = 'upload-file';
    $('html, body').animate({ scrollTop: '0px' }, 10);
}

// Change hash for page-reload
$('.nav a').on('shown.bs.tab', function (e) {
    window.location.hash = e.target.hash;
    $('html, body').animate({ scrollTop: '0px' }, 10);
})
const fields = ['number', 'text']
const showModal = function (id, type, name) {
    let options = ''
    $('#dmodal-body').empty();
    if (fields.includes(type)) {
        $('#dmodal-body').append(`
            <div class="form-group">
                <label for="smallInput">Choose a value to assign in this field</label>
                <input type="text" class="form-control form-control-sm" id="smallInput">
            </div>
        `)
    }
    console.log(id)
    if (type == 'list/record') {
        fetch(`/admin/listrecord/getByInputFieldId/${id}`).then(res => res.json()).then(({ show, values }) => {

            if (show && values) {
                values.forEach(listRecordValue => {
                    options += `<option value="${listRecordValue.label}">${listRecordValue.label}</option>`
                })
                $('#dmodal-body').append(`
                <div class="form-group">
                    <label for="exampleFormControlSelect1">Example select</label>
                    <select class="form-control" id="exampleFormControlSelect1">
                        ${options}
                    </select>
                </div>
        `)
            }
            else {
                $('#dmodal-body').append(`
                    <div id="nofield" class="mx-auto Kk_no_assigned">
                        <img class="img-responsive"
                            src="/assets/img/no_field_assigned.png">
                        <h4>No List record</h4>
                        <h6>Please attach a list to continue</h6>
                    </div>
                `)
            }
        }).catch(console.error)
    }


    $('#dmodal-default').text(' ' + name);

    $('#dmodal-body').append(``)
    $('#exampleModal').modal('show')
}

$('#fieldMappinggetObjBtn').on('click', () => {
    let data = [];
    let vendor = []
    let vendorMapped = []
    var notMappedCounter = 0
    let lists = Array.from($('#fieldLinkPreview').children())
    if (lists.length != 0) {
        if (lists[0].getAttribute('id') == 'nofield') {
            lists.shift()
            lists.pop()
        }
        lists.forEach(list => {
            if (list.getAttribute('name') != null && list.getAttribute('name').startsWith("__vendor")) {
                vendor.push(list)
            }
            let obj = {};
            let data1 = Array.from(list.children)
            obj.default = list.getAttribute('default-value')
            obj.fieldId = list.getAttribute('field-id')
            data1.forEach((child, i) => {
                if (child.nodeName == 'DIV' || child.localName == 'div') {
                    let id = child.id.split('-')
                    if (child.innerText == '' || child.innerHTML == '') {
                        notMappedCounter++
                        console.log(child);
                    }
                    if (id[0] == 'left') {
                        obj.from = child.innerText || child.innerHTML
                    } else {
                        obj.to = child.innerText || child.innerHTML
                    }

                }
            })

            data.push(obj)
        })
        if (vendor.length) {
            vendor.forEach(a => {
                let obj = {}
                let data2 = Array.from(a.children)
                obj.default = a.getAttribute('default-value')
                obj.fieldId = a.getAttribute('field-id')
                data2.forEach((child, i) => {
                    if (child.nodeName == 'DIV' || child.localName == 'div') {
                        let id = child.id.split('-')
                        if (id[0] == 'left') {
                            obj.from = child.innerText || child.innerHTML
                        } else {
                            obj.to = child.innerText || child.innerHTML
                        }

                    }
                })
                vendorMapped.push(obj)
            })
        }
        const finalData = vendorMapped.reduce((finalVal, currenctVal, currenctIndex) => {
            let index = Math.floor(currenctIndex / 5);
            if (!finalVal[index]) {
                finalVal[index] = [];
            }
            finalVal[index] = finalVal[index].concat(currenctVal);
            return finalVal;

        }, {});
        console.log(notMappedCounter, 'this is our counter');
        if (!notMappedCounter) {
            const r2 = required.map(r => r.id)
            console.log({ required });
            if (required.length === data.filter(d => r2.includes(d.fieldId)).length) {
                const formData = new FormData()
                formData.append('file', selectedFile)
                formData.append('mappingsData', JSON.stringify(data))
                formData.append('type', $('input[name="imagecheck"]:checked').val())
                formData.append('vendors', JSON.stringify(finalData))
                console.log(formData);
                fetch('/admin/importAssistant', {
                    method: 'POST',
                    body: formData
                }).then(res => res.json()).then(json => {
                    if(json.status == 200){
                        location.href = '/admin/product/all'
                    }
                    if(json.status == 400){
                        iziToast.warning({ message: json.message || 'Something Went Wrong!' })
                    }
                    else{
                        iziToast.error({message: json.message || 'Something Went Wrong!'})
                    }
                }).catch(console.error)
            }
            else {
                iziToast.warning({ message: 'One or more required fields are not Mapped', position: 'bottomCenter' })
            }
        }
        else {
            iziToast.error({ message: `${notMappedCounter} fields are not mapped remove them or map them` })
        }
    }
})


document.getElementById('defaultValueSubmitBtn').addEventListener('click', function () {
    const dmodalBody = document.getElementById('dmodal-body')
    let dv = dmodalBody.getElementsByTagName('input')[0]
    if (!dv) dv = dmodalBody.getElementsByTagName('select')[0]
    if (dv && dv.value) {
        dv = dv.value
        document.getElementById(current).setAttribute('default-value', dv)
    }
})
