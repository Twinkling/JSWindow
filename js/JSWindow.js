/* JS Window*/
JSWindow.defaultOptions = {

    isVisible  : true,            // 是否可见
    isDragable : true,            // 是否可拖拽
    isScalable : true,            // 是否可缩放
    isCollapse : false,           // 是否收起
    isMaximize : false,           // 是否最大化
    hasFooter  : true,            // 是否有底部状态栏

    zIndex     : 1000,            // 层级

    parent     : document.body,   // 新建窗口的父容器

    top        : 0,               // 初始化位置
    left       : 0,               // 初始化位置
    width      : 250,             // 初始化宽度
    minWidth   : 150,             // 最小宽度
    maxWidth   : 400,             // 最大宽度
    height     : 250,             // 初始化高度
    minHeight  : 150,             // 最小高度
    maxHeight  : 400,             // 最大高度

    header     : "title",         // 窗口标题
    content    : "content",       // 窗口内容
    footer     : "footer",        // 窗口底部，状态栏

    dragSize   : 8                // 可拖动范围大小
};

function JSWindow(opts) {
    if(this instanceof JSWindow) {
        var defaultOptions = this.constructor.defaultOptions;

        // 修改默认参数
        this.options = Util.extend(defaultOptions, opts);

        // 初始化
        this.init();
    }else {
        return new JSWindow(opts);
    }
}

