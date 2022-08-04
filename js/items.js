// add items to the "Add Items" tab
var furnitureType = { "desk": 0, "blackboard": 1, "door": 2, "window": 3, 'air_conditioning': 4};

$(document).ready(function() {
  var items = [
    {
      "name" : "课桌",
      "image" : "models/thumbnails/desk1.png",
      "model" : "models/js/desk.js",
      "type" : "1",
    }, 
    {
      "name" : "课桌",
      "image" : "models/thumbnails/desk2.png",
      "model" : "models/js/desk1.js",
      "type" : "1",
    }, 
    {
      "name" : "课桌_实验室",
      "image" : "models/thumbnails/desk_lab.png",
      "model" : "models/js/desk_lab.js",
      "type" : "1",
    }, 
    {
      "name" : "凳子_实验室",
      "image" : "models/thumbnails/stool.png",
      "model" : "models/js/stool.js",
      "type" : "1",
    },
    {
      "name" : "床_宿舍",
      "image" : "models/thumbnails/bed.png",
      "model" : "models/js/bed.js",
      "type" : "1",
    },
    {
      "name" : "椅子_宿舍",
      "image" : "models/thumbnails/chair2.png",
      "model" : "models/js/chair2.js",
      "type" : "1",
    }, 
    {
      "name" : "黑板",
      "image" : "models/thumbnails/blackboard1.png",
      "model" : "models/js/blackboard1.js",
      "type" : "2",
    },
    {
      "name" : "黑板",
      "image" : "models/thumbnails/blackboard2.png",
      "model" : "models/js/blackboard2.js",
      "type" : "2",
    },
    {
      "name" : "落地黑板",
      "image" : "models/thumbnails/blackboard.png",
      "model" : "models/js/blackboard.js",
      "type" : "1",
    }, 
    {
      "name" : "空调",
      "image" : "models/thumbnails/kongtiao.png",
      "model" : "models/js/kongtiao.js",
      "type" : "1",
    },   
   {
      "name" : "门-关",
      "image" : "models/thumbnails/thumbnail_Screen_Shot_2014-10-27_at_8.04.12_PM.png",
      "model" : "models/js/closed-door28x80_baked.js",
      "type" : "7",
    }, 
    {
      "name" : "门-开",
      "image" : "models/thumbnails/thumbnail_Screen_Shot_2014-10-27_at_8.22.46_PM.png",
      "model" : "models/js/open_door.js",
      "type" : "7",
    }, 
    {
      "name" : "窗户",
      "image" : "models/thumbnails/thumbnail_window.png",
      "model" : "models/js/whitewindow.js",
      "type" : "3",
    },   
    // {
    //   "name" : "地毯",
    //   "image" : "models/thumbnails/thumbnail_cb-blue-block60x96.png",
    //   "model" : "models/js/cb-blue-block-60x96.js",
    //   "type" : "8"
    // },
    // {
    //   "name" : "壁画",
    //   "image" : "models/thumbnails/thumbnail_nyc2.jpg",
    //   "model" : "models/js/nyc-poster2.js",
    //   "type" : "2"
    // }
   /*     
   {
      "name" : "",
      "image" : "",
      "model" : "",
      "type" : "1"
    }, 
    */
  ]



  var itemsDiv = $("#items-wrapper")
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var html = '<div class="col-sm-4">' +
                '<a class="thumbnail add-item" model-name="' + 
                item.name + 
                '" model-url="' +
                item.model +
                '" model-type="' +
                item.type + 
                '"><img src="' +
                item.image + 
                '" alt="Add Item"> '+
                item.name +
                '</a></div>';
    itemsDiv.append(html);
  }
});