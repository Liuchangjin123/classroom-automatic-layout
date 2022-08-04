var G1 = 50; // x → 轴方向课桌之间的最小间距
var G2 = 15; // z ↓ 轴方向课桌之间的最小间距
var G5 = 100;//实验室横向间隔最小值
var G6 = 0;//实验室纵向间隔值
var G7 = 200;

/** 
 * 
 * @param {number} Lr   盒子的长， x → 轴
 * @param {number} Wr   盒子的宽， z ↓ 轴
 * @param {number} Dl    桌子的长
 * @param {number} Dw    桌子的宽
 * @param {number} DLl    实验室桌子的长
 * @param {number} DLw    实验室桌子的宽
 * @param {number} Bl    床的长
 * @param {number} Bw    床的宽
 * @param {number} Kl    空调的长
 * @param {number} Kw    空调的宽
 * @param {number} num  物体的数量
 * 
 * 输出：position_list [] 物体应当摆放的坐标。
 */
function deskMatrixLayout(Lr, Wr, Dl, Dw, num) {

    var m = 1 // x → 轴方向可以摆放的数量
    while( (m-1) * G1 + m * Dl <= Lr ) {
        m++;
    } 
    // m--;

    var g3 = (Lr - m * Dl) / (m - 1) // 实际间距
    var g4 = G2 // 实际z间距初始化为最z小间距z
    var row = 0 // 放置行数

    var Xs = Dl/2;   // 放置的x坐标
    var Zs = 165 + Dw/2;   // 放置的z坐标

    var res = new Array()    // 返回各个物体应当摆放的位置
    for(i = 1; i <= num; i++) {
        if (Xs > Lr) {
            // 当前家具超出矩形布局区域  换行
            // console.log("换行");
            // row = row + 1;
            // 重新定位 (Xs,Zs)
            Xs = Dl/2; 
            Zs = Zs + g4 + Dw;
            if ( Wr - ( Zs - (165 - Dw/2) ) <= (200 + Dw / 2)) {
                alert("桌椅数量过多,请删除！"); break;
            }
        
            // console.log("放置：", i, "(", Xs, ",", Zs, ")");
            var coordinate = new THREE.Vector2( Xs, Zs );
            res.push(coordinate)
        } else {
            // 继续在此行放置
            // console.log("放置：", i, "(", Xs, ",", Zs, ")");
            var coordinate = new THREE.Vector2( Xs, Zs );
            res.push(coordinate)
        }
        // 指向下一个位置
        Xs = Xs + Dl + g3
    }
    return res;
}

function deskLabMatrixLayout(Lr, Wr, DLl, DLw, num){
    var m = 1;//Z → 轴方向可以摆放的数量
    while( (m-1) * G5 + m * DLl <= Lr - 100) {
        m++;
    } 
    var g7 = (Lr -100 - m * DLl) / (m - 1) // 实际间距
    var g8 = G6 // 实际z间距初始化为最z小间距z
    var row = 0 // 放置行数

    var Xs =50 + DLl/2;   // 放置的x坐标
    var Zs = 165 + DLw/2;   // 放置的z坐标

    var res = new Array()    // 返回各个物体应当摆放的位置
    for(ii = 1; ii <= num; ii++) {
        if (Xs > Lr) {
            // 当前家具超出矩形布局区域  换行
            // console.log("换行");
            // row = row + 1;
            // 重新定位 (Xs,Zs)
            Xs = 50 + DLl/2; 
            Zs = Zs + g8 + DLw;
            if ( Wr - ( Zs + DLw/2) <= 20) {
                alert("桌子数量过多,请删除！"); break;
            }
        
            // console.log("放置：", i, "(", Xs, ",", Zs, ")");
            var coordinate = new THREE.Vector2( Xs, Zs );
            res.push(coordinate)
        } else {
            // 继续在此行放置
            // console.log("放置：", i, "(", Xs, ",", Zs, ")");
            var coordinate = new THREE.Vector2( Xs, Zs );
            res.push(coordinate)
        }
        // 指向下一个位置
        Xs = Xs + DLl + g7
    }
    return res;
}

function stoolMatrixLayout(){
    
}

function bedMatrixLayout(Lr, Wr, Bl, Bw, num){
    var m = 2 // X → 轴方向可以摆放的数量
    // while( (m - 1) * G7 + m * Bw <= Lr ) {
    //     m++;
    // } 
    // m--;


    var g3 = (Lr - m * Bl) / (m - 1); // 实际间距
    var g4 = 0; // 实际z间距初始化为最z小间距
    // var row = 0 // 放置行数
    console.log('g3=' + g3);

    var Xs = Bl/2;   // 放置的x坐标
    var Zs = Bw/2;   // 放置的z坐标

    var res = new Array()    // 返回各个物体应当摆放的位置
    for(i = 1; i <= num; i++) {
        if (Xs > Lr) {
            // 当前家具超出矩形布局区域  换行
            // console.log("换行");
            // row = row + 1;
            // 重新定位 (Xs,Zs)
            Xs = Bl/2; 
            Zs = Zs + Bw;
            if (( Wr - ( Zs - Bl/2 ) ) <= (50 + Bw / 2)) {
                alert("床的数量过多,请删除！"); break;
            }
        
            // console.log("放置：", i, "(", Xs, ",", Zs, ")");
            var coordinate = new THREE.Vector2( Xs, Zs );
            res.push(coordinate)
        } else {
            // 继续在此行放置
            // console.log("放置：", i, "(", Xs, ",", Zs, ")");
            var coordinate = new THREE.Vector2( Xs, Zs );
            res.push(coordinate)
        }
        // 指向下一个位置
        Xs = Xs + g3 + Bl
    }
    return res;
}

function ktMatrixLayout(Lr, Wr, Kl, Kw, num){
    var res1 = new Array();
    var Xs = 0;
    var Zs = 0;
    // if (num == 1){
        Xs = Kw/2 + 10;
        Zs = Wr - Kl - 5;
        var coordinate = new THREE.Vector2( Xs, Zs );
        res1.push(coordinate)
    // }
    return res1;
}