// 工具集
var Util = {
    //跨浏览器事件对象
    event : {
        //为特定元素添加事件
        addHandler:function(element,type,handler){
            if(element.addEventListener){
                //DOM2级
                element.addEventListener(type,handler,false);
            }else if(element.attachEvent){
                //兼容IE8及更早版本，加上“on”，IE方法
                element.attachEvent("on" + type,handler);
            }else{
                //DOM0
                element["on" + type] = handler;
            }
        },

        //返回对event对象的引用
        getEvent:function(event){
            return event?event:window.event;
        },

        //返回事件的目标
        getTarget:function(event){
            return event.target||event.srcElement;
        },

        getRelatedTarget:function(event){
            if(event.relatedTarget){
                return event.relatedTarget;
            }else if(event.toElement){
                return event.toElement;
            }else if(event.fromElement){
                return event.fromElement;
            }else {
                return null;
            }
        },

        getButton:function(event){
            //检测MouseEvents特性可以知道event对象存在的button属性是否包含正确的值，失败，说明是IE
            if(document.implementation.hasFeature("MouseEvents","2.0")){
                return event.button;
            }else{
                switch(event.button){
                    case 0:
                    case 1:
                    case 3:
                    case 5:
                    case 7:
                        return 0;
                    case 2:
                    case 6:
                        return 2;
                    case 4:
                        return 1;
                }
            }
        },

        getWheelDelta:function(event){
            if(event.wheelDelta){
                return (client.engine.opera && client.engine.opera < 9.5 ?
                    -event.wheelDelta : event.wheelDelta);
            }else{
                return -event.detail * 40;
            }
        },

        getCharCode:function(event){
            if(typeof event.charCode == "number"){
                return event.charCode;
            }else{
                return event.keyCode;
            }
        },

        getCliboardText:function(event){
            var clipboardData = (event.clipboardData || window.clipboardData);
            return clipboardData.getData("text");
        },

        setCliboardText:function(event,value){
            if(event.clipboardData){
                return event.clipboardData.setData("text/plain",value);
            }else if(window.clipboardData){
                return window.clipboardData.setData("text",value);
            }
        },

        //取消事件默认行为
        preventDefault:function(event){
            if(event.preventDefault){
                event.preventDefault();
            }else{
                event.returnValue = false;
            }
        },

        removeHandler:function(element,type,handler){
            if(element.removeEventListener){
                //DOM2级
                element.removeEventListener(type,handler,false);
            }else if(element.detachEvent){
                //兼容IE8及更早版本，加上“on”，IE方法
                element.detachEvent("on" + type,handler);
            }else{
                element["on" + type] = null;
            }
        },

        stopPropagation:function(event){
            if(event.stopPropagation){
                event.stopPropagation();
            }else{
                event.cancelBubble = true;
            }
        }
    },

    extend : function test() {
        var result = {},
            temp;
        for(var i = 0, j = arguments.length; i < j;i++) {
            for(var prop in arguments[i]) {
                if(arguments[i].hasOwnProperty(prop)) {
                    temp = arguments[i][prop];
                    if(typeof temp === "object" && Object.prototype.toString.call(temp).indexOf("Element") === -1) {
                        result[prop] = test(result[prop],temp);
                    }else {
                        result[prop] = temp;
                    }
                }
            }
        }
        return result;
    },

    classList : {
        // 判断某个元素是否包含指定类名
        contains : function(element, className) {
            // 检查className是否是合法类名
            if(className.length === 0 || className.indexOf(" ") != -1) {
                throw new Error("类名非法");
            }
            // 常规检查
            var classes = element.className;
            if(!classes) { // element不含类名
                return false;
            }
            if(classes === className) { // element有一个完全匹配的类名
                return true;
            }
            return classes.search("\\b" + className + "\\b") != -1;
        },

        // 当指定元素不存在className时，为指定元素添加类名
        add : function(element, className) {
            if(this.contains(element, className)) { // 存在，直接返回
                return ;
            }
            var classes = element.className;
            if(classes && classes[classes.length - 1] != " ") { // 如果需要加一个空格
                className = " " + className;
            }
            element.className += className; // 将类名添加到指定元素中
        },

        // 将所有在指定元素中出现的className全部删除
        remove : function(element, className) {
            // 检查className是否合法
            if(className.length === 0 || className.indexOf(" ") != -1) {
                throw new Error("类名非法");
            }
            // 将所有作为单词的classNam和多余的尾随空格全部删除
            var pattern = new RegExp("\\b" + className + "\\b\\s*", "g");
            element.className = element.className.replace(pattern, "");
        },

        // 若className不存在，添加，返回true，存在，删除，返回false
        toggle : function(element, className) {
            if(this.contains(element,className)) {
                this.remove(element, className);
                return false;
            }else {
                this.add(element, className);
                return true;
            }
        },

        // 返回element.className
        toString : function(element) {
            return element.className;
        },

        // 返回element.className中的类名组成的数组
        toArray : function(element) {
            // return element.className.match(/\b\w+\b/g) || [];
            return element.className.split(" ") || [];
        }
    },

    // 获取指定元素在视口坐标中的尺寸和位置
    getBoundingClientRect : function(element) {
        var box = element.getBoundingClientRect();
        box.width = box.width || (box.right - box.left);
        box.height = box.height || (box.bottom - box.top);
        return box;
    }
}
