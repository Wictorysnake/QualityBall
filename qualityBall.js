/**
 * 质量球插件-by zcl
 * @todo 一个可定制的质量球组件，供测试使用
 * @param config 配置项，可自行添加相关配置，现有配置如下：
 *               1. type, 弹窗类型：默认为‘black’,表示该页面暂时没有设计，目前可选值有‘black’、‘yellow’、‘green’,
 *                        其中, 黑色：默认颜色，表示该页面暂时没有设计
 *                              黄色：正在做，但效果不完美
 *                              绿色：已达到最佳效果，用于测试
 *               2. show, 是否显示，方便后期测试完成直接隐藏
 */

;
(function (win, doc) {
    var win = win;
    var doc = doc;

    function on(action, selector, callback) {
        doc.addEventListener(action, function (e) {
            if (selector == e.target.tagName.toLowerCase() || selector == e.target.className || selector == e.target.id) {
                callback(e);
            }
        })
    }

    /**
     * 
     * @param {*} file 上传的本地文件
     * @param {*} token 七牛云上传的 token，一般由后台提供
     * @param {*} key 七牛云上传的 key
     */
    function QiniuUpload(file, token) {
        var upload_url = 'http://up.qiniu.com';
        var xhr = new XMLHttpRequest();
        xhr.open('POST', upload_url, true);
        var formData = new FormData();
        formData.append("file", file);
        formData.append("token", token);
        // if (key !== null && key !== undefined) {
        //     formData.append("key", key);
        // }
        var blkRet = '';
        xhr.onreadystatechange = function(res) {
            if (xhr.readyState == 4 && xhr.status == 200 && xhr.responseText != '') {
                var blkRet = JSON.parse(xhr.responseText);
                console.log(blkRet);
            } else if (xhr.status != 200 && xhr.responseText) {
                console.log('服务器传输异常');
            }
        }
        xhr.send(formData);
        return blkRet;
    }

    function QualityBall(config) {
        this.type = config.type || 'black';
        this.show = config.show || '';
        this.domain = config.domain || 'http://img.yyzz.com.cn/';
        this.token = config.token || 'Erx0piIVEeqedJUZFj3ZvhUCwQ-F36paaj6XQez6:LqmGtCqCFD9uEwusA1PXRMNppqo=:eyJzY29wZSI6Inl5anMiLCJkZWFkbGluZSI6MTU0NjkyMTAyNCwidXBIb3N0cyI6WyJodHRwOlwvXC91cC5xaW5pdS5jb20iLCJodHRwOlwvXC91cGxvYWQucWluaXUuY29tIiwiLUggdXAucWluaXUuY29tIGh0dHA6XC9cLzE4My4xMzEuNy4zIl19';
        this.submit = config.submit;
        this.X = 0;
        this.Y = 0;
        this.start = {
            X: 0,
            Y: 0,
        };
        this.move = {
            X: 0,
            Y: 0,
            speed: 0
        };
        this.end = {
            X: 0,
            Y: 0,
            status: false,
        };
        this.refX = 0;
        this.refY = 0;
        this.margin = 0;
        this.questionImgs = [];
        this.clicked = false;
        this.initDomFunc();
        this.initReady();
        // this.initBinding();
    }

    QualityBall.prototype = {
        constructor: QualityBall,
        showAlert: function(tip) {
            var _this = this;
            var _dom = doc.createElement('div');
            _dom.className = 'alert-tip';
            var tipNode = doc.createTextNode(tip);
            _dom.appendChild(tipNode);
            var _parent = doc.querySelector('.question-container');
            _parent.appendChild(_dom);
            setTimeout(() => {
                _parent.removeChild(_dom);
                _this.clicked = false;
            }, 3000);
        },
        initDomFunc: function () {
            var _this = this;
            var dom = doc.createElement('div');
            dom.className = 'qb-wrapper';
            dom.innerHTML = '<div id="qb" class="qb-container ' + _this.show + '">' +
                '<div class="ball ' + _this.type + '"></div>' +
                '</div>';
            doc.body.appendChild(dom);
        },
        initBinding: function (_this) {
            var $back = doc.querySelector('#q-icon-back');
            var $questionInp = doc.querySelector('#q-question-inp');
            var $uploadBtn = doc.querySelector('#upload_img');
            var $submitBtn = doc.querySelector('#q-submit-btn');

            on('touchstart', 'q-icon-back', function () {
                var _dom = doc.querySelector('.question-container');
                doc.body.removeChild(_dom);
            }, false);

            on('change', 'upload_img', function(e) {
                e = e || window.event;
                console.log(222, '上传图片', e.target.files[0]);
                var file = e.target.files[0];
                var _dom = doc.createElement('li');
                _dom.className = 'fl';
                var res = QiniuUpload(file, _this.token);
                console.log(res);
                var img_url = _this.domain + res.key;
                var _img = new Image();
                _img.src = img_url;
                _dom.appendChild(_img);
                _this.questionImgs.push(img_url);
                var closeBtn = doc.createElement('span');
                closeBtn.classList.add('icon-del', 'del-btn');
                var textNode = doc.createTextNode('+');
                closeBtn.appendChild(textNode);
                _dom.appendChild(closeBtn);
                var _parent = $uploadBtn.parentNode.parentNode;
                if (_parent.children[0]) {
                    _parent.insertBefore(_dom, _parent.children[0]);
                } else {
                    _parent.appendChild(_dom);
                }
                closeBtn.addEventListener('touchstart', function(e) {
                    e = e || win.event;
                    e.preventDefault();
                    e.stopPropagation();
                    _parent.removeChild(_dom);
                    _this.questionImgs.pop(img_url);
                }, false);
                console.log(_this.questionImgs);
            }, false);

            on('touchstart', 'q-submit-btn', function () {
                var questionInp = $questionInp.value.trim();
                if (_this.clicked) {
                    return;
                }
                _this.clicked = true;
                if (!questionInp) {
                    _this.showAlert('请输入问题描述');
                    return;
                }
                _this.submit(questionInp, _this.questionImgs);
            }, false);
        },
        initReady: function () {
            var _this = this;
            var $dom = doc.querySelector('#qb');
            $dom.addEventListener('touchstart', function () {
                _this.touch(event, _this, $dom);
            }, false);
            $dom.addEventListener('touchmove', function () {
                _this.touch(event, _this, $dom);
            }, false);
            $dom.addEventListener('touchend', function () {
                _this.touch(event, _this, $dom);
            }, false);
        },
        touch: function (event, that, $dom) {
            event = event || window.event;
            event.preventDefault();
            switch (event.type) {
                case "touchstart":
                    that.end.status = true;
                    event.preventDefault();
                    event.stopPropagation();
                    that.move.speed = 0;
                    that.start.X = event.touches[0].clientX;
                    that.start.Y = event.touches[0].clientY;
                    that.X = $dom.offsetLeft;
                    that.Y = $dom.offsetTop;
                    that.refX = that.start.X - that.X;
                    that.refY = that.start.Y - that.Y;
                    break;
                case "touchend":
                    that.end.X = event.changedTouches[0].clientX;
                    that.end.Y = event.changedTouches[0].clientY;
                    setTimeout(function () {
                        that.end.status = false;
                    }, that.move.speed * 1000);
                    if ((that.start.X == that.end.X) && (that.start.Y == that.end.Y)) {
                        var _dom = doc.createElement("div");
                        _dom.className = 'question-container';
                        _dom.innerHTML = '<div class="q-title">\
                                                <div class="icon-back" id="q-icon-back"></div>\
                                                <span class="text">问题反馈</span>\
                                            </div>\
                                            <div class="question-content">\
                                                <textarea name="question-inp" id="q-question-inp" class="question-inp info" placeholder="在这里描述界面问题"></textarea>\
                                                <div class="photo-upload-block">\
                                                    <div class="upload-wrap clearfix">\
                                                        <ul class="img-list clearfix">\
                                                            <div class="upload-btn fl" id="q-upload-btn">\
                                                                <input type="file" name="upload_img" id="upload_img" multiple="multiple">\
                                                                <span>+</span>\
                                                            </div>\
                                                        </ul>\
                                                    </div>\
                                                </div>\
                                                <div class="btn-bottom bg-blue flex-center" id="q-submit-btn">提交</div>\
                                            </div>';
                        doc.body.appendChild(_dom);
                        that.initBinding(that);
                    }

                    break;
                case "touchmove":
                    event.preventDefault();
                    var MAX_X = (doc.documentElement.clientWidth || doc.body.clientWidth) - $dom.offsetWidth - that.margin;
                    var MAX_Y = (doc.documentElement.clientHeight || doc.body.clientHeight) - $dom.offsetHeight - that.margin;
                    if (that.end.status) {
                        that.move.X = event.touches[0].clientX;
                        that.move.Y = event.touches[0].clientY;
                        that.X = that.move.X - that.refX;
                        that.Y = that.move.Y - that.refY;
                        if (that.X < 0) {
                            that.X = 0;
                        } else if (that.X > MAX_X) {
                            that.X = MAX_X;
                        }
                        if (that.Y < 0) {
                            that.Y = 0;
                        } else if (that.Y > MAX_Y) {
                            that.Y = MAX_Y;
                        }
                        $dom.style.left = that.X + 'px';
                        $dom.style.top = that.Y + 'px';
                    }

                    break;
            }
        },
    }

    if (typeof exports == "object") {
        module.exports = QualityBall;
    } else if (typeof define == "function" && define.amd) {
        define([], function () {
            return QualityBall;
        })
    } else {
        win.QualityBall = QualityBall;
    }
})(window, document);