JSWindow.prototype = {
    constructor : JSWindow,

    // 初始化
    init : function() {
        // 创建窗口
        this._create();

        this._getSize();

        this._setInitStatus();

        this.clickArea = null; // 当前点击区域
        this.setDragAble();

        this.setResize();

        this._setToInstances()

        this._bindSetToTop();
    },

    // 创建窗口节点
    _create : function() {
        var _this = this;
        var winNode = document.createElement('div');
        winNode.className = "JSWindow-wrapper";
        this.winNode = winNode;

        var winContainer = document.createElement('div');
        winContainer.className = "JSWindow-container selected";
        winNode.appendChild(winContainer);
        this.winContainer = winContainer;

        var winHeader = document.createElement('div');
        winHeader.className = "JSWindow-header clearfix";
        winContainer.appendChild(winHeader);
        this.winHeader = winHeader;
        Util.event.addHandler(winHeader, "dblclick", function(event) {
            _this.options.isMaximize ? _this.restore() : _this.maximize();
        });

        var headerText = document.createElement('label');
        headerText.className = "JSWindow-header-text";
        headerText.innerHTML = this.options.header;
        winHeader.appendChild(headerText);
        this.headerText = headerText;

        var winTools = document.createElement('div');
        winTools.className = "JSWindow-tools";
        winHeader.appendChild(winTools);
        Util.event.addHandler(winTools, "dblclick", function(event) {
            event = Util.event.getEvent(event);
            Util.event.stopPropagation(event);
        });
        Util.event.addHandler(winTools, "mousedown", function(event) {
            _this.clickArea = "winTools";
        });

        var winMinTool = document.createElement('span');
        winMinTool.className = "JSWindow-min";
        winTools.appendChild(winMinTool);
        Util.event.addHandler(winMinTool, "click", function(event) {
            event = Util.event.getEvent(event);
            Util.event.stopPropagation(event);
            _this.toggleMin();
        });

        var winMaxRestoreTool = document.createElement('span');
        winMaxRestoreTool.className = "JSWindow-max";
        winTools.appendChild(winMaxRestoreTool);
        Util.event.addHandler(winMaxRestoreTool, "click", function(event) {
            event = Util.event.getEvent(event);
            Util.event.stopPropagation(event);
            _this.options.isMaximize ? _this.restore() : _this.maximize();
        });
        this.winMaxRestoreTool = winMaxRestoreTool;

        var winCloseTool = document.createElement('span');
        winCloseTool.className = "JSWindow-close";
        winTools.appendChild(winCloseTool);
        Util.event.addHandler(winCloseTool, "click", function(event) {
            event = Util.event.getEvent(event);
            Util.event.stopPropagation(event);
            _this.destroy();
        });

        var winContent = document.createElement('div');
        winContent.className = "JSWindow-content";
        winContainer.appendChild(winContent);
        this.winContent = winContent;

        var contentTextarea = document.createElement('textarea');
        winContent.appendChild(contentTextarea);
        contentTextarea.innerHTML = this.options.content;

        if(this.options.hasFooter) {
            var winFooter = document.createElement('div');
            winFooter.className = "JSWindow-footer";
            winContainer.appendChild(winFooter);
            winFooter.innerHTML = this.options.footer;
            this.winFooter = winFooter;
        }

        this.options.parent.appendChild(winNode);
    },

    // 设置初始状态
    _setInitStatus : function() {
        var opts = this.options;

        this.moveTo(opts.left, opts.top);

        this.resizeTo(opts.width, opts.height);

        if(opts.isMaximize) {
            this.maximize();
            this.toggleDragAble(false);
        }else {
            this.toggleDragAble(true);
        }

        if(opts.isCollapse) {
            opts.isCollapse = !opts.isCollapse;
            this.toggleMin();
        }

        this._setToTop();
    },

    // 将所有实例存储在JSWindow构造器中
    _setToInstances : function() {
        if(!this.constructor.allInatances) {
            this.constructor.allInatances = [];
        }
        this.constructor.allInatances.push(this);
    },

    // 绑定点击事件修改层级
    _bindSetToTop : function() {
        var _this = this,
            allInatances = _this.constructor.allInatances;
        Util.event.addHandler(_this.winNode, "mousedown", function() {
            allInatances && Util.classList.remove(allInatances[allInatances.length - 1].winContainer, "selected");
            Util.classList.add(_this.winContainer, "selected");
            for(var i = 0, j = allInatances.length; i < j; i++) {
                if(allInatances[i] === _this) {
                    allInatances.splice(i,1);
                    allInatances.push(_this);
                }
                allInatances[i].winNode.style.zIndex = _this.options.zIndex + (5 * i);
            }
        });
    },

    // 设置窗口层级为最上层
    _setToTop : function() {
        var allInatances = this.constructor.allInatances,
            counter = allInatances ? allInatances.length : 0;
        counter && Util.classList.remove(allInatances[counter - 1].winContainer, "selected");
        Util.classList.add(this.winContainer, "selected");
        this.winContainer.style.zIndex = this.options.zIndex + (5 * counter);
    },

    _getSize : function() {
        // 获取窗口头部的尺寸
        this.options.headerSize = Util.getBoundingClientRect(this.winHeader);

        // 获取窗口主体尺寸
        this.options.contentSize = Util.getBoundingClientRect(this.winContent);

        // 获取窗口底部尺寸
        if(this.options.hasFooter) {
            this.options.footerSize = Util.getBoundingClientRect(this.winFooter);
            this.winContent.style.paddingBottom = this.options.footerSize.height + "px";
        }
    },

    // 销毁窗口
    destroy : function() {
        var allInatances = this.constructor.allInatances;
        allInatances.pop();
        (allInatances.length > 0) && Util.classList.add(allInatances[allInatances.length - 1].winContainer, "selected");
        this.options.parent.removeChild(this.winNode);
    },

    // 移动位置
    moveTo : function(left, top) {
        var winNodeStyle  = this.winNode.style,
            opts = this.options;
        winNodeStyle.left = left + "px";
        winNodeStyle.top  = top + "px";
        opts.left = left;
        opts.top  = top;
    },

    // 改变大小
    resizeTo : function(width, height) {
        var winNodeStyle    = this.winNode.style,
            opts = this.options;
        winNodeStyle.width  = width + "px";
        winNodeStyle.height = height + "px";
        opts.width  = width;
        opts.height = height;
    },

    // 最小化窗口
    toggleMin : function() {
        var opts = this.options;
        opts.contentSize = Util.getBoundingClientRect(this.winContent);
        var height = this.winNode.clientHeight - opts.contentSize.height + opts.headerSize.height;
        if(opts.isCollapse) {
            if(opts.isMaximize) {
                this.resizeTo(opts.parent.clientWidth, opts.parent.clientHeight);
            }else {
                this.resizeTo(this.prevStatus.width, this.prevStatus.height);
            }
            opts.hasFooter && (this.winFooter.style.display = "block");
            this.winContent.style.display = "block";
            opts.isCollapse = false;
        }else {
            if(opts.isMaximize) {
                this.resizeTo(opts.width, height);
            }else {
                this.prevStatus = {
                    left   : opts.left,
                    top    : opts.top,
                    width  : opts.width,
                    height : opts.height
                }
            }
            opts.hasFooter && (this.winFooter.style.display = "none");
            this.winContent.style.display = "none";
            this.resizeTo(opts.width, height);
            opts.isCollapse = true;
        }
    },

    // 窗口最大化
    maximize : function() {
        var opts = this.options;
        opts.contentSize = Util.getBoundingClientRect(this.winContent);
        var height = this.winNode.clientHeight - opts.contentSize.height + opts.headerSize.height;
        if(opts.isCollapse) {
            this.resizeTo(opts.parent.clientWidth, opts.height);
        }else {
            // 保存状态
            this.prevStatus = {
                left : opts.left,
                top : opts.top,
                width : opts.width,
                height : opts.height
            };

            this.resizeTo(
                opts.parent.clientWidth,
                opts.parent.clientHeight
            );
        }

        this.moveTo(0, 0);
        Util.classList.remove(this.winMaxRestoreTool, "JSWindow-max");
        Util.classList.add(this.winMaxRestoreTool, "JSWindow-restore");
        this.options.isMaximize = true;
        this.toggleDragAble(false);
    },

    // 还原窗口
    restore : function() {
        // var opts = this.options;
        if(this.options.isCollapse) {
            this.resizeTo(
                this.prevStatus.width,
                this.options.height
            );
        }else {
            this.resizeTo(
                this.prevStatus.width,
                this.prevStatus.height
            );
        }
        this.moveTo(
            this.prevStatus.left,
            this.prevStatus.top
        );
        Util.classList.remove(this.winMaxRestoreTool, "JSWindow-restore");
        Util.classList.add(this.winMaxRestoreTool, "JSWindow-max");
        this.options.isMaximize = false;
        this.toggleDragAble(true);
    },

    // 设置拖拽
    setDragAble : function() {
        if(this.options.isDragable) {
            var _this = this,
                opts = _this.options,
                startPostion, // 开始拖拽时的窗口位置
                startAxis, // 开始拖拽时的鼠标位置
                dragSize; // 可拖拽的范围

            // console.info(_this.winHeader);
            Util.event.addHandler(_this.winHeader, "mousedown", dragDown);

            // 点击拖拽区域
            function dragDown(event) {
                // console.info(_this.clickArea);
                if(opts.isMaximize || _this.clickArea === "winTools") {
                    _this.clickArea = null;
                    return ;
                }
                event = Util.event.getEvent(event);
                startPostion = {
                    left : opts.left,
                    top : opts.top
                };
                startAxis = {
                    x : event.clientX,
                    y : event.clientY
                };
                dragSize = {
                    width : opts.parent.clientWidth,
                    height : opts.parent.clientHeight
                };
                Util.event.addHandler(document, "mousemove", dragMove);
                Util.event.addHandler(document, "mouseup", dragUp);
            }

            // 拖拽移动过程
            function dragMove(event) {
                event = Util.event.getEvent(event);

                var change = {
                        x : event.clientX - startAxis.x,
                        y : event.clientY - startAxis.y
                    },
                    result = {
                        left : startPostion.left + change.x,
                        top : startPostion.top + change.y
                    };
                result.left = result.left < 0 ? 0 : result.left;
                result.left = result.left > dragSize.width - opts.width ?
                                dragSize.width - opts.width : result.left;
                result.top = result.top < 0 ? 0 : result.top;
                result.top = result.top > dragSize.height - opts.height ?
                                dragSize.height - opts.height : result.top;

                _this.moveTo(result.left,result.top);
            }

            // 停止拖拽
            function dragUp(event) {
                event = Util.event.getEvent(event);
                Util.event.removeHandler(document, "mousemove", dragMove);
                Util.event.removeHandler(document, "mouseup", dragUp);
            }
        }
    },

    // 切换可拖动状态
    toggleDragAble : function(isDragable) {
        if(this.options.isDragable){
            isDragable = typeof isDragable === "undefined" ? true : isDragable;
            this.winHeader.style.cursor = isDragable ? "move" : "default";
            this.headerText.style.cursor = isDragable ? "move" : "default";
        }
    },

    // 设置缩放鼠标样式
    _setResizeCursor : function() {
        var _this = this;

        Util.event.addHandler(_this.winNode, "mousemove", changeResizeCursor);

        var winNodeStyle = this.winNode.style,
            cursor,
            direction;
        function changeResizeCursor(event) {
            if(_this.isDraging) {return ;} // 正在拖动

            event = Util.event.getEvent(event);
            var winNodeEdge = Util.getBoundingClientRect(_this.winNode),
                opts = _this.options;
            if(event.clientX > winNodeEdge.right - opts.dragSize) { // E
                cursor = "e-resize";
                direction = "E";
                if(event.clientY > winNodeEdge.bottom - opts.dragSize) { // SE
                    cursor = "se-resize";
                    direction = "SE";
                }else if(event.clientY < winNodeEdge.top + opts.dragSize) { // NE
                    cursor = "ne-resize";
                    direction = "NE";
                }
            }else if(event.clientX < winNodeEdge.left + opts.dragSize) { // W
                cursor = "w-resize";
                direction = "W";
                if(event.clientY > winNodeEdge.bottom - opts.dragSize) { // SW
                    cursor = "sw-resize";
                    direction = "SW";
                }else if(event.clientY < winNodeEdge.top + opts.dragSize) { // NW
                    cursor = "nw-resize";
                    direction = "NW";
                }
            }else if(event.clientY > winNodeEdge.bottom - opts.dragSize) { // S
                cursor = "s-resize";
                direction = "S";
            }else if(event.clientY < winNodeEdge.top + opts.dragSize) { // N
                cursor = "n-resize";
                direction = "N";
            }else {
                cursor = "default";
                direction = null;
            }
            winNodeStyle.cursor = cursor;
            _this.direction = direction;
        }
    },

    // 调整窗口大小
    setResize : function() {
        if(!this.options.isScalable){
            return ;
        }

        this._setResizeCursor();

        var _this = this,
            opts = _this.options,
            startPostion, // 窗口开始调整时的位置
            startAxis, // 窗口开始调整时的鼠标位置
            startSize, // 窗口开始调整前的大小
            parentSize; // 父窗口大小

        Util.event.addHandler(_this.winNode, "mousedown", resizeDown);

        function resizeDown(event) {
            event = Util.event.getEvent(event);

            startPostion = {
                left : opts.left,
                top : opts.top
            };

            startAxis = {
                x : event.clientX,
                y : event.clientY
            };

            startSize = {
                width : opts.width,
                height : opts.height
            };

            parentSize = {
                width : opts.parent.clientWidth,
                height : opts.parent.clientHeight
            };

            Util.event.addHandler(document, "mousemove", resizeMove);
            Util.event.addHandler(document, "mouseup", resizeUp);
        }

        function resizeMove(event) {
            event = Util.event.getEvent(event);
            _this.isDraging = true;
            var change = {
                    x : event.clientX - startAxis.x,
                    y : event.clientY - startAxis.y
                },
                width = startSize.width,
                height = startSize.height,
                left = startPostion.left,
                top = startPostion.top,
                flag = false; // 是否可更改窗口大小
            switch(_this.direction) {
                case "W":
                    left = startPostion.left + change.x;
                    width = startSize.width - change.x;
                    if(left > 0 && width >= opts.minWidth && width <= opts.maxWidth) {
                        flag = true;
                    }
                    break;
                case "N":
                    top = startPostion.top + change.y;
                    height = startSize.height - change.y;
                    if(top > 0 && height >= opts.minHeight && height <= opts.maxHeight) {
                        flag = true;
                    }
                    break;
                case "E":
                    width = startSize.width + change.x;
                    if(width >= opts.minWidth && width <= opts.maxWidth && (width + opts.left) <= opts.parent.clientWidth) {
                        flag = true;
                    }
                    break;
                case "S":
                    height = startSize.height + change.y;
                    if(height >= opts.minHeight && height <= opts.maxHeight && (height + opts.top) <= opts.parent.clientHeight) {
                        flag = true;
                    }
                    break;
                case "SW":
                    left = startPostion.left + change.x;
                    width = startSize.width - change.x;
                    height = startSize.height + change.y;
                    if(left > 0 && width >= opts.minWidth && width <= opts.maxWidth
                        && height >= opts.minHeight && height <= opts.maxHeight && (height + opts.top) <= opts.parent.clientHeight) {
                        flag = true;
                    }
                    break;
                case "NW":
                    left = startPostion.left + change.x;
                    top = startPostion.top + change.y;
                    width = startSize.width - change.x;
                    height = startSize.height - change.y;
                    if(left > 0 && top > 0 && width >= opts.minWidth && width <= opts.maxWidth
                        && height >= opts.minHeight && height <= opts.maxHeight){
                        flag = true;
                    }
                    break;
                case "SE":
                    width = startSize.width + change.x;
                    height = startSize.height + change.y;
                    if(width >= opts.minWidth && width <= opts.maxWidth && (width + opts.left) <= opts.parent.clientWidth
                        && height >= opts.minHeight && height <= opts.maxHeight && (height + opts.top) <= opts.parent.clientHeight) {
                        flag = true;
                    }
                    break;
                case "NE":
                    top = startPostion.top + change.y;
                    width = startSize.width + change.x;
                    height = startSize.height - change.y;
                    if(width >= opts.minWidth && width <= opts.maxWidth && (width + opts.left) <= opts.parent.clientWidth
                         && top > 0 && height >= opts.minHeight && height <= opts.maxHeight) {
                        flag = true;
                    }
                    break;
                default :
                    return false;
            }

            if(flag) {
                _this.moveTo(left, top);
                _this.resizeTo(width, height);
            }
        }

        function resizeUp(event) {
            event = Util.event.getEvent(event);
            _this.isDraging = false;
            Util.event.removeHandler(document, "mousemove", resizeMove);
            Util.event.removeHandler(document, "mouseup", resizeUp);
        }
    }
}
