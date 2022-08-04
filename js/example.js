
/*
 * Camera Buttons
 */

var CameraButtons = function (blueprint3d) {

    var orbitControls = blueprint3d.three.controls;
    var three = blueprint3d.three;

    var panSpeed = 30;
    var directions = {
        UP: 1,
        DOWN: 2,
        LEFT: 3,
        RIGHT: 4
    }

    function init() {
        // Camera controls
        $("#zoom-in").click(zoomIn);
        $("#zoom-out").click(zoomOut);
        $("#zoom-in").dblclick(preventDefault);
        $("#zoom-out").dblclick(preventDefault);

        $("#reset-background").click(three.switchBackground)

        $("#reset-view").click(three.centerCamera)

        $("#move-left").click(function () {
            pan(directions.LEFT)
        })
        $("#move-right").click(function () {
            pan(directions.RIGHT)
        })
        $("#move-up").click(function () {
            pan(directions.UP)
        })
        $("#move-down").click(function () {
            pan(directions.DOWN)
        })

        $("#move-left").dblclick(preventDefault);
        $("#move-right").dblclick(preventDefault);
        $("#move-up").dblclick(preventDefault);
        $("#move-down").dblclick(preventDefault);
    }

    function preventDefault(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function pan(direction) {
        switch (direction) {
            case directions.UP:
                orbitControls.panXY(0, panSpeed);
                break;
            case directions.DOWN:
                orbitControls.panXY(0, -panSpeed);
                break;
            case directions.LEFT:
                orbitControls.panXY(panSpeed, 0);
                break;
            case directions.RIGHT:
                orbitControls.panXY(-panSpeed, 0);
                break;
        }
    }

    function zoomIn(e) {
        e.preventDefault();
        orbitControls.dollyIn(1.1);
        orbitControls.update();
    }

    function zoomOut(e) {
        e.preventDefault;
        orbitControls.dollyOut(1.1);
        orbitControls.update();
    }

    init();
}

/*
* Context menu for selected item
*/

var ContextMenu = function (blueprint3d) {

    var scope = this;
    var selectedItem;
    var three = blueprint3d.three;

    function init() {
        $("#context-menu-delete").click(function (event) {
            selectedItem.remove();
        });
        // 生成多个重复的组件
        $("#copy-items").click(function (event) {

            var num = $("#item-number").val()
            //console.log(selectedItem)
            if (num > 50) {
                alert("数量过多")
            } else {
                for (var i = 0; i < num; i++) {
                    console.log("创建：", i);
                    var modelUrl = selectedItem.metadata.modelUrl;
                    var itemType = selectedItem.metadata.itemType;
                    var metadata = selectedItem.metadata;
                    var rotation = selectedItem.rotation;
                    var position = selectedItem.position;
                    var scale = selectedItem.scale;
                    var fixed = selectedItem.fixed;
                    blueprint3d.model.scene.addItem(
                        itemType,
                        modelUrl,
                        metadata,
                        position,
                        null,
                        scale,
                        fixed
                    );

                }
            }
        });
        three.itemSelectedCallbacks.add(itemSelected);
        three.itemUnselectedCallbacks.add(itemUnselected);

        initResize();

        $("#fixed").click(function () {
            var checked = $(this).prop('checked');
            selectedItem.setFixed(checked);
        });
    }

    function cmToIn(cm) {
        return cm;
        //   return cm / 2.54;
    }

    function inToCm(inches) {
        return inches;
        //   return inches * 2.54;
    }

    function itemSelected(item) {
        selectedItem = item;

        $("#context-menu-name").text(item.metadata.itemName);

        $("#item-width").val(cmToIn(selectedItem.getWidth()).toFixed(0));
        $("#item-height").val(cmToIn(selectedItem.getHeight()).toFixed(0));
        $("#item-depth").val(cmToIn(selectedItem.getDepth()).toFixed(0));

        $("#context-menu").show();

        //绑定位置信息
        $("#item-pos-x").val(cmToIn(selectedItem.position.x).toFixed(0));
        $("#item-pos-y").val(cmToIn(selectedItem.position.y).toFixed(0));
        $("#item-pos-z").val(cmToIn(selectedItem.position.z).toFixed(0));
        $("#item-jiaodu").val(selectedItem.rotation._y);

        $("#fixed").prop('checked', item.fixed);
    }

    function resize() {
        selectedItem.resize(
            inToCm($("#item-height").val()),
            inToCm($("#item-width").val()),
            inToCm($("#item-depth").val())
        );
    }

    function initResize() {
        $("#item-height").change(resize);
        $("#item-width").change(resize);
        $("#item-depth").change(resize);
    }

    function itemUnselected() {
        selectedItem = null;
        $("#context-menu").hide();
    }

    init();
}

/*
* Loading modal for items
*/

var ModalEffects = function (blueprint3d) {

    var scope = this;
    var blueprint3d = blueprint3d;
    var itemsLoading = 0;

    this.setActiveItem = function (active) {
        itemSelected = active;
        update();
    }

    function update() {
        if (itemsLoading > 0) {
            $("#loading-modal").show();
        } else {
            $("#loading-modal").hide();
        }
    }

    function init() {
        blueprint3d.model.scene.itemLoadingCallbacks.add(function () {
            itemsLoading += 1;
            update();
        });

        blueprint3d.model.scene.itemLoadedCallbacks.add(function () {
            itemsLoading -= 1;
            update();
        });

        update();
    }

    init();
}

/*
* Side menu
*/

var SideMenu = function (blueprint3d, floorplanControls, modalEffects) {
    var blueprint3d = blueprint3d;
    var floorplanControls = floorplanControls;
    var modalEffects = modalEffects;

    var ACTIVE_CLASS = "active";

    var tabs = {
        "FLOORPLAN": $("#floorplan_tab"),
        "SHOP": $("#items_tab"),
        "DESIGN": $("#design_tab")
    }

    var scope = this;
    this.stateChangeCallbacks = $.Callbacks();

    this.states = {
        "DEFAULT": {
            "div": $("#viewer"),
            "tab": tabs.DESIGN
        },
        "FLOORPLAN": {
            "div": $("#floorplanner"),
            "tab": tabs.FLOORPLAN
        },
        "SHOP": {
            "div": $("#add-items"),
            "tab": tabs.SHOP
        }
    }

    // sidebar state
    var currentState = scope.states.FLOORPLAN;

    function init() {
        for (var tab in tabs) {
            var elem = tabs[tab];
            elem.click(tabClicked(elem));
        }

        $("#update-floorplan").click(floorplanUpdate);

        initLeftMenu();

        blueprint3d.three.updateWindowSize();
        handleWindowResize();

        initItems();

        setCurrentState(scope.states.DEFAULT);
    }

    function floorplanUpdate() {
        setCurrentState(scope.states.DEFAULT);
    }

    function tabClicked(tab) {
        return function () {
            // Stop three from spinning
            blueprint3d.three.stopSpin();

            // Selected a new tab
            for (var key in scope.states) {
                var state = scope.states[key];
                if (state.tab == tab) {
                    setCurrentState(state);
                    break;
                }
            }
        }
    }

    function setCurrentState(newState) {

        if (currentState == newState) {
            return;
        }

        // show the right tab as active
        if (currentState.tab !== newState.tab) {
            if (currentState.tab != null) {
                currentState.tab.removeClass(ACTIVE_CLASS);
            }
            if (newState.tab != null) {
                newState.tab.addClass(ACTIVE_CLASS);
            }
        }

        // set item unselected
        blueprint3d.three.getController().setSelectedObject(null);

        // show and hide the right divs
        currentState.div.hide()
        newState.div.show()

        // custom actions
        if (newState == scope.states.FLOORPLAN) {
            floorplanControls.updateFloorplanView();
            floorplanControls.handleWindowResize();
        }

        if (currentState == scope.states.FLOORPLAN) {
            blueprint3d.model.floorplan.update();
        }

        if (newState == scope.states.DEFAULT) {
            blueprint3d.three.updateWindowSize();
        }

        // set new state
        handleWindowResize();
        currentState = newState;

        scope.stateChangeCallbacks.fire(newState);
    }

    function initLeftMenu() {
        $(window).resize(handleWindowResize);
        handleWindowResize();
    }

    function handleWindowResize() {
        $(".sidebar").height(window.innerHeight);
        $("#add-items").height(window.innerHeight);

    };

    // TODO: 鼠标点击增加家具
    function initItems() {
        $("#add-items").find(".add-item").mousedown(function (e) {
            var modelUrl = $(this).attr("model-url");
            var itemType = parseInt($(this).attr("model-type"));
            var specific_type = $(this).attr("model-specific-type");
            var metadata = {
                itemName: $(this).attr("model-name"),
                resizable: true,
                modelUrl: modelUrl,
                itemType: itemType,
                specific_type: specific_type
            }
            blueprint3d.model.scene.addItem(itemType, modelUrl, metadata);
            setCurrentState(scope.states.DEFAULT);
        });
    }

    init();

}

/*
* Change floor and wall textures
*/

var TextureSelector = function (blueprint3d, sideMenu) {

    var scope = this;
    var three = blueprint3d.three;
    var isAdmin = isAdmin;

    var currentTarget = null;

    function initTextureSelectors() {
        $(".texture-select-thumbnail").click(function (e) {
            var textureUrl = $(this).attr("texture-url");
            var textureStretch = ($(this).attr("texture-stretch") == "true");
            var textureScale = parseInt($(this).attr("texture-scale"));
            currentTarget.setTexture(textureUrl, textureStretch, textureScale);

            e.preventDefault();
        });
    }

    function init() {
        three.wallClicked.add(wallClicked);
        three.floorClicked.add(floorClicked);
        three.itemSelectedCallbacks.add(reset);
        three.nothingClicked.add(reset);
        sideMenu.stateChangeCallbacks.add(reset);
        initTextureSelectors();
    }

    function wallClicked(halfEdge) {
        currentTarget = halfEdge;
        $("#floorTexturesDiv").hide();
        $("#wallTextures").show();
    }

    function floorClicked(room) {
        currentTarget = room;
        $("#wallTextures").hide();
        $("#floorTexturesDiv").show();
    }

    function reset() {
        $("#wallTextures").hide();
        $("#floorTexturesDiv").hide();
    }

    init();
}

/*
* Floorplanner controls
*/

var ViewerFloorplanner = function (blueprint3d) {

    var canvasWrapper = '#floorplanner';

    // buttons
    var move = '#move';
    var remove = '#delete';
    var draw = '#draw';

    var activeStlye = 'btn-primary disabled';

    this.floorplanner = blueprint3d.floorplanner;

    var scope = this;

    function init() {

        $(window).resize(scope.handleWindowResize);
        scope.handleWindowResize();

        // mode buttons
        scope.floorplanner.modeResetCallbacks.add(function (mode) {
            $(draw).removeClass(activeStlye);
            $(remove).removeClass(activeStlye);
            $(move).removeClass(activeStlye);
            if (mode == scope.floorplanner.modes.MOVE) {
                $(move).addClass(activeStlye);
            } else if (mode == scope.floorplanner.modes.DRAW) {
                $(draw).addClass(activeStlye);
            } else if (mode == scope.floorplanner.modes.DELETE) {
                $(remove).addClass(activeStlye);
            }

            if (mode == scope.floorplanner.modes.DRAW) {
                $("#draw-walls-hint").show();
                scope.handleWindowResize();
            } else {
                $("#draw-walls-hint").hide();
            }
        });

        $(move).click(function () {
            scope.floorplanner.setMode(scope.floorplanner.modes.MOVE);
        });

        $(draw).click(function () {
            scope.floorplanner.setMode(scope.floorplanner.modes.DRAW);
        });

        $(remove).click(function () {
            scope.floorplanner.setMode(scope.floorplanner.modes.DELETE);
        });
    }

    this.updateFloorplanView = function () {
        scope.floorplanner.reset();
    }

    this.handleWindowResize = function () {
        $(canvasWrapper).height(window.innerHeight - $(canvasWrapper).offset().top);
        scope.floorplanner.resizeView();
    };

    init();
};

var mainControls = function (blueprint3d) {
    var blueprint3d = blueprint3d;

    function newDesign() {
        blueprint3d.model.loadSerialized('{"floorplan":{"corners":{"f90da5e3-9e0e-eba7-173d-eb0b071e838e":{"x":200,"y":400},"da026c08-d76a-a944-8e7b-096b752da9ed":{"x":800,"y":400},"4e3d65cb-54c0-0681-28bf-bddcc7bdb571":{"x":800,"y":-400},"71d4f128-ae80-3d58-9bd2-711c6ce6cdf2":{"x":200,"y":-400}},"walls":[{"corner1":"71d4f128-ae80-3d58-9bd2-711c6ce6cdf2","corner2":"f90da5e3-9e0e-eba7-173d-eb0b071e838e","frontTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0},"backTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0}},{"corner1":"f90da5e3-9e0e-eba7-173d-eb0b071e838e","corner2":"da026c08-d76a-a944-8e7b-096b752da9ed","frontTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0},"backTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0}},{"corner1":"da026c08-d76a-a944-8e7b-096b752da9ed","corner2":"4e3d65cb-54c0-0681-28bf-bddcc7bdb571","frontTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0},"backTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0}},{"corner1":"4e3d65cb-54c0-0681-28bf-bddcc7bdb571","corner2":"71d4f128-ae80-3d58-9bd2-711c6ce6cdf2","frontTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0},"backTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0}}],"wallTextures":[],"floorTextures":{},"newFloorTextures":{}},"items":[]}');
    }

    function loadClassroom() {
        blueprint3d.model.loadSerialized('{"floorplan":{"corners":{"f90da5e3-9e0e-eba7-173d-eb0b071e838e":{"x":200,"y":418.28800000000024},"da026c08-d76a-a944-8e7b-096b752da9ed":{"x":810.1600000000002,"y":418.28800000000024},"4e3d65cb-54c0-0681-28bf-bddcc7bdb571":{"x":810.1600000000002,"y":-400},"71d4f128-ae80-3d58-9bd2-711c6ce6cdf2":{"x":200,"y":-400}},"walls":[{"corner1":"71d4f128-ae80-3d58-9bd2-711c6ce6cdf2","corner2":"f90da5e3-9e0e-eba7-173d-eb0b071e838e","frontTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0},"backTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0}},{"corner1":"f90da5e3-9e0e-eba7-173d-eb0b071e838e","corner2":"da026c08-d76a-a944-8e7b-096b752da9ed","frontTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0},"backTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0}},{"corner1":"da026c08-d76a-a944-8e7b-096b752da9ed","corner2":"4e3d65cb-54c0-0681-28bf-bddcc7bdb571","frontTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0},"backTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0}},{"corner1":"4e3d65cb-54c0-0681-28bf-bddcc7bdb571","corner2":"71d4f128-ae80-3d58-9bd2-711c6ce6cdf2","frontTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0},"backTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0}}],"wallTextures":[],"floorTextures":{},"newFloorTextures":{}},"items":[{"item_name":"窗户","item_type":3,"model_url":"models/js/whitewindow.js","xpos":809.6599731445312,"ypos":163.37712362111023,"zpos":149.12958919813138,"rotation":-1.5707963267948966,"scale_x":1,"scale_y":1,"scale_z":1,"fixed":false},{"item_name":"黑板","item_type":2,"model_url":"models/js/blackboard2.js","xpos":508.1228252312917,"ypos":155.2709053926249,"zpos":-393.0769230769231,"rotation":0,"scale_x":1,"scale_y":1,"scale_z":1,"fixed":false},{"item_name":"窗户","item_type":3,"model_url":"models/js/whitewindow.js","xpos":809.6599731445312,"ypos":163.7635217948718,"zpos":-85.30711981943,"rotation":-1.5707963267948966,"scale_x":1,"scale_y":1,"scale_z":1,"fixed":false},{"item_name":"门-关","item_type":7,"model_url":"models/js/closed-door28x80_baked.js","xpos":809.6599731445312,"ypos":110.80000022010701,"zpos":327.55075645415377,"rotation":-1.5707963267948966,"scale_x":1,"scale_y":1,"scale_z":1,"fixed":false},{"item_name":"窗户","item_type":3,"model_url":"models/js/whitewindow.js","xpos":200.50000000000003,"ypos":163.7635217948718,"zpos":155.9076782123259,"rotation":1.5707963267948966,"scale_x":1,"scale_y":1,"scale_z":1,"fixed":false},{"item_name":"窗户","item_type":3,"model_url":"models/js/whitewindow.js","xpos":200.50000000000003,"ypos":163.7635217948718,"zpos":-103.37425833344207,"rotation":1.5707963267948966,"scale_x":1,"scale_y":1,"scale_z":1,"fixed":false},{"item_name":"门-关","item_type":7,"model_url":"models/js/closed-door28x80_baked.js","xpos":809.6599731445312,"ypos":110.80000022010701,"zpos":-308.4163023508788,"rotation":-1.5707963267948966,"scale_x":1,"scale_y":1,"scale_z":1,"fixed":false}]}');
    }

    function loadDesign() {
        files = $("#loadFile").get(0).files;
        var reader = new FileReader();
        reader.onload = function (event) {
            var data = event.target.result;
            blueprint3d.model.loadSerialized(data);
        }
        reader.readAsText(files[0]);
    }

    function saveDesign() {
        var data = blueprint3d.model.exportSerialized();
        var a = window.document.createElement('a');
        var blob = new Blob([data], { type: 'text' });
        a.href = window.URL.createObjectURL(blob);
        a.download = 'design.layout3d';
        document.body.appendChild(a)
        a.click();
        document.body.removeChild(a)
    }

    // 自动布局按钮
    function autoLayout() {
        console.log('========开始布局=========');
        var data = blueprint3d.model.exportSerialized();
        data = JSON.parse(data);
        console.log(data);

        // 先找到所有的物体
        var desks = new Array();
        var kongtiao = new Array();
        var deskLab = new Array();
        var stool = new Array();
        var bed = new Array();
        var chair = new Array();

        // 记下物体的序号
        var desk_index = new Array();
        var kongtiao_index = new Array();
        var deskLab_index = new Array();
        var stool_index = new Array();
        var bed_index = new Array();
        var chair_index = new Array();

        // 空调长宽
        // var kongtiao_l = 52;
        // var kongtiao_w = 32;

        for (i in data.items) {
            if (data.items[i].item_name == "课桌") {
                desks.push(data.items[i]);
                desk_index.push(i);
                var desk_l = desks[0].width;
                var desk_w = desks[0].depth;
            }
            if (data.items[i].item_name == "课桌_实验室") {
                deskLab.push(data.items[i]);
                deskLab_index.push(i);
                var deskLab_l = deskLab[0].width;
                var deskLab_w = deskLab[0].depth;
            }
            if (data.items[i].item_name == "凳子_实验室") {
                stool.push(data.items[i]);
                stool_index.push(i);
                var stool_l = stool[0].width;
                var stool_w = stool[0].depth;
            }
            if (data.items[i].item_name == "床_宿舍") {
                bed.push(data.items[i]);
                bed_index.push(i);
                var bed_l = bed[0].depth;
                var bed_w = bed[0].width;
            }
            if (data.items[i].item_name == "椅子_宿舍") {
                chair.push(data.items[i]);
                chair_index.push(i);
                var chair_l = chair[0].depth;
                var chair_w = chair[0].width;
            }
        }

        // 缩放    
        // var scale_x = desks[0].scale_x;
        // var scale_z = desks[0].scale_z;

        // console.log(desks);
        var res = blueprint3d.model.floorplan.getBasePointAndSize();
        console.log("res：", res);

        for (k in data.items) {
            if (data.items[k].item_name == "课桌") {
                var poslist = deskMatrixLayout(res.length_x, res.length_z, desk_l, desk_w, desks.length);
                // 按照poslist更改data中的数据
                for (i in desk_index) {
                    data.items[desk_index[i]].xpos = res.base_x + poslist[i].x;
                    data.items[desk_index[i]].zpos = res.base_z + poslist[i].y;
                    data.items[desk_index[i]].rotation = Math.PI;
                }
                break;
            }

            if (data.items[k].item_name == "课桌_实验室") {
                var poslist = deskLabMatrixLayout(
                    res.length_x, res.length_z, deskLab_l, deskLab_w, deskLab.length);
                for (ii in deskLab_index) {
                    data.items[deskLab_index[ii]].xpos = res.base_x + poslist[ii].x;
                    data.items[deskLab_index[ii]].zpos = res.base_z + poslist[ii].y;
                    data.items[deskLab_index[ii]].ypos = res.base_z + poslist[ii].y;
                    data.items[deskLab_index[ii]].rotation = 0;
                } break;
            }


            if (data.items[k].item_name == "床_宿舍") {
                var poslist = bedMatrixLayout(res.length_x, res.length_z, bed_l, bed_w, bed.length);
                for (i in bed_index) {
                    data.items[bed_index[i]].xpos = res.base_x + poslist[i].x;
                    data.items[bed_index[i]].zpos = res.base_z + poslist[i].y;
                    if (i % 2 == 1)
                        data.items[bed_index[i]].rotation = - Math.PI / 2;
                    else
                        data.items[bed_index[i]].rotation = Math.PI / 2;
                }
            }
        }



        for (k in data.items) {
            if (data.items[k].item_name == "凳子_实验室") {

                var poslist = deskLabMatrixLayout(res.length_x, res.length_z, deskLab_l, deskLab_w, deskLab.length);
                var n = 0;
                var m = 0;
                var b = 0;
                for (j in stool_index) {
                    n = m / 4;
                    b = parseInt(n)
                    if (m % 4 == 0) {
                        data.items[stool_index[j]].xpos = data.items[deskLab_index[b]].xpos - 0.5 * (deskLab_l + stool_l);
                        data.items[stool_index[j]].zpos = data.items[deskLab_index[b]].zpos - 0.25 * 3 / 5 * (deskLab_w + stool_w);
                    }

                    if (m % 4 == 1) {
                        data.items[stool_index[j]].xpos = data.items[deskLab_index[b]].xpos - 0.5 * (deskLab_l + stool_l);
                        data.items[stool_index[j]].zpos = data.items[deskLab_index[b]].zpos + 0.25 * 3 / 5 * (deskLab_w + stool_w);
                    }
                    if (m % 4 == 2) {
                        data.items[stool_index[j]].xpos = data.items[deskLab_index[b]].xpos + 0.5 * (deskLab_l + stool_l);
                        data.items[stool_index[j]].zpos = data.items[deskLab_index[b]].zpos - 0.25 * 3 / 5 * (deskLab_w + stool_w);
                    }
                    if (m % 4 == 3) {
                        data.items[stool_index[j]].xpos = data.items[deskLab_index[b]].xpos + 0.5 * (deskLab_l + stool_l);
                        data.items[stool_index[j]].zpos = data.items[deskLab_index[b]].zpos + 0.25 * 3 / 5 * (deskLab_w + stool_w);
                    }
                    m++;
                }
            }
        }
        for (k in data.items) {
            if (data.items[k].item_name == "椅子_宿舍") {

                var poslist = bedMatrixLayout(res.length_x, res.length_z, bed_l, bed_w, bed.length);
                var n = 0;
                var m = 0;
                var b = 0;
                for (j in chair_index) {
                    n = m / 2;
                    b = parseInt(n)
                    if (m % 2 == 0) {
                        if (data.items[bed_index[b]].rotation == Math.PI / 2) {
                            data.items[chair_index[j]].xpos = data.items[bed_index[b]].xpos + 0.5 * (bed_l + chair_l);
                            data.items[chair_index[j]].zpos = data.items[bed_index[b]].zpos - 0.25 * 1 / 2 * (bed_w + chair_w);
                            data.items[chair_index[j]].rotation = - Math.PI / 2
                        }
                        if(data.items[bed_index[b]].rotation == - Math.PI / 2){
                            data.items[chair_index[j]].xpos = data.items[bed_index[b]].xpos - 0.5 * (bed_l + chair_l);
                            data.items[chair_index[j]].zpos = data.items[bed_index[b]].zpos - 0.25 * 1 / 2 * (bed_w + chair_w);
                            data.items[chair_index[j]].rotation = Math.PI / 2
                        }
                    }
                    if (m % 2 == 1) {
                        if (data.items[bed_index[b]].rotation == Math.PI / 2) {
                            data.items[chair_index[j]].xpos = data.items[bed_index[b]].xpos + 0.5 * (bed_l + chair_l);
                            data.items[chair_index[j]].zpos = data.items[bed_index[b]].zpos + 0.25 * 1 / 2 * (bed_w + chair_w);
                            data.items[chair_index[j]].rotation = - Math.PI / 2
                        }
                        if(data.items[bed_index[b]].rotation == - Math.PI / 2){
                            data.items[chair_index[j]].xpos = data.items[bed_index[b]].xpos - 0.5 * (bed_l + chair_l);
                            data.items[chair_index[j]].zpos = data.items[bed_index[b]].zpos + 0.25 * 1 / 2 * (bed_w + chair_w);
                            data.items[chair_index[j]].rotation = Math.PI / 2
                        }
                    }
                    m++;
                }
            }
        }

        for (i in data.items) {
            if (data.items[i].item_name == "空调") {
                kongtiao.push(data.items[i]);
                kongtiao_index.push(i);
                var kongtiao_l = kongtiao[0].depth;
                var kongtiao_w = kongtiao[0].width;
            }
        }
        var poslist1 = ktMatrixLayout(res.length_x, res.length_z, kongtiao_l, kongtiao_w, kongtiao.length);
        console.log(poslist)
        for (i in kongtiao_index) {
            data.items[kongtiao_index[i]].xpos = res.base_x + poslist1[i].x;
            data.items[kongtiao_index[i]].zpos = res.base_z + poslist1[i].y;
            data.items[kongtiao_index[i]].rotation = Math.atan(res.length_z / res.length_x) + Math.PI / 2;
        }

        blueprint3d.model.loadSerialized(JSON.stringify(data));



        // function autoLayout() {
        //     console.log('========开始布局=========');
        //     var data = blueprint3d.model.exportSerialized();
        //     data = JSON.parse(data); 

        //     var wallDepth = 10;
        //     var size =10;
        //     var _corners = new Array();
        //     var ccc = data.floorplan.corners;
        //     var roomData = {};

        //     var maxx=-1*Infinity;
        //     var minx=Infinity;
        //     var maxy=-1*Infinity;
        //     var miny=Infinity;

        //     for (var p in ccc) {
        //         _corners.push(ccc[p]);
        //         maxx = Math.max(maxx,ccc[p].x);
        //         minx = Math.min(minx,ccc[p].x);
        //         maxy = Math.max(maxy,ccc[p].y);
        //         miny = Math.min(miny,ccc[p].y);
        //     }
        //     var _cx=_corners[3].x, _cy= _corners[3].y;
        //     roomData.w = Math.abs(_corners[0].x - _corners[1].x) - wallDepth;
        //     roomData.h = Math.abs(_corners[3].y - _corners[1].y) - wallDepth;
        //     roomData.w/=size;
        //     roomData.h/=size;
        //     roomData.doors = [];
        //     roomData.windows = [];
        //     roomData.furnitures = [];

        // for (var i = 0; i < data.items.length; i++) {
        //     var it = data.items[i];
        //     if (it.special_type == furnitureType.door || it.special_type == furnitureType.window) {

        //         var tobj = {type:it.special_type,w: it.width, h: it.depth,vh:it.height,side: (it.rotation / (Math.PI / 2)+4)%4, cx: it.xpos - _cx , cy: it.zpos- _cy };
        //         tobj.cx/=size;
        //         tobj.cy/=size;
        //         tobj.w/=size;
        //         tobj.h/=size;
        //         if(it.special_type == furnitureType.door)
        //         {
        //             roomData.doors.push(tobj);
        //         }

        //         if (it.special_type == furnitureType.window)
        //         {
        //             roomData.windows.push(tobj);
        //         }
        //     }
        //     else {
        //         var tobj = {w: it.width, h: it.depth,vh:it.height, type: it.item_type};
        //         tobj.w/=size;
        //         tobj.h/=size;
        //         tobj.id = i;
        //         if (it.item_type == furnitureType.desk || it.item_type == furnitureType.bed || it.item_type == furnitureType.bedstand ||
        //             it.item_type == furnitureType.tvstand || it.item_type == furnitureType.dressingtable ||
        //             it.item_type == furnitureType.wardrobe || it.item_type == furnitureType.secretaire|| it.item_type == furnitureType.sofa ) {
        //             tobj.needSideWall = 1;

        //         }
        //         else  tobj.needSideWall = 0;
        //         roomData.furnitures.push(tobj);
        //     }
        // }

        // var ii=JSON.stringify(roomData);
        // var room = initRoom(roomData);
        // room = arrangeRoom(room);
        // for(var i=0;i<room.furnitures.length;i++){
        //     var f = room.furnitures[i];
        //     data.items[f.id]. rotation = (f.deriction+2*(f.deriction%2==0 ? 1:0))*Math.PI/2;
        //     data.items[f.id]. xpos = f.cx*size + _cx;
        //     data.items[f.id]. zpos = f.cy*size + _cy;
        //     if(data.items[f.id]. zpos- f.h*size/2-wallDepth<miny)
        //         data.items[f.id]. zpos = miny+f.h*size/2+wallDepth;
        //     if(data.items[f.id]. zpos+ f.h*size/2+wallDepth>maxy)
        //         data.items[f.id]. zpos = maxy-f.h*size/2-wallDepth;

        //     if(data.items[f.id]. xpos- f.w*size/2-wallDepth<minx)
        //         data.items[f.id]. xpos = minx+f.w*size/2+wallDepth;
        //     if(data.items[f.id]. xpos+ f.w*size/2+wallDepth>maxx)
        //         data.items[f.id]. xpos =maxx-f.w*size/2-wallDepth;
        // }

        // blueprint3d.model.loadSerialized(JSON.stringify(data));
    }

    function init() {
        $("#new").click(newDesign);
        $('#loadClassroom').click(loadClassroom);
        $("#saveFile").click(saveDesign);
        $("#loadFile").change(loadDesign);
        $("#autolayout").click(autoLayout);
    }

    init();
}

/*
* Initialize!
*/

$(document).ready(function () {

    // main setup
    var opts = {
        floorplannerElement: 'floorplanner-canvas',
        threeElement: '#viewer',
        threeCanvasElement: 'three-canvas',
        textureDir: "models/textures/",
        widget: false
    }
    var blueprint3d = new Blueprint3d(opts);

    var modalEffects = new ModalEffects(blueprint3d);
    var viewerFloorplanner = new ViewerFloorplanner(blueprint3d);
    var contextMenu = new ContextMenu(blueprint3d);
    var sideMenu = new SideMenu(blueprint3d, viewerFloorplanner, modalEffects);
    var textureSelector = new TextureSelector(blueprint3d, sideMenu);
    var cameraButtons = new CameraButtons(blueprint3d);
    mainControls(blueprint3d);

    // This serialization format needs work
    // Load a simple rectangle room
    blueprint3d.model.loadSerialized('{"floorplan":{"corners":{"f90da5e3-9e0e-eba7-173d-eb0b071e838e":{"x":200,"y":418.28800000000024},"da026c08-d76a-a944-8e7b-096b752da9ed":{"x":810.1600000000002,"y":418.28800000000024},"4e3d65cb-54c0-0681-28bf-bddcc7bdb571":{"x":810.1600000000002,"y":-400},"71d4f128-ae80-3d58-9bd2-711c6ce6cdf2":{"x":200,"y":-400}},"walls":[{"corner1":"71d4f128-ae80-3d58-9bd2-711c6ce6cdf2","corner2":"f90da5e3-9e0e-eba7-173d-eb0b071e838e","frontTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0},"backTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0}},{"corner1":"f90da5e3-9e0e-eba7-173d-eb0b071e838e","corner2":"da026c08-d76a-a944-8e7b-096b752da9ed","frontTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0},"backTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0}},{"corner1":"da026c08-d76a-a944-8e7b-096b752da9ed","corner2":"4e3d65cb-54c0-0681-28bf-bddcc7bdb571","frontTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0},"backTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0}},{"corner1":"4e3d65cb-54c0-0681-28bf-bddcc7bdb571","corner2":"71d4f128-ae80-3d58-9bd2-711c6ce6cdf2","frontTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0},"backTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0}}],"wallTextures":[],"floorTextures":{},"newFloorTextures":{}},"items":[{"item_name":"课桌","item_type":1,"model_url":"models/js/desk.js","xpos":237,"ypos":36.89909999999999,"zpos":-185,"rotation":3.141592653589793,"scale_x":1,"scale_y":1,"scale_z":1,"fixed":false},{"item_name":"窗户","item_type":3,"model_url":"models/js/whitewindow.js","xpos":809.6599731445312,"ypos":163.7635217948718,"zpos":-85.30711981943,"rotation":-1.5707963267948966,"scale_x":1,"scale_y":1,"scale_z":1,"fixed":false},{"item_name":"课桌","item_type":1,"model_url":"models/js/desk.js","xpos":344.232,"ypos":36.89909999999999,"zpos":-185,"rotation":3.141592653589793,"scale_x":1,"scale_y":1,"scale_z":1,"fixed":false},{"item_name":"窗户","item_type":3,"model_url":"models/js/whitewindow.js","xpos":809.6599731445312,"ypos":163.37712362111023,"zpos":149.12958919813138,"rotation":-1.5707963267948966,"scale_x":1,"scale_y":1,"scale_z":1,"fixed":false},{"item_name":"课桌","item_type":1,"model_url":"models/js/desk.js","xpos":451.46400000000006,"ypos":36.89909999999999,"zpos":-185,"rotation":3.141592653589793,"scale_x":1,"scale_y":1,"scale_z":1,"fixed":false},{"item_name":"课桌","item_type":1,"model_url":"models/js/desk.js","xpos":558.6960000000001,"ypos":36.89909999999999,"zpos":-185,"rotation":3.141592653589793,"scale_x":1,"scale_y":1,"scale_z":1,"fixed":false},{"item_name":"黑板","item_type":2,"model_url":"models/js/blackboard2.js","xpos":508.1228252312917,"ypos":155.2709053926249,"zpos":-393.0769230769231,"rotation":0,"scale_x":1,"scale_y":1,"scale_z":1,"fixed":false},{"item_name":"门-关","item_type":7,"model_url":"models/js/closed-door28x80_baked.js","xpos":809.6599731445312,"ypos":110.80000022010701,"zpos":-308.4163023508788,"rotation":-1.5707963267948966,"scale_x":1,"scale_y":1,"scale_z":1,"fixed":false},{"item_name":"窗户","item_type":3,"model_url":"models/js/whitewindow.js","xpos":200.50000000000003,"ypos":163.7635217948718,"zpos":155.9076782123259,"rotation":1.5707963267948966,"scale_x":1,"scale_y":1,"scale_z":1,"fixed":false},{"item_name":"窗户","item_type":3,"model_url":"models/js/whitewindow.js","xpos":200.50000000000003,"ypos":163.7635217948718,"zpos":-103.37425833344207,"rotation":1.5707963267948966,"scale_x":1,"scale_y":1,"scale_z":1,"fixed":false},{"item_name":"课桌","item_type":1,"model_url":"models/js/desk.js","xpos":237,"ypos":36.89909999999999,"zpos":-80,"rotation":3.141592653589793,"scale_x":1,"scale_y":1,"scale_z":1,"fixed":false},{"item_name":"课桌","item_type":1,"model_url":"models/js/desk.js","xpos":344.232,"ypos":36.89909999999999,"zpos":-80,"rotation":3.141592653589793,"scale_x":1,"scale_y":1,"scale_z":1,"fixed":false},{"item_name":"门-关","item_type":7,"model_url":"models/js/closed-door28x80_baked.js","xpos":809.6599731445312,"ypos":110.80000022010701,"zpos":327.55075645415377,"rotation":-1.5707963267948966,"scale_x":1,"scale_y":1,"scale_z":1,"fixed":false},{"item_name":"课桌","item_type":1,"model_url":"models/js/desk.js","xpos":665.9280000000001,"ypos":36.89909999999999,"zpos":-185,"rotation":3.141592653589793,"scale_x":1,"scale_y":1,"scale_z":1,"fixed":false},{"item_name":"课桌","item_type":1,"model_url":"models/js/desk.js","xpos":451.46400000000006,"ypos":36.89909999999999,"zpos":-80,"rotation":3.141592653589793,"scale_x":1,"scale_y":1,"scale_z":1,"fixed":false},{"item_name":"课桌","item_type":1,"model_url":"models/js/desk.js","xpos":773.1600000000002,"ypos":36.89909999999999,"zpos":-185,"rotation":3.141592653589793,"scale_x":1,"scale_y":1,"scale_z":1,"fixed":false},{"item_name":"课桌","item_type":1,"model_url":"models/js/desk.js","xpos":558.6960000000001,"ypos":36.89909999999999,"zpos":-80,"rotation":3.141592653589793,"scale_x":1,"scale_y":1,"scale_z":1,"fixed":false},{"item_name":"课桌","item_type":1,"model_url":"models/js/desk.js","xpos":665.9280000000001,"ypos":36.89909999999999,"zpos":-80,"rotation":3.141592653589793,"scale_x":1,"scale_y":1,"scale_z":1,"fixed":false},{"item_name":"课桌","item_type":1,"model_url":"models/js/desk.js","xpos":773.1600000000002,"ypos":36.89909999999999,"zpos":-80,"rotation":3.141592653589793,"scale_x":1,"scale_y":1,"scale_z":1,"fixed":false},{"item_name":"课桌","item_type":1,"model_url":"models/js/desk.js","xpos":237,"ypos":36.89909999999999,"zpos":25,"rotation":3.141592653589793,"scale_x":1,"scale_y":1,"scale_z":1,"fixed":false},{"item_name":"课桌","item_type":1,"model_url":"models/js/desk.js","xpos":344.232,"ypos":36.89909999999999,"zpos":25,"rotation":3.141592653589793,"scale_x":1,"scale_y":1,"scale_z":1,"fixed":false},{"item_name":"课桌","item_type":1,"model_url":"models/js/desk.js","xpos":451.46400000000006,"ypos":36.89909999999999,"zpos":25,"rotation":3.141592653589793,"scale_x":1,"scale_y":1,"scale_z":1,"fixed":false},{"item_name":"课桌","item_type":1,"model_url":"models/js/desk.js","xpos":558.6960000000001,"ypos":36.89909999999999,"zpos":25,"rotation":3.141592653589793,"scale_x":1,"scale_y":1,"scale_z":1,"fixed":false},{"item_name":"课桌","item_type":1,"model_url":"models/js/desk.js","xpos":665.9280000000001,"ypos":36.89909999999999,"zpos":25,"rotation":3.141592653589793,"scale_x":1,"scale_y":1,"scale_z":1,"fixed":false},{"item_name":"课桌","item_type":1,"model_url":"models/js/desk.js","xpos":773.1600000000002,"ypos":36.89909999999999,"zpos":25,"rotation":3.141592653589793,"scale_x":1,"scale_y":1,"scale_z":1,"fixed":false},{"item_name":"课桌","item_type":1,"model_url":"models/js/desk.js","xpos":237,"ypos":36.89909999999999,"zpos":130,"rotation":3.141592653589793,"scale_x":1,"scale_y":1,"scale_z":1,"fixed":false},{"item_name":"课桌","item_type":1,"model_url":"models/js/desk.js","xpos":344.232,"ypos":36.89909999999999,"zpos":130,"rotation":3.141592653589793,"scale_x":1,"scale_y":1,"scale_z":1,"fixed":false},{"item_name":"课桌","item_type":1,"model_url":"models/js/desk.js","xpos":451.46400000000006,"ypos":36.89909999999999,"zpos":130,"rotation":3.141592653589793,"scale_x":1,"scale_y":1,"scale_z":1,"fixed":false},{"item_name":"课桌","item_type":1,"model_url":"models/js/desk.js","xpos":558.6960000000001,"ypos":36.89909999999999,"zpos":130,"rotation":3.141592653589793,"scale_x":1,"scale_y":1,"scale_z":1,"fixed":false},{"item_name":"课桌","item_type":1,"model_url":"models/js/desk.js","xpos":665.9280000000001,"ypos":36.89909999999999,"zpos":130,"rotation":3.141592653589793,"scale_x":1,"scale_y":1,"scale_z":1,"fixed":false},{"item_name":"课桌","item_type":1,"model_url":"models/js/desk.js","xpos":773.1600000000002,"ypos":36.89909999999999,"zpos":130,"rotation":3.141592653589793,"scale_x":1,"scale_y":1,"scale_z":1,"fixed":false},{"item_name":"课桌","item_type":1,"model_url":"models/js/desk.js","xpos":237,"ypos":36.89909999999999,"zpos":235,"rotation":3.141592653589793,"scale_x":1,"scale_y":1,"scale_z":1,"fixed":false},{"item_name":"课桌","item_type":1,"model_url":"models/js/desk.js","xpos":344.232,"ypos":36.89909999999999,"zpos":235,"rotation":3.141592653589793,"scale_x":1,"scale_y":1,"scale_z":1,"fixed":false},{"item_name":"课桌","item_type":1,"model_url":"models/js/desk.js","xpos":451.46400000000006,"ypos":36.89909999999999,"zpos":235,"rotation":3.141592653589793,"scale_x":1,"scale_y":1,"scale_z":1,"fixed":false},{"item_name":"课桌","item_type":1,"model_url":"models/js/desk.js","xpos":558.6960000000001,"ypos":36.89909999999999,"zpos":235,"rotation":3.141592653589793,"scale_x":1,"scale_y":1,"scale_z":1,"fixed":false},{"item_name":"课桌","item_type":1,"model_url":"models/js/desk.js","xpos":665.9280000000001,"ypos":36.89909999999999,"zpos":235,"rotation":3.141592653589793,"scale_x":1,"scale_y":1,"scale_z":1,"fixed":false},{"item_name":"课桌","item_type":1,"model_url":"models/js/desk.js","xpos":773.1600000000002,"ypos":36.89909999999999,"zpos":235,"rotation":3.141592653589793,"scale_x":1,"scale_y":1,"scale_z":1,"fixed":false},{"item_name":"落地黑板","item_type":1,"model_url":"models/js/blackboard.js","xpos":261.4043771704685,"ypos":67.14970000000001,"zpos":-334.05453574567616,"rotation":0.5418251888431542,"scale_x":1,"scale_y":1,"scale_z":1,"fixed":false},{"item_name":"空调","item_type":1,"model_url":"models/js/kongtiao.js","xpos":244.56749637552588,"ypos":92.223419,"zpos":365.9040833306008,"rotation":2.43999458991986,"scale_x":1,"scale_y":1,"scale_z":1,"fixed":false}]}');
});
