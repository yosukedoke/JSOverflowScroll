/**
 * @license JSOverflowScroll v0.1
 * (c) 2013 Yosuke Doke http://yd-niku.holiday
 * License: MIT
 */
 
 ;(function ($) {
    "use strict";

    var MIN_DRAG_DISTANCE = 20,
        INTERVAL_TO_MOVE = 16,
        FRICTION = 0.98,
        LIMIT_SPEED = 10,
        LIMIT_TO_STOP = 1,
        ATTR_FLAG = "data-jquery-overflow-scroll";

    $.fn.overflowScroll = function () {// console.log("overflowScroll");
        this.each(function () {
            setup($(this));
        });
    };

    function setup($target) {
        if($target.attr(ATTR_FLAG)) { return; }
        $target.attr(ATTR_FLAG, 1);
        
        var isTouch = false,
            blockingClick = false,
            intervalID,
            touchStartX = 0,
            touchStartY = 0,
            scrollStartX = 0,
            scrollStartY = 0,
            touchX = 0,
            touchY = 0,
            touchSpeedX = 0,
            touchSpeedY = 0,
            minScrollX = 0,
            minScrollY = 0,
            maxScrollX = ($target.get(0).scrollWidth || $target.get(0).clientWidth) - $target.width(),
            maxScrollY = ($target.get(0).scrollHeight || $target.get(0).clientHeight) - $target.height();
    
        function clickSilencer() {
            return !blockingClick;
        }
        function touchStart(event) {
            event = event.originalEvent;

            blockingClick = false;
            clearInterval(intervalID);

            isTouch = true;

            var touch = event.touches[0];

            touchStartX = touchX = touch.pageX;
            touchStartY = touchY = touch.pageY;

            scrollStartX = $target.scrollLeft();
            scrollStartY = $target.scrollTop();
        }

        function touchMove(event) {
            event = event.originalEvent;
            event.preventDefault();

            var touch = event.touches[0];

            touchX = touch.pageX;
            touchY = touch.pageY;

            var diffX = Math.abs(touchStartX - touchX),
                diffY = Math.abs(touchStartY - touchY);

            if(!blockingClick && (diffX > MIN_DRAG_DISTANCE || diffY > MIN_DRAG_DISTANCE)) {
                blockingClick = true;
            }
            var willScrollX = scrollStartX + (touchStartX - touchX),
                willScrollY = scrollStartY + (touchStartY - touchY);

            $target.scrollLeft(willScrollX);
            $target.scrollTop(willScrollY);
        }
        function touchEnd(event) {
            event = event.originalEvent;

            clearInterval(intervalID);

            var touch = event.changedTouches[0];
            isTouch = false;

            touchSpeedX = (touchX - touch.pageX);
            touchSpeedY = (touchY - touch.pageY);

            touchX = touch.pageX;
            touchY = touch.pageY;

            var willScrollX = scrollStartX + (touchStartX - touchX),
                willScrollY = scrollStartY + (touchStartY - touchY),
                oldScrollX = $target.scrollLeft(),
                oldScrollY = $target.scrollTop();

            if(oldScrollX > minScrollX && oldScrollX <  maxScrollX) {
                $target.scrollLeft(willScrollX);
            } else {
                touchSpeedX = 0;
            }

            if(oldScrollY > minScrollY && oldScrollY < maxScrollY) {
                $target.scrollTop(willScrollY);
            } else {
                touchSpeedY = 0;
            }

            intervalID = setInterval(afterMoving, INTERVAL_TO_MOVE);
        }

        $target.on("click", "a", clickSilencer);
        $target.on("touchstart",touchStart);
        $target.on("touchmove", touchMove);
        $target.on("touchend touchcancel", touchEnd);

        function afterMoving() {
            if (isTouch) {
                clearInterval(intervalID);
                return;
            }
            if ((Math.abs(touchSpeedX)<LIMIT_TO_STOP && Math.abs(touchSpeedY)<LIMIT_TO_STOP)) {
                blockingClick = false;
                clearInterval(intervalID);
                return;
            }

            var oldX = $target.scrollLeft(),
                oldY = $target.scrollTop();

            touchSpeedX *= FRICTION;
            touchSpeedY *= FRICTION;

            $target.scrollLeft(oldX + Math.round(Math.min(LIMIT_SPEED,Math.max(-LIMIT_SPEED, touchSpeedX))));
            $target.scrollTop(oldY + Math.round(Math.min(LIMIT_SPEED,Math.max(-LIMIT_SPEED, touchSpeedY))));
        }
    }
})(jQuery);
