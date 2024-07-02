//游戏参数
var fightingEnd = false; //战斗结束
var appearBoss = false; //遇见boss
var appearKnight = false; //遇见骑士
var updateSkinStatus = false; //变身状态
var meetStatus = 'waitting'; //相遇状态
var proposeStatus = 'waitting'; //求婚状态

//弹幕参数
var thisColor = '00A2D6', fontSize = 32;
var dm_container = document.getElementById('dm_container');
var send = document.getElementById('send');
var pmh = dm_container.offsetHeight * 2 / 3; //弹幕出现的高度区域
var pmw = dm_container.offsetWidth;
var blessArr = [];

/**
 * 获取祝福
 */
function getBless() {
    //marryme
    var RunnerContainer = document.getElementById('runner-container');
    var ringImg = document.createElement('img');//创建一个标签
    ringImg.setAttribute('src', 'assets/material_img/marryme.gif');//给标签定义src链接
    ringImg.setAttribute('id', 'marryme-img');
    RunnerContainer.appendChild(ringImg);//放到指定的id里
    //getBless
    $.post("../bless.php", { action: 'get_bless' }, function (data, status) {
        var res = eval('(' + data + ')');
        if (res.code) {
            blessArr = res.data;
        }
    });
    var tim = null;
    var count = blessArr.length;
    tim = setInterval(function () {
        count--;
        if (count == 0) {
            clearInterval(tim);
        }
        createDm(blessArr[Math.floor(Math.random() * blessArr.length)]);
    }, 800);
}

/**
 * 生成弹幕
 */
function createDm(bless) {
    var danmu = document.createElement('div');
    danmu.setAttribute('class', 'danmu');
    danmu.innerHTML = bless
    dm_container.appendChild(danmu);
    danmu.style.fontSize = fontSize;
    danmu.style.color = '#' + thisColor;
    danmu.style.left = '900px';
    danmu.style.top = Math.floor(Math.random() * pmh) + 'px';
    var l = pmw - danmu.offsetWidth;
    var tim = null;
    tim = setInterval(function () {
        l--;
        if (l <= (0 - danmu.offsetWidth)) {
            clearInterval(tim);
            dm_container.removeChild(danmu);
        }
        danmu.style.left = l + 'px';
    }, 20);

    //copy别人祝福
    danmu.onclick = function () {
        document.getElementById('bless').value = bless;
    };
}

//判断手机横竖屏状态：
function hengshuping() {
    if (window.orientation == 180 || window.orientation == 0) {
        //竖屏
        document.getElementById('gamebox').style.display = 'none';
        document.getElementById('game_start').style.display = 'block';
    }
    if (window.orientation == 90 || window.orientation == -90) {
        //横屏
        document.getElementById('game_start').style.display = 'none';
        document.getElementById('gamebox').style.display = 'block';
        document.getElementById('tips_box').style.display = 'block';
    }
}

/**
 * 点击发送键发送弹幕
 */
send.onclick = function () {
    var bless = document.getElementById('bless').value;
    if (bless != '') {
        createDm(bless);
        document.getElementById('bless').value = '';
        $.post("../bless.php", { action: 'insert', bless: bless }, function (data, status) {
            var res = eval('(' + data + ')');
            if (res.code) {
                alert('感谢你的祝福～');
            }
        });
    }
};

/**
 * 输入完文字点击回车键发送弹幕
 */
document.onkeydown = function (even) {
    var event = even || window.event;
    if (event.keyCode == 13) {
        var bless = document.getElementById('bless').value;
        if (bless != '') {
            createDm();
            document.getElementById('bless').value = '';
        }
    }
};

