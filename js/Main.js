
$(function () {
    // 元素
    var map = $('#map');
    var pauseObj = $('#pause');
    var jixuObj = $('#pause_jixu');
    var endObj = $('#end');
    var retObj = $('#end_jixu').bind('click', init);
    var pause_retObj = $('#pause_ret');
    var startBtn = $('#start');
    var score = $('#score');
    var scoreNum = score.children('span');
    var end_score = $('#end_score');

    // 创建一个玩家对象
    var player = new Player();
    var playerEle = $('#player');
    playerEle.css('display', 'none');
    // 开始按钮
    // 开始事件
    startBtn.bind('click', start);

    //计时标记
    var enemyTime = 0;
    var times = 0;
    var bulletTime = 0;
    var timer;
    // 子弹和飞机数组
    var bullets = [];
    var enemys = [];
    // 得分
    var scores = 0;
    /*
        创建飞机类
        属性有：横纵坐标 实际大小 血量 等级 死亡标记 死亡倒计时间 分数 元素对象 背景图片 爆炸图片
    */
    function start() {
        window.event.cancelBubble = true;
        // 初始化界面
        $(this).css('display', 'none');
        map.css('background', 'url(image/bgc.png)');
        score.css('display', 'block');
        playerEle.css('display', 'block');
        mapMove();
        // 初始化游戏
        // 给我方飞机添加暂停事件 解绑继续事件
        playerEle.unbind('click').bind('click', pause);
        // 移动我方飞机
        $(document).unbind('mousemove').bind('mousemove', playerMove);
        // 创建敌方飞机 子弹 
        timer = setInterval(begin, 20);
    }
    function mapMove(boolean) {
        clearInterval(map.timer);
        if (boolean || boolean == null) {
            map.timer = setInterval(() => {
                var current = parseInt(map.css('backgroundPositionY'));
                current += 1;
                map.css('backgroundPositionY', current);
            }, 30);
        }
    }
    function begin() {//每秒执行50次
        // 遍历删除死亡的子弹
        for (var i = 0; i < bullets.length; i++) {
            if (bullets[i].dieOut == true) {
                bullets[i].ele.remove();
                bullets.splice(i, 1);
            }
        }
        // 遍历删除死亡的飞机
        for (var i = 0; i < enemys.length; i++) {
            // 飞机血量小于0延迟删除
            if (enemys[i].hp <= 0) {
                enemys[i].dieTime++;
            }
        }
        for (var i = 0; i < enemys.length; i++) {
            if (enemys[i].ele.offset().top >= map.height()) {
                enemys[i].ele.remove();
                enemys.splice(i, 1);
            }
        }
        for (var i = 0; i < enemys.length; i++) {

            if (enemys[i].dieTime == 20) {
                enemys[i].ele.remove();
                enemys.splice(i, 1);
            }
        }
        // 创建子弹并移动子弹
        bulletTime++;
        enemyTime++;
        if (bulletTime == 5) {//子弹的速度是1秒10发
            var bulletX = parseInt(playerEle.css('left')) + player.sizeX / 2;
            var bulletY = parseInt(playerEle.css('top')) - 20 || 448;
            var bullet = new getBullets(bulletX, bulletY, 100);
            // 加入到数组中
            bullets.push(bullet);
            bullet.move();
            bulletTime = 0;
        }
        // 创建敌机并移动
        if (enemyTime == 20) {//每秒执行2.5次times

            times++;
            if (times % 5 == 0) {//中飞机2秒1次
                enemys.push(new Enemy(46, 60, 500, 2000, 'image/中飞机.png', 'image/中飞机爆炸.gif', getSpeed(getRandom(1, 2))));
            }
            if (times == 20) {//大飞机8秒一次
                enemys.push(new Enemy(110, 164, 1200, 5000, 'image/大飞机.png', 'image/大飞机爆炸.gif', getSpeed(1)));
                times = 0;
            }
            if (times % 2 == 0) {//小飞机1.25次每秒
                enemys.push(new Enemy(34, 24, 100, 1000, 'image/小飞机.png', 'image/小飞机爆炸.gif', getSpeed(getRandom(1, 3))));
            }
            enemyTime = 0;
        }
        // 子弹与飞机碰撞
        for (var i = 0; i < bullets.length; i++) {
            var b = bullets[i];
            var bulletX = b.ele.offset().left;
            var bulletY = b.ele.offset().top;
            var bulletmaxX = b.ele.offset().left + b.sizeX;
            var bulletmaxY = b.ele.offset().top + b.sizeY;
            for (var j = 0; j < enemys.length; j++) {
                var e = enemys[j];
                var enemyX = e.ele.offset().left;
                var enemyY = e.ele.offset().top + e.sizeY;
                var enemymaxX = e.ele.offset().left + e.sizeX;
                var enemymaxY = e.ele.offset().top + e.sizeY;
                if (bulletmaxY >= enemyY && bulletY <= enemymaxY) {
                    if ((bulletmaxX > enemyX && bulletmaxX < enemymaxX) || (bulletmaxX < enemymaxX && bulletmaxX > enemyX)) {
                        // 减少飞机血量
                        if (e.ele.offset().top >= 0) {
                            e.hp -= b.attack;
                        }
                        // 更改爆炸图片
                        if (e.hp <= 0) {
                            // 统计分数
                            if (e.ele.attr('src') != e.dieBgi) {
                                e.ele.attr('src', e.dieBgi);
                                scores += e.score;
                                scoreNum.html(scores);
                                console.log(e.ele);
                            }
                        } else {
                            //删除子弹
                            $(b.ele).remove();
                            bullets.splice(i, 1);
                        }
                        break;
                    }
                }
            }
        }
        // 飞机和玩家相撞   
        for (var i = 0; i < enemys.length; i++) {
            var e = enemys[i];
            var enemyX = e.ele.offset().left;
            var enemymaxX = e.ele.offset().left + e.sizeX;
            var enemyY = e.ele.offset().top;
            var enemymaxY = e.ele.offset().top + e.sizeY;
            var pX = playerEle.offset().left;
            var pmaxX = playerEle.offset().left + player.sizeX;
            var pY = playerEle.offset().top;
            var pmaxY = playerEle.offset().top + player.sizeY;

            if (pY < enemymaxY - 40 && pmaxY > enemyY && e.hp > 0) {
                if (pmaxX > enemyX && pX < enemymaxX) {
                    playerEle.attr('src', '../image/本方飞机爆炸.gif');
                    $(document).unbind('mousemove', playerMove);
                    endObj.css('display', 'block');
                    end_score.html(scores);
                    end();
                }
            }
        }
    }
    function playerMove(e) {
        var x = e.clientX - map.offset().left - player.sizeX / 2;
        var y = e.clientY - map.offset().top - player.sizeY / 2;
        player.x = x;
        player.y = y;
        var maxX = map.width() - player.sizeX / 2;
        var maxY = map.height() - player.sizeY / 2;
        (x > maxX) && (x = maxX);
        (x <= -player.sizeX / 2) && (x = -player.sizeX / 2);
        (y > maxY) && (y = maxY);
        (y < 0) && (y = 0);
        playerEle.css({ left: x, top: y });
    }
    function pause() {
        if (window.event) {
            window.event.cancelBubble = true;
        }
        // 可视化暂停界面
        pauseObj.css('display', 'block');
        mapMove(false);
        // 先移除暂停事件再添加继续事件
        $(document).unbind('mousemove', playerMove);
        jixuObj.unbind('click').bind('click', jixu);
        pause_retObj.unbind('click').bind('click', function f1() {
            pause_retObj.unbind('click', f1);
            window.event.cancelBubble = true;
            end();
            init();
        });
        playerEle.unbind('click').bind('click', jixu);

        for (var i = 0; i < enemys.length; i++) {
            clearInterval(enemys[i].ele.timer);
        }
        for (var i = 0; i < bullets.length; i++) {
            clearInterval(bullets[i].ele.timer);
        }
        clearInterval(timer);
    }

    function jixu() {
        if (window.event) {
            window.event.cancelBubble = true;
        }
        pauseObj.css('display', 'none');
        jixuObj.unbind('click', jixu);
        playerEle.unbind('click').bind({ 'click': pause });
        $(document).unbind('mousemove').bind('mousemove', playerMove);
        for (var i = 0; i < enemys.length; i++) {
            enemys[i].move();
        }
        for (var i = 0; i < bullets.length; i++) {
            bullets[i].move();
        }
        timer = setInterval(begin, 20);
        mapMove();
    }
    function end() {
        if (window.event) {
            window.event.cancelBubble = true;
        }
        // 停止生产飞机
        for (var i = 0; i < enemys.length; i++) {
            clearInterval(enemys[i].ele.timer);
        }
        for (var i = 0; i < bullets.length; i++) {
            clearInterval(bullets[i].ele.timer);
        }
        clearInterval(timer);
        // 初始化数据
        enemyTime = 0;
        times = 0;
        bulletTime = 0;
        bullets = [];
        enemys = [];
        scores = 0;
        // 移除我方飞机事件
        playerEle.unbind('click');
        mapMove(false);
    }
    function init() {
        if (window.event) {
            window.event.cancelBubble = true;
        }
        endObj.css('display', 'none');
        playerEle.css('display', 'none');
        score.css('display', 'none');
        pauseObj.css('display', 'none');
        map.css('background', 'url(image/开始背景.png)');
        scoreNum.html(0);
        // 删除子弹和飞机
        map.children('img[id!=player]').remove();
        startBtn.css('display', 'block');
        clearInterval(timer);
        // 初始化我的飞机
        playerEle.attr('src', '../image/我的飞机.gif');
        playerEle.css('left', 120);
        playerEle.css('top', 468);

    }

    function Plane(x, y, sizeX, sizeY, hp, dieOut, dieTime, score, ele, bgi, dieBgi, speed) {
        this.x = x;
        this.y = y;
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.hp = hp;
        this.dieOut = dieOut;
        this.dieTime = dieTime;
        this.score = score;
        this.ele = ele;
        this.bgi = bgi;
        this.dieBgi = dieBgi;
        this.speed = speed;
        // 飞机初始化
        this.init = function (x, y) {
            // 添加背景图片并且初始化坐标
            this.ele = $('<img src = ' + this.bgi + ' />');
            this.ele.appendTo(map).css({ position: 'absolute', left: x, top: y });
        };
        this.init(this.x, this.y);
    }
    // 我方飞机类
    function Player(x, y) {
        Plane.call(this, x || 120, y || 468, 66, 80, 100, false, 100, 0, null, '../image/我的飞机.gif', '../image/本方飞机爆炸.gif');
        this.ele.attr('id', 'player');
    }
    // 敌方飞机类
    function Enemy(sizeX, sizeY, hp, score, bgi, dieBgi, speed) {
        var b = parseInt(map.width()) - sizeX;
        Plane.call(this, Math.random() * b, -100, sizeX, sizeY, hp, false, 0, score, null, bgi, dieBgi, speed);
        // 初始化速度
        this.move = function () {
            animate(this.ele, { 'top': 568 }, 10, function () {
                this.dieOut = true;
            }.bind(this), this.speed / 2);
        };
        this.move();
    }
    // 子弹类
    function Bullet(x, y, sizeX, sizeY, bgi, attack) {
        this.x = x;
        this.y = y;
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.bgi = bgi;
        this.attack = attack;
        this.ele;
        this.dieOut = false;
    }
    // 获得子弹
    function getBullets(x, y, attack) {
        Bullet.call(this, x, y, 6, 14, 'image/bullet.png', attack || 100);
        this.ele = $('<img src= " ' + this.bgi + ' "/>').appendTo(map);
        this.move = function () {
            animate(this.ele, { 'top': 0 }, 15, function () {
                this.dieOut = true;
            }.bind(this));
        };
        this.init = function () {
            this.ele.css({ 'position': 'absolute', 'left': this.x, 'top': this.y });
            this.move();
        };
        this.init();
    }
    function Game() {
        this.start = function () {
        }
    }
    // 我的动画函数
    function animate(ele, json, speed, fn, s) {
        clearInterval(ele.timer);
        ele.timer = setInterval(function () {
            for (var attr in json) {
                var target = json[attr];
                var current = parseFloat(ele.css(attr));
                var step = s || 10;
                step = target - current > 0 ? step : -step;
                current += step;
                if (Math.abs(step) >= Math.abs(target - current)) {
                    ele.css(attr, target + 'px');
                    clearInterval(ele.timer);
                    if (fn) {
                        fn();
                    }
                } else {
                    ele.css(attr, current + 'px');
                }
            }
        }, speed || 20);
    }
    function getSpeed(speed) {
        var sudu = 0;
        if (scores < 20000) {
            sudu = 1;
        } else if (scores < 50000) {
            sudu = 2;
        } else if (scores < 100000) {
            sudu = 3;
        } else if (scores < 150000) {
            sudu = 4;
        } else if (scores < 200000) {
            sudu = 5;
        }
        sudu += speed;
        return sudu > 6 ? 6 : sudu;
    }
    function getRandom(a, b) {
        return Math.random() * (b - a) + a;
    };
});