(function () {
    /**
     * T-Rex runner.
     * @param {string} outerContainerId Outer containing element id.
     * @param {Object} opt_config
     * @constructor
     * @export
     */
    function Runner(outerContainerId, opt_config) {
        if (Runner.instance_) {
            return Runner.instance_;
        }
        Runner.instance_ = this;

        //输出盒子定义
        this.outerContainerEl = document.querySelector(outerContainerId);
        this.containerEl = null;
        this.snackbarEl = null;
        //详情button按钮，不知道干嘛用的，html里没有这个按钮
        this.detailsButton = this.outerContainerEl.querySelector('#details-button');

        //配置项设置，传参或者从单例获取
        this.config = opt_config || Runner.config;

        //初始化尺寸
        this.dimensions = Runner.defaultDimensions;

        //初始化画布
        this.canvas = null;
        this.canvasCtx = null;

        //定义一只霸王龙
        this.tRex = null;

        //初始测距仪
        this.distanceMeter = null;
        //距离默认为0
        this.distanceRan = 0;

        //分数
        this.highestScore = 0;

        this.time = 0;
        this.runningTime = 0;
        //每帧需要多少毫秒
        this.msPerFrame = 1000 / FPS;
        //当前的速度，从配置项取
        this.currentSpeed = this.config.SPEED;

        //障碍数组
        this.obstacles = [];

        //复活节彩蛋是否被激活。
        this.activated = false; // Whether the easter egg has been activated.

        //游戏当前是否处于游戏状态。
        this.playing = false; // Whether the game is currently in play state.
        //已坠毁
        this.crashed = false;
        //已停顿
        this.paused = false;
        //已倒转
        this.inverted = false;
        //倒转计时器
        this.invertTimer = 0;
        //调整时间的id？
        this.resizeTimerId_ = null;

        //游戏次数
        this.playCount = 0;

        // Sound FX.音效
        this.audioBuffer = null;
        this.soundFx = {};

        // Global web audio context for playing sounds.游戏中的公共的网页音效
        this.audioContext = null;

        // Images.
        this.images = {};
        this.imagesLoaded = 0;

        if (this.isDisabled()) {
            //如果这个复活节彩蛋开启了
            this.setupDisabledRunner();//启动复活节彩蛋runner
        } else {
            //从原型对象中初始化地图
            this.loadImages();
        }
    }
    window['Runner'] = Runner; //实例化一个窗口对象为Runner

    /**
     * Frames per second.
     * 每秒帧数
     * @const
     */
    var FPS = 60;

    /** @const
     * window.devicePixelRatio：当前显示设备的物理像素分辨率与CSS像素分辨率之比
     * 判断是否是HIDPI,>1则是，对于HiDPI / Retina显示屏则期望值为2
     * */
    // var IS_HIDPI = window.devicePixelRatio > 1;
    var IS_HIDPI = true;

    /** @const
     * 是否是ios
     * */
    var IS_IOS = /iPad|iPhone|iPod/.test(window.navigator.platform) || /iPad|iPhone|iPod/.test(window.navigator.userAgent);

    /** @const
     * 是否是手机移动端
     * */
    var IS_MOBILE = /Android/.test(window.navigator.userAgent) || IS_IOS;

    /**
     * Default game width.
     * 默认游戏的尺寸
     * @const
     */
    var DEFAULT_WIDTH = 1280;
    var DEFAULT_HEIGHT = 300;
    if (IS_MOBILE) {
        DEFAULT_WIDTH = window.screen.availWidth;
        //DEFAULT_HEIGHT = window.screen.availWidth;
    }
    console.log('DEFAULT_WIDTH:' + DEFAULT_WIDTH);

    /** @const
     * 设备是否可触控
     * */
    var IS_TOUCH_ENABLED = 'ontouchstart' in window;


    /**
     * Default game configuration.
     * 默认游戏配置
     * @enum {number}
     */
    Runner.config = {
        //加速
        ACCELERATION: 0.001,
        //背景里云的运动速度
        BG_CLOUD_SPEED: 0.2,
        //
        BOTTOM_PAD: 10,
        //清除时间
        CLEAR_TIME: 3000,
        //云出现的频率
        CLOUD_FREQUENCY: 0.5,
        //游戏结束时间
        GAMEOVER_CLEAR_TIME: 750,
        //GAP系数
        GAP_COEFFICIENT: 0.6,
        //重力系数
        GRAVITY: 0.6,
        //初始跳速
        INITIAL_JUMP_VELOCITY: 12,
        //反转衰减持续时间
        INVERT_FADE_DURATION: 12000,
        //反向距离
        INVERT_DISTANCE: 70000,
        //最大闪烁次数
        MAX_BLINK_COUNT: 3,
        //最大云朵数
        MAX_CLOUDS: 6,
        //每组障碍物的最大数量
        MAX_OBSTACLE_LENGTH: 3,
        //相邻的障碍物类型的最大重复数
        MAX_OBSTACLE_DUPLICATION: 2,
        //最大速度
        MAX_SPEED: 10,
        //最小跳跃高度
        MIN_JUMP_HEIGHT: 35,
        //移动速度系数
        MOBILE_SPEED_COEFFICIENT: 1.2,
        //资源模版id
        RESOURCE_TEMPLATE_ID: 'audio-resources',
        //初始速度
        SPEED: 5,
        //速度下降系数
        SPEED_DROP_COEFFICIENT: 3
    };


    /**
     * Default dimensions.
     * 默认尺寸
     * @enum {string}
     */
    Runner.defaultDimensions = {
        WIDTH: DEFAULT_WIDTH,//460
        HEIGHT: DEFAULT_HEIGHT,//300
    };


    /**
     * CSS class names.
     * @enum {string}
     */
    Runner.classes = {
        CANVAS: 'runner-canvas',
        CONTAINER: 'runner-container',
        CRASHED: 'crashed',
        ICON: 'icon-offline',
        INVERTED: 'inverted',
        SNACKBAR: 'snackbar',
        SNACKBAR_SHOW: 'snackbar-show',
        TOUCH_CONTROLLER: 'controller'
    };


    /**
     * Sprite definition layout of the spritesheet.
     * 精灵图的精灵定义布局。
     * @enum {Object}
     */
    Runner.spriteDefinition = {
        LDPI: {
            CACTUS_LARGE: { x: 332, y: 2 },//大仙人掌
            CACTUS_SMALL: { x: 228, y: 2 },//小仙人掌
            CLOUD: { x: 86, y: 2 },//云朵
            HORIZON: { x: 2, y: 54 },//地平线
            MOON: { x: 484, y: 2 },//月亮
            PTERODACTYL: { x: 134, y: 2 },//翼手龙
            RESTART: { x: 2, y: 2 },//重新开始
            TEXT_SPRITE: { x: 655, y: 2 },//文本
            TREX: { x: 848, y: 2 },//霸王龙
            STAR: { x: 645, y: 2 },//星星
            XUEBI: { x: 543, y: 2 },//猫咪
        },
        HDPI: {
            CACTUS_LARGE: { x: 2779, y: 382 }, //大仙人掌
            CACTUS_SMALL: { x: 2891, y: 379 }, //小仙人掌
            CLOUD: { x: 166, y: 2 }, //云朵
            HORIZON: { x: 0, y: 160 }, //地平线
            MOON: { x: 954, y: 2 }, //月亮
            PTERODACTYL: { x: 2993, y: 342 }, //翼手龙
            RESTART: { x: 2, y: 2 }, //重新开始
            TEXT_SPRITE: { x: 1294, y: 2 }, //文本
            TREX: { x: 4377, y: 328 }, //霸王龙
            STAR: { x: 1276, y: 2 }, //星星
            XUEBI: { x: 2814, y: 277 }, //雪碧
            HAITAI: { x: 3030, y: 280 }, //海苔
            YUANDAN: { x: 2928, y: 275 }, //元旦
            GUNGUN: { x: 3116, y: 277 }, //元滚滚
            YUANXIAO: { x: 3203, y: 275 }, //元宵
            BOSS: { x: 3320, y: 38 }, //恶龙
            KNIGHT: { x: 9503, y: 312 }, //骑士
        }
    };


    /**
     * Sound FX. Reference to the ID of the audio tag on interstitial page.
     * 声音特效。参考中间页上音频标签的ID。
     * @enum {string}
     */
    Runner.sounds = {
        BUTTON_PRESS: 'offline-sound-press',
        HIT: 'offline-sound-hit',
        SCORE: 'offline-sound-reached'
    };


    /**
     * Key code mapping.
     * 关键动作的映射
     * @enum {Object}
     */
    Runner.keycodes = {
        JUMP: { '38': 1, '32': 1 },  // Up, spacebar
        DUCK: { '40': 1 },  // Down
        RESTART: { '13': 1 },  // Enter
    };


    /**
     * Runner event names.
     * 事件名称
     * @enum {string}
     */
    Runner.events = {
        ANIM_END: 'webkitAnimationEnd',//在 CSS 动画完成后触发
        CLICK: 'click',//点击事件
        KEYDOWN: 'keydown',//键盘按下事件
        KEYUP: 'keyup',//键盘松开事件
        MOUSEDOWN: 'mousedown',//鼠标按下事件
        MOUSEUP: 'mouseup',//鼠标松开事件
        RESIZE: 'resize',//窗口尺寸大小调整事件
        TOUCHEND: 'touchend',//滑动结束事件
        TOUCHSTART: 'touchstart',//滑动开始事件
        VISIBILITY: 'visibilitychange',//页面可见行改变事件
        BLUR: 'blur',//失去焦点事件
        FOCUS: 'focus',//获取焦点事件
        LOAD: 'load'//加载事件
    };


    //Runner的原型对象
    Runner.prototype = {
        /**
         * Whether the easter egg has been disabled. CrOS enterprise enrolled devices.
         * 复活节彩蛋是否被禁用。企业注册设备
         * @return {boolean}
         */
        isDisabled: function () {
            // return loadTimeData && loadTimeData.valueExists('disabledEasterEgg');
            //返回本地时间并判断本地时间value值中是否包含复活节彩蛋
            return false;//直接返回false
        },

        /**
         * For disabled instances, set up a snackbar with the disabled message.
         * 对于禁用的实例，设置带有禁用消息的snackbar。
         * 这个好像是复活节专属runner
         */
        setupDisabledRunner: function () {
            this.containerEl = document.createElement('div');
            this.containerEl.className = Runner.classes.SNACKBAR;
            this.containerEl.textContent = loadTimeData.getValue('disabledEasterEgg');
            this.outerContainerEl.appendChild(this.containerEl);

            // Show notification when the activation key is pressed.
            //按下激活键时显示通知
            document.addEventListener(Runner.events.KEYDOWN, function (e) {
                if (Runner.keycodes.JUMP[e.keyCode]) {
                    this.containerEl.classList.add(Runner.classes.SNACKBAR_SHOW);
                    document.querySelector('.icon').classList.add('icon-disabled');
                }
            }.bind(this));
        },

        /**
         * Setting individual settings for debugging.
         * 开启调试模式
         * @param {string} setting
         * @param {*} value
         */
        updateConfigSetting: function (setting, value) {
            if (setting in this.config && value != undefined) {
                this.config[setting] = value;

                switch (setting) {
                    case 'GRAVITY':
                    case 'MIN_JUMP_HEIGHT':
                    case 'SPEED_DROP_COEFFICIENT':
                        this.tRex.config[setting] = value;
                        break;
                    case 'INITIAL_JUMP_VELOCITY':
                        this.tRex.setJumpVelocity(value);
                        break;
                    case 'SPEED':
                        this.setSpeed(value);
                        break;
                }
            }
        },

        /**
         * Cache the appropriate image sprite from the page and get the sprite sheet
         * 从页面缓存适当的图像精灵并获取精灵表
         * definition.
         */
        loadImages: function () {
            if (IS_HIDPI) {
                //如果是高清设备就初始化高清图
                Runner.imageSprite = document.getElementById('offline-resources-2x');
                //从高清精灵图配置中获取到主要物品的坐标
                this.spriteDef = Runner.spriteDefinition.HDPI;
            } else {
                Runner.imageSprite = document.getElementById('offline-resources-1x');
                this.spriteDef = Runner.spriteDefinition.LDPI;
            }

            // 精灵图加载完成后，初始化Runner
            if (Runner.imageSprite.complete) {
                this.init();
            } else {
                // If the images are not yet loaded, add a listener.
                //如果图像尚未加载，请添加侦听器
                Runner.imageSprite.addEventListener(Runner.events.LOAD,
                    this.init.bind(this));
            }
        },

        /**
         * Load and decode base 64 encoded sounds.
         * 加载和解码base 64编码的声音。
         */
        loadSounds: function () {
            if (!IS_IOS) {
                this.audioContext = new AudioContext();

                var resourceTemplate = document.getElementById(this.config.RESOURCE_TEMPLATE_ID).content;

                for (var sound in Runner.sounds) {
                    var soundSrc = resourceTemplate.getElementById(Runner.sounds[sound]).src;
                    soundSrc = soundSrc.substr(soundSrc.indexOf(',') + 1);
                    var buffer = decodeBase64ToArrayBuffer(soundSrc);

                    // Async, so no guarantee of order in array.
                    //异步，因此不能保证数组中的顺序。
                    this.audioContext.decodeAudioData(buffer, function (index, audioData) {
                        this.soundFx[index] = audioData;
                    }.bind(this, sound));
                }
            }
        },

        /**
         * Sets the game speed. Adjust the speed accordingly if on a smaller screen.
         * 设定游戏速度。如果屏幕较小，则相应调整速度。
         * @param {number} opt_speed
         */
        setSpeed: function (opt_speed) {
            var speed = opt_speed || this.currentSpeed;

            // Reduce the speed on smaller mobile screens.
            if (this.dimensions.WIDTH < DEFAULT_WIDTH) {
                var mobileSpeed = speed * this.dimensions.WIDTH / DEFAULT_WIDTH *
                    this.config.MOBILE_SPEED_COEFFICIENT;
                this.currentSpeed = mobileSpeed > speed ? speed : mobileSpeed;
            } else if (opt_speed) {
                this.currentSpeed = opt_speed;
            }
        },

        /**
         * Game initialiser.
         * 游戏初始化。
         */
        init: function () {
            // Hide the static icon.-隐藏静态的待机恐龙
            document.querySelector('.' + Runner.classes.ICON).style.visibility = 'hidden';

            //调整游戏空间大小
            this.adjustDimensions();
            //设置游戏速度，需要根据屏幕大小进行调节
            this.setSpeed();

            //创建一个div
            this.containerEl = document.createElement('div');
            this.containerEl.className = Runner.classes.CONTAINER;//创建一个className
            this.containerEl.id = Runner.classes.CONTAINER;

            // Player canvas container.-游戏者的画布容器
            this.canvas = createCanvas(this.containerEl, this.dimensions.WIDTH, this.dimensions.HEIGHT, Runner.classes.PLAYER);

            //返回一个2d画布
            this.canvasCtx = this.canvas.getContext('2d');
            var ctx = this.canvas.getContext('2d');
            this.canvasCtx.fillStyle = '#f7f7f7';//画布填充底色
            this.canvasCtx.fill();//画布填充底色
            Runner.updateCanvasScaling(this.canvas);

            //实例化一个地平线和背景，参数传一个画布，精灵图坐标，画布的尺寸，GAP系数
            // Horizon contains clouds, obstacles and the ground.-地平线上有云、障碍物和地面。
            this.horizon = new Horizon(this.canvas, this.spriteDef, this.dimensions, this.config.GAP_COEFFICIENT);

            // 实例化测距仪，参数传一个画布、精灵图坐标中的文本精灵，画布宽度
            this.distanceMeter = new DistanceMeter(this.canvas, this.spriteDef.TEXT_SPRITE, this.dimensions.WIDTH);

            // Draw t-rex
            //实例化霸王龙，传入画布、精灵图中的霸王龙坐标
            this.tRex = new Trex(this.canvas, this.spriteDef.TREX);

            //给主盒子里追加一个游戏区的容器
            this.outerContainerEl.appendChild(this.containerEl);

            if (IS_MOBILE) {
                //手机的话创建一个触控容器，方便监听屏幕的触控点击事件
                this.createTouchController();
            }

            //开始监听用户操作事件
            this.startListening();

            //更新
            this.update();

            //监听一个窗口尺寸大小调整事件，绑定当前事件
            window.addEventListener(Runner.events.RESIZE, this.debounceResize.bind(this));
        },

        /**
         * Create the touch controller. A div that covers whole screen.
         * 创建触摸控制器。覆盖整个屏幕的div。
         */
        createTouchController: function () {
            this.touchController = document.createElement('div');
            this.touchController.className = Runner.classes.TOUCH_CONTROLLER;
            this.outerContainerEl.appendChild(this.touchController);
        },

        /**
         * Debounce the resize event.
         * 调整大小事件
         */
        debounceResize: function () {
            if (!this.resizeTimerId_) {
                this.resizeTimerId_ = setInterval(this.adjustDimensions.bind(this), 250);
            }
        },

        /**
         * Adjust game space dimensions on resize.
         * 调整游戏空间大小。
         */
        adjustDimensions: function () {
            clearInterval(this.resizeTimerId_);//清除计时器
            this.resizeTimerId_ = null;

            var boxStyles = window.getComputedStyle(this.outerContainerEl);
            //设置边距
            var padding = Number(boxStyles.paddingLeft.substr(0, boxStyles.paddingLeft.length - 2));

            this.dimensions.WIDTH = this.outerContainerEl.offsetWidth - padding * 2;

            // Redraw the elements back onto the canvas.
            if (this.canvas) {
                this.canvas.width = this.dimensions.WIDTH;
                this.canvas.height = this.dimensions.HEIGHT;

                //更新画布的大小
                Runner.updateCanvasScaling(this.canvas);

                this.distanceMeter.calcXPos(this.dimensions.WIDTH);
                this.clearCanvas();
                this.horizon.update(0, 0, true);
                this.tRex.update(0);

                // Outer container and distance meter.
                //外部容器和测距仪。
                if (this.playing || this.crashed || this.paused) {
                    //或游戏中或已坠毁已停顿
                    this.containerEl.style.width = this.dimensions.WIDTH + 'px';
                    this.containerEl.style.height = this.dimensions.HEIGHT + 'px';
                    this.distanceMeter.update(0, Math.ceil(this.distanceRan));
                    //游戏停止，取消动画帧
                    this.stop();
                } else {
                    this.tRex.draw(0, 0);
                }

                // Game over panel.
                if (this.crashed && this.gameOverPanel) {
                    this.gameOverPanel.updateDimensions(this.dimensions.WIDTH);
                    this.gameOverPanel.draw();
                }
            }
        },

        /**
         * Play the game intro.
         * 游戏介绍。
         * Canvas container width expands out to the full width.
         * 画布容器宽度扩展到全宽
         */
        playIntro: function () {
            if (!this.activated && !this.crashed) {
                this.playingIntro = true;
                this.tRex.playingIntro = true;

                // CSS animation definition.
                var keyframes = '@-webkit-keyframes intro { ' +
                    'from { width:' + Trex.config.WIDTH + 'px }' +
                    'to { width: ' + this.dimensions.WIDTH + 'px }' +
                    '}';
                document.styleSheets[0].insertRule(keyframes, 0);

                this.containerEl.addEventListener(Runner.events.ANIM_END,
                    this.startGame.bind(this));

                this.containerEl.style.webkitAnimation = 'intro .4s ease-out 1 both';
                this.containerEl.style.width = this.dimensions.WIDTH + 'px';

                // if (this.touchController) {
                //     this.outerContainerEl.appendChild(this.touchController);
                // }
                this.playing = true;
                this.activated = true;
            } else if (this.crashed) {
                this.restart();
            }
        },


        /**
         * Update the game status to started.
         * 将游戏状态更新为“已开始”。
         * 开始游戏
         */
        startGame: function () {
            this.runningTime = 0;
            this.playingIntro = false;
            this.tRex.playingIntro = false;
            this.containerEl.style.webkitAnimation = '';
            this.playCount++;//游戏次数+1

            //开始背景音乐-直到世界尽头
            playAudio('bgm-world8bit');

            // Handle tabbing off the page. Pause the current game.
            //绑定页面可见性事件
            document.addEventListener(Runner.events.VISIBILITY,
                this.onVisibilityChange.bind(this));//这里面包含了开始和结束游戏

            //绑定页面失焦事件
            window.addEventListener(Runner.events.BLUR,
                this.onVisibilityChange.bind(this));

            //绑定页面聚焦事件
            window.addEventListener(Runner.events.FOCUS,
                this.onVisibilityChange.bind(this));
        },

        //清空画布
        clearCanvas: function () {
            this.canvasCtx.clearRect(0, 0, this.dimensions.WIDTH,
                this.dimensions.HEIGHT);
        },

        /**
         * Update the game frame and schedules the next one.
         * 更新游戏框架并安排下一个。
         */
        update: function () {
            this.updatePending = false;

            var now = getTimeStamp();
            // 间隔时间
            var deltaTime = now - (this.time || now);
            // 更新时间为当前时间
            this.time = now;

            if (this.playing) {//游戏中

                //清空画布
                this.clearCanvas();

                if (this.tRex.jumping) {//跳跃中
                    // 更新霸王龙的跳跃效果
                    this.tRex.updateJump(deltaTime);
                }

                this.runningTime += deltaTime;
                //根据runningTime是否大于清除时间判断是否有障碍
                var hasObstacles = this.runningTime > this.config.CLEAR_TIME;

                // First jump triggers the intro.
                // 第一次跳转会触发简介

                if (this.tRex.jumpCount == 1 && !this.playingIntro) {
                    this.playIntro();
                }

                // The horizon doesn't move until the intro is over.
                // 直到介绍结束，地平线才会移动
                if (this.playingIntro) {
                    this.horizon.update(0, this.currentSpeed, hasObstacles);
                } else {
                    deltaTime = !this.activated ? 0 : deltaTime;
                    this.horizon.update(deltaTime, this.currentSpeed, hasObstacles, this.inverted);
                }


                // Check for collisions.
                // 检查障碍物与霸王龙有无碰撞
                var collision = hasObstacles && checkForCollision(this.horizon.obstacles[0], this.tRex);

                if (!collision) {
                    //距离等于当前的速度*更新时间除以每帧毫秒的累加
                    this.distanceRan += this.currentSpeed * deltaTime / this.msPerFrame;
                    if (this.currentSpeed < this.config.MAX_SPEED) {
                        this.currentSpeed += this.config.ACCELERATION;
                    }

                    //变身触发音效
                    if (updateSkinStatus) {
                        this.playSound(this.soundFx.SCORE);
                        updateSkinStatus = false;
                    }

                } else {
                    //有碰撞则游戏结束
                    this.gameOver();
                }

                // 游戏成就之声
                var playAchievementSound = this.distanceMeter.update(deltaTime, Math.ceil(this.distanceRan));

                if (playAchievementSound) {
                    //不同分数有不同声效
                    this.playSound(this.soundFx.SCORE);
                }

                //获取当前距离分数
                var actualDistance = this.distanceMeter.getActualDistance(Math.ceil(this.distanceRan));

                // Night mode.
                // 夜间模式
                if (this.invertTimer > this.config.INVERT_FADE_DURATION) {
                    this.invertTimer = 0;
                    this.invertTrigger = false;
                    this.invert();
                } else if (this.invertTimer) {
                    this.invertTimer += deltaTime;
                } else {
                    // 根据距离触发夜景模式
                    if (actualDistance > 0) {
                        // 距离超过700时触发夜景模式
                        this.invertTrigger = !(actualDistance % this.config.INVERT_DISTANCE);

                        if (this.invertTrigger && this.invertTimer === 0) {
                            this.invertTimer += deltaTime;
                            this.invert();
                        }
                    }
                }
            }

            if (this.playing || (!this.activated && this.tRex.blinkCount < Runner.config.MAX_BLINK_COUNT)) {
                this.tRex.update(deltaTime);
                this.scheduleNextUpdate();
            }

            // 如果boss出现并且公主未在空中
            if (appearBoss && !this.tRex.jumping && !fightingEnd) {
                //触发战斗画面
                this.StartFighting();
            }

            //骑士出现
            if (meetStatus === 'start') {
                this.princessCloseToKnight();
            }

            // 开始求婚
            if (this.tRex.status === 'HANDINHAND') {
                this.stop();
                this.triggerRing();
            }

            // 切换牵手状态
            if (proposeStatus === 'start') {
                this.tRex.update(0, 'HANDINHAND');
            }

            //公主和骑士相遇
            if (meetStatus === 'end') {
                console.log('相遇了呀');
                proposeStatus = 'start';
            }

        },

        /**
         * Event handler.
         * 事件钩子
         */
        handleEvent: function (e) {
            return (function (evtType, events) {
                switch (evtType) {
                    case events.KEYDOWN:
                    case events.TOUCHSTART:
                    case events.MOUSEDOWN:
                        // 键盘按下时、点击屏幕开始时、鼠标点击时
                        this.onKeyDown(e);
                        break;
                    case events.KEYUP:
                    case events.TOUCHEND:
                    case events.MOUSEUP:
                        this.onKeyUp(e);
                        break;
                }
            }.bind(this))(e.type, Runner.events);
        },

        /**
         * Bind relevant key / mouse / touch listeners.
         * 绑定相关键/鼠标/触摸监听器。
         */
        startListening: function () {
            // Keys.
            document.addEventListener(Runner.events.KEYDOWN, this);
            document.addEventListener(Runner.events.KEYUP, this);

            if (IS_MOBILE) {
                // Mobile only touch devices.-仅限移动触摸设备
                this.touchController.addEventListener(Runner.events.TOUCHSTART, this);
                this.touchController.addEventListener(Runner.events.TOUCHEND, this);
                this.containerEl.addEventListener(Runner.events.TOUCHSTART, this);
            } else {
                // Mouse.
                document.addEventListener(Runner.events.MOUSEDOWN, this);
                document.addEventListener(Runner.events.MOUSEUP, this);
            }
        },

        /**
         * Remove all listeners.
         * 移除所有监听器
         */
        stopListening: function () {
            document.removeEventListener(Runner.events.KEYDOWN, this);
            document.removeEventListener(Runner.events.KEYUP, this);

            if (IS_MOBILE) {
                this.touchController.removeEventListener(Runner.events.TOUCHSTART, this);
                this.touchController.removeEventListener(Runner.events.TOUCHEND, this);
                this.containerEl.removeEventListener(Runner.events.TOUCHSTART, this);
            } else {
                document.removeEventListener(Runner.events.MOUSEDOWN, this);
                document.removeEventListener(Runner.events.MOUSEUP, this);
            }
        },

        /**
         * Process keydown.
         * 监控键盘按下，控制小恐龙的行为
         * @param {Event} e
         */
        onKeyDown: function (e) {
            // Prevent native page scrolling whilst tapping on mobile.
            // 在手机上点击时防止本机页面滚动。
            if (IS_MOBILE && this.playing) {
                e.preventDefault();// 取消该事件
            }

            // 开始求婚则不允许操作了;
            if (proposeStatus === 'start') {
                return;
            }

            // 如果不是点了特殊按钮
            if (e.target != this.detailsButton) {
                // 不是已坠毁 && （敲了空格或者up || 触摸屏幕）
                if (!this.crashed && (Runner.keycodes.JUMP[e.keyCode] || e.type == Runner.events.TOUCHSTART)) {

                    // 触发了自定义事件
                    if ((!this.tRex.jumping && !fightingEnd && appearBoss) || (appearKnight)) {
                        fightingEnd = true;
                        document.getElementById('fighting-img').style.display = 'none';
                        console.log('BOSS被击败');

                        this.tRex.reset();
                        this.play();
                        return;
                    }

                    if (!this.playing) {// 首次点击跳跃
                        //首次点击隐藏初始的静态小恐龙
                        fadeOutElement();
                        this.loadSounds();//加载音效
                        this.playing = true;// 游戏开始
                        this.update();
                        playAudio('bgm-world8bit');
                        if (window.errorPageController) {
                            errorPageController.trackEasterEgg();
                        }
                    }

                    // Play sound effect and jump on starting the game for the first time.
                    // 第一次开始游戏时播放音效和跳跃。
                    if (!this.tRex.jumping && !this.tRex.ducking) {
                        this.playSound(this.soundFx.BUTTON_PRESS);
                        this.tRex.startJump(this.currentSpeed);
                    }



                }

                // 如果是已坠毁 && 触摸屏 && 触摸游戏区域
                if (this.crashed && e.type == Runner.events.TOUCHSTART && e.currentTarget == this.containerEl) {
                    // 游戏重启
                    this.restart();
                }
            }

            // 如果是游戏中 && 没坠毁 && 点击了down按钮
            if (this.playing && !this.crashed && Runner.keycodes.DUCK[e.keyCode]) {
                e.preventDefault();
                if (this.tRex.jumping) {
                    // Speed drop, activated only when jump key is not pressed.
                    // 跳到半空中时候点击了down按钮的话，速度下降，仅在未按下跳转键时激活。
                    this.tRex.setSpeedDrop(); //加速下降
                } else if (!this.tRex.jumping && !this.tRex.ducking) {
                    // Duck.- 恐龙低头
                    this.tRex.setDuck(true);
                }
            }

        },


        /**
         * Process key up.
         * 监控键盘松开
         * @param {Event} e
         */
        onKeyUp: function (e) {

            // 开始求婚则不允许操作了;
            if (proposeStatus === 'start') {
                return;
            }

            var keyCode = String(e.keyCode);
            var isjumpKey = Runner.keycodes.JUMP[keyCode] || e.type == Runner.events.TOUCHEND || e.type == Runner.events.MOUSEDOWN;

            if (this.isRunning() && isjumpKey) {
                //如果奔跑中松开了jump键则结束小恐龙的jump
                this.tRex.endJump();
            } else if (Runner.keycodes.DUCK[keyCode]) {
                //松开了down键才会结束蹲下动作
                this.tRex.speedDrop = false;
                this.tRex.setDuck(false);
            } else if (this.crashed) {//已经坠毁
                // Check that enough time has elapsed before allowing jump key to restart.
                // 在允许跳转键重新启动之前，请检查是否经过了足够的时间。
                var deltaTime = getTimeStamp() - this.time;

                //如果是点击了回车键或者是鼠标左键 || （游戏结束后750ms && 跳跃键）
                if (Runner.keycodes.RESTART[keyCode] || this.isLeftClickOnCanvas(e) ||
                    (deltaTime >= this.config.GAMEOVER_CLEAR_TIME && Runner.keycodes.JUMP[keyCode])) {
                    //重启游戏
                    this.restart();
                }
            } else if (this.paused && isjumpKey) {
                // 如果暂停情况下点击jump键，继续游戏
                // Reset the jump state
                this.tRex.reset();
                this.tRex.update(0, Trex.status.RUNNING);
            }

        },

        /**
         * Returns whether the event was a left click on canvas.
         * 返回事件是否为画布上的左键单击。
         * On Windows right click is registered as a click.
         * 在Windows上，右键单击注册为单击。
         * @param {Event} e
         * @return {boolean}
         */
        isLeftClickOnCanvas: function (e) {
            return e.button != null && e.button < 2 &&
                e.type == Runner.events.MOUSEUP && e.target == this.canvas;
        },

        /**
         * RequestAnimationFrame wrapper.
         */
        scheduleNextUpdate: function () {
            if (!this.updatePending) {
                this.updatePending = true;
                this.raqId = requestAnimationFrame(this.update.bind(this));
            }
        },

        /**
         * Whether the game is running.
         * 判断游戏是否在进行
         * @return {boolean}
         */
        isRunning: function () {
            return !!this.raqId;
        },

        /**
         * Game over state.
         * 游戏结束状态
         */
        gameOver: function () {
            this.playSound(this.soundFx.HIT);
            //移动设备震动一下
            vibrate(200);

            this.crashed = true;
            this.distanceMeter.acheivement = false;

            this.stop();
            this.tRex.update(0, StatusFromSkin(this.tRex.skinStatus, 'CRASHED'));


            // Game over panel.
            if (!this.gameOverPanel) {
                this.gameOverPanel = new GameOverPanel(this.canvas,
                    this.spriteDef.TEXT_SPRITE, this.spriteDef.RESTART,
                    this.dimensions);
            } else {
                this.gameOverPanel.draw();
            }

            // Update the high score.
            // 更新高分
            if (this.distanceRan > this.highestScore) {
                this.highestScore = Math.ceil(this.distanceRan);
                this.distanceMeter.setHighScore(this.highestScore);
            }

            // Reset the time clock.
            this.time = getTimeStamp();
        },

        //游戏停止，取消动画帧
        stop: function () {
            this.playing = false;
            this.paused = true;
            cancelAnimationFrame(this.raqId);
            this.raqId = 0;
            stopAudio('bgm-world8bit');
        },

        //游戏开始
        play: function () {
            if (!this.crashed) {
                this.playing = true;
                this.paused = false;
                this.tRex.update(0, StatusFromSkin(this.tRex.skinStatus, 'RUNNING'));
                this.time = getTimeStamp();
                this.update();
                playAudio('bgm-world8bit');
            }
        },

        //游戏重启
        restart: function () {
            if (!this.raqId) {
                this.playCount++;
                this.runningTime = 0;
                this.playing = true;
                this.crashed = false;
                this.distanceRan = 0;
                this.setSpeed(this.config.SPEED);
                this.time = getTimeStamp();
                this.containerEl.classList.remove(Runner.classes.CRASHED);
                this.clearCanvas();
                this.distanceMeter.reset(this.highestScore);
                this.horizon.reset();
                this.tRex.skinStatus = 'PRINCESS';
                this.tRex.reset();
                this.playSound(this.soundFx.BUTTON_PRESS);
                this.invert(true);
                this.update();
                playAudio('bgm-world8bit');

                //变量初始化
                fightingEnd = false;
                appearBoss = false;
                appearKnight = false;
                meetStatus = 'waitting';

            }
        },

        /**
         * Pause the game if the tab is not in focus.
         * 如果标签不在焦点位置，暂停游戏
         */
        onVisibilityChange: function (e) {
            if (document.hidden || document.webkitHidden || e.type == 'blur' || document.visibilityState != 'visible') {
                this.stop();
            } else if (!this.crashed) {
                this.tRex.reset();
                this.play();
            }
        },



        /**
         * Play a sound.
         * 播放声音
         * @param {SoundBuffer} soundBuffer
         */
        playSound: function (soundBuffer) {
            if (soundBuffer) {
                var sourceNode = this.audioContext.createBufferSource();
                sourceNode.buffer = soundBuffer;
                sourceNode.connect(this.audioContext.destination);
                sourceNode.start(0);
            }
        },

        /**
         * Inverts the current page / canvas colors.
         * 反转当前页面/画布的颜色。
         * @param {boolean} Whether to reset colors.
         */
        invert: function (reset) {
            if (reset) {
                document.body.classList.toggle(Runner.classes.INVERTED, false);
                this.invertTimer = 0;
                this.inverted = false;
            } else {
                this.inverted = document.body.classList.toggle(Runner.classes.INVERTED,
                    this.invertTrigger);
            }
        },

        /**
         * 触发战斗
         */
        StartFighting: function () {
            this.stop();
            document.getElementById('fighting_box').style.display = 'block';
        },

        /**
         * 公主向骑士靠近
         */
        princessCloseToKnight: function () {
            meetStatus = 'ing';
            this.stop();
        },

        /**
         * 触发💍弹出的彩蛋
         */
        triggerRing: function () {
            var RunnerContainer = document.getElementById('runner-container');
            var fireworksImg = RunnerContainer.getElementsByTagName("img");
            if (fireworksImg.length < 1) {
                //烟花
                var img = document.createElement('img');//创建一个标签
                img.setAttribute('src', 'assets/material_img/fireworks.gif');//给标签定义src链接
                img.setAttribute('id', 'fireworks-img');
                RunnerContainer.appendChild(img);//放到指定的id里
                //爱心
                var loveImg = document.createElement('img');//创建一个标签
                loveImg.setAttribute('src', 'assets/material_img/love.png');//给标签定义src链接
                loveImg.setAttribute('id', 'love-img');
                RunnerContainer.appendChild(loveImg);//放到指定的id里
                //弹幕
                setTimeout("getBless()", 2000);
            }
        },

    };

    /**
     * Updates the canvas size taking into
     * account the backing store pixel ratio and
     * the device pixel ratio.
     * 更新画布大小，同时考虑备份存储像素比率和设备像素比率
     *
     * See article by Paul Lewis:
     * http://www.html5rocks.com/en/tutorials/canvas/hidpi/
     *
     * @param {HTMLCanvasElement} canvas
     * @param {number} opt_width
     * @param {number} opt_height
     * @return {boolean} Whether the canvas was scaled.
     */
    Runner.updateCanvasScaling = function (canvas, opt_width, opt_height) {
        var context = canvas.getContext('2d');

        // Query the various pixel ratios
        var devicePixelRatio = Math.floor(window.devicePixelRatio) || 1;
        var backingStoreRatio = Math.floor(context.webkitBackingStorePixelRatio) || 1;
        var ratio = devicePixelRatio / backingStoreRatio;

        // Upscale the canvas if the two ratios don't match
        if (devicePixelRatio !== backingStoreRatio) {
            var oldWidth = opt_width || canvas.width;
            var oldHeight = opt_height || canvas.height;

            canvas.width = oldWidth * ratio;
            canvas.height = oldHeight * ratio;

            canvas.style.width = oldWidth + 'px';
            canvas.style.height = oldHeight + 'px';

            // Scale the context to counter the fact that we've manually scaled
            // our canvas element.
            context.scale(ratio, ratio);
            return true;
        } else if (devicePixelRatio == 1) {
            // Reset the canvas width / height. Fixes scaling bug when the page is
            // zoomed and the devicePixelRatio changes accordingly.
            canvas.style.width = canvas.width + 'px';
            canvas.style.height = canvas.height + 'px';
        }
        return false;
    };


    /**
     * Get random number.
     * 获取随机数。
     * @param {number} min
     * @param {number} max
     * @param {number}
     */
    function getRandomNum(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }


    /**
     * Vibrate on mobile devices.
     * 在移动设备上振动。
     * @param {number} duration Duration of the vibration in milliseconds.
     */
    function vibrate(duration) {
        if (IS_MOBILE && window.navigator.vibrate) {
            window.navigator.vibrate(duration);
        }
    }


    /**
     * Create canvas element.
     * 创建画布元素。
     * @param {HTMLElement} container Element to append canvas to.
     * @param {number} width
     * @param {number} height
     * @param {string} opt_classname
     * @return {HTMLCanvasElement}
     */
    function createCanvas(container, width, height, opt_classname) {
        var canvas = document.createElement('canvas');
        canvas.className = opt_classname ? Runner.classes.CANVAS + ' ' +
            opt_classname : Runner.classes.CANVAS;
        canvas.width = width;
        canvas.height = height;
        container.appendChild(canvas);

        return canvas;
    }


    /**
     * Decodes the base 64 audio to ArrayBuffer used by Web Audio.
     * 将基本64音频解码为Web audio使用的ArrayBuffer。
     * @param {string} base64String
     */
    function decodeBase64ToArrayBuffer(base64String) {
        var len = (base64String.length / 4) * 3;
        var str = atob(base64String);
        var arrayBuffer = new ArrayBuffer(len);
        var bytes = new Uint8Array(arrayBuffer);

        for (var i = 0; i < len; i++) {
            bytes[i] = str.charCodeAt(i);
        }
        return bytes.buffer;
    }


    /**
     * Return the current timestamp.
     * 返回当前时间戳
     * @return {number}
     */
    function getTimeStamp() {
        return IS_IOS ? new Date().getTime() : performance.now();
    }




    //******************************************************************************


    /**
     * Game over panel.
     * 游戏结束
     * @param {!HTMLCanvasElement} canvas
     * @param {Object} textImgPos
     * @param {Object} restartImgPos
     * @param {!Object} dimensions Canvas dimensions.
     * @constructor
     */
    function GameOverPanel(canvas, textImgPos, restartImgPos, dimensions) {
        this.canvas = canvas;
        this.canvasCtx = canvas.getContext('2d');
        this.canvasDimensions = dimensions;
        this.textImgPos = textImgPos;
        this.restartImgPos = restartImgPos;
        this.draw();
    };

    /**
    * 根据皮肤切换动作
    * */
    function StatusFromSkin(skin, status) {
        skin = (skin == 'PRINCESS') ? '' : skin;
        var skinStatus = skin + status;
        return Trex.status[skinStatus];
    }


    /**
     * Dimensions used in the panel.
     * 面板中使用的尺寸。
     * @enum {number}
     */
    GameOverPanel.dimensions = {
        TEXT_X: 0,
        TEXT_Y: 13,
        TEXT_WIDTH: 191,
        TEXT_HEIGHT: 11,
        RESTART_WIDTH: 36,
        RESTART_HEIGHT: 32
    };


    /**
     * 游戏结束的原型对象
     * */
    GameOverPanel.prototype = {
        /**
         * Update the panel dimensions.
         * 更新面板尺寸。
         * @param {number} width New canvas width.
         * @param {number} opt_height Optional new canvas height.
         */
        updateDimensions: function (width, opt_height) {
            this.canvasDimensions.WIDTH = width;
            if (opt_height) {
                this.canvasDimensions.HEIGHT = opt_height;
            }
        },

        /**
         * Draw the panel.
         * 绘制面板。
         */
        draw: function () {
            var dimensions = GameOverPanel.dimensions;

            var centerX = this.canvasDimensions.WIDTH / 2;

            // Game over text.-游戏结束文字
            var textSourceX = dimensions.TEXT_X;
            var textSourceY = dimensions.TEXT_Y;
            var textSourceWidth = dimensions.TEXT_WIDTH;
            var textSourceHeight = dimensions.TEXT_HEIGHT;

            var textTargetX = Math.round(centerX - (dimensions.TEXT_WIDTH / 2));
            var textTargetY = Math.round((this.canvasDimensions.HEIGHT - 25) / 3);
            var textTargetWidth = dimensions.TEXT_WIDTH;
            var textTargetHeight = dimensions.TEXT_HEIGHT;

            var restartSourceWidth = dimensions.RESTART_WIDTH;
            var restartSourceHeight = dimensions.RESTART_HEIGHT;
            var restartTargetX = centerX - (dimensions.RESTART_WIDTH / 2);
            var restartTargetY = this.canvasDimensions.HEIGHT / 2;

            if (IS_HIDPI) {
                textSourceY *= 2;
                textSourceX *= 2;
                textSourceWidth *= 2;
                textSourceHeight *= 2;
                restartSourceWidth *= 2;
                restartSourceHeight *= 2;
            }

            textSourceX += this.textImgPos.x;
            textSourceY += this.textImgPos.y;

            // Game over text from sprite.
            // 从雪碧图中获取游戏结束文本
            this.canvasCtx.drawImage(Runner.imageSprite,
                textSourceX, textSourceY, textSourceWidth, textSourceHeight,
                textTargetX, textTargetY, textTargetWidth, textTargetHeight);

            // Restart button.
            // 游戏重启按钮
            this.canvasCtx.drawImage(Runner.imageSprite,
                this.restartImgPos.x, this.restartImgPos.y,
                restartSourceWidth, restartSourceHeight,
                restartTargetX, restartTargetY, dimensions.RESTART_WIDTH,
                dimensions.RESTART_HEIGHT);
        }
    };


    //******************************************************************************

    /**
     * Check for a collision.
     * 检查有无碰撞。
     * @param {!Obstacle} obstacle
     * @param {!Trex} tRex T-rex object.
     * @param {HTMLCanvasContext} opt_canvasCtx Optional canvas context for drawing
     *    collision boxes.
     * @return {Array<CollisionBox>}
     */
    function checkForCollision(obstacle, tRex, opt_canvasCtx) {
        //创建最外层的大盒子
        var obstacleBoxXPos = Runner.defaultDimensions.WIDTH + obstacle.xPos;

        // Adjustments are made to the bounding box as there is a 1 pixel white
        // 由于有一个1像素的白色，因此会对边界框进行调整
        // border around the t-rex and obstacles.
        // 霸王龙和障碍物周围的边界。
        var tRexBox = new CollisionBox(
            tRex.xPos + 1,
            tRex.yPos + 1,
            tRex.config.WIDTH - 2,
            tRex.config.HEIGHT - 2);

        var obstacleBox = new CollisionBox(
            obstacle.xPos + 1,
            obstacle.yPos + 1,
            obstacle.typeConfig.width * obstacle.size - 2,
            obstacle.typeConfig.height - 2);

        // Debug outer box
        if (opt_canvasCtx) {
            drawCollisionBoxes(opt_canvasCtx, tRexBox, obstacleBox);
        }

        // Simple outer bounds check.
        if (boxCompare(tRexBox, obstacleBox)) {
            var collisionBoxes = obstacle.collisionBoxes;
            var tRexCollisionBoxes = tRex.ducking ?
                Trex.collisionBoxes.DUCKING : Trex.collisionBoxes.RUNNING;

            // Detailed axis aligned box check.
            for (var t = 0; t < tRexCollisionBoxes.length; t++) {
                for (var i = 0; i < collisionBoxes.length; i++) {
                    //修正盒子
                    var adjTrexBox = createAdjustedCollisionBox(tRexCollisionBoxes[t], tRexBox);
                    var adjObstacleBox = createAdjustedCollisionBox(collisionBoxes[i], obstacleBox);
                    var crashed = boxCompare(adjTrexBox, adjObstacleBox);

                    // Draw boxes for debug.
                    if (opt_canvasCtx) {
                        drawCollisionBoxes(opt_canvasCtx, adjTrexBox, adjObstacleBox);
                    }

                    if (crashed) {
                        // 换皮肤
                        if (obstacle.typeConfig.isBuff) {
                            // 获取猫咪Buff变换皮肤
                            updateSkin(obstacle, tRex);
                            return false;
                        }
                        if (obstacle.typeConfig.type === 'KNIGHT') {
                            // 公主和骑士相遇了
                            // this.triggerRing();
                            obstacle.remove = true;
                            meetStatus = 'end';
                            return false;
                        }
                        return [adjTrexBox, adjObstacleBox];
                    }
                }
            }
        }
        return false;
    };

    /**
    * 更换皮肤
    * */
    function updateSkin(skin, tRex) {
        skin.remove = true;
        updateSkinStatus = true;
        tRex.update(0, StatusFromSkin(skin.typeConfig.type, 'RUNNING'));
        tRex.skinStatus = skin.typeConfig.type;
    };

    /**
    * 播放音乐
    * */
    function playAudio(audioId, isLoop = false) {
        var audio = document.getElementById(audioId);
        if (audio !== null) {
            audio.play(); // 播放
        }
    }

    /**
    * 暂停音乐
    * */
    function stopAudio(audioId) {
        var audio = document.getElementById(audioId);
        if (audio !== null) {
            audio.pause(); // 暂停
        }
    }

    /**
     * Adjust the collision box.
     * 调整碰撞框，将相对坐标转为画布坐标
     * @param {!CollisionBox} box The original box.
     * @param {!CollisionBox} adjustment Adjustment box.
     * @return {CollisionBox} The adjusted collision box object.
     */
    function createAdjustedCollisionBox(box, adjustment) {
        return new CollisionBox(
            box.x + adjustment.x,
            box.y + adjustment.y,
            box.width,
            box.height);
    };


    /**
     * Draw the collision boxes for debug.
     * 绘制用于调试的冲突框。
     */
    function drawCollisionBoxes(canvasCtx, tRexBox, obstacleBox) {
        canvasCtx.save();
        canvasCtx.strokeStyle = '#f00';
        canvasCtx.strokeRect(tRexBox.x, tRexBox.y, tRexBox.width, tRexBox.height);

        canvasCtx.strokeStyle = '#0f0';
        canvasCtx.strokeRect(obstacleBox.x, obstacleBox.y,
            obstacleBox.width, obstacleBox.height);
        canvasCtx.restore();
    };


    /**
     * Compare two collision boxes for a collision.
     * 比较两个碰撞框中的碰撞。
     * @param {CollisionBox} tRexBox 霸王龙的碰撞盒子
     * @param {CollisionBox} obstacleBox 障碍物的碰撞盒子
     * @return {boolean} Whether the boxes intersected.-盒子是否相交
     */
    function boxCompare(tRexBox, obstacleBox) {
        var crashed = false;
        var tRexBoxX = tRexBox.x;
        var tRexBoxY = tRexBox.y;

        var obstacleBoxX = obstacleBox.x;
        var obstacleBoxY = obstacleBox.y;

        // Axis-Aligned Bounding Box method.
        // 轴对齐边界框方法。
        if (tRexBox.x < obstacleBoxX + obstacleBox.width &&
            tRexBox.x + tRexBox.width > obstacleBoxX &&
            tRexBox.y < obstacleBox.y + obstacleBox.height &&
            tRexBox.height + tRexBox.y > obstacleBox.y) {
            crashed = true;
        }

        return crashed;
    };


    //******************************************************************************

    /**
     * 碰撞盒子
     * @param {number} x X position.盒子x坐标
     * @param {number} y Y Position.盒子y坐标
     * @param {number} w Width.盒子宽度
     * @param {number} h Height.盒子高度
     */
    function CollisionBox(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
    };






    //******************************************************************************

    /**
     * Obstacle.
     * 障碍
     * @param {HTMLCanvasCtx} canvasCtx
     * @param {Obstacle.type} type
     * @param {Object} spritePos Obstacle position in sprite.
     * @param {Object} dimensions
     * @param {number} gapCoefficient Mutipler in determining the gap.
     * @param {number} speed
     * @param {number} opt_xOffset
     */
    function Obstacle(canvasCtx, type, spriteImgPos, dimensions, gapCoefficient, speed, opt_xOffset) {

        this.canvasCtx = canvasCtx;
        this.spritePos = spriteImgPos;
        //障碍物类型(仙人掌、翼龙)
        this.typeConfig = type;
        this.gapCoefficient = gapCoefficient;
        //每个障碍物的数量(1~3)
        this.size = getRandomNum(1, Obstacle.MAX_OBSTACLE_LENGTH);
        this.dimensions = dimensions;
        //表示该障碍物是否可以被移除
        this.remove = false;
        //水平坐标
        this.xPos = dimensions.WIDTH + (opt_xOffset || 0);
        this.yPos = 0;
        this.width = 0;
        this.collisionBoxes = [];
        this.gap = 0;
        //速度修正
        this.speedOffset = 0;

        //障碍物的动画帧
        this.currentFrame = 0;
        //动画帧切换的计时器
        this.timer = 0;

        this.init(speed);
    };

    /**
     * Coefficient for calculating the maximum gap.
     * 障碍物最大间距系数
     * @const
     */
    Obstacle.MAX_GAP_COEFFICIENT = 1.5; //障碍物最大间距系数

    /**
     * Maximum obstacle grouping count.
     * 每组障碍物的最大数量
     * @const
     */
    Obstacle.MAX_OBSTACLE_LENGTH = 1;

    //障碍物的原型对象
    Obstacle.prototype = {
        /**
         * Initialise the DOM for the obstacle.
         * 为障碍物初始化DOM
         * @param {number} speed
         */
        init: function (speed) {
            // 复制碰撞框
            this.cloneCollisionBoxes();

            // Only allow sizing if we're at the right speed.
            // 只有在速度合适的情况下才允许调整尺寸。
            // 如果随机障碍物是翼龙，则只出现一只
            // 翼龙的multipleSpeed是999，远大于speed
            if ((this.size > 1 && this.typeConfig.multipleSpeed > speed) || this.typeConfig.isBuff) {
                this.size = 1;
            }

            //障碍物的总宽度等于单个障碍物的宽度乘以个数
            this.width = this.typeConfig.width[0] * this.size;

            // Check if obstacle can be positioned at various heights.
            // 检查障碍物是否可以放置在不同的高度。
            // 若障碍物的纵坐标是一个数组
            if (Array.isArray(this.typeConfig.yPos)) {
                //则随机选取一个
                var yPosConfig = IS_MOBILE ? this.typeConfig.yPosMobile : this.typeConfig.yPos;
                this.yPos = yPosConfig[getRandomNum(0, yPosConfig.length - 1)];
            } else {
                this.yPos = this.typeConfig.yPos;
            }

            this.draw();

            // Make collision box adjustments,
            // Central box is adjusted to the size as one box.
            // 进行碰撞盒调整，将中央盒调整为一个盒的大小
            //      ____        ______        ________
            //    _|   |-|    _|     |-|    _|       |-|
            //   | |<->| |   | |<--->| |   | |<----->| |
            //   | | 1 | |   | |  2  | |   | |   3   | |
            //   |_|___|_|   |_|_____|_|   |_|_______|_|
            //
            if (this.size > 1) {
                this.collisionBoxes[1].width = this.width - this.collisionBoxes[0].width -
                    this.collisionBoxes[2].width;
                this.collisionBoxes[2].x = this.width - this.collisionBoxes[2].width;
            }

            // For obstacles that go at a different speed from the horizon.
            // 以不同于地平线的速度行进的障碍物。
            // 对翼龙的速度进行修正，让它看起来有的飞得快一些，有些飞得慢一些
            if (this.typeConfig.speedOffset) {
                this.speedOffset = Math.random() > 0.5 ? this.typeConfig.speedOffset : -this.typeConfig.speedOffset;
            }

            //障碍物之间的间隙，与游戏速度有关
            this.gap = this.getGap(this.gapCoefficient, speed);
        },

        /**
         * Draw and crop based on size.
         */
        draw: function () {
            //障碍物宽高
            var sourceWidth = this.typeConfig.width[this.currentFrame];
            var sourceHeight = this.typeConfig.height[this.currentFrame];

            // X position in sprite.
            // 根据障碍物数量计算障碍物在雪碧图上的x坐标
            // this.size的取值范围是1~3
            // var sourceX = (sourceWidth * this.size) * (0.5 * (this.size - 1)) + this.spritePos.x;
            var sourceX = this.spritePos.x;
            var sourceY = this.spritePos.y;

            // Animation frames.
            // 如果当前动画帧大于0，说明障碍物类型是翼龙
            // 更新翼龙的雪碧图x坐标使其匹配第二帧动画
            sourceX += this.typeConfig.spriteX[this.currentFrame];
            sourceY += this.typeConfig.spriteY[this.currentFrame];

            var boxH = this.typeConfig.boxH;//在游戏中的角色高度固定


            if (this.typeConfig.type === 'BOSS' && fightingEnd) {
                boxH = 80;
                this.yPos = 200;
            }
            var boxW = Math.round(boxH * sourceWidth * this.size / sourceHeight); //宽度根据角色图的比例来

            this.canvasCtx.drawImage(Runner.imageSprite,
                sourceX, sourceY,
                sourceWidth * this.size, sourceHeight,
                this.xPos, this.yPos,
                boxW * this.size, boxH);

        },

        /**
         * Obstacle frame update.
         * 单个障碍物的移动
         * @param {number} deltaTime
         * @param {number} speed
         */
        update: function (deltaTime, speed) {
            //如果障碍物还没有移出屏幕外
            if (!this.remove) {
                //如果有速度修正则修正速度
                if (this.typeConfig.speedOffset) {
                    speed += this.speedOffset;
                }
                //更新x坐标,如果求婚开始，障碍物则不移动，公主移动
                if (meetStatus != 'ing') {
                    this.xPos -= Math.floor((speed * FPS / 1000) * deltaTime);
                }


                // Update frame
                if (this.typeConfig.numFrames) {
                    this.timer += deltaTime;
                    if (this.timer >= this.typeConfig.frameRate) {
                        //在两个动画帧之间来回切换以达到动画效果
                        this.currentFrame = this.currentFrame == this.typeConfig.numFrames - 1 ? 0 : this.currentFrame + 1;
                        this.timer = 0;
                    }
                }
                this.draw();

                if (!this.isVisible()) {
                    this.remove = true;
                    if (this.typeConfig.type == 'BOSS') {
                        appearBoss = false;
                    }
                }

                //当boss出场后，画面暂停，出现战斗特效
                if (this.typeConfig.type == 'BOSS' && this.xPos < (DEFAULT_WIDTH * 4 / 5) && this.xPos > (DEFAULT_WIDTH / 2)) {
                    appearBoss = true;
                }

                //当骑士出场后，居中后暂停，准备开始求婚
                if (this.typeConfig.type == 'KNIGHT') {
                    console.log('meetStatus:' + meetStatus);
                    console.log('max:' + (DEFAULT_WIDTH / 2 + 60));
                    console.log('xPos:' + this.xPos);
                }
                if (meetStatus == 'waitting' && this.typeConfig.type == 'KNIGHT' && this.xPos < (DEFAULT_WIDTH / 2 + 40) && this.xPos > (DEFAULT_WIDTH / 2)) {
                    meetStatus = 'start';
                }
            }
        },

        /**
         * Calculate a random gap size.
         * - Minimum gap gets wider as speed increses
         * 障碍物之间的间隔，gapCoefficient为间隔系数
         * @param {number} gapCoefficient
         * @param {number} speed
         * @return {number} The gap size.
         */
        getGap: function (gapCoefficient, speed) {
            var minGap = Math.round(this.width * speed + this.typeConfig.minGap * gapCoefficient);
            var maxGap = Math.round(minGap * Obstacle.MAX_GAP_COEFFICIENT);
            return getRandomNum(minGap, maxGap);
        },

        /**
         * Check if obstacle is visible.
         * 判断障碍物是否移出屏幕外
         * @return {boolean} Whether the obstacle is in the game area.
         */
        isVisible: function () {
            return this.xPos + this.width > 0;
        },

        /**
         * Make a copy of the collision boxes, since these will change based on
         * obstacle type and size.
         * 复制碰撞框，因为它们会根据障碍物的类型和大小而改变
         */
        cloneCollisionBoxes: function () {
            var collisionBoxes = this.typeConfig.collisionBoxes;

            for (var i = collisionBoxes.length - 1; i >= 0; i--) {
                this.collisionBoxes[i] = new CollisionBox(collisionBoxes[i].x,
                    collisionBoxes[i].y, collisionBoxes[i].width,
                    collisionBoxes[i].height);
            }
        }
    };


    /**
     * Obstacle definitions.- 障碍
     * minGap: minimum pixel space betweeen obstacles.
     * multipleSpeed: Speed at which multiples are allowed.
     * speedOffset: speed faster / slower than the horizon.
     * minSpeed: Minimum speed which the obstacle can make an appearance.
     */
    Obstacle.types = [
        {
            type: 'CACTUS_SMALL', //小仙人掌
            isBuff: false,
            width: [81], //宽
            height: [94], //高
            spriteX: [0],
            spriteY: [0],
            boxH: 60, // 游戏中的角色高度
            yPos: 234, //在画布上的y坐标
            multipleSpeed: 4,
            minGap: 120, //最小间距
            minSpeed: 0, //出现前提的最低速度
            collisionBoxes: [
                new CollisionBox(0, 7, 5, 27),
                new CollisionBox(4, 0, 6, 34),
                new CollisionBox(10, 4, 7, 14)
            ]
        },
        {
            type: 'CACTUS_LARGE', //大仙人掌
            isBuff: false,
            width: [85],
            height: [91],
            spriteX: [0],
            spriteY: [0],
            boxH: 60,
            yPos: 234,
            multipleSpeed: 7,
            minGap: 120,
            minSpeed: 0,
            collisionBoxes: [
                new CollisionBox(0, 12, 7, 38),
                new CollisionBox(8, 0, 7, 49),
                new CollisionBox(13, 10, 10, 38)
            ]
        },
        {
            type: 'PTERODACTYL', //翼龙
            isBuff: false,
            width: [158, 135],
            height: [131, 132],
            spriteX: [0, 181],//如果有两帧的话，之前的相对位置
            spriteY: [0, 0],
            boxH: 70, // 游戏中的角色高度
            yPos: [210, 150, 120], //有高、中、低三种高度
            yPosMobile: [210, 210], // 手机的话就有高、低两种高度
            multipleSpeed: 999,
            minSpeed: 6,
            minGap: 20,
            collisionBoxes: [
                new CollisionBox(15, 15, 16, 5),
                new CollisionBox(18, 21, 24, 6),
                new CollisionBox(2, 14, 4, 3),
                new CollisionBox(6, 10, 4, 7),
                new CollisionBox(10, 8, 6, 9)
            ],
            numFrames: 2, //有两个动画帧
            frameRate: 1000 / 6, //动画帧的切换速率，这里为一秒6帧
            speedOffset: .8 //速度修正
        },
        {
            type: 'XUEBI', //雪碧
            isBuff: true,
            width: [78],
            height: [56],
            spriteX: [0],
            spriteY: [0],
            boxH: 30, // 游戏中的角色高度
            yPos: 260,
            multipleSpeed: 7,
            minGap: 20,
            minSpeed: 6,
            collisionBoxes: [
                new CollisionBox(22, 0, 17, 16),
                new CollisionBox(1, 18, 30, 9),
                new CollisionBox(10, 35, 14, 8)
            ]
        },
        {
            type: 'HAITAI', //海苔
            isBuff: true,
            width: [57],
            height: [53],
            spriteX: [0],
            spriteY: [0],
            boxH: 30, // 游戏中的角色高度
            yPos: 260,
            multipleSpeed: 7,
            minGap: 20,
            minSpeed: 6,
            collisionBoxes: [
                new CollisionBox(22, 0, 17, 16),
                new CollisionBox(1, 18, 30, 9),
                new CollisionBox(10, 35, 14, 8)
            ]
        },
        {
            type: 'YUANDAN', //元旦
            isBuff: true,
            width: [66],
            height: [58],
            spriteX: [0],
            spriteY: [0],
            boxH: 30, // 游戏中的角色高度
            yPos: 260,
            multipleSpeed: 7,
            minGap: 20,
            minSpeed: 6,
            collisionBoxes: [
                new CollisionBox(22, 0, 17, 16),
                new CollisionBox(1, 18, 30, 9),
                new CollisionBox(10, 35, 14, 8)
            ]
        },
        {
            type: 'GUNGUN', //元滚滚
            isBuff: true,
            width: [62],
            height: [56],
            spriteX: [0],
            spriteY: [0],
            boxH: 30, // 游戏中的角色高度
            yPos: 260,
            multipleSpeed: 7,
            minGap: 20,
            minSpeed: 6,
            collisionBoxes: [
                new CollisionBox(22, 0, 17, 16),
                new CollisionBox(1, 18, 30, 9),
                new CollisionBox(10, 35, 14, 8)
            ]
        },
        {
            type: 'YUANXIAO', //元宵
            isBuff: true,
            width: [65],
            height: [58],
            spriteX: [0],
            spriteY: [0],
            boxH: 30, // 游戏中的角色高度
            yPos: 260,
            multipleSpeed: 7,
            minGap: 20,
            minSpeed: 6,
            collisionBoxes: [
                new CollisionBox(22, 0, 17, 16),
                new CollisionBox(1, 18, 30, 9),
                new CollisionBox(10, 35, 14, 8)
            ]
        },
        {
            type: 'BOSS', //BOSS
            isBuff: false,
            width: [391, 383],
            height: [424, 424],
            spriteX: [0, 416],
            spriteY: [0, 0],
            boxH: 150, // 游戏中的角色高度
            yPos: 95,
            multipleSpeed: 999,
            minGap: 120,
            minSpeed: 7,
            collisionBoxes: [
                new CollisionBox(22, 0, 17, 16),
                new CollisionBox(1, 18, 30, 9),
                new CollisionBox(10, 35, 14, 8)
            ],
            numFrames: 2, //有两个动画帧
            frameRate: 1000 / 2, //动画帧的切换速率，这里为一秒6帧
            speedOffset: .8 //速度修正
        },
        {
            type: 'KNIGHT', //骑士
            isBuff: false,
            width: [100],
            height: [160],
            spriteX: [0],
            spriteY: [0],
            boxH: 90, // 游戏中的角色高度
            yPos: 207,
            multipleSpeed: 999,
            minGap: 360,
            minSpeed: 999,
            collisionBoxes: [
                new CollisionBox(22, 0, 17, 16),
                new CollisionBox(1, 18, 30, 9),
                new CollisionBox(10, 35, 14, 8)
            ]
        }
    ];


    //******************************************************************************
    /**
     * T-rex game character.
     * 霸王龙游戏角色。
     * @param {HTMLCanvas} canvas
     * @param {Object} spritePos Positioning within image sprite.
     * @constructor
     */
    function Trex(canvas, spritePos) {
        this.canvas = canvas;
        this.canvasCtx = canvas.getContext('2d');
        this.spritePos = spritePos; //在雪碧图中的位置
        this.xPos = 200; //在画布中的x坐标
        this.yPos = 0; //在画布中的y坐标
        // Position when on the ground.-在地面上的位置。
        this.groundYPos = 0; //初始化地面的高度
        this.currentFrame = 0; //初始化动画帧
        this.currentAnimFrames = []; //记录当前状态的动画帧
        this.currentAnimFramesY = []; //记录当前状态的动画帧的Y
        this.blinkDelay = 0; //眨眼延迟(随机)
        this.blinkCount = 0; //眨眼次数
        this.animStartTime = 0; //动画开始的时间
        this.timer = 0; //计时器
        this.msPerFrame = 1000 / FPS; //默认帧率
        this.config = Trex.config; //拷贝一个配置的副本方便以后使用
        // Current status.现状
        this.status = Trex.status.WAITING; //初始化默认状态为待机状态

        //为各种状态建立标识
        this.jumping = false; //角色是否处于跳跃中
        this.ducking = false; //角色是否处于闪避中
        this.jumpVelocity = 0; //跳跃的初始速度
        this.reachedMinHeight = false; //是否到达最小跳跃高度
        this.speedDrop = false; //是否加速降落
        this.jumpCount = 0; //跳跃次数
        this.jumpspotX = 0;
        this.jumpspotY = 0;
        this.skinStatus = Trex.skinType.PRINCESS;

        this.init();
    };


    /**
     * T-rex player config.
     * 霸王龙的配置
     * @enum {number}
     */
    Trex.config = {
        DROP_VELOCITY: -5,
        GRAVITY: 0.6,
        HEIGHT: 70, //站立时高度
        HEIGHT_DUCK: 25,
        HEIGHT_ENDJUMP: 95,
        INIITAL_JUMP_VELOCITY: -10,
        INTRO_DURATION: 4000,
        MAX_JUMP_HEIGHT: 135,
        MIN_JUMP_HEIGHT: 30, //最小起跳高度
        SPEED_DROP_COEFFICIENT: 3,
        SPRITE_WIDTH: 262,
        START_X_POS: DEFAULT_WIDTH,
        WIDTH: 49, //站立时宽度
        WIDTH_DUCK: 59, //闪避时宽度
        WIDTH_ENDJUMP: 49, //闪避时宽度
        WIDTH_CRASHED: 71, //碰撞时宽度
        WIDTH_RUNNING: 59 //奔跑时宽度
    };


    /**
     * Used in collision detection.
     * 用于碰撞检测
     * @type {Array<CollisionBox>}
     */
    Trex.collisionBoxes = {
        DUCKING: [
            new CollisionBox(1, 18, 55, 25)
        ],
        RUNNING: [
            //为恐龙建立了6个碰撞盒子，分布在头、躯干和脚，同时它还有闪避状态
            new CollisionBox(22, 0, 17, 16),
            new CollisionBox(1, 18, 30, 9),
            new CollisionBox(10, 35, 14, 8),
            new CollisionBox(1, 24, 29, 5),
            new CollisionBox(5, 30, 21, 4),
            new CollisionBox(9, 34, 15, 4)
        ]
    };


    /**
     * Animation states.
     * 动画状态。
     * @enum {string}
     */
    Trex.status = {
        CRASHED: 'CRASHED', //与障碍物发生碰撞
        DUCKING: 'DUCKING', //蹲下
        JUMPING: 'JUMPING', //跳跃
        ENDJUMP: 'ENDJUMP', //降落
        RUNNING: 'RUNNING', //跑动
        WAITING: 'WAITING', //待机
        HANDINHAND: 'HANDINHAND', //手牵手
        XUEBIRUNNING: 'XUEBIRUNNING', //雪碧跑
        XUEBIJUMPING: 'XUEBIJUMPING', //雪碧跳
        XUEBICRASHED: 'XUEBICRASHED', //雪碧碰撞
        XUEBIENDJUMP: 'XUEBIENDJUMP', //雪碧降落
        HAITAIRUNNING: 'HAITAIRUNNING', //海苔跑
        HAITAIJUMPING: 'HAITAIJUMPING', //海苔跳
        HAITAICRASHED: 'HAITAICRASHED', //海苔碰撞
        HAITAIENDJUMP: 'HAITAIENDJUMP', //海苔降落
        YUANDANRUNNING: 'YUANDANRUNNING', //元旦跑
        YUANDANJUMPING: 'YUANDANJUMPING', //元旦跳
        YUANDANCRASHED: 'YUANDANCRASHED', //元旦碰撞
        YUANDANENDJUMP: 'YUANDANENDJUMP', //元旦降落
        YUANXIAORUNNING: 'YUANXIAORUNNING', //元宵跑
        YUANXIAOJUMPING: 'YUANXIAOJUMPING', //元宵跳
        YUANXIAOCRASHED: 'YUANXIAOCRASHED', //元宵碰撞
        YUANXIAOENDJUMP: 'YUANXIAOENDJUMP', //元宵降落
        GUNGUNRUNNING: 'GUNGUNRUNNING', //滚滚跑
        GUNGUNJUMPING: 'GUNGUNJUMPING', //滚滚跳
        GUNGUNCRASHED: 'GUNGUNCRASHED', //滚滚碰撞
        GUNGUNENDJUMP: 'GUNGUNENDJUMP', //滚滚降落
    };

    /**
     * 皮肤类型
     * @enum {string}
     */
    Trex.skinType = {
        PRINCESS: 'PRINCESS', //公主
        XUEBI: 'XUEBI', //雪碧
        HAITAI: 'HAITAI', //海苔
        YUANDAN: 'YUANDAN', //元旦
        YUANXIAO: 'YUANXIAO', //元宵
        GUNGUN: 'GUNGUN', //元滚滚
    };

    /**
     * Blinking coefficient.
     * 眨眼间隔
     * @const
     */
    Trex.BLINK_TIMING = 70000; //眨眼间隔


    /**
     * Animation config for different states.
     * 不同状态的动画配置。
     * 元数据(metadata)，记录各个状态的动画帧和帧率
     * @enum {Object}
     */
    Trex.animFrames = {
        WAITING: { //待机状态
            frames: [0, 0], //动画帧x坐标在44和0之间切换，由于在雪碧图中的y坐标是0所以不用记录
            framesY: [0, 0],
            msPerFrame: 1000 / 3, //一秒3帧
            width: [98, 98],
            height: [145, 145]
        },
        RUNNING: {
            frames: [138, 302],
            framesY: [11, 7],
            msPerFrame: 1000 / 12,
            width: [118, 118],
            height: [134, 138]
        },
        CRASHED: {
            frames: [857],
            framesY: [0],
            width: [98],
            height: [144],
            msPerFrame: 1000 / 60
        },
        JUMPING: {
            frames: [458],
            framesY: [9],
            msPerFrame: 1000 / 60,
            width: [95],
            height: [136]
        },
        ENDJUMP: {
            frames: [599],
            framesY: [-44],
            width: [117],
            height: [189],
            msPerFrame: 1000 / 60
        },
        HANDINHAND: {
            frames: [5261],
            framesY: [-16],
            width: [146],
            height: [160],
            msPerFrame: 1000 / 60
        },
        DUCKING: {
            frames: [262, 321],
            msPerFrame: 1000 / 8
        },
        XUEBIRUNNING: {
            frames: [1078, 1215],
            framesY: [23, 16],
            msPerFrame: 1000 / 12,
            width: [109, 104],
            height: [121, 128]
        },
        XUEBIJUMPING: {
            frames: [1334],
            framesY: [19],
            msPerFrame: 1000 / 60,
            width: [95],
            height: [125]
        },
        XUEBIENDJUMP: {
            frames: [1451],
            framesY: [23],
            width: [98],
            height: [121],
            msPerFrame: 1000 / 60
        },
        XUEBICRASHED: {
            frames: [1574],
            framesY: [3],
            width: [62],
            height: [141],
            msPerFrame: 1000 / 60
        },
        HAITAIRUNNING: {
            frames: [2721, 2862],
            framesY: [1, -4],
            msPerFrame: 1000 / 12,
            width: [115, 109],
            height: [143, 148]
        },
        HAITAIJUMPING: {
            frames: [3037],
            framesY: [3],
            msPerFrame: 1000 / 60,
            width: [60],
            height: [141]
        },
        HAITAIENDJUMP: {
            frames: [3133],
            framesY: [-4],
            msPerFrame: 1000 / 60,
            width: [84],
            height: [148]
        },
        HAITAICRASHED: {
            frames: [3259],
            framesY: [-2],
            width: [60],
            height: [145],
            msPerFrame: 1000 / 60
        },
        YUANDANRUNNING: {
            frames: [1823, 1986],
            framesY: [16, 11],
            msPerFrame: 1000 / 12,
            width: [136, 134],
            height: [128, 133]
        },
        YUANDANJUMPING: {
            frames: [2145],
            framesY: [14],
            msPerFrame: 1000 / 60,
            width: [134],
            height: [130]
        },
        YUANDANENDJUMP: {
            frames: [2281],
            framesY: [-22],
            msPerFrame: 1000 / 60,
            width: [167],
            height: [165]
        },
        YUANDANCRASHED: {
            frames: [2473],
            framesY: [7],
            width: [113],
            height: [137],
            msPerFrame: 1000 / 60
        },
        GUNGUNRUNNING: {
            frames: [3508, 3672],
            framesY: [9, 4],
            msPerFrame: 1000 / 12,
            width: [119, 121],
            height: [135, 140]
        },
        GUNGUNJUMPING: {
            frames: [3822],
            framesY: [-2],
            msPerFrame: 1000 / 60,
            width: [113],
            height: [146]
        },
        GUNGUNENDJUMP: {
            frames: [3963],
            framesY: [1],
            msPerFrame: 1000 / 60,
            width: [116],
            height: [143]
        },
        GUNGUNCRASHED: {
            frames: [4096],
            framesY: [2],
            width: [112],
            height: [141],
            msPerFrame: 1000 / 60
        },
        YUANXIAORUNNING: {
            frames: [4384, 4519],
            framesY: [-2, -6],
            msPerFrame: 1000 / 12,
            width: [126, 127],
            height: [146, 150]
        },
        YUANXIAOJUMPING: {
            frames: [4681],
            framesY: [-15],
            msPerFrame: 1000 / 60,
            width: [124],
            height: [159]
        },
        YUANXIAOENDJUMP: {
            frames: [4829],
            framesY: [-4],
            msPerFrame: 1000 / 60,
            width: [132],
            height: [148]
        },
        YUANXIAOCRASHED: {
            frames: [4981],
            framesY: [-10],
            width: [124],
            height: [154],
            msPerFrame: 1000 / 60
        }
    };


    /**
    * 霸王龙的原型对象
    * */
    Trex.prototype = {
        /**
         * T-rex player initaliser.
         * 霸王龙玩家启动。
         * Sets the t-rex to blink at random intervals.
         * 设置霸王龙以随机间隔闪烁。
         */
        init: function () {
            this.groundYPos = Runner.defaultDimensions.HEIGHT - this.config.HEIGHT - Runner.config.BOTTOM_PAD;
            this.yPos = this.groundYPos;
            //计算出最小起跳高度
            this.minJumpHeight = this.groundYPos - this.config.MIN_JUMP_HEIGHT;

            this.draw(0, 0, 98, 145);
            this.update(0, Trex.status.WAITING);
        },

        /**
         * Setter for the jump velocity.
         * 设置跳跃速度
         * The approriate drop velocity is also set.
         * 设置落地速度
         */
        setJumpVelocity: function (setting) {
            this.config.INIITAL_JUMP_VELOCITY = -setting;
            this.config.DROP_VELOCITY = -setting / 2;
        },

        /**
         * Set the animation status.
         * 设置动画状态。
         * @param {!number} deltaTime
         * @param {Trex.status} status Optional status to switch to.
         */
        update: function (deltaTime, opt_status) {
            this.timer += deltaTime;

            // Update the status.
            if (opt_status) {
                this.status = opt_status;
                this.currentFrame = 0;
                //得到对应状态的帧率 e.g. WAITING 1000ms / 3fps = 333ms/fps
                this.msPerFrame = Trex.animFrames[opt_status].msPerFrame;
                //对应状态的动画帧的x
                // e.g. WAITING [44,0]
                this.currentAnimFrames = Trex.animFrames[opt_status].frames;
                //对应状态的动画帧的y
                this.currentAnimFramesY = Trex.animFrames[opt_status].framesY;
                this.currentAnimFramesW = Trex.animFrames[opt_status].width;
                this.currentAnimFramesH = Trex.animFrames[opt_status].height;

                if (opt_status == Trex.status.WAITING) {
                    //开始计时
                    this.animStartTime = getTimeStamp();
                    //设置延时
                    this.setBlinkDelay();
                }
            }

            // 公主向骑士移动
            if (meetStatus == 'ing' && this.xPos < this.config.START_X_POS) {
                this.xPos += Math.round((this.config.START_X_POS / this.config.INTRO_DURATION) * deltaTime);
            }


            //待机状态
            if (this.status == Trex.status.WAITING) {
                //执行眨眼动作
                this.blink(getTimeStamp());
            } else {
                // 奔跑或跳跃或碰撞
                this.draw(this.currentAnimFrames[this.currentFrame], this.currentAnimFramesY[this.currentFrame], this.currentAnimFramesW[this.currentFrame], this.currentAnimFramesH[this.currentFrame]);
            }

            // Update the frame position.
            //计时器超过一帧的运行时间，切换到下一帧
            if (this.timer >= this.msPerFrame) {
                this.currentFrame = this.currentFrame == this.currentAnimFrames.length - 1 ? 0 : this.currentFrame + 1;
                this.timer = 0; //重置计时器
            }

            // Speed drop becomes duck if the down key is still being pressed.
            if (this.speedDrop && this.yPos == this.groundYPos) {
                this.speedDrop = false;
                this.setDuck(true);
            }
        },

        /**
         * Draw the t-rex to a particular position.
         * 将霸王龙牵引至特定位置。
         * @param {number} x
         * @param {number} y
         */
        draw: function (x, y, w, h) {
            var sourceX = x;
            var sourceY = y;
            var sourceHeight = h;
            var sourceWidth = w;
            var boxH = this.config.HEIGHT;//在游戏中的角色高度固定


            // Adjustments for sprite sheet position.
            sourceX += this.spritePos.x;
            sourceY += this.spritePos.y;

            // Ducking.
            if (this.ducking && this.status != Trex.status.CRASHED) {
                this.canvasCtx.drawImage(Runner.imageSprite, sourceX, sourceY,
                    sourceWidth, sourceHeight,
                    this.xPos, this.yPos,
                    this.config.WIDTH_DUCK, this.config.HEIGHT);
            } else {
                // Crashed whilst ducking. Trex is standing up so needs adjustment.
                if (this.ducking && this.status == Trex.status.CRASHED) {
                    this.xPos++;
                }
                if (this.status === Trex.status.ENDJUMP) {
                    boxH = 95;
                }
                if (this.status === Trex.status.HANDINHAND) {
                    boxH = 95;
                    this.yPos = 200;
                }
                var boxW = Math.round(boxH * sourceWidth / sourceHeight); //宽度根据角色图的比例来
                // Standing / running
                this.canvasCtx.drawImage(Runner.imageSprite, sourceX, sourceY,
                    sourceWidth, sourceHeight,
                    this.xPos, this.yPos,
                    boxW, boxH);
            }
        },

        /**
         * Sets a random time for the blink to happen.
         * 设置随机眨眼间隔时间
         */
        setBlinkDelay: function () {
            this.blinkDelay = Math.ceil(Math.random() * Trex.BLINK_TIMING);
        },

        /**
         * Make t-rex blink at random intervals.
         * 让霸王龙以随机间隔眨眼。
         * @param {number} time Current time in milliseconds.
         */
        blink: function (time) {
            var deltaTime = time - this.animStartTime;
            if (deltaTime >= this.blinkDelay) {
                this.draw(this.currentAnimFrames[this.currentFrame], 0);

                if (this.currentFrame == 1) { //0闭眼 1睁眼
                    //设置新的眨眼间隔时间
                    this.setBlinkDelay();
                    this.animStartTime = time;
                    this.blinkCount++;
                }
            }
        },

        /**
         * Initialise a jump.
         * 初始化跳跃
         * @param {number} speed
         */
        startJump: function (speed) {
            if (!this.jumping) {
                //切换到jump状态
                this.update(0, StatusFromSkin(this.skinStatus, 'JUMPING'));
                //设置跳跃速度
                this.jumpVelocity = this.config.INIITAL_JUMP_VELOCITY - (speed / 10);
                this.jumping = true;
                this.reachedMinHeight = false;
                this.speedDrop = false;
            }
        },

        /**
         * Jump is complete, falling down.
         * 跳跃完成，降落
         */
        endJump: function () {
            if (this.reachedMinHeight && this.jumpVelocity < this.config.DROP_VELOCITY) {
                this.jumpVelocity = this.config.DROP_VELOCITY;
            }

            //降落时时
            if (this.jumpVelocity >= 3) {
                this.update(0, StatusFromSkin(this.skinStatus, 'ENDJUMP'));
            }

        },

        /**
         * Update frame for a jump.
         * 更新跳跃帧
         * @param {number} deltaTime
         * @param {number} speed
         */
        updateJump: function (deltaTime, speed) {
            //帧切换速率
            var msPerFrame = Trex.animFrames[this.status].msPerFrame;
            //经过的帧数
            var framesElapsed = deltaTime / msPerFrame;

            // Speed drop makes Trex fall faster.-速度下降使霸王龙下降得更快
            //更新y轴坐标
            if (this.speedDrop) {
                this.yPos += Math.round(this.jumpVelocity * this.config.SPEED_DROP_COEFFICIENT * framesElapsed);
            } else {
                this.yPos += Math.round(this.jumpVelocity * framesElapsed);
            }

            // 由于速度受重力影响，需要对速度进行修正
            this.jumpVelocity += this.config.GRAVITY * framesElapsed;

            // 达到最小跳跃高度
            if (this.yPos < this.minJumpHeight || this.speedDrop) {
                this.reachedMinHeight = true;
            }

            // 达到最大高度后停止跳跃
            if (this.yPos < this.config.MAX_JUMP_HEIGHT || this.speedDrop) {
                this.endJump();
            }

            // Back down at ground level. Jump completed.- 回到地面。跳转完成。
            if (this.yPos > this.groundYPos) {
                this.reset();
                this.jumpCount++;
            }

            if (this.playing) {
                this.update(deltaTime);
            }
        },

        /**
         * Set the speed drop. Immediately cancels the current jump.
         * 设置速度下降。立即取消当前跳转。
         */
        setSpeedDrop: function () {
            this.speedDrop = true;
            this.jumpVelocity = 1;
        },

        /**
         * @param {boolean} isDucking.
         */
        setDuck: function (isDucking) {
            if (isDucking && this.status != Trex.status.DUCKING) {
                this.update(0, Trex.status.DUCKING);
                this.ducking = true;
            } else if (this.status == Trex.status.DUCKING) {
                this.update(0, Trex.status.RUNNING);
                this.ducking = false;
            }
        },

        /**
         * Reset the t-rex to running at start of game.
         * 游戏开始时将霸王龙重置为跑步。
         */
        reset: function () {
            this.yPos = this.groundYPos;
            this.jumpVelocity = 0;
            this.jumping = false;
            this.ducking = false;
            this.update(0, StatusFromSkin(this.skinStatus, 'RUNNING'));
            this.midair = false;
            this.speedDrop = false;
            this.jumpCount = 0;
        }
    };


    //******************************************************************************

    /**
     * Handles displaying the distance meter.
     * 距离记录器
     * @param {!HTMLCanvasElement} canvas
     * @param {Object} spritePos Image position in sprite.
     * @param {number} canvasWidth
     * @constructor
     */
    function DistanceMeter(canvas, spritePos, canvasWidth) {
        this.canvas = canvas;
        this.canvasCtx = canvas.getContext('2d');
        this.image = Runner.imageSprite;
        this.spritePos = spritePos;
        //相对坐标
        this.x = 0;
        this.y = 5;

        this.currentDistance = 0;
        //最大分数
        this.maxScore = 0;
        //高分榜
        this.highScore = 0;
        this.container = null;

        this.digits = [];
        //是否进行闪动特效
        this.acheivement = false;
        this.defaultString = '';
        //闪动特效计时器
        this.flashTimer = 0;
        //闪动计数器
        this.flashIterations = 0;
        this.invertTrigger = false;

        this.config = DistanceMeter.config;
        //最大记录为万位数
        this.maxScoreUnits = this.config.MAX_DISTANCE_UNITS;

        this.init(canvasWidth);
    };


    /**
     * @enum {number}
     */
    DistanceMeter.dimensions = {
        WIDTH: 10, //每个字符的宽度
        HEIGHT: 13, //每个字符的高
        DEST_WIDTH: 11 //间隙
    };


    /**
     * Y positioning of the digits in the sprite sheet.
     * X position is always 0.
     * @type {Array<number>}
     */
    DistanceMeter.yPos = [0, 13, 27, 40, 53, 67, 80, 93, 107, 120];


    /**
     * Distance meter config.
     * 距离配置
     * @enum {number}
     */
    DistanceMeter.config = {
        // 初始时记录的分数上限为5位数，即99999
        MAX_DISTANCE_UNITS: 5,

        // 每隔100米距离记录器的数字出现闪动特效
        ACHIEVEMENT_DISTANCE: 1000,

        // 将移动距离转化为合理的数值所用的转化系数
        COEFFICIENT: 0.025,

        // 每250ms闪动一次
        FLASH_DURATION: 1000 / 4,

        // 闪动次数
        FLASH_ITERATIONS: 3
    };


    //距离计数的原型对象
    DistanceMeter.prototype = {
        /**
         * Initialise the distance meter to '00000'.
         * 初始化距离记录器为00000
         * @param {number} width Canvas width in px.
         */
        init: function (width) {
            var maxDistanceStr = '';

            this.calcXPos(width);
            this.maxScore = this.maxScoreUnits;
            for (var i = 0; i < this.maxScoreUnits; i++) {
                this.draw(i, 0);
                this.defaultString += '0';
                maxDistanceStr += '9';
            }

            //99999
            this.maxScore = parseInt(maxDistanceStr);
        },

        /**
         * Calculate the xPos in the canvas.
         * 计算出xPos
         * @param {number} canvasWidth
         */
        calcXPos: function (canvasWidth) {
            this.x = canvasWidth - (DistanceMeter.dimensions.DEST_WIDTH * (this.maxScoreUnits + 1));
        },

        /**
         * Draw a digit to canvas.
         * @param {number} digitPos Position of the digit.
         * @param {number} value Digit value 0-9.
         * @param {boolean} opt_highScore Whether drawing the high score.
         */
        draw: function (digitPos, value, opt_highScore) {
            var sourceWidth = DistanceMeter.dimensions.WIDTH;
            var sourceHeight = DistanceMeter.dimensions.HEIGHT;
            var sourceX = DistanceMeter.dimensions.WIDTH * value;
            var sourceY = 0;

            var targetX = digitPos * DistanceMeter.dimensions.DEST_WIDTH;
            var targetY = this.y;
            var targetWidth = DistanceMeter.dimensions.WIDTH;
            var targetHeight = DistanceMeter.dimensions.HEIGHT;

            // For high DPI we 2x source values.
            if (IS_HIDPI) {
                sourceWidth *= 2;
                sourceHeight *= 2;
                sourceX *= 2;
            }

            sourceX += this.spritePos.x;
            sourceY += this.spritePos.y;

            this.canvasCtx.save();

            if (opt_highScore) {
                // 将最高分放至当前分数的左边
                var highScoreX = this.x - (this.maxScoreUnits * 2) * DistanceMeter.dimensions.WIDTH;
                this.canvasCtx.translate(highScoreX, this.y);
            } else {
                this.canvasCtx.translate(this.x, this.y);
            }

            this.canvasCtx.drawImage(this.image, sourceX, sourceY,
                sourceWidth, sourceHeight,
                targetX, targetY,
                targetWidth, targetHeight
            );

            this.canvasCtx.restore();
        },

        /**
         * Covert pixel distance to a 'real' distance.
         * 将像素距离转换为“真实”距离。
         * @param {number} distance Pixel distance ran. 像素距离
         * @return {number} The 'real' distance ran. “真实距离”
         */
        getActualDistance: function (distance) {
            return distance ? Math.round(distance * this.config.COEFFICIENT) : 0;
        },

        /**
         * Update the distance meter.
         * 更新距离记录器
         * @param {number} distance
         * @param {number} deltaTime
         * @return {boolean} Whether the acheivement sound fx should be played. 是否播放声音
         */
        update: function (deltaTime, distance) {
            var paint = true;
            var playSound = false;

            if (!this.acheivement) {
                //获取实际距离计算分数
                distance = this.getActualDistance(distance);
                // 分数超过最大分数时增加至十万位999999
                if (distance > this.maxScore && this.maxScoreUnits == this.config.MAX_DISTANCE_UNITS) {
                    this.maxScoreUnits++;
                    this.maxScore = parseInt(this.maxScore + '9');
                } else {
                    this.distance = 0;
                }

                if (distance > 0) {
                    // 每100距离开始闪动特效并播放声音
                    if (distance % this.config.ACHIEVEMENT_DISTANCE == 0) {
                        // Flash score and play sound.
                        // 闪光记分和播放声音。
                        this.acheivement = true;
                        this.flashTimer = 0;
                        playSound = true;
                    }

                    // Create a string representation of the distance with leading 0.
                    // 在距离前面追加0成为分数
                    var distanceStr = (this.defaultString + distance).substr(-this.maxScoreUnits);
                    this.digits = distanceStr.split('');
                } else {
                    this.digits = this.defaultString.split('');
                }
            } else {
                // 到达目标分数时闪动分数
                if (this.flashIterations <= this.config.FLASH_ITERATIONS) {
                    this.flashTimer += deltaTime;

                    if (this.flashTimer < this.config.FLASH_DURATION) {
                        paint = false;
                    } else if (this.flashTimer > this.config.FLASH_DURATION * 2) {
                        this.flashTimer = 0;
                        this.flashIterations++;
                    }
                } else {
                    this.acheivement = false;
                    this.flashIterations = 0;
                    this.flashTimer = 0;
                }
            }

            // 非闪动时绘制分数
            if (paint) {
                for (var i = this.digits.length - 1; i >= 0; i--) {
                    this.draw(i, parseInt(this.digits[i]));
                }
            }

            this.drawHighScore();
            return playSound;
        },

        /**
         * Draw the high score.
         * 绘制高分
         */
        drawHighScore: function () {
            this.canvasCtx.save();
            this.canvasCtx.globalAlpha = .8; //让字符看起来颜色稍浅
            for (var i = this.highScore.length - 1; i >= 0; i--) {
                this.draw(i, parseInt(this.highScore[i], 10), true);
            }
            this.canvasCtx.restore();
        },

        /**
         * Set the highscore as a array string.
         * 更新最高分
         * Position of char in the sprite: H - 10, I - 11.
         * @param {number} distance Distance ran in pixels.-距离以像素为单位。
         */
        setHighScore: function (distance) {
            //设置最高分
            distance = this.getActualDistance(distance);
            var highScoreStr = (this.defaultString + distance).substr(-this.maxScoreUnits);
            //10和11分别对应雪碧图中的H、I
            this.highScore = ['10', '11', ''].concat(highScoreStr.split(''));
        },

        /**
         * Reset the distance meter back to '00000'.
         * 重置记录器为00000
         */
        reset: function () {
            this.update(0);
            this.acheivement = false;
        }
    };


    //******************************************************************************

    /**
     * Cloud background item.
     * Similar to an obstacle object but without collision boxes.
     * 与障碍物类似，但没有碰撞框。
     * @param {HTMLCanvasElement} canvas Canvas element.
     * @param {Object} spritePos Position of image in sprite.
     * @param {number} containerWidth
     */
    function Cloud(canvas, spritePos, containerWidth) {
        this.canvas = canvas;
        this.canvasCtx = this.canvas.getContext('2d');
        this.spritePos = spritePos;
        this.containerWidth = containerWidth;
        this.xPos = containerWidth; //云朵初始x坐标在屏幕外
        this.yPos = 0; //云朵初始高度
        this.remove = false; //是否移除
        //云朵之间的间隙400~100
        this.cloudGap = getRandomNum(Cloud.config.MIN_CLOUD_GAP, Cloud.config.MAX_CLOUD_GAP);

        this.init();
    };


    /**
     * Cloud object config.
     * @enum {number}
     */
    Cloud.config = {
        HEIGHT: 14, //云朵sprite的高度
        MAX_CLOUD_GAP: 400, //两朵云之间的最大间隙
        MAX_SKY_LEVEL: 30, //云朵的最大高度
        MIN_CLOUD_GAP: 100, //两朵云之间的最小间隙
        MIN_SKY_LEVEL: 71, //云朵的最小高度
        WIDTH: 46 //云朵sprite的宽度
    };


    //云朵的原型对象
    Cloud.prototype = {
        /**
         * Initialise the cloud. Sets the Cloud height.
         * 初始化云。设置云的高度。
         */
        init: function () {
            // 在高度范围内随机获取云的高度，设置云朵的高度为随机30~71
            this.yPos = getRandomNum(Cloud.config.MAX_SKY_LEVEL, Cloud.config.MIN_SKY_LEVEL);
            this.draw();
        },

        /**
         * Draw the cloud.
         * 绘制云朵
         */
        draw: function () {
            this.canvasCtx.save();
            var sourceWidth = Cloud.config.WIDTH;
            var sourceHeight = Cloud.config.HEIGHT;

            if (IS_HIDPI) {
                sourceWidth = sourceWidth * 2;
                sourceHeight = sourceHeight * 2;
            }

            this.canvasCtx.drawImage(Runner.imageSprite, this.spritePos.x, this.spritePos.y,
                sourceWidth, sourceHeight,
                this.xPos, this.yPos,
                Cloud.config.WIDTH, Cloud.config.HEIGHT);

            this.canvasCtx.restore();
        },

        /**
         * Update the cloud position.
         * 更新云移动的位置
         * @param {number} speed
         */
        update: function (speed) {
            //仅绘制符合条件的云朵
            if (!this.remove) {
                //向左移动
                this.xPos -= Math.ceil(speed);
                this.draw();

                // Mark as removeable if no longer in the canvas.
                // 如果不再在画布中，则标记为可移除。
                if (!this.isVisible()) {
                    this.remove = true;
                }
            }
        },

        /**
         * Check if the cloud is visible on the stage.
         * 检查云彩是否在舞台上可见。
         * @return {boolean}
         */
        isVisible: function () {
            return this.xPos + Cloud.config.WIDTH > 0;
        }
    };


    //******************************************************************************

    /**
     * Nightmode shows a moon and stars on the horizon.
     * 夜间模式显示地平线上有月亮和星星。
     */
    function NightMode(canvas, spritePos, containerWidth) {
        this.spritePos = spritePos;
        this.canvas = canvas;
        this.canvasCtx = canvas.getContext('2d');
        this.xPos = containerWidth - 50;
        this.yPos = 30;
        this.currentPhase = 0;
        this.opacity = 0;
        this.containerWidth = containerWidth;
        this.stars = [];
        this.drawStars = false;
        this.placeStars();
    };

    /**
     * @enum {number}
     */
    NightMode.config = {
        FADE_SPEED: 0.035,
        HEIGHT: 40,
        MOON_SPEED: 0.25,
        NUM_STARS: 2,
        STAR_SIZE: 9,
        STAR_SPEED: 0.3,
        STAR_MAX_Y: 70,
        WIDTH: 20
    };

    NightMode.phases = [140, 120, 100, 60, 40, 20, 0];

    //夜间模式的原型对象
    NightMode.prototype = {
        /**
         * Update moving moon, changing phases.
         * @param {boolean} activated Whether night mode is activated.
         * @param {number} delta
         */
        update: function (activated, delta) {
            // Moon phase.
            if (activated && this.opacity == 0) {
                this.currentPhase++;

                if (this.currentPhase >= NightMode.phases.length) {
                    this.currentPhase = 0;
                }
            }

            // Fade in / out.
            if (activated && (this.opacity < 1 || this.opacity == 0)) {
                this.opacity += NightMode.config.FADE_SPEED;
            } else if (this.opacity > 0) {
                this.opacity -= NightMode.config.FADE_SPEED;
            }

            // Set moon positioning.
            if (this.opacity > 0) {
                this.xPos = this.updateXPos(this.xPos, NightMode.config.MOON_SPEED);

                // Update stars.
                if (this.drawStars) {
                    for (var i = 0; i < NightMode.config.NUM_STARS; i++) {
                        this.stars[i].x = this.updateXPos(this.stars[i].x,
                            NightMode.config.STAR_SPEED);
                    }
                }
                this.draw();
            } else {
                this.opacity = 0;
                this.placeStars();
            }
            this.drawStars = true;
        },

        updateXPos: function (currentPos, speed) {
            if (currentPos < -NightMode.config.WIDTH) {
                currentPos = this.containerWidth;
            } else {
                currentPos -= speed;
            }
            return currentPos;
        },

        draw: function () {
            var moonSourceWidth = this.currentPhase == 3 ? NightMode.config.WIDTH * 2 :
                NightMode.config.WIDTH;
            var moonSourceHeight = NightMode.config.HEIGHT;
            var moonSourceX = this.spritePos.x + NightMode.phases[this.currentPhase];
            var moonOutputWidth = moonSourceWidth;
            var starSize = NightMode.config.STAR_SIZE;
            var starSourceX = Runner.spriteDefinition.LDPI.STAR.x;

            if (IS_HIDPI) {
                moonSourceWidth *= 2;
                moonSourceHeight *= 2;
                moonSourceX = this.spritePos.x +
                    (NightMode.phases[this.currentPhase] * 2);
                starSize *= 2;
                starSourceX = Runner.spriteDefinition.HDPI.STAR.x;
            }

            this.canvasCtx.save();
            this.canvasCtx.globalAlpha = this.opacity;

            // Stars.
            if (this.drawStars) {
                for (var i = 0; i < NightMode.config.NUM_STARS; i++) {
                    this.canvasCtx.drawImage(Runner.imageSprite,
                        starSourceX, this.stars[i].sourceY, starSize, starSize,
                        Math.round(this.stars[i].x), this.stars[i].y,
                        NightMode.config.STAR_SIZE, NightMode.config.STAR_SIZE);
                }
            }

            // Moon.
            this.canvasCtx.drawImage(Runner.imageSprite, moonSourceX,
                this.spritePos.y, moonSourceWidth, moonSourceHeight,
                Math.round(this.xPos), this.yPos,
                moonOutputWidth, NightMode.config.HEIGHT);

            this.canvasCtx.globalAlpha = 1;
            this.canvasCtx.restore();
        },

        // Do star placement.
        // 星星的位置
        placeStars: function () {
            var segmentSize = Math.round(this.containerWidth / NightMode.config.NUM_STARS);

            for (var i = 0; i < NightMode.config.NUM_STARS; i++) {
                this.stars[i] = {};
                this.stars[i].x = getRandomNum(segmentSize * i, segmentSize * (i + 1));
                this.stars[i].y = getRandomNum(0, NightMode.config.STAR_MAX_Y);

                if (IS_HIDPI) {
                    this.stars[i].sourceY = Runner.spriteDefinition.HDPI.STAR.y + NightMode.config.STAR_SIZE * 2 * i;
                } else {
                    this.stars[i].sourceY = Runner.spriteDefinition.LDPI.STAR.y + NightMode.config.STAR_SIZE * i;
                }
            }
        },

        reset: function () {
            this.currentPhase = 0;
            this.opacity = 0;
            this.update(false);
        }

    };


    //******************************************************************************

    /**
     * Horizon Line.-地平线
     * Consists of two connecting lines. Randomly assigns a flat / bumpy horizon.
     * 由两条连接线组成。随机指定平坦/崎岖的地平线。
     * @param {HTMLCanvasElement} canvas
     * @param {Object} spritePos Horizon position in sprite.
     * @constructor
     */
    function HorizonLine(canvas, spritePos) {
        this.spritePos = spritePos;
        this.canvas = canvas;
        this.canvasCtx = canvas.getContext('2d');
        this.sourceDimensions = {};
        this.dimensions = HorizonLine.dimensions;
        //在雪碧图中坐标为2和602处分别为不同的地形
        this.sourceXPos = [this.spritePos.x];
        this.xPos = []; //地面在画布中的x坐标
        this.yPos = 0; //地面在画布中的y坐标
        this.bumpThreshold = 0.5; //颠簸系数

        //初始化获取背景长度
        this.setSourceDimensions();
        this.draw();
    };


    /**
     * Horizon line dimensions.
     * 地平线的尺寸
     * @enum {number}
     */
    HorizonLine.dimensions = {
        WIDTH: 1360,
        HEIGHT: 316,
        YPOS: 142   //在canvas中的位置
    };

    //地平线的原型对象
    HorizonLine.prototype = {
        /**
         * Set the source dimensions of the horizon line.
         * 设置地平线的源尺寸。
         */
        setSourceDimensions: function () {
            for (var dimension in HorizonLine.dimensions) {
                if (IS_HIDPI) {
                    if (dimension != 'YPOS') {
                        this.sourceDimensions[dimension] = HorizonLine.dimensions[dimension] * 2;
                    }
                } else {
                    this.sourceDimensions[dimension] = HorizonLine.dimensions[dimension];
                }
                this.dimensions[dimension] = HorizonLine.dimensions[dimension];
            }

            //地面在画布上的位置
            this.xPos = [0, HorizonLine.dimensions.WIDTH];
            this.yPos = HorizonLine.dimensions.YPOS;
        },

        /**
         * Return the crop x position of a type.
         * 返回类型的裁剪x位置，生成随机地形
         */
        getRandomType: function () {
            // 随机一个x值，如果大于颠簸阈值则取正常宽度，否则是0
            return 0;
            // return Math.random() > this.bumpThreshold ? this.dimensions.WIDTH : 0;
        },

        /**
         * Draw the horizon line.
         * 绘制地平线
         */
        draw: function () {
            this.canvasCtx.drawImage(Runner.imageSprite, this.sourceXPos[0],
                this.spritePos.y,
                this.sourceDimensions.WIDTH, this.sourceDimensions.HEIGHT,
                this.xPos[0], this.yPos,
                this.dimensions.WIDTH, this.dimensions.HEIGHT);

            this.canvasCtx.drawImage(Runner.imageSprite, this.sourceXPos[0],
                this.spritePos.y,
                this.sourceDimensions.WIDTH, this.sourceDimensions.HEIGHT,
                this.xPos[1], this.yPos,
                this.dimensions.WIDTH, this.dimensions.HEIGHT);
        },

        /**
         * Update the x position of an indivdual piece of the line.
         * 更新线的单个部分的x位置。
         * @param {number} pos Line position.
         * @param {number} increment
         */
        updateXPos: function (pos, increment) {
            var line1 = pos;
            var line2 = pos == 0 ? 1 : 0;

            this.xPos[line1] -= increment;
            this.xPos[line2] = this.xPos[line1] + this.dimensions.WIDTH;

            //若第一段地面完全移出canvas外
            if (this.xPos[line1] <= -this.dimensions.WIDTH) {
                //则将其移动至canvas外右侧
                this.xPos[line1] += this.dimensions.WIDTH * 2;
                //同时将第二段地面移动至canvas内
                this.xPos[line2] = this.xPos[line1] - this.dimensions.WIDTH;
                //选择随机地形
                this.sourceXPos[line1] = this.getRandomType() + this.spritePos.x;
            }
        },

        /**
         * Update the horizon line.
         * 更新地平线的移动
         * @param {number} deltaTime
         * @param {number} speed
         */
        update: function (deltaTime, speed) {
            var increment = Math.floor(speed * (FPS / 1000) * deltaTime);

            if (meetStatus != 'ing') {
                if (this.xPos[0] <= 0) {//交换地面一和二
                    this.updateXPos(0, increment);
                } else {
                    this.updateXPos(1, increment);
                }
            }

            this.draw();
        },

        /**
         * Reset horizon to the starting position.
         * 将地平线重置到起始位置。
         */
        reset: function () {
            this.xPos[0] = 0;
            this.xPos[1] = HorizonLine.dimensions.WIDTH;
        }
    };


    //******************************************************************************

    /**
     * Horizon background class.
     * 地平线背景类。
     * 地平线上有云、障碍物和地面
     * @param {HTMLCanvasElement} canvas
     * @param {Object} spritePos Sprite positioning.
     * @param {Object} dimensions Canvas dimensions.
     * @param {number} gapCoefficient
     * @constructor
     */
    function Horizon(canvas, spritePos, dimensions, gapCoefficient) {
        this.canvas = canvas;
        this.canvasCtx = this.canvas.getContext('2d');
        this.config = Horizon.config;
        this.dimensions = dimensions; // 尺寸
        this.gapCoefficient = gapCoefficient;
        this.obstacles = []; //存储障碍物的数组
        this.obstacleHistory = []; //记录障碍物数组中障碍物的类型
        this.horizonOffsets = [0, 0];
        this.cloudFrequency = this.config.CLOUD_FREQUENCY;
        this.spritePos = spritePos;
        this.nightMode = null;

        // Cloud - 云朵
        this.clouds = []; //用于存储云朵
        this.cloudSpeed = this.config.BG_CLOUD_SPEED;

        // Horizon - 地平线
        this.horizonLine = null;
        this.init();
    };


    /**
     * Horizon config.
     * 地平线的配置
     * @enum {number}
     */
    Horizon.config = {
        BG_CLOUD_SPEED: 0.2, // 云的速度
        BUMPY_THRESHOLD: .3, // 地平线上凹凸的幅度
        CLOUD_FREQUENCY: .5, //云朵出现频率
        HORIZON_HEIGHT: 16, // 水平高度
        MAX_CLOUDS: 6 //最多云朵数
    };

    //地平线的原型对象
    Horizon.prototype = {
        /**
         * Initialise the horizon. Just add the line and a cloud. No obstacles.
         * 初始化地平线。只需添加线和云。没有障碍。
         */
        init: function () {
            this.addCloud();//给云朵数组里新增一个云朵对象
            this.horizonLine = new HorizonLine(this.canvas, this.spritePos.HORIZON);// 实例化一个地平线对象
            this.nightMode = new NightMode(this.canvas, this.spritePos.MOON, this.dimensions.WIDTH);
        },

        /**
         * @param {number} deltaTime
         * @param {number} currentSpeed
         * @param {boolean} updateObstacles Used as an override to prevent
         *     the obstacles from being updated / added. This happens in the
         *     ease in section.
         * @param {boolean} showNightMode Night mode activated.
         */
        update: function (deltaTime, currentSpeed, updateObstacles, showNightMode) {
            this.runningTime += deltaTime;
            this.horizonLine.update(deltaTime, currentSpeed);
            this.nightMode.update(showNightMode);
            this.updateClouds(deltaTime, currentSpeed);

            if (updateObstacles) {
                this.updateObstacles(deltaTime, currentSpeed);
            }
        },

        /**
         * Update the cloud positions.
         * 添加云朵并控制其移动
         * @param {number} deltaTime
         * @param {number} currentSpeed
         */
        updateClouds: function (deltaTime, speed) {
            var cloudSpeed = this.cloudSpeed / 1000 * deltaTime * speed;
            var numClouds = this.clouds.length;

            if (numClouds) {
                for (var i = numClouds - 1; i >= 0; i--) {
                    this.clouds[i].update(cloudSpeed);
                }

                var lastCloud = this.clouds[numClouds - 1];

                // Check for adding a new cloud.
                //若当前存在的云朵数量小于最大云朵数量 && 云朵位置大于间隙时
                if (numClouds < this.config.MAX_CLOUDS &&
                    (this.dimensions.WIDTH - lastCloud.xPos) > lastCloud.cloudGap &&
                    this.cloudFrequency > Math.random()) {
                    //随机添加云朵
                    this.addCloud();
                }

                // Remove expired clouds.-过滤掉已经移出屏幕外的云朵
                this.clouds = this.clouds.filter(function (obj) {
                    return !obj.remove;
                });
            } else {
                this.addCloud();
            }
        },

        /**
         * Update the obstacle positions.
         * 管理多个障碍物移动
         * @param {number} deltaTime
         * @param {number} currentSpeed
         */
        updateObstacles: function (deltaTime, currentSpeed) {
            // 保存一个障碍物数组的副本
            var updatedObstacles = this.obstacles.slice(0);

            // obstacles初始为空数组
            for (var i = 0; i < this.obstacles.length; i++) {
                var obstacle = this.obstacles[i];
                //障碍移动
                obstacle.update(deltaTime, currentSpeed);

                //移除被标记为删除的障碍物
                if (obstacle.remove) {
                    //移除数组的第一项
                    updatedObstacles.shift();
                }
            }
            this.obstacles = updatedObstacles;//初始为空数组

            if (this.obstacles.length > 0) {
                //获取障碍物列表中的最后一个障碍物
                var lastObstacle = this.obstacles[this.obstacles.length - 1];

                //若满足条件则添加障碍物
                if (lastObstacle && !lastObstacle.followingObstacleCreated &&
                    lastObstacle.isVisible() &&
                    (lastObstacle.xPos + lastObstacle.width + lastObstacle.gap) <
                    this.dimensions.WIDTH && !appearKnight) {
                    this.addNewObstacle(currentSpeed);
                    lastObstacle.followingObstacleCreated = true;
                }
            } else {
                //若障碍物列表中没有障碍物则立即添加
                this.addNewObstacle(currentSpeed);
            }
        },

        removeFirstObstacle: function () {
            this.obstacles.shift();
        },

        /**
         * Add a new obstacle.
         * 随机添加障碍
         * @param {number} currentSpeed
         */
        addNewObstacle: function (currentSpeed) {
            //随机选取一种类型的障碍
            var obstacleTypeIndex = getRandomNum(0, Obstacle.types.length - 1);
            var obstacleType = Obstacle.types[obstacleTypeIndex];

            // Check for multiples of the same type of obstacle.
            // Also check obstacle is available at current speed.
            //检查随机取到的障碍物类型是否与前两个重复
            //或者检查其速度是否合法，这样可以保证游戏在低速时不出现翼龙
            //如果检查不通过，则重新再选一次直到通过为止
            if (this.duplicateObstacleCheck(obstacleType.type) || currentSpeed < obstacleType.minSpeed) {
                this.addNewObstacle(currentSpeed);
            } else {
                if (fightingEnd) {
                    obstacleType = Obstacle.types[Obstacle.types.length - 1];
                    appearKnight = true;
                }
                //检查通过后，获取其雪碧图中的坐标
                var obstacleSpritePos = this.spritePos[obstacleType.type];
                //生成新的障碍物并存入数组
                this.obstacles.push(new Obstacle(this.canvasCtx, obstacleType, obstacleSpritePos, this.dimensions, this.gapCoefficient, currentSpeed, obstacleType.width[0]));

                //同时将障碍物的类型存入history数组
                this.obstacleHistory.unshift(obstacleType.type);

                //若history数组的长度大于1，则清空最前面的两个
                if (this.obstacleHistory.length > 1) {
                    this.obstacleHistory.splice(Runner.config.MAX_OBSTACLE_DUPLICATION);
                }
            }
        },

        /**
         * Returns whether the previous two obstacles are the same as the next one.
         * 检查障碍物是否超过允许的最大重复数。
         * Maximum duplication is set in config value MAX_OBSTACLE_DUPLICATION.
         * @return {boolean}
         */
        duplicateObstacleCheck: function (nextObstacleType) {
            var duplicateCount = 0;
            //与history数组中的障碍物类型比较，最大只允许重得两次
            for (var i = 0; i < this.obstacleHistory.length; i++) {
                duplicateCount = this.obstacleHistory[i] == nextObstacleType ? duplicateCount + 1 : 0;
            }
            return duplicateCount >= Runner.config.MAX_OBSTACLE_DUPLICATION;
        },

        /**
         * Reset the horizon layer.
         * Remove existing obstacles and reposition the horizon line.
         */
        reset: function () {
            this.obstacles = [];
            this.horizonLine.reset();
            this.nightMode.reset();
        },

        /**
         * Update the canvas width and scaling.
         * @param {number} width Canvas width.
         * @param {number} height Canvas height.
         */
        resize: function (width, height) {
            this.canvas.width = width;
            this.canvas.height = height;
        },

        /**
         * Add a new cloud to the horizon.
         * 给地平线增添一片新的云彩。
         */
        addCloud: function () {
            this.clouds.push(new Cloud(this.canvas, this.spritePos.CLOUD, this.dimensions.WIDTH));
        }
    };
})();


//页面加载实例化一个Runner
function onDocumentLoad() {
    //页面加载完就实例一个Runner
    new Runner('.interstitial-wrapper');
    hengshuping();
    $(window).bind('orientationchange', function (e) {
        hengshuping();
    });
}

//添加一个DOM内容加载监听事件
document.addEventListener('DOMContentLoaded', onDocumentLoad);
